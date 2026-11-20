import { Tabs } from 'expo-router/js-tabs';

import { IconoTab } from '../../components/IconoTab';
import { useTema } from '../../hooks/useTema';

export default function TabsLayout() {
  const c = useTema();

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: c.primario, tabBarInactiveTintColor: c.textoSecundario }}>
      <Tabs.Screen
        name="(catalogo)"
        options={{
          title: 'Catálogo',
          headerShown: false,
          tabBarIcon: ({ focused, size }) => (
            <IconoTab nombre="library-outline" activo={focused} tamanio={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reservas"
        options={{
          title: 'Mis reservas',
          tabBarIcon: ({ focused, size }) => (
            <IconoTab nombre="bookmarks-outline" activo={focused} tamanio={size} />
          ),
        }}
      />
    </Tabs>
  );
}
