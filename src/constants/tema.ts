import { Platform } from 'react-native';

export type Colores = {
  fondo: string;
  superficie: string;
  texto: string;
  textoSecundario: string;
  primario: string;
  sobrePrimario: string;
  error: string;
  exito: string;
  borde: string;
  deshabilitado: string;
};

// Paleta "papel y tinta": fondo cálido de biblioteca y verde botella como color de acción.
export const colores: Record<'claro' | 'oscuro', Colores> = {
  claro: {
    fondo: '#F6F1E7',
    superficie: '#FFFDF8',
    texto: '#1F2A24',
    textoSecundario: '#5B6560',
    primario: '#1F5C4A',
    sobrePrimario: '#FFFFFF',
    error: '#B3261E',
    exito: '#2E7D32',
    borde: '#DDD3C2',
    deshabilitado: '#B9B2A6',
  },
  oscuro: {
    fondo: '#121815',
    superficie: '#1B231F',
    texto: '#ECE6DA',
    textoSecundario: '#A9B1AC',
    primario: '#7CC5A8',
    sobrePrimario: '#0E1A15',
    error: '#F2B8B5',
    exito: '#8BD18F',
    borde: '#2E3833',
    deshabilitado: '#4A524E',
  },
};

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const tipografia = {
  minima: 12,
  chica: 14,
  cuerpo: 16,
  subtitulo: 18,
  titulo: 24,
  portada: 30,
} as const;

export const fuentes = {
  titulos: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }),
} as const;

export const pesos = {
  normal: '400',
  medio: '600',
  negrita: '700',
} as const;

export const radios = {
  sm: 6,
  md: 12,
  lg: 20,
} as const;

export const tamaniosIcono = {
  chico: 20,
  mediano: 24,
  grande: 32,
} as const;

export const bordes = {
  fino: 1,
  marcado: 4,
} as const;

export const ALTURA_CAMARA = 300;

export const TAMANIO_TACTIL_MINIMO = 44;

export const opacidades = {
  presionado: 0.75,
} as const;

export const ANCHO_TARJETA_RECIENTE = 168;
