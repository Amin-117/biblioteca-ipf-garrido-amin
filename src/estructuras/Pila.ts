// Pila LIFO genérica. Las instancias guardadas en estado de React no se mutan:
// se crea una copia con clonar() o Pila.desde() y se aplica la operación sobre la copia.
export class Pila<T> {
  #items: T[] = [];

  static desde<T>(elementos: readonly T[]): Pila<T> {
    const pila = new Pila<T>();
    for (const elemento of elementos) {
      pila.apilar(elemento);
    }
    return pila;
  }

  get tamanio(): number {
    return this.#items.length;
  }

  estaVacia(): boolean {
    return this.#items.length === 0;
  }

  apilar(elemento: T): void {
    this.#items.push(elemento);
  }

  desapilar(): T | undefined {
    return this.#items.pop();
  }

  verTope(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  // Copia en orden de base a tope.
  aArray(): T[] {
    return [...this.#items];
  }

  clonar(): Pila<T> {
    return Pila.desde(this.#items);
  }
}
