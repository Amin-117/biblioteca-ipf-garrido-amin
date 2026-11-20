import { DarkTheme, DefaultTheme, type Theme } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useTema } from './useTema';

// Header, tabs y fondo de las pantallas toman los colores de tema.ts.
export function useTemaNavegacion(): Theme {
  const esOscuro = useColorScheme() === 'dark';
  const c = useTema();
  return useMemo(() => {
    const base = esOscuro ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: c.primario,
        background: c.fondo,
        card: c.superficie,
        text: c.texto,
        border: c.borde,
        notification: c.error,
      },
    };
  }, [esOscuro, c]);
}
