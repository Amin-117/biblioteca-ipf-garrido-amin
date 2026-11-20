import AsyncStorage from '@react-native-async-storage/async-storage';

import { CLAVE_ALMACENAMIENTO } from '../constants/biblioteca';
import type { EstadoGuardado } from '../types';
import { esEstadoGuardado } from './validaciones';

// Datos ausentes, JSON corrupto o con otra forma: se arranca con el estado inicial sin romper la app.
export async function cargarEstado(): Promise<EstadoGuardado | null> {
  try {
    const texto = await AsyncStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (texto === null) {
      return null;
    }
    const datos: unknown = JSON.parse(texto);
    return esEstadoGuardado(datos) ? datos : null;
  } catch {
    return null;
  }
}

export async function guardarEstado(estado: EstadoGuardado): Promise<void> {
  await AsyncStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(estado));
}
