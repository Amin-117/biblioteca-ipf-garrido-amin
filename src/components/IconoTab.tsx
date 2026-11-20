import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { useTema } from '../hooks/useTema';

type Props = {
  nombre: ComponentProps<typeof Ionicons>['name'];
  activo: boolean;
  tamanio: number;
};

export function IconoTab({ nombre, activo, tamanio }: Props) {
  const c = useTema();
  return <Ionicons name={nombre} color={activo ? c.primario : c.textoSecundario} size={tamanio} />;
}
