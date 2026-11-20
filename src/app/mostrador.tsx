import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BotonPrimario } from '../components/BotonPrimario';
import { FilaMostrador } from '../components/FilaMostrador';
import { MensajeVacio } from '../components/MensajeVacio';
import { bordes, espaciado, tipografia, type Colores } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { useTema } from '../hooks/useTema';
import { tituloDe } from '../lib/catalogo';

type LibroEnEspera = {
  isbn: string;
  titulo: string;
  alFrente: string | undefined;
  enEspera: number;
};

export default function Mostrador() {
  const { listasEspera, entregarAlSiguiente, cerrarSesion } = useBiblioteca();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const [ultimoMovimiento, setUltimoMovimiento] = useState<string | null>(null);

  const librosConEspera = useMemo<LibroEnEspera[]>(
    () =>
      Object.entries(listasEspera)
        .filter(([, cola]) => !cola.estaVacia())
        .map(([isbn, cola]) => ({
          isbn,
          titulo: tituloDe(isbn),
          alFrente: cola.verFrente(),
          enEspera: cola.tamanio,
        })),
    [listasEspera],
  );

  async function entregar(libro: LibroEnEspera) {
    const resultado = await entregarAlSiguiente(libro.isbn);
    if (resultado.tipo === 'sin-espera') {
      setUltimoMovimiento(`Nadie espera “${libro.titulo}” en este momento.`);
      return;
    }
    setUltimoMovimiento(
      resultado.aVos
        ? `Entregaste “${libro.titulo}” a ${resultado.persona}: se le avisó que ya puede retirarlo.`
        : `Entregaste “${libro.titulo}” a ${resultado.persona}.`,
    );
  }

  return (
    <View style={estilos.contenedor}>
      <FlatList
        data={librosConEspera}
        keyExtractor={(libro) => libro.isbn}
        renderItem={({ item }) => (
          <FilaMostrador
            titulo={item.titulo}
            alFrente={item.alFrente}
            enEspera={item.enEspera}
            onEntregar={() => entregar(item)}
          />
        )}
        ListHeaderComponent={
          ultimoMovimiento ? (
            <Text style={estilos.movimiento} accessibilityLiveRegion="polite">
              {ultimoMovimiento}
            </Text>
          ) : undefined
        }
        ListEmptyComponent={
          <MensajeVacio mensaje="No hay ningún libro con lista de espera. No hay nada para entregar." />
        }
        contentContainerStyle={estilos.lista}
      />
      <View style={estilos.pie}>
        <BotonPrimario texto="Cerrar sesión" variante="secundario" onPress={cerrarSesion} />
      </View>
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
    },
    lista: {
      paddingBottom: espaciado.lg,
    },
    movimiento: {
      color: c.exito,
      fontSize: tipografia.cuerpo,
      paddingHorizontal: espaciado.md,
      paddingTop: espaciado.md,
    },
    pie: {
      padding: espaciado.md,
      borderTopWidth: bordes.fino,
      borderTopColor: c.borde,
      backgroundColor: c.superficie,
    },
  });
}
