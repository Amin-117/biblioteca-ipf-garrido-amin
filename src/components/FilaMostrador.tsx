import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { bordes, espaciado, fuentes, pesos, radios, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { BotonPrimario } from './BotonPrimario';

type Props = {
  titulo: string;
  alFrente: string | undefined;
  enEspera: number;
  onEntregar: () => void;
};

export function FilaMostrador({ titulo, alFrente, enEspera, onEntregar }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>Al frente: {alFrente ?? 'nadie'}</Text>
      <Text style={estilos.detalle}>
        {enEspera === 1 ? 'Espera 1 persona' : `Esperan ${enEspera} personas`}
      </Text>
      <BotonPrimario
        texto="Entregar al siguiente"
        onPress={onEntregar}
        deshabilitado={enEspera === 0}
        accessibilityHint={`Entrega un ejemplar de ${titulo} a la primera persona de la lista`}
      />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    tarjeta: {
      gap: espaciado.sm,
      padding: espaciado.md,
      marginHorizontal: espaciado.md,
      marginTop: espaciado.md,
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
