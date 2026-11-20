import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { bordes, espaciado, radios, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { BotonPrimario } from './BotonPrimario';

type Props = {
  texto: string;
  tipo?: 'info' | 'error';
  textoAccion?: string;
  onAccion?: () => void;
};

// Mensaje en línea (no ocupa la pantalla entera), opcionalmente con una acción.
export function Aviso({ texto, tipo = 'info', textoAccion, onAccion }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <View style={[estilos.aviso, tipo === 'error' && estilos.error]} accessibilityLiveRegion="polite">
      <Text style={estilos.texto}>{texto}</Text>
      {textoAccion && onAccion ? (
        <BotonPrimario texto={textoAccion} variante="secundario" onPress={onAccion} />
      ) : null}
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    aviso: {
      gap: espaciado.sm,
      padding: espaciado.md,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      borderLeftWidth: bordes.marcado,
      borderLeftColor: c.primario,
      backgroundColor: c.superficie,
    },
    error: {
      borderLeftColor: c.error,
    },
    texto: {
      color: c.texto,
      fontSize: tipografia.cuerpo,
    },
  });
}
