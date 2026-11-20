import {
  AndroidImportance,
  cancelScheduledNotificationAsync,
  getAllScheduledNotificationsAsync,
  getPermissionsAsync,
  SchedulableTriggerInputTypes,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
} from 'expo-notifications';
import { Platform } from 'react-native';

import { CANAL_PRESTAMOS, SEGUNDOS_RECORDATORIO_DEMO } from '../constants/biblioteca';
import { formatearFecha } from './fechas';

// Se configura una sola vez al importar el módulo (lo importa el layout raíz):
// así las notificaciones también se muestran con la app abierta.
// En Android, shouldPlaySound: false impide el aviso desplegable, por eso va en true.
setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// En Android 13+ el canal tiene que existir antes de pedir el permiso.
export async function crearCanalPrestamos(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }
  await setNotificationChannelAsync(CANAL_PRESTAMOS, {
    name: 'Préstamos',
    description: 'Recordatorios de devolución y libros listos para retirar',
    importance: AndroidImportance.HIGH,
  });
}

// Modo demostración: llega a los SEGUNDOS_RECORDATORIO_DEMO segundos. Devuelve el identificador.
export async function programarRecordatorio(titulo: string, fechaDevolucionIso: string): Promise<string> {
  return scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de devolución',
      body: `Recordá devolver “${titulo}” antes del ${formatearFecha(fechaDevolucionIso)}.`,
    },
    trigger: {
      type: SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: SEGUNDOS_RECORDATORIO_DEMO,
      channelId: CANAL_PRESTAMOS,
    },
  });
}

export async function notificarRetiroDisponible(titulo: string): Promise<void> {
  await crearCanalPrestamos();
  await scheduleNotificationAsync({
    content: {
      title: 'Biblioteca IPF',
      body: `¡Ya podés retirar “${titulo}”!`,
    },
    trigger: null,
  });
}

export async function cancelarRecordatorio(id: string): Promise<void> {
  await cancelScheduledNotificationAsync(id);
}

export async function idsProgramados(): Promise<Set<string>> {
  const programadas = await getAllScheduledNotificationsAsync();
  return new Set(programadas.map((notificacion) => notificacion.identifier));
}

// Se consulta en el momento (no se usa un valor guardado): la persona pudo cambiarlo en Ajustes.
export async function notificacionesConcedidas(): Promise<boolean> {
  const permiso = await getPermissionsAsync();
  return permiso.granted;
}
