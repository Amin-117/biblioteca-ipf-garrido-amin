import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { BotonPrimario } from '../../components/BotonPrimario';
import { ConfirmacionReserva } from '../../components/ConfirmacionReserva';
import { EstadoCarga } from '../../components/EstadoCarga';
import { MensajeError } from '../../components/MensajeError';
import { DIAS_PRESTAMO } from '../../constants/biblioteca';
import { useBiblioteca } from '../../context/BibliotecaContext';
import { buscarLibroPorIsbn } from '../../lib/catalogo';
import { formatearFecha, sumarDias } from '../../lib/fechas';
import { volver } from '../../lib/navegacion';
import { esIsbnValido, normalizarParametro } from '../../lib/validaciones';

export default function Reservar() {
  const { isbn } = useLocalSearchParams<{ isbn: string }>();
  const codigo = normalizarParametro(isbn);
  const { reservar, disponibles, listasEspera, yaReservado } = useBiblioteca();
  // Fecha fijada al abrir la pantalla: es la que se muestra antes de confirmar.
  const [hoy] = useState(() => new Date());
  const [rechazo, setRechazo] = useState<string | null>(null);
  const [confirmada, setConfirmada] = useState(false);

  const salida = <BotonPrimario texto="Volver" variante="secundario" onPress={volver} />;

  if (!esIsbnValido(codigo)) {
    return (
      <MensajeError mensaje={`El código “${codigo}” no es un ISBN válido: tiene que tener 13 números.`}>
        {salida}
      </MensajeError>
    );
  }

  const libro = buscarLibroPorIsbn(codigo);
  if (!libro) {
    return (
      <MensajeError mensaje="No encontramos ningún libro con ese ISBN en la biblioteca.">{salida}</MensajeError>
    );
  }

  // Mientras se cierra el modal, el Context ya tiene la reserva: no mostrar "Ya reservaste".
  if (confirmada) {
    return <EstadoCarga mensaje="Listo. Te llevamos a Mis reservas…" />;
  }

  if (rechazo || yaReservado(codigo)) {
    return (
      <MensajeError
        mensaje={rechazo ?? `Ya reservaste “${libro.titulo}”. No hace falta reservarlo de nuevo: lo ves en Mis reservas.`}>
        {salida}
      </MensajeError>
    );
  }

  const enEspera = listasEspera[codigo]?.tamanio ?? 0;
  const esPrestamo = disponibles(codigo) > 0 && enEspera === 0;
  const explicacion = esPrestamo
    ? `Te lo llevás hoy y lo devolvés el ${formatearFecha(sumarDias(hoy, DIAS_PRESTAMO).toISOString())} (${DIAS_PRESTAMO} días).`
    : `No hay ejemplares para vos en este momento: quedás en el puesto ${enEspera + 1} de la lista de espera. Te avisamos cuando te toque.`;

  function confirmar() {
    const resultado = reservar(codigo);
    if (resultado.tipo === 'rechazada') {
      setRechazo('No pudimos registrar la reserva: ya tenés este libro reservado o prestado.');
      return;
    }
    setConfirmada(true);
    // dismissTo cierra el modal y vuelve a /reservas sin dejar la confirmación en el historial.
    router.dismissTo('/reservas');
  }

  return (
    <ConfirmacionReserva
      titulo={libro.titulo}
      explicacion={explicacion}
      esPrestamo={esPrestamo}
      onConfirmar={confirmar}
      onCancelar={volver}
    />
  );
}
