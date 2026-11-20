import { type BarcodeScanningResult, type BarcodeSettings, CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Aviso } from '../components/Aviso';
import { BotonPrimario } from '../components/BotonPrimario';
import { EntradaIsbnManual } from '../components/EntradaIsbnManual';
import { EstadoCarga } from '../components/EstadoCarga';
import { PantallaPermisoBloqueado } from '../components/PantallaPermisoBloqueado';
import { ESPERA_CODIGO_REPETIDO_MS } from '../constants/biblioteca';
import { ALTERNATIVA_PERMISO, BENEFICIO_PERMISO } from '../constants/textos';
import { ALTURA_CAMARA, bordes, espaciado, radios, tipografia, type Colores } from '../constants/tema';
import { useLibros } from '../hooks/useLibros';
import { usePermiso } from '../hooks/usePermiso';
import { useTema } from '../hooks/useTema';
import { esIsbnValido } from '../lib/validaciones';

const AJUSTES_ESCANER: BarcodeSettings = { barcodeTypes: ['ean13'] };

export default function Escanear() {
  const { estado, abrirAjustes } = usePermiso('camara');
  const { libros, cargando, error, reintentar } = useLibros();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const [aviso, setAviso] = useState<string | null>(null);

  // useRef y no useState: el cambio es inmediato y frena las llamadas que llegan antes del re-render.
  const yaNavego = useRef(false);
  const ultimoNoEncontrado = useRef<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current);
      }
    },
    [],
  );

  function abrirLibro(isbn: string) {
    if (yaNavego.current) {
      return;
    }
    yaNavego.current = true;
    // replace: "atrás" desde el detalle no vuelve al escáner.
    router.replace({ pathname: '/libro/[isbn]', params: { isbn } });
  }

  function avisarNoEncontrado(isbn: string) {
    ultimoNoEncontrado.current = isbn;
    setAviso('Ese libro no está en el catálogo de la biblioteca. Podés escanear otro.');
    if (temporizador.current) {
      clearTimeout(temporizador.current);
    }
    // Mientras el mismo código siga frente a la cámara se ignora; después de unos segundos se olvida.
    temporizador.current = setTimeout(() => {
      ultimoNoEncontrado.current = null;
    }, ESPERA_CODIGO_REPETIDO_MS);
  }

  function alEscanear({ data }: BarcodeScanningResult) {
    if (yaNavego.current || data === ultimoNoEncontrado.current || !esIsbnValido(data)) {
      return;
    }
    if (cargando || error) {
      return;
    }
    if (libros.some((libro) => libro.isbn === data)) {
      abrirLibro(data);
    } else {
      avisarNoEncontrado(data);
    }
  }

  let zonaCamara;
  if (estado === 'cargando') {
    zonaCamara = <EstadoCarga mensaje="Consultando el permiso de la cámara…" />;
  } else if (estado === 'preguntable') {
    zonaCamara = (
      <View style={estilos.centrado}>
        <Text style={estilos.texto}>{BENEFICIO_PERMISO.camara}</Text>
        <BotonPrimario
          texto="Activar la cámara"
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } })}
        />
      </View>
    );
  } else if (estado === 'bloqueado') {
    zonaCamara = (
      <PantallaPermisoBloqueado mensaje={ALTERNATIVA_PERMISO.camara} onAbrirAjustes={abrirAjustes} />
    );
  } else {
    zonaCamara = (
      <CameraView
        style={estilos.camara}
        facing="back"
        barcodeScannerSettings={AJUSTES_ESCANER}
        onBarcodeScanned={alEscanear}
        accessibilityLabel="Vista de la cámara: apuntá al código de barras de la contratapa"
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.contenido} keyboardShouldPersistTaps="handled">
      <View style={estilos.zonaCamara}>{zonaCamara}</View>
      {estado === 'concedido' && cargando ? (
        <Aviso texto="Estamos cargando el catálogo para reconocer los códigos…" />
      ) : null}
      {estado === 'concedido' && error ? (
        <Aviso
          tipo="error"
          texto="No pudimos cargar el catálogo, así que todavía no podemos reconocer los códigos. Mientras tanto podés escribir el ISBN."
          textoAccion="Reintentar"
          onAccion={reintentar}
        />
      ) : null}
      {aviso ? <Aviso tipo="error" texto={aviso} /> : null}
      <EntradaIsbnManual onBuscar={abrirLibro} />
    </ScrollView>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenido: {
      padding: espaciado.md,
      gap: espaciado.md,
    },
    zonaCamara: {
      height: ALTURA_CAMARA,
      borderRadius: radios.md,
      borderWidth: bordes.fino,
      borderColor: c.borde,
      backgroundColor: c.superficie,
      overflow: 'hidden',
      justifyContent: 'center',
    },
    camara: {
      flex: 1,
    },
    centrado: {
      alignItems: 'center',
      gap: espaciado.md,
      padding: espaciado.md,
    },
    texto: {
      color: c.texto,
      fontSize: tipografia.cuerpo,
      textAlign: 'center',
    },
  });
}
