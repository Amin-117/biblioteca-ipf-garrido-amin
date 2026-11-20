import { router, Stack } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { espaciado, fuentes, pesos, tipografia, type Colores } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { useLibros } from '../hooks/useLibros';
import { useTema } from '../hooks/useTema';
import { formatearFecha } from '../lib/fechas';
import { BotonPrimario } from './BotonPrimario';
import { DatoLibro } from './DatoLibro';
import { EnlaceBoton } from './EnlaceBoton';
import { EstadoCarga } from './EstadoCarga';
import { MensajeError } from './MensajeError';

type Props = {
  // Ya validado (13 dígitos): este componente sí hace el pedido.
  isbn: string;
};

function personas(cantidad: number): string {
  return cantidad === 1 ? '1 persona' : `${cantidad} personas`;
}

export function FichaLibro({ isbn }: Props) {
  const { libros, cargando, error, reintentar } = useLibros();
  const { registrarVisto, disponibles, listasEspera, prestamoActivo, posicionEnEspera } =
    useBiblioteca();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  const libro = libros.find((candidato) => candidato.isbn === isbn);
  const existe = libro !== undefined;

  // Solo se apila un detalle válido y existente; depende de "existe" (booleano) y no del objeto
  // libro, que es nuevo en cada respuesta de la API.
  useEffect(() => {
    if (existe) {
      registrarVisto(isbn);
    }
  }, [existe, isbn, registrarVisto]);

  if (cargando) {
    return (
      <>
        <Stack.Screen options={{ title: 'Cargando…' }} />
        <EstadoCarga mensaje="Buscando el libro…" />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro' }} />
        <MensajeError mensaje={error} textoAccion="Reintentar" onAccion={reintentar}>
          <EnlaceBoton href="/" texto="Ir al Catálogo" />
        </MensajeError>
      </>
    );
  }

  if (!libro) {
    return (
      <>
        <Stack.Screen options={{ title: 'Libro no encontrado' }} />
        <MensajeError mensaje="No encontramos ningún libro con ese ISBN en la biblioteca.">
          <EnlaceBoton href="/" texto="Ir al Catálogo" />
        </MensajeError>
      </>
    );
  }

  const prestamo = prestamoActivo(isbn);
  const posicion = posicionEnEspera(isbn);
  const enEspera = listasEspera[isbn]?.tamanio ?? 0;

  let textoBoton = 'Reservar';
  if (prestamo) {
    textoBoton = 'Ya lo reservaste: lo tenés prestado';
  } else if (posicion !== -1) {
    textoBoton = `Ya lo reservaste: sos el puesto ${posicion}`;
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido}>
      <Stack.Screen options={{ title: libro.titulo }} />
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo} accessibilityRole="header">
          {libro.titulo}
        </Text>
        <Text style={estilos.autor}>{libro.autor}</Text>
      </View>
      <View>
        <DatoLibro etiqueta="Año" valor={String(libro.anio)} />
        <DatoLibro etiqueta="Ejemplares disponibles" valor={String(disponibles(isbn))} />
        <DatoLibro etiqueta="En lista de espera" valor={personas(enEspera)} />
        <DatoLibro etiqueta="ISBN" valor={libro.isbn} />
        {prestamo ? (
          <DatoLibro etiqueta="Lo devolvés el" valor={formatearFecha(prestamo.fechaDevolucion)} />
        ) : null}
      </View>
      <BotonPrimario
        texto={textoBoton}
        deshabilitado={prestamo !== undefined || posicion !== -1}
        onPress={() => router.push({ pathname: '/reservar/[isbn]', params: { isbn } })}
      />
    </ScrollView>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenido: {
      padding: espaciado.lg,
      gap: espaciado.lg,
    },
    cabecera: {
      gap: espaciado.xs,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.portada,
      fontWeight: pesos.negrita,
    },
    autor: {
      color: c.textoSecundario,
      fontSize: tipografia.subtitulo,
    },
  });
}
