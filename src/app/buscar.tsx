import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { CampoTexto } from '../components/CampoTexto';
import { EstadoCarga } from '../components/EstadoCarga';
import { FilaLibro } from '../components/FilaLibro';
import { MensajeError } from '../components/MensajeError';
import { MensajeVacio } from '../components/MensajeVacio';
import { DEMORA_BUSQUEDA_MS } from '../constants/biblioteca';
import { bordes, espaciado, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { buscarLibros } from '../lib/api';
import { normalizarParametro } from '../lib/validaciones';
import type { Libro } from '../types';

export default function Buscar() {
  const params = useLocalSearchParams<{ q?: string }>();
  const q = normalizarParametro(params.q);
  const consulta = q.trim();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  // Estado local del input, inicializado desde la URL, para que lo escrito no "salte".
  const [texto, setTexto] = useState(q);
  const [resultados, setResultados] = useState<Libro[]>([]);
  const [cargando, setCargando] = useState(consulta !== '');
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (consulta === '') {
      return;
    }
    // La limpieza corre antes de la próxima búsqueda (o al desmontar):
    // cancela el temporizador pendiente y marca como vieja la respuesta en vuelo.
    let activo = true;
    const temporizador = setTimeout(async () => {
      try {
        const libros = await buscarLibros(consulta);
        if (activo) {
          setResultados(libros);
          setCargando(false);
        }
      } catch {
        if (activo) {
          setError(true);
          setCargando(false);
        }
      }
    }, DEMORA_BUSQUEDA_MS);

    return () => {
      activo = false;
      clearTimeout(temporizador);
    };
  }, [consulta, intento]);

  function cambiarTexto(nuevo: string) {
    setTexto(nuevo);
    // setParams reemplaza el parámetro de la ruta actual: no apila una pantalla por letra.
    router.setParams({ q: nuevo });
    if (nuevo.trim() !== consulta) {
      setCargando(nuevo.trim() !== '');
      setError(false);
    }
  }

  function reintentar() {
    setCargando(true);
    setError(false);
    setIntento((anterior) => anterior + 1);
  }

  let contenido;
  if (consulta === '') {
    contenido = <MensajeVacio mensaje="Escribí un título o un autor para buscar en el catálogo." />;
  } else if (cargando) {
    contenido = <EstadoCarga mensaje={`Buscando “${consulta}”…`} />;
  } else if (error) {
    contenido = (
      <MensajeError
        mensaje="No pudimos completar la búsqueda. Probá de nuevo."
        textoAccion="Reintentar"
        onAccion={reintentar}
      />
    );
  } else {
    contenido = (
      <FlatList
        data={resultados}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => <FilaLibro libro={item} />}
        ListEmptyComponent={
          <MensajeVacio mensaje={`No encontramos libros para “${consulta}”. Probá con otro título o autor.`} />
        }
        keyboardShouldPersistTaps="handled"
      />
    );
  }

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.buscador}>
        <CampoTexto
          etiqueta="Título o autor"
          valor={texto}
          onCambiar={cambiarTexto}
          placeholder="Por ejemplo: borges"
          autoFocus={consulta === ''}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
      <View style={estilos.contenido}>{contenido}</View>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
    },
    buscador: {
      padding: espaciado.md,
      borderBottomWidth: bordes.fino,
      borderBottomColor: c.borde,
      backgroundColor: c.superficie,
    },
    contenido: {
      flex: 1,
    },
  });
}
