import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, tamaniosIcono, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  mensaje: string;
  children?: ReactNode;
};

export function MensajeVacio({ mensaje, children }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="book-outline" size={tamaniosIcono.grande} color={c.textoSecundario} />
      <Text style={estilos.texto}>{mensaje}</Text>
      {children}
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: espaciado.xl,
      gap: espaciado.md,
    },
    texto: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
      textAlign: 'center',
    },
  });
}
