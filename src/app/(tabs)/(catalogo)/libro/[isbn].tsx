import { Stack, useLocalSearchParams } from 'expo-router';

import { EnlaceBoton } from '../../../../components/EnlaceBoton';
import { FichaLibro } from '../../../../components/FichaLibro';
import { MensajeError } from '../../../../components/MensajeError';
import { esIsbnValido, normalizarParametro } from '../../../../lib/validaciones';

export default function DetalleLibro() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const codigo = normalizarParametro(isbn);

  // Con un parámetro inválido no se hace ningún pedido: FichaLibro (que usa useLibros) ni se monta.
  if (!esIsbnValido(codigo)) {
    return (
      <>
        <Stack.Screen options={{ title: 'Código inválido' }} />
        <MensajeError mensaje={`El código “${codigo}” no es un ISBN válido: tiene que tener 13 números.`}>
          <EnlaceBoton href="/" texto="Ir al Catálogo" />
        </MensajeError>
      </>
    );
  }

  return <FichaLibro isbn={codigo} />;
}
