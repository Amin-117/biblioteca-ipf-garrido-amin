import { createContext, type ReactNode, use, useCallback, useMemo, useState } from 'react';

import { CREDENCIALES_PERSONAL, USUARIO_ACTUAL } from '../constants/biblioteca';
import { ESPERA_INICIAL } from '../data/esperaInicial';
import { Cola } from '../estructuras/Cola';
import { Pila } from '../estructuras/Pila';
import { buscarLibroPorIsbn, tituloDe } from '../lib/catalogo';
import {
  cancelarRecordatorio,
  notificacionesConcedidas,
  notificarRetiroDisponible,
  programarRecordatorio,
} from '../lib/notificaciones';
import { calcularDisponibles, crearPrestamo } from '../lib/prestamos';
import type {
  Aviso,
  BibliotecaContextValor,
  Prestamo,
  ResultadoEntrega,
  ResultadoReserva,
} from '../types';

const BibliotecaContext = createContext<BibliotecaContextValor | null>(null);

function crearListasIniciales(): Record<string, Cola<string>> {
  return Object.fromEntries(
    Object.entries(ESPERA_INICIAL).map(([isbn, nombres]) => [isbn, Cola.desde(nombres)]),
  );
}

function crearIdAviso(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function esActivoDe(prestamo: Prestamo, isbn: string): boolean {
  return prestamo.isbn === isbn && prestamo.estado === 'activo';
}

// Estado con useState + actualizaciones funcionales (no useReducer): las acciones async
// (notificaciones) se escriben directo en cada callback, sin acciones intermedias.
// Regla: nunca se muta una Pila/Cola del estado; se clona, se opera sobre la copia y se hace setState.
export function useEstadoBiblioteca(): BibliotecaContextValor {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [listasEspera, setListasEspera] = useState<Record<string, Cola<string>>>(crearListasIniciales);
  const [recientes, setRecientes] = useState(() => new Pila<string>());
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [sesionIniciada, setSesionIniciada] = useState(false);

  const prestamoActivo = useCallback(
    (isbn: string) => prestamos.find((prestamo) => esActivoDe(prestamo, isbn)),
    [prestamos],
  );

  const posicionEnEspera = useCallback(
    (isbn: string) => listasEspera[isbn]?.posicionDe(USUARIO_ACTUAL) ?? -1,
    [listasEspera],
  );

  const yaReservado = useCallback(
    (isbn: string) => prestamoActivo(isbn) !== undefined || posicionEnEspera(isbn) !== -1,
    [prestamoActivo, posicionEnEspera],
  );

  const disponibles = useCallback(
    (isbn: string) => {
      const libro = buscarLibroPorIsbn(isbn);
      return libro ? calcularDisponibles(libro, prestamos) : 0;
    },
    [prestamos],
  );

  const registrarVisto = useCallback((isbn: string) => {
    setRecientes((anterior) => {
      if (anterior.verTope() === isbn) {
        return anterior;
      }
      const nueva = anterior.clonar();
      nueva.apilar(isbn);
      return nueva;
    });
  }, []);

  const agregarAviso = useCallback((texto: string) => {
    setAvisos((anteriores) => [
      { id: crearIdAviso(), texto, fecha: new Date().toISOString() },
      ...anteriores,
    ]);
  }, []);

  const descartarAviso = useCallback((id: string) => {
    setAvisos((anteriores) => anteriores.filter((aviso) => aviso.id !== id));
  }, []);

  const reservar = useCallback(
    (isbn: string): ResultadoReserva => {
      if (!buscarLibroPorIsbn(isbn) || yaReservado(isbn)) {
        return { tipo: 'rechazada' };
      }
      const enEspera = listasEspera[isbn]?.tamanio ?? 0;
      if (disponibles(isbn) > 0 && enEspera === 0) {
        const nuevo = crearPrestamo(isbn, 'estante', new Date());
        setPrestamos((anteriores) => [...anteriores, nuevo]);
        return { tipo: 'prestamo', fechaDevolucion: nuevo.fechaDevolucion };
      }
      setListasEspera((anteriores) => {
        const nueva = anteriores[isbn]?.clonar() ?? new Cola<string>();
        nueva.encolar(USUARIO_ACTUAL);
        return { ...anteriores, [isbn]: nueva };
      });
      return { tipo: 'espera', posicion: enEspera + 1 };
    },
    [listasEspera, disponibles, yaReservado],
  );

  const actualizarRecordatorio = useCallback((isbn: string, recordatorioId: string | null) => {
    setPrestamos((anteriores) =>
      anteriores.map((prestamo) =>
        esActivoDe(prestamo, isbn) ? { ...prestamo, recordatorioId } : prestamo,
      ),
    );
  }, []);

  const activarRecordatorio = useCallback(
    async (isbn: string) => {
      const prestamo = prestamoActivo(isbn);
      if (!prestamo) {
        return;
      }
      if (prestamo.recordatorioId) {
        await cancelarRecordatorio(prestamo.recordatorioId);
      }
      const id = await programarRecordatorio(tituloDe(isbn), prestamo.fechaDevolucion);
      actualizarRecordatorio(isbn, id);
    },
    [prestamoActivo, actualizarRecordatorio],
  );

  const desactivarRecordatorio = useCallback(
    async (isbn: string) => {
      const id = prestamoActivo(isbn)?.recordatorioId;
      actualizarRecordatorio(isbn, null);
      if (id) {
        await cancelarRecordatorio(id);
      }
    },
    [prestamoActivo, actualizarRecordatorio],
  );

  const devolver = useCallback(
    async (isbn: string) => {
      const id = prestamoActivo(isbn)?.recordatorioId;
      setPrestamos((anteriores) =>
        anteriores.map((prestamo) =>
          esActivoDe(prestamo, isbn)
            ? { ...prestamo, estado: 'devuelto', recordatorioId: null }
            : prestamo,
        ),
      );
      if (id) {
        await cancelarRecordatorio(id);
      }
    },
    [prestamoActivo],
  );

  const entregarAlSiguiente = useCallback(
    async (isbn: string): Promise<ResultadoEntrega> => {
      const persona = listasEspera[isbn]?.verFrente();
      if (persona === undefined) {
        return { tipo: 'sin-espera' };
      }
      setListasEspera((anteriores) => {
        const nueva = anteriores[isbn]?.clonar() ?? new Cola<string>();
        nueva.desencolar();
        return { ...anteriores, [isbn]: nueva };
      });
      const aVos = persona === USUARIO_ACTUAL;
      if (aVos) {
        setPrestamos((anteriores) => [...anteriores, crearPrestamo(isbn, 'mostrador', new Date())]);
        const titulo = tituloDe(isbn);
        const textoAviso = `¡Ya podés retirar “${titulo}”! Pasá por el mostrador de la biblioteca.`;
        try {
          if (await notificacionesConcedidas()) {
            await notificarRetiroDisponible(titulo);
          } else {
            agregarAviso(textoAviso);
          }
        } catch {
          agregarAviso(textoAviso);
        }
      }
      return { tipo: 'entregado', persona, aVos };
    },
    [listasEspera, agregarAviso],
  );

  const iniciarSesion = useCallback((usuario: string, clave: string) => {
    const correctas =
      usuario.trim() === CREDENCIALES_PERSONAL.usuario && clave === CREDENCIALES_PERSONAL.clave;
    if (correctas) {
      setSesionIniciada(true);
    }
    return correctas;
  }, []);

  const cerrarSesion = useCallback(() => {
    setSesionIniciada(false);
  }, []);

  return useMemo(
    () => ({
      prestamos,
      listasEspera,
      recientes,
      sesionIniciada,
      avisos,
      registrarVisto,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      agregarAviso,
      descartarAviso,
      disponibles,
      posicionEnEspera,
      yaReservado,
      prestamoActivo,
    }),
    [
      prestamos,
      listasEspera,
      recientes,
      sesionIniciada,
      avisos,
      registrarVisto,
      reservar,
      devolver,
      activarRecordatorio,
      desactivarRecordatorio,
      entregarAlSiguiente,
      iniciarSesion,
      cerrarSesion,
      agregarAviso,
      descartarAviso,
      disponibles,
      posicionEnEspera,
      yaReservado,
      prestamoActivo,
    ],
  );
}

type PropsProvider = {
  valor: BibliotecaContextValor;
  children: ReactNode;
};

export function BibliotecaProvider({ valor, children }: PropsProvider) {
  return <BibliotecaContext value={valor}>{children}</BibliotecaContext>;
}

export function useBiblioteca(): BibliotecaContextValor {
  const valor = use(BibliotecaContext);
  if (valor === null) {
    throw new Error('useBiblioteca debe usarse dentro de BibliotecaProvider (src/app/_layout.tsx).');
  }
  return valor;
}
