import type { Recurso } from '../types';

// Molde: "Usamos tu [dato] para [beneficio concreto]".
export const BENEFICIO_PERMISO: Record<Recurso, string> = {
  camara:
    'Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.',
  notificaciones:
    'Usamos las notificaciones para recordarte cuándo devolver un libro y avisarte cuando una reserva está lista para retirar.',
};

export const ALTERNATIVA_PERMISO: Record<Recurso, string> = {
  camara: 'La cámara está bloqueada para esta app. Podés habilitarla en Ajustes o escribir el ISBN a mano.',
  notificaciones: 'Las notificaciones están desactivadas. Te avisamos acá adentro.',
};

export const NOMBRE_RECURSO: Record<Recurso, string> = {
  camara: 'Cámara',
  notificaciones: 'Notificaciones',
};
