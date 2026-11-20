import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

type Props = {
  nombre: ComponentProps<typeof Ionicons>['name'];
  color: string;
  tamanio: number;
};

export function IconoTab({ nombre, color, tamanio }: Props) {
  return <Ionicons name={nombre} color={color} size={tamanio} />;
}
