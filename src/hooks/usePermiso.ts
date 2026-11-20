import { useCameraPermissions } from 'expo-camera';
import {
  getPermissionsAsync,
  type NotificationPermissionsStatus,
  requestPermissionsAsync,
} from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Linking } from 'react-native';

import { crearCanalPrestamos } from '../lib/notificaciones';
import { mapearPermiso } from '../lib/permisos';
import type { EstadoPermiso, Recurso } from '../types';

type RespuestaPermiso = Pick<NotificationPermissionsStatus, 'granted' | 'canAskAgain'>;

// Si el sistema no puede responder (por ejemplo, en web), se trata como bloqueado:
// la app sigue funcionando con su alternativa.
const SIN_SOPORTE: RespuestaPermiso = { granted: false, canAskAgain: false };

export type ControlPermiso = {
  estado: EstadoPermiso;
  pedir: () => Promise<EstadoPermiso>;
  abrirAjustes: () => Promise<void>;
  actualizar: () => Promise<EstadoPermiso>;
};

export function usePermiso(recurso: Recurso): ControlPermiso {
  const esCamara = recurso === 'camara';
  // El hook de expo-camera se llama siempre (reglas de los hooks); solo consulta si es la cámara.
  const [permisoCamara, pedirCamara, consultarCamara] = useCameraPermissions({ get: esCamara });
  const [permisoNotificaciones, setPermisoNotificaciones] = useState<RespuestaPermiso | null>(null);
  // actualizar() y pedir() se llaman desde handlers y foco: si la pantalla ya se desmontó, no se guarda nada.
  const montado = useRef(true);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const guardarNotificaciones = useCallback((respuesta: RespuestaPermiso) => {
    if (montado.current) {
      setPermisoNotificaciones(respuesta);
    }
  }, []);

  const estado = mapearPermiso(esCamara ? permisoCamara : permisoNotificaciones);

  const actualizar = useCallback(async (): Promise<EstadoPermiso> => {
    try {
      if (esCamara) {
        return mapearPermiso(await consultarCamara());
      }
      const respuesta = await getPermissionsAsync();
      guardarNotificaciones(respuesta);
      return mapearPermiso(respuesta);
    } catch {
      guardarNotificaciones(SIN_SOPORTE);
      return mapearPermiso(SIN_SOPORTE);
    }
  }, [esCamara, consultarCamara, guardarNotificaciones]);

  const pedir = useCallback(async (): Promise<EstadoPermiso> => {
    try {
      if (esCamara) {
        return mapearPermiso(await pedirCamara());
      }
      // Android 13+: el canal se crea antes de pedir el permiso.
      await crearCanalPrestamos();
      const respuesta = await requestPermissionsAsync();
      guardarNotificaciones(respuesta);
      return mapearPermiso(respuesta);
    } catch {
      guardarNotificaciones(SIN_SOPORTE);
      return mapearPermiso(SIN_SOPORTE);
    }
  }, [esCamara, pedirCamara, guardarNotificaciones]);

  const abrirAjustes = useCallback(() => Linking.openSettings(), []);

  useEffect(() => {
    let activo = true;

    async function consultarNotificaciones() {
      try {
        const respuesta = await getPermissionsAsync();
        if (activo) {
          setPermisoNotificaciones(respuesta);
        }
      } catch {
        if (activo) {
          setPermisoNotificaciones(SIN_SOPORTE);
        }
      }
    }

    function consultar() {
      if (esCamara) {
        consultarCamara();
      } else {
        consultarNotificaciones();
      }
    }

    // La cámara ya se consulta al montar (opción get); las notificaciones, acá.
    if (!esCamara) {
      consultarNotificaciones();
    }

    // Al volver de Ajustes la app pasa a 'active': se vuelve a consultar y la pantalla se actualiza sola.
    const suscripcion = AppState.addEventListener('change', (estadoApp) => {
      if (estadoApp === 'active') {
        consultar();
      }
    });

    return () => {
      activo = false;
      suscripcion.remove();
    };
  }, [esCamara, consultarCamara]);

  return { estado, pedir, abrirAjustes, actualizar };
}
