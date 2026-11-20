import { FlatList } from 'react-native';

import { EncabezadoCatalogo } from '../../../components/EncabezadoCatalogo';
import { EstadoCarga } from '../../../components/EstadoCarga';
import { FilaLibro } from '../../../components/FilaLibro';
import { MensajeError } from '../../../components/MensajeError';
import { MensajeVacio } from '../../../components/MensajeVacio';
import { useLibros } from '../../../hooks/useLibros';

export default function Catalogo() {
  const { libros, cargando, error, reintentar } = useLibros();

  if (cargando) {
    return <EstadoCarga mensaje="Cargando el catálogo…" />;
  }

  if (error) {
    return <MensajeError mensaje={error} textoAccion="Reintentar" onAccion={reintentar} />;
  }

  return (
    <FlatList
      data={libros}
      keyExtractor={(libro) => libro.isbn}
      renderItem={({ item }) => <FilaLibro libro={item} />}
      ListHeaderComponent={<EncabezadoCatalogo libros={libros} />}
      ListEmptyComponent={<MensajeVacio mensaje="El catálogo está vacío por ahora. Volvé a intentar más tarde." />}
    />
  );
}
