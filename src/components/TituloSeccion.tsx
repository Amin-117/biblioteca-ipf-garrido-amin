import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { espaciado, fuentes, pesos, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  texto: string;
};

export function TituloSeccion({ texto }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Text style={estilos.titulo} accessibilityRole="header">
      {texto}
    </Text>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.subtitulo,
      fontWeight: pesos.negrita,
      paddingHorizontal: espaciado.md,
      paddingTop: espaciado.lg,
      paddingBottom: espaciado.sm,
    },
  });
}
