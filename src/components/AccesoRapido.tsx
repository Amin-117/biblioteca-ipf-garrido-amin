import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, Link } from 'expo-router';
import { type ComponentProps, useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  espaciado,
  pesos,
  radios,
  TAMANIO_TACTIL_MINIMO,
  tamaniosIcono,
  tipografia,
  type Colores,
} from '../constants/tema';
import { useTema } from '../hooks/useTema';

type Props = {
  href: Href;
  texto: string;
  icono: ComponentProps<typeof Ionicons>['name'];
};

export function AccesoRapido({ href, texto, icono }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={estilos.acceso}>
        <Ionicons name={icono} size={tamaniosIcono.mediano} color={c.sobrePrimario} />
        <Text style={estilos.texto}>{texto}</Text>
      </Pressable>
    </Link>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    acceso: {
      flex: 1,
      minHeight: TAMANIO_TACTIL_MINIMO,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: espaciado.sm,
      paddingVertical: espaciado.md,
      borderRadius: radios.md,
      backgroundColor: c.primario,
    },
    texto: {
      color: c.sobrePrimario,
      fontSize: tipografia.cuerpo,
      fontWeight: pesos.medio,
    },
  });
}
