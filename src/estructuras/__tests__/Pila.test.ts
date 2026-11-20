import { Pila } from '../Pila';

describe('Pila', () => {
  it('empieza vacía y desapilar devuelve undefined sin romperse', () => {
    const pila = new Pila<string>();
    expect(pila.estaVacia()).toBe(true);
    expect(pila.tamanio).toBe(0);
    expect(pila.desapilar()).toBeUndefined();
    expect(pila.verTope()).toBeUndefined();
  });

  it('respeta el orden LIFO', () => {
    const pila = Pila.desde(['a', 'b', 'c']);
    expect(pila.verTope()).toBe('c');
    expect(pila.desapilar()).toBe('c');
    expect(pila.desapilar()).toBe('b');
    expect(pila.desapilar()).toBe('a');
    expect(pila.estaVacia()).toBe(true);
  });

  it('actualiza tamanio al apilar y desapilar', () => {
    const pila = new Pila<number>();
    pila.apilar(1);
    pila.apilar(2);
    expect(pila.tamanio).toBe(2);
    pila.desapilar();
    expect(pila.tamanio).toBe(1);
  });

  it('aArray devuelve una copia de base a tope', () => {
    const pila = Pila.desde([1, 2, 3]);
    const copia = pila.aArray();
    expect(copia).toEqual([1, 2, 3]);
    copia.push(99);
    expect(pila.tamanio).toBe(3);
  });

  it('clonar crea una instancia independiente', () => {
    const original = Pila.desde(['x']);
    const copia = original.clonar();
    copia.apilar('y');
    expect(copia).not.toBe(original);
    expect(original.aArray()).toEqual(['x']);
    expect(copia.aArray()).toEqual(['x', 'y']);
  });
});
