import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  ANCHO_TARJETA_RECIENTE,
  bordes,
  espaciado,
  fuentes,
  opacidades,
  pesos,
  radios,
  TAMANIO_TACTIL_MINIMO,
  tipografia,
  type Colores,
} from '../constants/tema';
import { useTema } from '../hooks/useTema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
};

export function TarjetaReciente({ libro }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Link href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${libro.titulo}, de ${libro.autor}`}
        style={({ pressed }) => [estilos.tarjeta, pressed && estilos.presionada]}>
        <Text style={estilos.titulo} numberOfLines={2}>
          {libro.titulo}
        </Text>
        <Text style={estilos.autor} numberOfLines={1}>
          {libro.autor}
        </Text>
      </Pressable>
    </Link>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    tarjeta: {
      width: ANCHO_TARJETA_RECIENTE,
      minHeight: TAMANIO_TACTIL_MINIMO,
      gap: espaciado.xs,
      padding: espaciado.md,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      borderLeftWidth: bordes.marcado,
      borderLeftColor: c.primario,
      backgroundColor: c.superficie,
    },
    presionada: {
      opacity: opacidades.presionado,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.cuerpo,
      fontWeight: pesos.medio,
    },
    autor: {
      color: c.textoSecundario,
      fontSize: tipografia.minima,
    },
  });
}
