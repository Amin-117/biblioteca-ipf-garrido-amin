import { usePathname } from 'expo-router';

import { EnlaceBoton } from '../components/EnlaceBoton';
import { MensajeError } from '../components/MensajeError';

export default function NoEncontrada() {
  const ruta = usePathname();

  return (
    <MensajeError mensaje={`La dirección “${ruta}” no existe en la app.`}>
      <EnlaceBoton href="/" texto="Ir al Catálogo" />
    </MensajeError>
  );
}
