import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  bordes,
  espaciado,
  fuentes,
  pesos,
  TAMANIO_TACTIL_MINIMO,
  tamaniosIcono,
  tipografia,
  type Colores,
} from '../constants/tema';
import { useTema } from '../hooks/useTema';
import type { Libro } from '../types';

type Props = {
  libro: Libro;
};

export function FilaLibro({ libro }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Link href={{ pathname: '/libro/[isbn]', params: { isbn: libro.isbn } }} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Abre la ficha del libro"
        style={estilos.fila}>
        <View style={estilos.textos}>
          <Text style={estilos.titulo}>{libro.titulo}</Text>
          <Text style={estilos.autor}>
            {libro.autor} · {libro.anio}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={tamaniosIcono.chico} color={c.textoSecundario} />
      </Pressable>
    </Link>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    fila: {
      minHeight: TAMANIO_TACTIL_MINIMO,
      flexDirection: 'row',
      alignItems: 'center',
      gap: espaciado.sm,
      paddingVertical: espaciado.md,
      paddingHorizontal: espaciado.md,
      backgroundColor: c.superficie,
      borderBottomWidth: bordes.fino,
      borderBottomColor: c.borde,
    },
    textos: {
      flex: 1,
      gap: espaciado.xs,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.subtitulo,
      fontWeight: pesos.medio,
    },
    autor: {
      color: c.textoSecundario,
      fontSize: tipografia.chica,
    },
  });
}
