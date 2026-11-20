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
