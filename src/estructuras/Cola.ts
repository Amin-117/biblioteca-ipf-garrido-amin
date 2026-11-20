// Cola FIFO genérica sin Array.prototype.shift: un mapa indexado y dos índices hacen que desencolar sea O(1).
// Las instancias guardadas en estado de React no se mutan: se trabaja sobre clonar() o Cola.desde().
export class Cola<T> {
  #items = new Map<number, T>();
  #inicio = 0;
  #fin = 0;

  static desde<T>(elementos: readonly T[]): Cola<T> {
    const cola = new Cola<T>();
    for (const elemento of elementos) {
      cola.encolar(elemento);
    }
    return cola;
  }

  get tamanio(): number {
    return this.#fin - this.#inicio;
  }

  estaVacia(): boolean {
    return this.tamanio === 0;
  }

  encolar(elemento: T): void {
    this.#items.set(this.#fin, elemento);
    this.#fin += 1;
  }

  desencolar(): T | undefined {
    if (this.estaVacia()) {
      return undefined;
    }
    const elemento = this.#items.get(this.#inicio);
    this.#items.delete(this.#inicio);
    this.#inicio += 1;
    return elemento;
  }

  verFrente(): T | undefined {
    return this.#items.get(this.#inicio);
  }

  // Posición empezando en 1; -1 si no está.
  posicionDe(elemento: T): number {
    for (let i = this.#inicio; i < this.#fin; i += 1) {
      if (this.#items.get(i) === elemento) {
        return i - this.#inicio + 1;
      }
    }
    return -1;
  }

  contiene(elemento: T): boolean {
    return this.posicionDe(elemento) !== -1;
  }

  // Copia en orden de frente a final.
  aArray(): T[] {
    const elementos: T[] = [];
    for (let i = this.#inicio; i < this.#fin; i += 1) {
      const elemento = this.#items.get(i);
      if (elemento !== undefined) {
        elementos.push(elemento);
      }
    }
    return elementos;
  }

  clonar(): Cola<T> {
    return Cola.desde(this.aArray());
  }
}
