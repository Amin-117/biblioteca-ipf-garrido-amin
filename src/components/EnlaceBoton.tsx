import { type Href, Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

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

type Props = {
  href: Href;
  texto: string;
  replace?: boolean;
};

// <Link> con aspecto de botón secundario: para salidas como "Ir al Catálogo".
// Bajo <Link asChild> el style tiene que ser estático: la forma de función ({ pressed }) se pierde.
export function EnlaceBoton({ href, texto, replace = false }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Link href={href} replace={replace} asChild>
      <Pressable
        accessibilityRole="link"
        style={estilos.enlace}>
        <Text style={estilos.texto}>{texto}</Text>
      </Pressable>
    </Link>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    enlace: {
      minHeight: TAMANIO_TACTIL_MINIMO,
      paddingHorizontal: espaciado.lg,
      paddingVertical: espaciado.sm,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.primario,
      backgroundColor: c.superficie,
      alignItems: 'center',
      justifyContent: 'center',
    },
    texto: {
      color: c.primario,
      fontSize: tipografia.cuerpo,
      fontWeight: pesos.medio,
    },
  });
}
