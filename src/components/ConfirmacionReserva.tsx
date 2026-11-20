import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, fuentes, pesos, tamaniosIcono, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { BotonPrimario } from './BotonPrimario';

type Props = {
  titulo: string;
  explicacion: string;
  esPrestamo: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
};

export function ConfirmacionReserva({ titulo, explicacion, esPrestamo, onConfirmar, onCancelar }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor}>
      <Ionicons
        name={esPrestamo ? 'book-outline' : 'people-outline'}
        size={tamaniosIcono.grande}
        color={c.primario}
      />
      <Text style={estilos.titulo} accessibilityRole="header">
        {titulo}
      </Text>
      <Text style={estilos.explicacion}>{explicacion}</Text>
      <View style={estilos.botones}>
        <BotonPrimario texto="Confirmar" onPress={onConfirmar} />
        <BotonPrimario texto="Cancelar" variante="secundario" onPress={onCancelar} />
      </View>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      padding: espaciado.lg,
      gap: espaciado.md,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.titulo,
      fontWeight: pesos.negrita,
    },
    explicacion: {
      color: c.texto,
      fontSize: tipografia.subtitulo,
    },
    botones: {
      gap: espaciado.sm,
      marginTop: espaciado.md,
    },
  });
}
