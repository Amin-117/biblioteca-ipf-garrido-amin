import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, tamaniosIcono, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { BotonPrimario } from './BotonPrimario';

type Props = {
  mensaje: string;
  onAbrirAjustes: () => void;
};

export function PantallaPermisoBloqueado({ mensaje, onAbrirAjustes }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor}>
      <Ionicons name="lock-closed-outline" size={tamaniosIcono.grande} color={c.textoSecundario} />
      <Text style={estilos.texto}>{mensaje}</Text>
      <BotonPrimario texto="Abrir Ajustes" onPress={onAbrirAjustes} />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      alignItems: 'center',
      gap: espaciado.md,
      padding: espaciado.md,
    },
    texto: {
      color: c.texto,
      fontSize: tipografia.cuerpo,
      textAlign: 'center',
    },
  });
}
