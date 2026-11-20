import { useMemo } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { bordes, espaciado, fuentes, pesos, radios, TAMANIO_TACTIL_MINIMO, tipografia, type Colores } from '../constants/tema';
import { useTema } from '../hooks/useTema';
import { formatearFecha } from '../lib/fechas';
import type { Prestamo } from '../types';
import { BotonPrimario } from './BotonPrimario';

type Props = {
  prestamo: Prestamo;
  titulo: string;
  onCambiarRecordatorio: (activar: boolean) => void;
  onDevolver: () => void;
};

export function TarjetaPrestamo({ prestamo, titulo, onCambiarRecordatorio, onDevolver }: Props) {
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const recordatorioActivo = prestamo.recordatorioId !== null;

  return (
    <View style={estilos.tarjeta}>
      <Text style={estilos.titulo}>{titulo}</Text>
      <Text style={estilos.detalle}>Devolvelo el {formatearFecha(prestamo.fechaDevolucion)}</Text>
      {prestamo.origen === 'mostrador' ? (
        <Text style={estilos.detalle}>Lo retirás en el mostrador.</Text>
      ) : null}
      <View style={estilos.filaInterruptor}>
        <Text style={estilos.etiqueta}>Recordarme</Text>
        <Switch
          accessibilityLabel={`Recordarme la devolución de ${titulo}`}
          value={recordatorioActivo}
          onValueChange={onCambiarRecordatorio}
          trackColor={{ false: c.deshabilitado, true: c.primario }}
          thumbColor={c.superficie}
        />
      </View>
      <BotonPrimario
        texto="Devolver"
        variante="secundario"
        onPress={onDevolver}
        accessibilityHint={`Marca ${titulo} como devuelto y cancela el recordatorio`}
      />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    tarjeta: {
      gap: espaciado.sm,
      padding: espaciado.md,
      marginHorizontal: espaciado.md,
      marginBottom: espaciado.md,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      backgroundColor: c.superficie,
    },
    titulo: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.subtitulo,
      fontWeight: pesos.medio,
    },
    detalle: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
    },
    filaInterruptor: {
      minHeight: TAMANIO_TACTIL_MINIMO,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    etiqueta: {
      color: c.texto,
      fontSize: tipografia.cuerpo,
    },
  });
}
