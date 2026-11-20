import { Stack, useLocalSearchParams } from 'expo-router';

import { BotonPrimario } from '../../components/BotonPrimario';
import { MensajeError } from '../../components/MensajeError';
import { PantallaPermisoPrevia } from '../../components/PantallaPermisoPrevia';
import { NOMBRE_RECURSO } from '../../constants/textos';
import { volver } from '../../lib/navegacion';
import { esRecurso } from '../../lib/permisos';
import { esIsbnValido, normalizarParametro } from '../../lib/validaciones';

export default function PermisoPrevio() {
  const params = useLocalSearchParams<{ recurso: string; isbn?: string }>();
  const recurso = normalizarParametro(params.recurso);
  const isbn = normalizarParametro(params.isbn);

  if (!esRecurso(recurso)) {
    return (
      <MensajeError mensaje="Ese permiso no existe en la app.">
        <BotonPrimario texto="Volver" variante="secundario" onPress={volver} />
      </MensajeError>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: NOMBRE_RECURSO[recurso] }} />
      <PantallaPermisoPrevia recurso={recurso} isbnRecordatorio={esIsbnValido(isbn) ? isbn : null} />
    </>
  );
}
