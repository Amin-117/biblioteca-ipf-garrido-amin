import type { EstadoPermiso, Recurso } from '../types';

type RespuestaPermiso = {
  granted: boolean;
  canAskAgain: boolean;
};

export function mapearPermiso(respuesta: RespuestaPermiso | null): EstadoPermiso {
  if (respuesta === null) {
    return 'cargando';
  }
  if (respuesta.granted) {
    return 'concedido';
  }
  // canAskAgain (no status) decide entre "Continuar" y "Abrir Ajustes": status es 'denied' en ambos casos.
  return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
}

export function esRecurso(valor: string): valor is Recurso {
  return valor === 'camara' || valor === 'notificaciones';
}
