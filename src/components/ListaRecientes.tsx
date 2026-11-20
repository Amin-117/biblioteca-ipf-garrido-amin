import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { CANTIDAD_RECIENTES } from '../constants/biblioteca';
import { espaciado, fuentes, pesos, tipografia, type Colores } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { useTema } from '../hooks/useTema';
import { ultimosVistos } from '../lib/recientes';
import type { Libro } from '../types';
import { TarjetaReciente } from './TarjetaReciente';

type Props = {
  libros: Libro[];
};

// Los 3 del tope de la Pila de recientes, del más reciente al más antiguo.
export function ListaRecientes({ libros }: Props) {
  const { recientes } = useBiblioteca();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  const vistos = useMemo(
    () =>
      ultimosVistos(recientes, CANTIDAD_RECIENTES)
        .map((isbn) => libros.find((libro) => libro.isbn === isbn))
        .filter((libro): libro is Libro => libro !== undefined),
    [recientes, libros],
  );

  return (
    <View style={estilos.seccion}>
      <Text style={estilos.titulo} accessibilityRole="header">
        Vistos recientemente
      </Text>
      <FlatList
        horizontal
        data={vistos}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <TarjetaReciente libro={item} />}
        ListEmptyComponent={
          <Text style={estilos.vacio}>Todavía no abriste ningún libro.</Text>
        }
        contentContainerStyle={estilos.lista}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    seccion: {
      gap: espaciado.sm,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.subtitulo,
      fontWeight: pesos.negrita,
      paddingHorizontal: espaciado.md,
    },
    lista: {
      gap: espaciado.sm,
      paddingHorizontal: espaciado.md,
    },
    vacio: {
      color: c.textoSecundario,
      fontSize: tipografia.chica,
    },
  });
}
