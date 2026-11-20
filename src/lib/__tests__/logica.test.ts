import { Pila } from '../../estructuras/Pila';
import type { Libro, Prestamo } from '../../types';
import { mapearPermiso } from '../permisos';
import { calcularDisponibles, crearPrestamo } from '../prestamos';
import { ultimosVistos } from '../recientes';
import { esEstadoGuardado, esIsbnValido, normalizarParametro } from '../validaciones';

const libro: Libro = {
  isbn: '9788499089515',
  titulo: 'Ficciones',
  autor: 'Jorge Luis Borges',
  anio: 1944,
  ejemplares: 2,
};

function prestamo(cambios: Partial<Prestamo>): Prestamo {
  return { ...crearPrestamo(libro.isbn, 'estante', new Date(2026, 0, 1)), ...cambios };
}

describe('esIsbnValido', () => {
  it('acepta exactamente 13 dígitos', () => {
    expect(esIsbnValido('9788499089515')).toBe(true);
  });

  it('rechaza letras, guiones y largos incorrectos', () => {
    expect(esIsbnValido('abc')).toBe(false);
    expect(esIsbnValido('123')).toBe(false);
    expect(esIsbnValido('978-84-99089515')).toBe(false);
    expect(esIsbnValido('97884990895150')).toBe(false);
  });
});

describe('normalizarParametro', () => {
  it('toma el primer valor de un array y convierte undefined en texto vacío', () => {
    expect(normalizarParametro(['a', 'b'])).toBe('a');
    expect(normalizarParametro(undefined)).toBe('');
    expect(normalizarParametro('borges')).toBe('borges');
  });
});

describe('mapearPermiso', () => {
  it('distingue los cuatro estados usando canAskAgain', () => {
    expect(mapearPermiso(null)).toBe('cargando');
    expect(mapearPermiso({ granted: true, canAskAgain: true })).toBe('concedido');
    expect(mapearPermiso({ granted: false, canAskAgain: true })).toBe('preguntable');
    expect(mapearPermiso({ granted: false, canAskAgain: false })).toBe('bloqueado');
  });
});

describe('calcularDisponibles', () => {
  it('resta préstamos activos del estante y nunca baja de cero', () => {
    expect(calcularDisponibles(libro, [])).toBe(2);
    expect(calcularDisponibles(libro, [prestamo({})])).toBe(1);
    expect(calcularDisponibles(libro, [prestamo({}), prestamo({}), prestamo({})])).toBe(0);
  });

  it('un préstamo del estante devuelto ya no resta', () => {
    expect(calcularDisponibles(libro, [prestamo({ estado: 'devuelto' })])).toBe(2);
  });

  it('un préstamo del mostrador devuelto suma un ejemplar', () => {
    expect(calcularDisponibles(libro, [prestamo({ origen: 'mostrador' })])).toBe(2);
    expect(
      calcularDisponibles(libro, [prestamo({ origen: 'mostrador', estado: 'devuelto' })]),
    ).toBe(3);
  });

  it('ignora préstamos de otros libros', () => {
    expect(calcularDisponibles(libro, [prestamo({ isbn: '0000000000000' })])).toBe(2);
  });
});

describe('crearPrestamo', () => {
  it('vence a los 7 días y empieza sin recordatorio', () => {
    const nuevo = crearPrestamo(libro.isbn, 'estante', new Date(2026, 0, 1, 12));
    const dias = (Date.parse(nuevo.fechaDevolucion) - Date.parse(nuevo.fechaInicio)) / 86400000;
    expect(dias).toBe(7);
    expect(nuevo.recordatorioId).toBeNull();
    expect(nuevo.estado).toBe('activo');
  });
});

describe('ultimosVistos', () => {
  it('devuelve los del tope, del más reciente al más antiguo y sin repetir', () => {
    const pila = Pila.desde(['a', 'b', 'c', 'a', 'd']);
    expect(ultimosVistos(pila, 3)).toEqual(['d', 'a', 'c']);
    expect(ultimosVistos(new Pila<string>(), 3)).toEqual([]);
  });
});

describe('esEstadoGuardado', () => {
  const valido = {
    prestamos: [crearPrestamo(libro.isbn, 'estante', new Date(2026, 0, 1))],
    listasEspera: { [libro.isbn]: ['Ana'] },
    recientes: [libro.isbn],
    avisos: [{ id: '1', texto: 'Hola', fecha: '2026-01-01T00:00:00.000Z' }],
  };

  it('acepta un estado con la forma esperada', () => {
    expect(esEstadoGuardado(valido)).toBe(true);
  });

  it('rechaza datos con otra forma sin lanzar errores', () => {
    expect(esEstadoGuardado(null)).toBe(false);
    expect(esEstadoGuardado('texto')).toBe(false);
    expect(esEstadoGuardado({ ...valido, recientes: [1, 2] })).toBe(false);
    expect(esEstadoGuardado({ ...valido, prestamos: [{ isbn: 1 }] })).toBe(false);
  });
});
