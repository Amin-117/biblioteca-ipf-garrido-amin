import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { bordes, espaciado, fuentes, pesos, radios, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  titulo: string;
  posicion: number;
  total: number;
};

export function TarjetaEspera({ titulo, posicion, total }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>
        Estás en el puesto {posicion} de {total} en la lista de espera.
      </Text>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    tarjeta: {
      gap: espaciado.xs,
      padding: espaciado.md,
      marginHorizontal: espaciado.md,
      marginBottom: espaciado.sm,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      backgroundColor: c.superficie,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.subtitulo,
      fontWeight: pesos.medio,
    },
    detalle: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
    },
  });
}
