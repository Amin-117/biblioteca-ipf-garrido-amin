import type { Pila } from '../estructuras/Pila';

// Del tope hacia la base, sin repetir ISBN (un libro puede estar apilado más de una vez).
export function ultimosVistos(pila: Pila<string>, cantidad: number): string[] {
  const resultado: string[] = [];
  const desdeElTope = pila.aArray().reverse();
  for (const isbn of desdeElTope) {
    if (!resultado.includes(isbn)) {
      resultado.push(isbn);
    }
    if (resultado.length === cantidad) {
      break;
    }
  }
  return resultado;
}
