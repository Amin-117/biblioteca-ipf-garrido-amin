import type { Aviso, EstadoGuardado, Prestamo } from '../types';

const PATRON_ISBN = /^\d{13}$/;

export function esIsbnValido(valor: string): boolean {
  return PATRON_ISBN.test(valor);
}

// useLocalSearchParams puede entregar un string, un array (parámetro repetido) o nada.
export function normalizarParametro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) {
    return valor[0] ?? '';
  }
  return valor ?? '';
}

type Objeto = Record<string, unknown>;

function esObjeto(valor: unknown): valor is Objeto {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

function esListaDeTextos(valor: unknown): valor is string[] {
  return Array.isArray(valor) && valor.every((item) => typeof item === 'string');
}

function esPrestamo(valor: unknown): valor is Prestamo {
  return (
    esObjeto(valor) &&
    typeof valor.isbn === 'string' &&
    typeof valor.fechaInicio === 'string' &&
    typeof valor.fechaDevolucion === 'string' &&
    (valor.recordatorioId === null || typeof valor.recordatorioId === 'string') &&
    (valor.origen === 'estante' || valor.origen === 'mostrador') &&
    (valor.estado === 'activo' || valor.estado === 'devuelto')
  );
}

function esAviso(valor: unknown): valor is Aviso {
  return (
    esObjeto(valor) &&
    typeof valor.id === 'string' &&
    typeof valor.texto === 'string' &&
    typeof valor.fecha === 'string'
  );
}

export function esEstadoGuardado(valor: unknown): valor is EstadoGuardado {
  return (
    esObjeto(valor) &&
    Array.isArray(valor.prestamos) &&
    valor.prestamos.every(esPrestamo) &&
    esObjeto(valor.listasEspera) &&
    Object.values(valor.listasEspera).every(esListaDeTextos) &&
    esListaDeTextos(valor.recientes) &&
    Array.isArray(valor.avisos) &&
    valor.avisos.every(esAviso)
  );
}
