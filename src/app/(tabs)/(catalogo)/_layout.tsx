import { Stack } from 'expo-router';

import { BotonPersonal } from '../../../components/BotonPersonal';

// Un deep link a /libro/[isbn] deja el Catálogo debajo dentro de esta pestaña.
export const unstable_settings = {
  anchor: 'index',
};

export default function CatalogoLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Catálogo', headerRight: () => <BotonPersonal /> }}
      />
      <Stack.Screen name="libro/[isbn]" options={{ title: 'Libro' }} />
    </Stack>
  );
}
