import { useCallback, useEffect, useState } from 'react';

import { obtenerLibros } from '../lib/api';
import type { Libro } from '../types';

export type EstadoLibros = {
  libros: Libro[];
  cargando: boolean;
  error: string | null;
  reintentar: () => void;
};

const MENSAJE_ERROR = 'No pudimos cargar el catálogo. Revisá tu conexión y probá de nuevo.';

export function useLibros(): EstadoLibros {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Cambiar "intento" vuelve a ejecutar el efecto: es la única forma de pedir de nuevo.
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    // Si el componente se desmonta o el pedido queda viejo, la respuesta se descarta.
    let activo = true;

    async function cargar() {
      try {
        const datos = await obtenerLibros();
        if (activo) {
          setLibros(datos);
          setCargando(false);
        }
      } catch {
        if (activo) {
          setError(MENSAJE_ERROR);
          setCargando(false);
        }
      }
    }

    cargar();

    return () => {
      activo = false;
    };
  }, [intento]);

  const reintentar = useCallback(() => {
    setCargando(true);
    setError(null);
    setIntento((anterior) => anterior + 1);
  }, []);

  return { libros, cargando, error, reintentar };
}
