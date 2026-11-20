import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { bordes, espaciado, radios, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import type { Aviso } from '../types';
import { BotonIcono } from './BotonIcono';

type Props = {
  aviso: Aviso;
  onDescartar: () => void;
};

export function TarjetaAviso({ aviso, onDescartar }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.tarjeta} accessibilityLiveRegion="polite">
      <Text style={estilos.texto}>{aviso.texto}</Text>
      <BotonIcono icono="close" accessibilityLabel="Descartar aviso" onPress={onDescartar} />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    tarjeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.sm,
      paddingLeft: espaciado.md,
      paddingVertical: espaciado.xs,
      marginHorizontal: espaciado.md,
      marginBottom: espaciado.sm,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      borderLeftWidth: bordes.marcado,
      borderLeftColor: c.exito,
      backgroundColor: c.superficie,
    },
    texto: {
      flex: 1,
      color: c.texto,
      fontSize: tipografia.cuerpo,
    },
  });
}
