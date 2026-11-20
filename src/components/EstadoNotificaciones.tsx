import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, tamaniosIcono, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import type { EstadoPermiso } from '../types';

type Props = {
  estado: EstadoPermiso;
};

const TEXTOS: Record<EstadoPermiso, string> = {
  cargando: 'Consultando las notificaciones…',
  concedido: 'Notificaciones activadas',
  preguntable: 'Notificaciones desactivadas: se piden al activar “Recordarme”.',
  bloqueado: 'Notificaciones desactivadas: te avisamos acá adentro.',
};

export function EstadoNotificaciones({ estado }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const activadas = estado === 'concedido';

  return (
    <View style={estilos.fila} accessible accessibilityLiveRegion="polite">
      <Ionicons
        name={activadas ? 'notifications' : 'notifications-off-outline'}
        size={tamaniosIcono.chico}
        color={activadas ? c.exito : c.textoSecundario}
      />
      <Text style={estilos.texto}>{TEXTOS[estado]}</Text>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    fila: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.sm,
      paddingHorizontal: espaciado.md,
      paddingTop: espaciado.md,
    },
    texto: {
      flex: 1,
      color: c.textoSecundario,
      fontSize: tipografia.chica,
    },
  });
}
