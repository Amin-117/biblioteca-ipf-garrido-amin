import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '../../components/Aviso';
import { EnlaceBoton } from '../../components/EnlaceBoton';
import { EstadoNotificaciones } from '../../components/EstadoNotificaciones';
import { MensajeVacio } from '../../components/MensajeVacio';
import { TarjetaAviso } from '../../components/TarjetaAviso';
import { TarjetaEspera } from '../../components/TarjetaEspera';
import { TarjetaPrestamo } from '../../components/TarjetaPrestamo';
import { TituloSeccion } from '../../components/TituloSeccion';
import { USUARIO_ACTUAL } from '../../constants/biblioteca';
import { ALTERNATIVA_PERMISO } from '../../constants/textos';
import { espaciado, tipografia, type Colores } from '../../constants/tema';
import { useBiblioteca } from '../../context/BibliotecaContext';
import { usePermiso } from '../../hooks/usePermiso';
import { useTema } from '../../hooks/useTema';
import { tituloDe } from '../../lib/catalogo';
import type { Prestamo } from '../../types';

type ReservaEnEspera = {
  isbn: string;
  titulo: string;
  posicion: number;
  total: number;
};

export default function MisReservas() {
  const {
    prestamos,
    listasEspera,
    avisos,
    devolver,
    activarRecordatorio,
    desactivarRecordatorio,
    sincronizarRecordatorios,
    descartarAviso,
  } = useBiblioteca();
  const { estado, actualizar, abrirAjustes } = usePermiso('notificaciones');
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const [mostrarBloqueo, setMostrarBloqueo] = useState(false);
  const [errorRecordatorio, setErrorRecordatorio] = useState<string | null>(null);

  // Al enfocar la pestaña: estado real del permiso y recordatorios que ya llegaron.
  // (El regreso desde Ajustes lo detecta usePermiso con AppState.)
  useFocusEffect(
    useCallback(() => {
      actualizar();
      sincronizarRecordatorios();
    }, [actualizar, sincronizarRecordatorios]),
  );

  const activos = useMemo(
    () => prestamos.filter((prestamo) => prestamo.estado === 'activo'),
    [prestamos],
  );

  const enEspera = useMemo<ReservaEnEspera[]>(
    () =>
      Object.entries(listasEspera)
        .map(([isbn, cola]) => ({
          isbn,
          titulo: tituloDe(isbn),
          posicion: cola.posicionDe(USUARIO_ACTUAL),
          total: cola.tamanio,
        }))
        .filter((reserva) => reserva.posicion !== -1),
    [listasEspera],
  );

  async function cambiarRecordatorio(prestamo: Prestamo, activar: boolean) {
    setErrorRecordatorio(null);
    if (!activar) {
      await desactivarRecordatorio(prestamo.isbn);
      return;
    }
    // Se consulta el permiso en este momento: la persona pudo cambiarlo en Ajustes.
    const permiso = await actualizar();
    if (permiso === 'concedido') {
      setMostrarBloqueo(false);
      try {
        await activarRecordatorio(prestamo.isbn);
      } catch {
        setErrorRecordatorio('No pudimos programar el recordatorio. Probá de nuevo en un momento.');
      }
    } else if (permiso === 'preguntable') {
      router.push({
        pathname: '/permisos/[recurso]',
        params: { recurso: 'notificaciones', isbn: prestamo.isbn },
      });
    } else {
      setMostrarBloqueo(true);
    }
  }

  const encabezado = (
    <View>
      <EstadoNotificaciones estado={estado} />
      {mostrarBloqueo && estado === 'bloqueado' ? (
        <View style={estilos.bloque}>
          <Aviso
            tipo="error"
            texto={ALTERNATIVA_PERMISO.notificaciones}
            textoAccion="Abrir Ajustes"
            onAccion={abrirAjustes}
          />
        </View>
      ) : null}
      {errorRecordatorio ? (
        <View style={estilos.bloque}>
          <Aviso tipo="error" texto={errorRecordatorio} />
        </View>
      ) : null}
      {avisos.length > 0 ? (
        <>
          <TituloSeccion texto="Avisos" />
          <FlatList
            data={avisos}
            keyExtractor={(aviso) => aviso.id}
            renderItem={({ item }) => (
              <TarjetaAviso aviso={item} onDescartar={() => descartarAviso(item.id)} />
            )}
            scrollEnabled={false}
          />
        </>
      ) : null}
      <TituloSeccion texto="Mis préstamos" />
    </View>
  );

  const pie = (
    <View>
      <TituloSeccion texto="Mis reservas en espera" />
      <FlatList
        data={enEspera}
        keyExtractor={(reserva) => reserva.isbn}
        renderItem={({ item }) => (
          <TarjetaEspera titulo={item.titulo} posicion={item.posicion} total={item.total} />
        )}
        ListEmptyComponent={
          <Text style={estilos.vacio}>No estás en ninguna lista de espera.</Text>
        }
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <FlatList
      data={activos}
      keyExtractor={(prestamo) => prestamo.isbn}
      renderItem={({ item }) => (
        <TarjetaPrestamo
          prestamo={item}
          titulo={tituloDe(item.isbn)}
          onCambiarRecordatorio={(activar) => cambiarRecordatorio(item, activar)}
          onDevolver={() => devolver(item.isbn)}
        />
      )}
      ListHeaderComponent={encabezado}
      ListEmptyComponent={
        <MensajeVacio mensaje="Todavía no tenés préstamos. Buscá un libro en el Catálogo.">
          <EnlaceBoton href="/" texto="Ir al Catálogo" />
        </MensajeVacio>
      }
      ListFooterComponent={pie}
      contentContainerStyle={estilos.lista}
    />
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    lista: {
      paddingBottom: espaciado.xl,
    },
    bloque: {
      paddingHorizontal: espaciado.md,
      paddingTop: espaciado.md,
    },
    vacio: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
      paddingHorizontal: espaciado.md,
    },
  });
}
