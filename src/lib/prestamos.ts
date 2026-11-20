import { DIAS_PRESTAMO } from '../constants/biblioteca';
import type { Libro, OrigenPrestamo, Prestamo } from '../types';
import { sumarDias } from './fechas';

// Los disponibles se calculan, no se guardan: un mismo dato en dos lugares se desincroniza.
// Un préstamo del estante saca un ejemplar mientras está activo (al devolverlo vuelve).
// Un préstamo del mostrador usa un ejemplar que otra persona devolvió: al devolverlo, suma uno al estante.
export function calcularDisponibles(libro: Libro, prestamos: readonly Prestamo[]): number {
  let disponibles = libro.ejemplares;
  for (const prestamo of prestamos) {
    if (prestamo.isbn !== libro.isbn) {
      continue;
    }
    if (prestamo.origen === 'estante' && prestamo.estado === 'activo') {
      disponibles -= 1;
    }
    if (prestamo.origen === 'mostrador' && prestamo.estado === 'devuelto') {
      disponibles += 1;
    }
  }
  return Math.max(0, disponibles);
}

export function crearPrestamo(isbn: string, origen: OrigenPrestamo, ahora: Date): Prestamo {
  return {
    isbn,
    fechaInicio: ahora.toISOString(),
    fechaDevolucion: sumarDias(ahora, DIAS_PRESTAMO).toISOString(),
    recordatorioId: null,
    origen,
    estado: 'activo',
  };
}
