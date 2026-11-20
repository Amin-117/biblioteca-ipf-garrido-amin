import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BotonPrimario } from '../components/BotonPrimario';
import { CampoTexto } from '../components/CampoTexto';
import { espaciado, tipografia, type Colores } from '../constants/tema';
import { useBiblioteca } from '../context/BibliotecaContext';
import { useTema } from '../hooks/useTema';

export default function Login() {
  const { iniciarSesion } = useBiblioteca();
  const c = useTema();
  const estilos = useMemo(() => crearEstilos(c), [c]);
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState<string | null>(null);

  const faltanDatos = usuario.trim() === '' || clave === '';

  // Si las credenciales son correctas, Stack.Protected quita /login de la pila: el modal se cierra solo.
  function ingresar() {
    if (!iniciarSesion(usuario, clave)) {
      setError('El usuario o la clave no son correctos. Revisalos y probá de nuevo.');
    }
  }

  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.ayuda}>
        Acceso exclusivo para el personal de la biblioteca.
      </Text>
      <CampoTexto
        etiqueta="Usuario"
        valor={usuario}
        onCambiar={(texto) => {
          setUsuario(texto);
          setError(null);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="username"
        returnKeyType="next"
      />
      <CampoTexto
        etiqueta="Clave"
        valor={clave}
        onCambiar={(texto) => {
          setClave(texto);
          setError(null);
        }}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={faltanDatos ? undefined : ingresar}
      />
      {error ? (
        <Text style={estilos.error} accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}
      <BotonPrimario texto="Ingresar" onPress={ingresar} deshabilitado={faltanDatos} />
      <BotonPrimario texto="Cancelar" variante="secundario" onPress={() => router.back()} />
    </View>
  );
}

function crearEstilos(c: Colores) {
  return StyleSheet.create({
    contenedor: {
      flex: 1,
      padding: espaciado.lg,
      gap: espaciado.md,
    },
    ayuda: {
      color: c.textoSecundario,
      fontSize: tipografia.cuerpo,
    },
    error: {
      color: c.error,
      fontSize: tipografia.cuerpo,
    },
  });
}
