import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ALTERNATIVA_PERMISO, BENEFICIO_PERMISO } from '../constants/textos';
import { espaciado, fuentes, pesos, tamaniosIcono, tipografia, type Colores } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { usePermiso } from '../hooks/usePermiso';
import { useTema } from '../hooks/useTema';
import { volver } from '../lib/navegacion';
import type { Recurso } from '../types';
import { BotonPrimario } from './BotonPrimario';
import { EstadoCarga } from './EstadoCarga';

type Props = {
  recurso: Recurso;
  // Préstamo cuyo recordatorio se activa al conceder notificaciones (opcional).
  isbnRecordatorio: string | null;
};

export function PantallaPermisoPrevia({ recurso, isbnRecordatorio }: Props) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);
  const { activarRecordatorio, agregarAviso } = useBiblioteca();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const [pidiendo, setPidiendo] = useState(false);

  async function continuar() {
    setPidiendo(true);
    const nuevoEstado = await pedir();
    if (nuevoEstado === 'concedido' && recurso === 'notificaciones' && isbnRecordatorio) {
      try {
        await activarRecordatorio(isbnRecordatorio);
      } catch {
        agregarAviso('No pudimos programar el recordatorio. Probá activarlo de nuevo desde Mis reservas.');
      }
    }
    volver();
  }

  if (estado === 'cargando' || pidiendo) {
    return <EstadoCarga mensaje="Consultando el permiso…" />;
  }

  const icono = recurso === 'camara' ? 'camera-outline' : 'notifications-outline';

  return (
    <View style={estilos.contenedor}>
      <Ionicons name={icono} size={tamaniosIcono.grande} color={c.primario} />
      <Text style={estilos.beneficio}>{BENEFICIO_PERMISO[recurso]}</Text>
      {estado === 'concedido' ? (
        <>
          <Text style={estilos.detalle}>Listo: el permiso ya está activado.</Text>
          <BotonPrimario texto="Volver" onPress={volver} />
        </>
      ) : null}
      {estado === 'preguntable' ? <BotonPrimario texto="Continuar" onPress={continuar} /> : null}
      {estado === 'bloqueado' ? (
        <>
          <Text style={estilos.detalle}>{ALTERNATIVA_PERMISO[recurso]}</Text>
          <BotonPrimario texto="Abrir Ajustes" onPress={abrirAjustes} />
        </>
      ) : null}
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      padding: espaciado.lg,
      gap: espaciado.lg,
      justifyContent: 'center',
    },
    beneficio: {
      color: c.texto,
      fontFamily: fuentes.titulos,
      fontSize: tipografia.titulo,
      fontWeight: pesos.medio,
    },
    detalle: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
    },
  });
}
