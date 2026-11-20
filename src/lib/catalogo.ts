import { LIBROS } from '../data/libros';
import type { Libro } from '../types';

const LIBROS_POR_ISBN = new Map(LIBROS.map((libro) => [libro.isbn, libro]));

// Consulta local y sincrónica para el Context (títulos y ejemplares iniciales).
export function buscarLibroPorIsbn(isbn: string): Libro | undefined {
  return LIBROS_POR_ISBN.get(isbn);
}

export function tituloDe(isbn: string): string {
  return buscarLibroPorIsbn(isbn)?.titulo ?? 'Libro';
}
