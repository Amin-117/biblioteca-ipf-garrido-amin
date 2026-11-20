// Persona usuaria de la app (los alumnos). En la lista de espera aparece con este nombre.
export const USUARIO_ACTUAL = 'Vos';

export const DIAS_PRESTAMO = 7;

// Modo demostración: el recordatorio llega a los 15 segundos en vez de un día antes del vencimiento.
export const SEGUNDOS_RECORDATORIO_DEMO = 15;

export const CANAL_PRESTAMOS = 'prestamos';

export const CANTIDAD_RECIENTES = 3;

export const DEMORA_BUSQUEDA_MS = 300;

// Tiempo durante el que se ignora un código no encontrado que sigue frente a la cámara.
export const ESPERA_CODIGO_REPETIDO_MS = 3000;

export const DEMORA_GUARDADO_MS = 400;

export const CLAVE_ALMACENAMIENTO = 'biblioteca-ipf/estado-v1';

// Credenciales fijas del personal (consigna: usuario y clave fijos en el código).
export const CREDENCIALES_PERSONAL = {
  usuario: 'biblioteca',
  clave: 'ipf2026',
} as const;
