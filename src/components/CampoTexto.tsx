import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import {
  bordes,
  espaciado,
  pesos,
  radios,
  TAMANIO_TACTIL_MINIMO,
  tipografia,
  type Colores,
} from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = Omit<TextInputProps, 'style' | 'value' | 'onChangeText'> & {
  etiqueta: string;
  valor: string;
  onCambiar: (texto: string) => void;
};

export function CampoTexto({ etiqueta, valor, onCambiar, ...resto }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <TextInput
        {...resto}
        accessibilityLabel={etiqueta}
        value={valor}
        onChangeText={onCambiar}
        placeholderTextColor={c.textoSecundario}
        style={estilos.campo}
      />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      gap: espaciado.xs,
    },
    etiqueta: {
      color: c.texto,
      fontSize: tipografia.chica,
      fontWeight: pesos.medio,
    },
    campo: {
      minHeight: TAMANIO_TACTIL_MINIMO,
      paddingHorizontal: espaciado.md,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      backgroundColor: c.superficie,
      color: c.texto,
      fontSize: tipografia.cuerpo,
    },
  });
}
