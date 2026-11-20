import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, fuentes, pesos, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import type { Libro } from '../types';
import { AccesoRapido } from './AccesoRapido';
import { ListaRecientes } from './ListaRecientes';

type Props = {
  libros: Libro[];
};

export function EncabezadoCatalogo({ libros }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.accesos}>
        <AccesoRapido href="/buscar" texto="Buscar" icono="search" />
        <AccesoRapido href="/escanear" texto="Escanear" icono="barcode-outline" />
      </View>
      <ListaRecientes libros={libros} />
      <Text style={estilos.titulo} accessibilityRole="header">
        Todos los libros
      </Text>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      gap: espaciado.lg,
      paddingTop: espaciado.md,
      paddingBottom: espaciado.sm,
    },
    accesos: {
      flexDirection: 'row',
      gap: espaciado.sm,
      paddingHorizontal: espaciado.md,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.subtitulo,
      fontWeight: pesos.negrita,
      paddingHorizontal: espaciado.md,
    },
  });
}
