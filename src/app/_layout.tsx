import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { BibliotecaProvider, useEstadoBiblioteca } from '../context/BibliotecaContext';
import { useTemaNavegacion } from '../hooks/useTemaNavegacion';
// Importarlo acá registra setNotificationHandler una sola vez al iniciar la app.
import '../lib/notificaciones';

// Un deep link directo (por ejemplo /buscar) deja las pestañas debajo en la pila.
export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const biblioteca = useEstadoBiblioteca();
  const temaNavegacion = useTemaNavegacion();

  return (
    <BibliotecaProvider valor={biblioteca}>
      <ThemeProvider value={temaNavegacion}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="buscar" options={{ title: 'Buscar' }} />
          <Stack.Screen name="escanear" options={{ title: 'Escanear' }} />
          <Stack.Screen
            name="reservar/[isbn]"
            options={{ title: 'Confirmar reserva', presentation: 'modal' }}
          />
          <Stack.Screen
            name="permisos/[recurso]"
            options={{ title: 'Permiso', presentation: 'modal' }}
          />
          <Stack.Protected guard={!biblioteca.sesionIniciada}>
            <Stack.Screen
              name="login"
              options={{ title: 'Ingreso del personal', presentation: 'modal' }}
            />
          </Stack.Protected>
          <Stack.Protected guard={biblioteca.sesionIniciada}>
            <Stack.Screen name="mostrador" options={{ title: 'Mostrador' }} />
          </Stack.Protected>
          <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
        </Stack>
      </ThemeProvider>
    </BibliotecaProvider>
  );
}
