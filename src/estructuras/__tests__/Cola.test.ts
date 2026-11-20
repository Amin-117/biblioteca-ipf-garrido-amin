import { Cola } from '../Cola';

describe('Cola', () => {
  it('desencolar una cola vacía devuelve undefined sin romperse', () => {
    const cola = new Cola<string>();
    expect(cola.desencolar()).toBeUndefined();
    expect(cola.verFrente()).toBeUndefined();
    expect(cola.tamanio).toBe(0);
    expect(cola.estaVacia()).toBe(true);
  });

  it('respeta el orden FIFO', () => {
    const cola = Cola.desde(['Ana', 'Beto', 'Caro']);
    expect(cola.verFrente()).toBe('Ana');
    expect(cola.desencolar()).toBe('Ana');
    expect(cola.desencolar()).toBe('Beto');
    expect(cola.desencolar()).toBe('Caro');
    expect(cola.desencolar()).toBeUndefined();
  });

  it('actualiza tamanio y sigue funcionando después de vaciarse', () => {
    const cola = new Cola<number>();
    cola.encolar(1);
    cola.encolar(2);
    expect(cola.tamanio).toBe(2);
    cola.desencolar();
    cola.desencolar();
    expect(cola.tamanio).toBe(0);
    cola.encolar(3);
    expect(cola.tamanio).toBe(1);
    expect(cola.verFrente()).toBe(3);
  });

  it('aArray devuelve una copia de frente a final', () => {
    const cola = Cola.desde([1, 2, 3]);
    cola.desencolar();
    const copia = cola.aArray();
    expect(copia).toEqual([2, 3]);
    copia.push(99);
    expect(cola.tamanio).toBe(2);
  });

  it('posicionDe es 1-based, -1 si no está, y contiene lo acompaña', () => {
    const cola = Cola.desde(['Ana', 'Beto', 'Caro']);
    expect(cola.posicionDe('Ana')).toBe(1);
    expect(cola.posicionDe('Caro')).toBe(3);
    expect(cola.posicionDe('Dani')).toBe(-1);
    cola.desencolar();
    expect(cola.posicionDe('Caro')).toBe(2);
    expect(cola.contiene('Ana')).toBe(false);
    expect(cola.contiene('Beto')).toBe(true);
  });

  it('desde y clonar crean instancias independientes', () => {
    const elementos = ['a', 'b'];
    const cola = Cola.desde(elementos);
    elementos.push('c');
    expect(cola.tamanio).toBe(2);

    const copia = cola.clonar();
    copia.encolar('z');
    expect(copia).not.toBe(cola);
    expect(cola.aArray()).toEqual(['a', 'b']);
    expect(copia.aArray()).toEqual(['a', 'b', 'z']);
  });
});
