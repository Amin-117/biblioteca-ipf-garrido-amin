import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  bordes,
  espaciado,
  opacidades,
  pesos,
  radios,
  TAMANIO_TACTIL_MINIMO,
  tipografia,
  type Colores,
} from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  texto: string;
  onPress: () => void;
  deshabilitado?: boolean;
  variante?: 'primario' | 'secundario';
  accessibilityHint?: string;
};

export function BotonPrimario({
  texto,
  onPress,
  deshabilitado = false,
  variante = 'primario',
  accessibilityHint,
}: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const esSecundario = variante === 'secundario';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: deshabilitado }}
      accessibilityHint={accessibilityHint}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        estilos.boton,
        esSecundario && estilos.botonSecundario,
        deshabilitado && estilos.botonDeshabilitado,
        pressed && estilos.presionado,
      ]}>
      <Text
        style={[
          estilos.texto,
          esSecundario && estilos.textoSecundario,
          deshabilitado && estilos.textoDeshabilitado,
        ]}>
        {texto}
      </Text>
    </Pressable>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    boton: {
      minHeight: TAMANIO_TACTIL_MINIMO,
      minWidth: TAMANIO_TACTIL_MINIMO,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.sm,
      borderRadius: radios.md,
      backgroundColor: c.primario,
      alignItems: 'center',
      justifyContent: 'center',
    },
    botonSecundario: {
      backgroundColor: c.superficie,
      borderWidth: bordes.fino,
      borderColor: c.primario,
    },
    botonDeshabilitado: {
      backgroundColor: c.deshabilitado,
      borderColor: c.deshabilitado,
    },
    presionado: {
      opacity: opacidades.presionado,
    },
    texto: {
      color: c.sobrePrimario,
      fontSize: tipografia.cuerpo,
      fontWeight: pesos.medio,
      textAlign: 'center',
    },
    textoSecundario: {
      color: c.primario,
    },
    textoDeshabilitado: {
      color: c.fondo,
    },
  });
}
