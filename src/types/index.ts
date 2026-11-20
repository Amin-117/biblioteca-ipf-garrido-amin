import type { Cola } from '../estructuras/Cola';
import type { Pila } from '../estructuras/Pila';

export type Libro = {
  isbn: string;        // 13 dígitos, sin guiones
  titulo: string;
  autor: string;
  anio: number;
  ejemplares: number;  // ejemplares en el estante al iniciar la app
};

export type OrigenPrestamo = 'estante' | 'mostrador';

export type EstadoPrestamo = 'activo' | 'devuelto';

export type Prestamo = {
  isbn: string;
  fechaInicio: string; // ISO 8601
  fechaDevolucion: string; // ISO 8601
  recordatorioId: string | null;
  origen: OrigenPrestamo;
  estado: EstadoPrestamo;
};

export type Aviso = {
  id: string;
  texto: string;
  fecha: string; // ISO 8601
};

export type Recurso = 'camara' | 'notificaciones';

export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export type ResultadoReserva =
  | { tipo: 'prestamo'; fechaDevolucion: string }
  | { tipo: 'espera'; posicion: number }
  | { tipo: 'rechazada' };

export type ResultadoEntrega =
  | { tipo: 'sin-espera' }
  | { tipo: 'entregado'; persona: string; aVos: boolean };

export type BibliotecaContextValor = {
  prestamos: Prestamo[];
  // Instancias de solo lectura para la UI: el Provider nunca las muta, crea copias nuevas.
  listasEspera: Readonly<Record<string, Cola<string>>>;
  recientes: Pila<string>; // ISBN vistos, de base a tope
  sesionIniciada: boolean;
  avisos: Aviso[];
  registrarVisto: (isbn: string) => void;
  reservar: (isbn: string) => ResultadoReserva;
  devolver: (isbn: string) => Promise<void>;
  activarRecordatorio: (isbn: string) => Promise<void>;
  desactivarRecordatorio: (isbn: string) => Promise<void>;
  sincronizarRecordatorios: () => Promise<void>;
  entregarAlSiguiente: (isbn: string) => Promise<ResultadoEntrega>;
  iniciarSesion: (usuario: string, clave: string) => boolean;
  cerrarSesion: () => void;
  agregarAviso: (texto: string) => void;
  descartarAviso: (id: string) => void;
  disponibles: (isbn: string) => number;
  posicionEnEspera: (isbn: string) => number;
  yaReservado: (isbn: string) => boolean;
  prestamoActivo: (isbn: string) => Prestamo | undefined;
};
