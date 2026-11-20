import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { espaciado, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { esIsbnValido } from '../lib/validaciones';
import { BotonPrimario } from './BotonPrimario';
import { CampoTexto } from './CampoTexto';

type Props = {
  onBuscar: (isbn: string) => void;
};

// Alternativa que siempre está disponible: sin cámara, el ISBN se escribe a mano.
export function EntradaIsbnManual({ onBuscar }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const [texto, setTexto] = useState('');

  const isbn = texto.trim();
  const valido = esIsbnValido(isbn);
  const mostrarAyuda = isbn !== '' && !valido;

  return (
    <View style={estilos.contenedor}>
      <CampoTexto
        etiqueta="O escribí el ISBN (13 números)"
        valor={texto}
        onCambiar={setTexto}
        keyboardType="number-pad"
        maxLength={13}
        placeholder="9788499089515"
        returnKeyType="search"
        onSubmitEditing={valido ? () => onBuscar(isbn) : undefined}
      />
      {mostrarAyuda ? (
        <Text style={estilos.ayuda}>
          Faltan números: el ISBN tiene 13 dígitos y escribiste {isbn.length}.
        </Text>
      ) : null}
      <BotonPrimario texto="Buscar" onPress={() => onBuscar(isbn)} deshabilitado={!valido} />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      gap: espaciado.sm,
    },
    ayuda: {
      color: c.textoSecundario,
      fontSize: tipografia.chica,
    },
  });
}
