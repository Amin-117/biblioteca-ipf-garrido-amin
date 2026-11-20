import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, tamaniosIcono, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { BotonPrimario } from './BotonPrimario';

type Props = {
  mensaje: string;
  // Toda pantalla de error tiene una salida: un botón (Reintentar/Volver) o un enlace.
  textoAccion?: string;
  onAccion?: () => void;
  children?: ReactNode;
};

export function MensajeError({ mensaje, textoAccion, onAccion, children }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="assertive">
      <Ionicons name="alert-circle-outline" size={tamaniosIcono.grande} color={c.error} />
      <Text style={estilos.texto}>{mensaje}</Text>
      {textoAccion && onAccion ? <BotonPrimario texto={textoAccion} onPress={onAccion} /> : null}
      {children}
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: espaciado.xl,
      gap: espaciado.md,
    },
    texto: {
      color: c.texto,
      fontSize: tipografia.subtitulo,
      textAlign: 'center',
    },
  });
}
