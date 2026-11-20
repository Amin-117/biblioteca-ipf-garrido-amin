import Ionicons from '@expo/vector-icons/Ionicons';
import { type ComponentProps, useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { opacidades, radios, TAMANIO_TACTIL_MINIMO, tamaniosIcono, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  icono: ComponentProps<typeof Ionicons>['name'];
  // Obligatorio: un botón que solo tiene ícono no se entiende con lector de pantalla.
  accessibilityLabel: string;
  onPress: () => void;
};

export function BotonIcono({ icono, accessibilityLabel, onPress }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}>
      <Ionicons name={icono} size={tamaniosIcono.mediano} color={c.textoSecundario} />
    </Pressable>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    boton: {
      minWidth: TAMANIO_TACTIL_MINIMO,
      minHeight: TAMANIO_TACTIL_MINIMO,
      borderRadius: radios.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presionado: {
      opacity: opacidades.presionado,
      backgroundColor: c.borde,
    },
  });
}
