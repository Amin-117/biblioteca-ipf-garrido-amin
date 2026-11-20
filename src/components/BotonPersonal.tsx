import { Link } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import {
  espaciado,
  opacidades,
  pesos,
  TAMANIO_TACTIL_MINIMO,
  tipografia,
  type Colores,
} from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { useTema } from '../hooks/useTema';

// Link "Personal" del header del Catálogo: con sesión va al mostrador, sin sesión al login.
export function BotonPersonal() {
  const { sesionIniciada } = useBiblioteca();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);

  return (
    <Link href={sesionIniciada ? '/mostrador' : '/login'} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={sesionIniciada ? 'Personal: ir al mostrador' : 'Personal: ingresar'}
        style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}>
        <Text style={estilos.texto}>Personal</Text>
      </Pressable>
    </Link>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    boton: {
      minHeight: TAMANIO_TACTIL_MINIMO,
      minWidth: TAMANIO_TACTIL_MINIMO,
      paddingHorizontal: espaciado.sm,
      justifyContent: 'center',
    },
    presionado: {
      opacity: opacidades.presionado,
    },
    texto: {
      color: c.primario,
      fontSize: tipografia.cuerpo,
      fontWeight: pesos.medio,
    },
  });
}
