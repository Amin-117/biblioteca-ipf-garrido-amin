import { useColorScheme } from 'react-native';

import { colores, type Colores } from '../constants/tema';

export function useTema(): Colores {
  return useColorScheme() === 'dark' ? colores.oscuro : colores.claro;
}
