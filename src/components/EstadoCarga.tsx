import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { espaciado, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  mensaje?: string;
};

export function EstadoCarga({ mensaje = 'Cargando…' }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={c.primario} />
      <Text style={estilos.texto}>{mensaje}</Text>
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
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
      textAlign: 'center',
    },
  });
}
