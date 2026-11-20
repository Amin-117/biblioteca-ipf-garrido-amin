import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { bordes, espaciado, pesos, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  etiqueta: string;
  valor: string;
};

export function DatoLibro({ etiqueta, valor }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.fila} accessible accessibilityLabel={`${etiqueta}: ${valor}`}>
      <Text style={estilos.etiqueta}>{etiqueta}</Text>
      <Text style={estilos.valor}>{valor}</Text>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    fila: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: espaciado.md,
      paddingVertical: espaciado.sm,
      borderBottomWidth: bordes.fino,
      borderBottomColor: c.borde,
    },
    etiqueta: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
    },
    valor: {
      flexShrink: 1,
      color: c.texto,
      fontSize: tipografia.cuerpo,
      fontWeight: pesos.medio,
      textAlign: 'right',
    },
  });
}
