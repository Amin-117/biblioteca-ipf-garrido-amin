# RESPUESTAS — TP N° 4 "Biblioteca IPF"

> **Borrador de apoyo.** Cada pregunta tiene la estructura del enunciado, las referencias exactas al código (archivo:línea) y los datos técnicos que la responden. Las respuestas finales hay que **redactarlas con palabras propias** (la consigna invalida respuestas copiadas). Lo marcado con `> PENDIENTE (probar en el teléfono):` solo se completa probando en Expo Go.
>
> Líneas actualizadas al commit final. Si cambiás código, revisá los números.

---

## Parte B · Estado, efectos y renderizado

### B1. El ciclo de vida de useLibros

Código: [src/hooks/useLibros.ts](src/hooks/useLibros.ts)

- Estados: `libros` (l. 16), `cargando` arranca en `true` (l. 17), `error` (l. 18), `intento` (l. 20).
- Efecto: l. 22–46. Bandera `let activo = true` (l. 24), función async **adentro** del efecto (`cargar`, l. 26), llamada en l. 41, limpieza `activo = false` (l. 44), dependencias `[intento]` (l. 46).
- En el éxito, `setLibros` y `setCargando(false)` se llaman juntos después del `await` (un solo render gracias al batching automático de React 18+). En el error, `setError` y `setCargando(false)` también juntos.
- Pantalla: [src/app/(tabs)/(catalogo)/index.tsx](src/app/(tabs)/(catalogo)/index.tsx) l. 13 (`if (cargando)` → `EstadoCarga`), l. 17 (`if (error)` → `MensajeError` con Reintentar), l. 22 (`FlatList`), l. 27 (`ListEmptyComponent`).

**a) Render por render (notas):**

| # | Qué lo provoca | `libros` | `cargando` | `error` | Qué se ve |
| --- | --- | --- | --- | --- | --- |
| 1 | Montaje del Catálogo | `[]` | `true` | `null` | `EstadoCarga` |
| — | Después del render 1 corre el efecto → `obtenerLibros()` (800 ms) | | | | |
| 2 | `setLibros(datos)` + `setCargando(false)` (batch) | 19 libros | `false` | `null` | Lista |

Con falla:

| # | Qué lo provoca | `libros` | `cargando` | `error` | Qué se ve |
| --- | --- | --- | --- | --- | --- |
| 1 | Montaje | `[]` | `true` | `null` | `EstadoCarga` |
| 2 | `setError(MENSAJE_ERROR)` + `setCargando(false)` | `[]` | `false` | texto amigable | `MensajeError` + "Reintentar" |
| 3 | Toca Reintentar: `setCargando(true)`, `setError(null)`, `setIntento(n+1)` en el handler (l. 48–52), un solo render | `[]` | `true` | `null` | `EstadoCarga` |
| — | Cambió `intento` → corre la limpieza del efecto anterior y el efecto nuevo pide otra vez | | | | |
| 4 | Respuesta (éxito o error) | … | `false` | … | Lista o error |

Notas para la redacción: el Catálogo también se re-renderiza si cambia el `value` del Context (lo usa `ListaRecientes`, dentro del header), pero eso no cambia `libros/cargando/error`. Si en desarrollo React monta los efectos dos veces (Strict Mode), el primer pedido se descarta gracias a `activo = false`; verificalo con el `console.log` de B1 b.

**b) ¿Se desmonta el Catálogo?**
Datos técnicos: con Tabs de JS las pestañas visitadas quedan montadas (`unmountOnBlur` no se usa) y en un Stack la pantalla de abajo sigue montada cuando se apila el detalle. Se espera que la limpieza **no** corra al cambiar de pestaña ni al abrir un detalle, y sí cuando cambia `intento` (Reintentar) y cuando el Catálogo sale de verdad de la pila.

> PENDIENTE (probar en el teléfono): agregar temporalmente `console.log('limpieza useLibros', intento)` dentro del `return () => { … }` de [src/hooks/useLibros.ts](src/hooks/useLibros.ts) l. 43–45, probar: cambiar a "Mis reservas", abrir un detalle, tocar Reintentar, y anotar en qué casos aparece. **Borrar el console.log antes de entregar** (la consigna lo prohíbe en la entrega).

Ojo: el detalle ([src/components/FichaLibro.tsx](src/components/FichaLibro.tsx)) y el escáner también usan `useLibros`; cada uno tiene su propia instancia del hook y su propia limpieza (por ejemplo, al salir del detalle con "atrás" se desmonta y corre la limpieza de esa instancia).

**c) `async` directo en `useEffect`:** una función `async` siempre devuelve una Promesa; React espera que el efecto devuelva `undefined` o una función de limpieza. Con `useEffect(async () => …)` la "limpieza" sería una Promesa (React avisa y no la puede llamar), así que no habría forma de poner `activo = false`. Solución usada: función `cargar` declarada dentro del efecto (l. 26) y llamada sin `await` (l. 41); el efecto devuelve la limpieza (l. 43–45).

**d) Reintentar:** l. 48–52. El efecto depende de `intento` (l. 46); incrementarlo vuelve a ejecutar el efecto. Por qué `intento` y no otro valor: es un contador que **siempre cambia** (`n + 1`), aunque el error sea el mismo; usar `error` o `cargando` como dependencia no sirve (pueden volver al mismo valor, y además el efecto los modifica, lo que crearía ciclos). La regla `react-hooks/set-state-in-effect` del lint obliga a poner `cargando = true` en el handler y no dentro del efecto.

### B2. La condición de carrera del buscador

Código: [src/app/buscar.tsx](src/app/buscar.tsx). `q` se lee con `useLocalSearchParams` (l. 18) y se normaliza (l. 19–20). Efecto l. 31–57: `let activo = true` (l. 37), `setTimeout` de 300 ms (l. 38 y 51, debounce), limpieza `activo = false` + `clearTimeout` (l. 53–56), dependencias `[consulta, intento]` (l. 57). `router.setParams({ q })` en l. 62.

| Momento | Qué pasa | Sin limpieza: qué se ve | Con tu código: qué se ve |
| --- | --- | --- | --- |
| t = 0 ms | Escribe "bor" → se pide `buscarLibros("bor")` (1.400 ms) | Cargando | Cargando |
| t = 200 ms | Escribe "borges" → se pide `buscarLibros("borges")` (300 ms) | Cargando | Cargando (la limpieza del efecto de "bor" ya corrió: `activo = false`) |
| t = 500 ms | Llega "borges" | Resultados de "borges" | Resultados de "borges" |
| t = 1.400 ms | Llega "bor" | **Se pisan** con los de "bor" (la pantalla dice "borges" pero muestra otra búsqueda) | Se descarta (`activo` de ese efecto es `false`): siguen los de "borges" |

Nota sobre el debounce: con mi código real, a t = 200 ms la limpieza también hace `clearTimeout`, así que `buscarLibros("bor")` **ni siquiera se llega a pedir** (faltaban 100 ms para el temporizador). La tabla de la consigna supone que los dos pedidos salieron; ahí la que actúa es la bandera `activo`.

**a)** La limpieza (l. 53–56) pone en `false` la variable `activo` **de la clausura del efecto anterior** y cancela su temporizador. Corre antes de ejecutar el efecto con la `consulta` nueva y al desmontar la pantalla.

**b) Propuesta del compañero (`if (texto === q)` dentro del `.then`):** no funciona. `q` dentro del `.then` es el valor capturado por la clausura **del render en que se creó el efecto**, que es el mismo `q` con el que se buscó, así que la comparación siempre da `true`. Para que sirviera habría que leer el valor actual (por ejemplo, un `useRef` actualizado en cada render), y aun así es más frágil que la limpieza.

**c) URL y botón atrás:** con `router.setParams` la URL cambia (`/buscar?q=b`, `?q=bo`…) pero se reemplazan los parámetros de la pantalla actual: no se apila nada y "atrás" sale del buscador de una vez. Con `router.push` cada letra apilaría una pantalla nueva: "atrás" iría letra por letra y cada pantalla haría su propia búsqueda.

> PENDIENTE (probar en el teléfono): confirmar en Android que "atrás" desde `/buscar?q=borges` vuelve al Catálogo de un solo toque.

### B3. Mutar o reemplazar

**a)** Muestra `Personas en espera: 0` después de los tres toques: `encolar` cambia el objeto por dentro pero nunca se llama a un setter, así que React no vuelve a renderizar. La referencia guardada en el estado es la misma.

**b)** Al escribir en el `TextInput` controlado se llama a su `setState` → hay re-render → el `<Text>` lee `espera.tamanio`, que ya vale 3. El número "salta". Es peor que un error constante porque depende de que otra cosa provoque un render: a veces se ve bien, a veces no, y cuesta reproducirlo y encontrar la causa.

**c) Cómo lo resolví:** [src/context/BibliotecaContext.tsx](src/context/BibliotecaContext.tsx)
- Encolar al reservar: l. 170–174 (`anteriores[isbn]?.clonar()` → `encolar` sobre la copia → `{ ...anteriores, [isbn]: nueva }`).
- Desencolar en el mostrador: l. 265–269.
- Pila de recientes: l. 138–145 (`anterior.clonar()` → `apilar`).
- Copias: `Cola.desde` / `clonar` ([src/estructuras/Cola.ts](src/estructuras/Cola.ts) l. 8 y método `clonar` al final), `Pila.desde` / `clonar` ([src/estructuras/Pila.ts](src/estructuras/Pila.ts) l. 6 y al final).

Comparación para redactar:
| Alternativa | Ventaja | Costo |
| --- | --- | --- |
| Copia nueva + `setState` (la mía) | React detecta el cambio por referencia; el estado viejo queda intacto (sirve para comparar, deshacer) | Copiar O(n) en cada operación; hay que acordarse de no mutar |
| Contador de versión (`setVersion(v => v + 1)` después de mutar) | Barato, no copia | La instancia es la misma: `useMemo`/`memo` con esa dependencia no se enteran; fácil de olvidar |
| `useReducer` | Todas las transiciones en un solo lugar, fácil de testear | Más código; las acciones async (notificaciones) quedan fuera del reducer |

### B4. ¿Dónde vive cada dato?

| Dato | Dónde vive en tu app | Datos para el "por qué" |
| --- | --- | --- |
| Texto del buscador | **URL** (`q`, [src/app/buscar.tsx](src/app/buscar.tsx) l. 18) + estado local del input (`texto`, l. 25) | La URL permite deep link y compartir; el estado local evita que el cursor salte mientras se actualiza la URL |
| Préstamos y reservas | **Context** (`prestamos`, [BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) l. 46) + AsyncStorage | Los usan varias pantallas (detalle, reservar, reservas) y sobreviven a cerrar la app |
| Listas de espera | **Context** (`Record<string, Cola<string>>`, l. 47) + AsyncStorage (como arrays) | Las modifican dos roles (alumno al reservar, personal en el mostrador) |
| Vistos recientemente | **Context** (`Pila<string>`, l. 48) + AsyncStorage | Se escriben en el detalle y se leen en el Catálogo (otra pantalla) |
| Sesión del personal | **Context** (`sesionIniciada`); **no** se persiste | La necesita el layout raíz para `Stack.Protected`; por seguridad, al reiniciar la app hay que volver a ingresar |
| Ejemplares disponibles | **Se calcula** (`calcularDisponibles`, [src/lib/prestamos.ts](src/lib/prestamos.ts) l. 8) | Guardarlo duplicaría información que ya está en los préstamos (ver E4 d) |
| Estado del permiso de cámara | **Sistema operativo**; la app solo guarda la última respuesta en el estado de `useCameraPermissions` ([src/hooks/usePermiso.ts](src/hooks/usePermiso.ts) l. 30) y la vuelve a consultar al volver a primer plano (l. 112) | El usuario lo puede cambiar fuera de la app (Ajustes) |
| Identificador de la notificación programada | En el préstamo (`recordatorioId`) dentro del **Context** + AsyncStorage; la notificación en sí la guarda el **SO** | Sin el id no se puede cancelar (D2) |

**Re-render por el Context:** cuando cambia el `value` (memorizado con `useMemo`, l. 303 en adelante) se re-renderizan **todos** los componentes que llaman `useBiblioteca()`: `BotonPersonal`, `ListaRecientes`, `FichaLibro`, `reservar/[isbn]`, `reservas`, `mostrador`, `PantallaPermisoPrevia`. El Catálogo (`index.tsx`) no usa el Context, pero `ListaRecientes` (en su header) sí: al activar un recordatorio cambia `prestamos` → cambia el `value` → `ListaRecientes` se re-renderiza aunque solo use `recientes`. Opciones: separar en varios Context (por ejemplo `RecientesContext`), usar un selector (`use-context-selector`) o `memo` en los hijos. En una app de este tamaño no vale la pena (listas chicas, render barato); habría que medirlo con el Profiler antes de complicar el diseño.

---

## Parte C · Navegación y rutas

### C1. La pila en tu app

Navegadores: Stack raíz ([src/app/_layout.tsx](src/app/_layout.tsx)), Tabs ([src/app/(tabs)/_layout.tsx](src/app/(tabs)/_layout.tsx)), Stack de la tab Catálogo ([src/app/(tabs)/(catalogo)/_layout.tsx](src/app/(tabs)/(catalogo)/_layout.tsx)).

| # | Acción | Pilas resultantes (de base a tope) — lo esperado según el código |
| --- | --- | --- |
| 1 | Abre la app. | Raíz: `[(tabs)]` · Tabs: pestaña activa Catálogo · Stack Catálogo: `[index]` |
| 2 | Toca un libro del Catálogo. | Raíz: `[(tabs)]` · Stack Catálogo: `[index, libro/[isbn]]` |
| 3 | Toca "Reservar". | Raíz: `[(tabs), reservar/[isbn] (modal)]` · Stack Catálogo sin cambios |
| 4 | Toca "Confirmar". | `dismissTo('/reservas')`: Raíz `[(tabs)]` con la pestaña "Mis reservas" activa · Stack Catálogo sigue `[index, libro/[isbn]]` |
| 5 | Toca atrás (Android). | Las Tabs vuelven a la primera pestaña (comportamiento por defecto `backBehavior: 'firstRoute'`): se ve el **detalle** (el Stack del Catálogo conserva su pila) |
| 6 | Toca la tab "Catálogo". | Tocar la pestaña que ya está enfocada lleva su Stack al inicio: Stack Catálogo `[index]` |

> PENDIENTE (probar en el teléfono): confirmar las filas 5 y 6 (qué pantalla aparece realmente).

**a)** Paso 4: `router.dismissTo('/reservas')` en [src/app/reservar/[isbn].tsx](src/app/reservar/[isbn].tsx) l. 69 (antes, `setConfirmada(true)` en l. 67 evita que el modal muestre "Ya reservaste" mientras se cierra). Con `push`: la confirmación quedaría debajo y "atrás" volvería a ella. Con `replace`: reemplaza el modal por otra ruta (no lo "cierra"; la animación es la de una pantalla nueva). `dismissTo` cierra pantallas hasta llegar a `/reservas` y, si no la encuentra, reemplaza. Justificación en el README, sección "Decisiones técnicas".

**b)** Paso 6: datos para la respuesta en la fila 6; discutir si conviene que la pestaña "recuerde" el detalle (sirve para retomar) o que vuelva al inicio.

### C2. El escáner que dispara de más

Código: [src/app/escanear.tsx](src/app/escanear.tsx).

**a)** Sin protección, cada lectura (varias por segundo) llamaría `router.push`: se encolarían muchas acciones de navegación y quedarían varias copias del detalle apiladas (hay que tocar "atrás" muchas veces). Relacionar con la cola de acciones de navegación del TP 2.

**b)** `useRef`: `yaNavego` (l. 29), se pone en `true` en l. 46 antes de navegar y se consulta en l. 64. Con `useState(true)` el valor nuevo recién existe en el próximo render; las llamadas a `onBarcodeScanned` que ya llegaron usan la función del render anterior, que "ve" `false` en su clausura, y vuelven a navegar.

**c)** `router.replace` (l. 48): el escáner se reemplaza por el detalle; "atrás" lleva a la pantalla previa (el Catálogo). Con `push`, "atrás" volvería al escáner con la cámara todavía apuntando al código → volvería a abrir el detalle.

**d)** Si el ISBN no está en el catálogo (l. 70–74): aviso "Ese libro no está en el catálogo de la biblioteca. Podés escanear otro." (l. 53) y la cámara sigue activa. Para no repetir el aviso: `ultimoNoEncontrado` (l. 30, se asigna en l. 52 y se compara en l. 64) más un temporizador de `ESPERA_CODIGO_REPETIDO_MS` = 3 s (l. 58) que lo olvida; el temporizador se limpia al desmontar (l. 33–40) y antes de crear uno nuevo (l. 54–56).

### C3. Deep links y rutas protegidas

> PENDIENTE (probar en el teléfono): probar cada link en Expo Go con `exp://IP:8081/--/…` (comandos en el README, sección "Deep links de prueba") y completar las columnas "Qué ve" y "Qué queda debajo" con lo que muestre el teléfono. Lo de abajo es lo esperado y lo que se vio en la prueba web.

| Link | Qué ve la persona (esperado) | Qué queda debajo (esperado) | Qué parte del código lo decide |
| --- | --- | --- | --- |
| `bibliotecaipf://libro/9788499089515` | Detalle de *Ficciones* | Catálogo en la misma pestaña; tabs abajo | `unstable_settings.anchor` de [(catalogo)/_layout.tsx](src/app/(tabs)/(catalogo)/_layout.tsx) l. 7 y del raíz [_layout.tsx](src/app/_layout.tsx) l. 13; [FichaLibro.tsx](src/components/FichaLibro.tsx) |
| `bibliotecaipf://libro/123` | "El código “123” no es un ISBN válido…" + "Ir al Catálogo" | Igual que el anterior | [libro/[isbn].tsx](src/app/(tabs)/(catalogo)/libro/[isbn].tsx) l. 13 (`esIsbnValido`) |
| `bibliotecaipf://buscar?q=borges` | Buscador con los 4 de Borges | `(tabs)` debajo | `anchor: '(tabs)'` ([_layout.tsx](src/app/_layout.tsx) l. 12–14); [buscar.tsx](src/app/buscar.tsx) l. 18 |
| `bibliotecaipf://mostrador` (sin sesión) | El Catálogo (la ruta no existe sin sesión; en la prueba web la URL terminó en `/`) | — | `Stack.Protected guard={biblioteca.sesionIniciada}` ([_layout.tsx](src/app/_layout.tsx) l. 55) |
| `bibliotecaipf://reserva` | Mis reservas | `(tabs)` | `<Redirect href="/reservas" />` ([reserva.tsx](src/app/reserva.tsx) l. 5) |
| `bibliotecaipf://escanear` (cámara bloqueada) | Mensaje "La cámara está bloqueada…" + "Abrir Ajustes" + ingreso manual | `(tabs)` | [escanear.tsx](src/app/escanear.tsx) l. 90–93; [usePermiso.ts](src/hooks/usePermiso.ts); [permisos.ts](src/lib/permisos.ts) l. 16 |

**¿Por qué `/libro/123` llega al detalle?** El router solo compara la **forma** de la URL con el árbol de archivos: `[isbn]` acepta cualquier segmento ("123", "abc"). Validar el contenido es responsabilidad de la pantalla (la ruta dinámica), por eso [libro/[isbn].tsx](src/app/(tabs)/(catalogo)/libro/[isbn].tsx) valida antes de pedir datos y `FichaLibro` contempla el libro inexistente.

### C4. Foco, montaje y primer plano

**a)** `useEffect(…, [])`: el montaje del componente (una vez). `useFocusEffect`: cada vez que la pantalla gana el foco dentro de la navegación (y su limpieza cuando lo pierde). `AppState`: la app entera pasa entre `active` / `background` / `inactive` (por ejemplo, ir a Ajustes y volver).

**b)** Volver de Ajustes: solo `AppState` (la pantalla no se desmontó ni perdió el foco dentro de la navegación). Ir al Catálogo y volver a "Mis reservas": solo `useFocusEffect` (la app no salió de primer plano y la pestaña no se vuelve a montar).

**c)** Se usan las dos: `useFocusEffect` en [src/app/(tabs)/reservas.tsx](src/app/(tabs)/reservas.tsx) l. 48–53 (llama `actualizar()` y `sincronizarRecordatorios()`), y `AppState` dentro de [src/hooks/usePermiso.ts](src/hooks/usePermiso.ts) l. 112–117 con `suscripcion.remove()` en l. 120. Caso de estado viejo si se usara una sola: solo `useFocusEffect` → al volver de Ajustes seguiría diciendo "desactivadas"; solo `AppState` → si se cambia el permiso desde otra pantalla de la app (por ejemplo, `/permisos/notificaciones`) y se vuelve a la pestaña, no se entera.

---

## Parte D · Permisos en tu app

### D1. Recorrido completo de la cámara

Lo esperado según el código y el comportamiento documentado de Android 11+ (dos rechazos = "no volver a preguntar"):

| # | Acción | Qué muestra tu app | status | canAskAgain |
| --- | --- | --- | --- | --- |
| 1 | Toca "Escanear" por primera vez. | `/escanear` en estado preguntable: beneficio + "Activar la cámara" + ingreso manual. Al tocar el botón: `/permisos/camara` | `undetermined` | `true` |
| 2 | "Continuar" → "No permitir". | Vuelve a `/escanear` (preguntable) | `denied` | `true` |
| 3 | Toca "Escanear" otra vez. | Preguntable otra vez | `denied` | `true` |
| 4 | "Continuar" → "No permitir". | Vuelve a `/escanear`, ahora bloqueado: mensaje + "Abrir Ajustes" | `denied` | `false` |
| 5 | Toca "Escanear" otra vez. | Bloqueado (no se vuelve a mostrar el diálogo del sistema) | `denied` | `false` |
| 6 | "Abrir Ajustes" → habilita la cámara → vuelve. | Concedido: `CameraView` escaneando (sin tocar nada) | `granted` | `true` |

> PENDIENTE (probar en el teléfono): hacer el recorrido en un Android 14 con la app recién instalada (en Expo Go: borrar los datos de Expo Go o desinstalarla y reinstalarla) y corregir la tabla con lo que se vea. Si hace falta ver `status` y `canAskAgain`, agregar temporalmente un `<Text>` o un `console.log` y borrarlo después.

**a) iOS:** el sistema pregunta **una sola vez**: después del primer "No permitir", `canAskAgain` pasa a `false`. Cambia en el paso 2/3: la app ya muestra "bloqueado" con "Abrir Ajustes" en el paso 3.

**b) La línea que decide:** [src/lib/permisos.ts](src/lib/permisos.ts) l. 16:

```ts
return respuesta.canAskAgain ? 'preguntable' : 'bloqueado';
```

Usa `canAskAgain`. `status` vale `'denied'` en los dos casos (se puede volver a preguntar o no), así que no alcanza para elegir entre "Continuar" y "Abrir Ajustes".

**c)** Se entera la suscripción a `AppState` de [src/hooks/usePermiso.ts](src/hooks/usePermiso.ts) l. 112–117: al volver a `'active'` llama a `consultarCamara()` (el `getPermission` de `useCameraPermissions`), que actualiza el estado y la pantalla pasa a "concedido". Sin eso, la app seguiría mostrando "bloqueado" hasta salir y volver a entrar al escáner.

### D2. Notificaciones y consistencia

**a)** Si no se cancelara, a los 15 s llegaría "Recordá devolver…" de un libro ya devuelto (información falsa, la persona pierde confianza en los avisos). Cancelación: `devolver` en [BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) l. 242–257 (`cancelarRecordatorio(id)` en l. 253) y al apagar el interruptor, `desactivarRecordatorio` l. 231–240.

**b)** En el préstamo (`recordatorioId`) dentro del Context y persistido en AsyncStorage (efecto de guardado en l. 97–112, `guardarEstado` l. 102). Si la app se cierra antes de que llegue: la notificación la tiene el **sistema operativo** y llega igual; el id se recupera de AsyncStorage al iniciar (`hidratar`, l. 57). Problema: al volver, el id puede apuntar a una notificación que ya llegó (el interruptor diría "activado" sin nada programado), o, sin persistencia, el id se perdería y no se podría cancelar. Cómo se resolvió: al hidratar se compara con `getAllScheduledNotificationsAsync()` (`idsProgramados`, l. 61) y los que ya no están pasan a `null`; lo mismo hace `sincronizarRecordatorios` al enfocar "Mis reservas" y al recibir una notificación con la app abierta (`addNotificationReceivedListener`, l. 208).

**c)** En Android 13+ (API 33) `POST_NOTIFICATIONS` es un permiso en tiempo de ejecución y el diálogo del sistema está ligado a que exista un canal: la documentación de Expo indica crear el canal **antes** de pedir el permiso. Código: `crearCanalPrestamos()` ([src/lib/notificaciones.ts](src/lib/notificaciones.ts) l. 33) llamado en [usePermiso.ts](src/hooks/usePermiso.ts) l. 70, antes de `requestPermissionsAsync` (l. 71). En Android 12 o anterior no hay permiso en tiempo de ejecución: las notificaciones vienen permitidas por defecto (`requestPermissionsAsync` devuelve concedido sin diálogo); el canal igual hace falta (desde Android 8) para mostrar la notificación.

**d)** Te enterás por un aviso dentro de la app en "Mis reservas" (descartable). Código: `entregarAlSiguiente` en [BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) l. 259–288; la decisión está en l. 275–283:

```ts
try {
  if (await notificacionesConcedidas()) {
    await notificarRetiroDisponible(titulo);
  } else {
    agregarAviso(textoAviso);
  }
} catch {
  agregarAviso(textoAviso);
}
```

`notificacionesConcedidas()` ([src/lib/notificaciones.ts](src/lib/notificaciones.ts) l. 76–79) llama a `getPermissionsAsync()` **en ese momento**. Importa porque la persona puede haber cambiado el permiso en Ajustes después del último chequeo: un valor guardado podría decir "concedido" y la notificación no se mostraría nunca (ni tampoco el aviso).

### D3. Lo que tu app pide y lo que no

Datos verificados con `npx expo prebuild --platform android --no-install` y `npx expo config --type introspect` (ver README, sección "Permisos"):

| Plataforma | Permiso o clave declarada | Función de la app que lo justifica | ¿Quién lo agrega? |
| --- | --- | --- | --- |
| Android | `CAMERA` | Leer el código de barras en `/escanear` | Plugin y manifiesto de `expo-camera` |
| Android | `POST_NOTIFICATIONS` | Recordatorio de devolución y aviso de retiro | Manifiesto de `expo-notifications` |
| Android | `RECEIVE_BOOT_COMPLETED` | Reprogramar notificaciones pendientes después de reiniciar | Manifiesto de `expo-notifications` |
| Android | `INTERNET` | Conectar con el servidor de desarrollo (Metro) y cargar actualizaciones | Plantilla de Expo / React Native |
| Android | `VIBRATE` | Vibración de las notificaciones | Plantilla de Expo |
| iOS | `NSCameraUsageDescription` = "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN." | Diálogo de permiso de la cámara | Plugin `expo-camera` (`cameraPermission` en app.json) |

(En iOS las notificaciones locales no necesitan clave en Info.plist; `enableRemoteNotifications: false` evita el entitlement `aps-environment`.)

**a)** Fragmento de [app.json](app.json):

```json
["expo-camera", {
  "cameraPermission": "Usamos tu cámara para leer el código de barras del libro y abrir su ficha sin escribir el ISBN.",
  "microphonePermission": false,
  "recordAudioAndroid": false,
  "barcodeScannerEnabled": true
}]
```

y en `android.blockedPermissions`: `"android.permission.RECORD_AUDIO"` (se agrega `tools:node="remove"` en el manifiesto). `recordAudioAndroid` por defecto es `true` porque `expo-camera` también graba video con sonido; la app no graba.

**b)** Notas: `expo-image-picker` con `launchImageLibraryAsync`. En Android 13+ usa el Photo Picker del sistema, que no necesita permiso de lectura; en iOS 14+ el PHPicker tampoco (el plugin igual agrega `NSPhotoLibraryUsageDescription`, conviene configurarlo o desactivarlo). Hace falta **una build nueva**: es un módulo nativo nuevo y cambia la configuración nativa (plugins/permisos); una actualización OTA solo cambia JavaScript y assets. Además, la consigna actual prohíbe instalarlo.

**c)** Lo no verificable en Expo Go (Expo Go es una app ya compilada con sus propios permisos y textos):
- El texto de propósito de la cámara: el diálogo muestra el de Expo Go, no el de app.json.
- `blockedPermissions` y `recordAudioAndroid`: el manifiesto real es el de Expo Go.
- El esquema `bibliotecaipf://` (en Expo Go se usa `exp://IP:8081/--/…`).
- El color del ícono de la notificación y el splash con los colores propios.
- Cómo se ve el canal "Préstamos" en los ajustes de notificaciones de la app (en Expo Go aparece dentro de Expo Go).

Cómo verificarlo: development build con EAS (pasos en el README), `adb shell dumpsys package ar.edu.ipf.bibliotecaipf | grep permission`, y el prebuild en carpeta temporal.

> PENDIENTE (probar en el teléfono): anotar qué se vio distinto en Expo Go (por ejemplo, qué texto aparece en el diálogo de la cámara).

---

## Parte E · Buenas prácticas y decisiones de diseño

### E1. Revisión de código

**a) Problemas (notas: línea → clasificación → por qué → cómo se corrige):**

1. L. 10 y 22 — `any` en `useState<any[]>` y `{ libro: any }` → mala práctica: se pierde el chequeo de tipos (un typo en `libro.titlo` compila). Usar `Libro[]` de `src/types`.
2. L. 13–16 — pide cámara y notificaciones al abrir la app, sin contexto → mala práctica grave (y motivo de rechazo en tiendas): el usuario no sabe para qué, suele negar, y en iOS no se puede volver a preguntar. Pedir en el momento de uso, con pantalla previa (`/permisos/[recurso]`).
3. L. 13–16 — dependencias incompletas: usa `pedirPermiso` y el array está vacío → advertencia de `react-hooks/exhaustive-deps`.
4. L. 15 — promesa sin `await` ni `catch` → posible rechazo no manejado (advertencia/error de ejecución en consola).
5. L. 18–20 — `useEffect` **sin array de dependencias**: corre después de cada render; `setLibros` con un array nuevo provoca otro render → bucle infinito de pedidos → rendimiento (y batería/datos).
6. L. 19 — sin limpieza (`activo`) ni manejo de error: `setState` tras desmontar, sin estado de carga ni de error; si `obtenerLibros` falla (1 de cada 5) → rechazo no manejado y pantalla vacía sin explicación.
7. L. 22–30 — componente `Fila` declarado **dentro** de otro componente → rendimiento/mala práctica: en cada render es un tipo nuevo, React desmonta y monta todas las filas (pierde estado). Lint `react-hooks/static-components`. Llevarlo a `src/components/FilaLibro.tsx`.
8. L. 24 — `router.push('/libro/' + libro.isbn)` con string concatenado → sin rutas tipadas; usar `{ pathname: '/libro/[isbn]', params: { isbn } }`.
9. L. 24 y 37 — `Pressable` sin `accessibilityRole="button"`; el de l. 37 solo tiene ícono y no tiene `accessibilityLabel` → accesibilidad (el lector de pantalla dice "botón" sin nombre o nada). Área táctil del ícono de 28 px < 44.
10. L. 25 — estilos en línea, color `'#333'` y números sueltos → mala práctica (sin tema, no respeta modo oscuro: texto oscuro sobre fondo oscuro). `StyleSheet.create` + `tema.ts`.
11. L. 33–36 — `ScrollView` + `map` para una lista de datos → rendimiento (renderiza todo, sin virtualización). `FlatList`.
12. L. 35 — `key={i}` (índice) → advertencia/bug: si la lista cambia de orden, React reutiliza filas equivocadas. `keyExtractor={(libro) => libro.isbn}`.
13. Sin estados de carga, error ni vacío; sin `ListEmptyComponent`.
14. L. 11 — `permiso` se declara y no se usa (lint: variable sin uso).

**b) Efecto sin dependencias (l. 18–20), primer minuto:** render 1 → efecto → pedido (800 ms) → `setLibros(copia nueva)` → render 2 → el efecto corre otra vez → otro pedido → … un pedido cada ~800 ms (≈75 por minuto), cada uno con una copia nueva. 1 de cada 5 falla y queda como rechazo no manejado. Además, si el componente se desmonta, los `setState` siguen llegando. Si `obtenerLibros()` devolviera **siempre el mismo array**, `setLibros` recibiría la misma referencia: React compara con `Object.is`, no re-renderiza, y el bucle se corta después del segundo pedido. Por eso la API entregada devuelve copias "como una API real": hace visible el error.

**c) Reescritura con los hooks, componentes y constantes de esta app** (equivale a [src/app/(tabs)/(catalogo)/index.tsx](src/app/(tabs)/(catalogo)/index.tsx)):

```tsx
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
```

Qué resuelve cada pieza: `useLibros` (efecto con limpieza, `[intento]`, error amigable); `FilaLibro` (componente de módulo, `Link` con href tipado en forma de objeto, `accessibilityRole`, área de 44 px, estilos del tema); `EncabezadoCatalogo` → `AccesoRapido` (botón "Escanear" con texto e ícono, que lleva a `/escanear`, donde el permiso se pide recién con la pantalla previa); ningún permiso se pide al abrir.

**d)** Notas: rechazo en tienda → pedir permisos al abrir sin explicar para qué (Apple App Review Guideline 5.1.1: pedir solo lo necesario y en contexto; en Android, Google Play revisa permisos sensibles). Desinstalación → los dos diálogos de permiso apenas se abre la app (primera impresión), y el bucle de pedidos (batería, datos, lista que parpadea).

### E2. Organización y acoplamiento

**a)** Importaciones (verificable con `grep -rn "from '\.\./" src`):

```
app ──► components, hooks, context, lib, constants, types
components ──► hooks, context, lib, constants, types (y otros components)
hooks ──► lib, constants, types
context ──► lib, estructuras, data, constants, types
lib ──► data, estructuras (solo tipo en recientes.ts), constants, types
estructuras, data, constants ──► types (solo tipos)
types ──► estructuras (solo `import type`)
```

No hay importaciones hacia `src/app`. Si un hook importara algo de `src/app`, Expo Router lo trataría como ruta (todo archivo en `app` es pantalla), se crearía un ciclo de dependencias y el hook dejaría de ser reutilizable.

**b)** Si el catálogo viniera de una API real cambiarían: [src/lib/api.ts](src/lib/api.ts) (pedidos reales) y [src/lib/catalogo.ts](src/lib/catalogo.ts), que hoy busca en `LIBROS` de forma sincrónica para el Context (título y ejemplares en `reservar`, `disponibles`, avisos) y para `/reservar/[isbn]`. Ese segundo archivo indica un acoplamiento: el Context depende de tener el catálogo local. Mejora posible: que el Context reciba los libros cargados por `useLibros` (o un caché compartido) en lugar de leer `data/` directamente.

**c) `<ConPermiso recurso="camara">`:** se gana menos código repetido en pantallas que se abren solo para usar el recurso. Se pierde: la pantalla previa como ruta (deep link, botón atrás, modal), la posibilidad de mostrar la alternativa (ingreso manual) **junto** a la cámara, y control fino de cuándo se pide. Para notificaciones no sirve: se piden desde un interruptor (un evento), no al montar una pantalla; ahí hace falta el hook (`usePermiso`) con `pedir`/`actualizar` que devuelven el estado nuevo ([src/app/(tabs)/reservas.tsx](src/app/(tabs)/reservas.tsx) l. 80–95).

### E3. Mapa de fallas

| Situación | Qué ve la persona | Dónde se maneja |
| --- | --- | --- |
| `obtenerLibros()` falla | "No pudimos cargar el catálogo. Revisá tu conexión y probá de nuevo." + "Reintentar" | [src/hooks/useLibros.ts](src/hooks/useLibros.ts) l. 34–38; [src/app/(tabs)/(catalogo)/index.tsx](src/app/(tabs)/(catalogo)/index.tsx) l. 17–19 |
| Se abre `/libro/abc` | "El código “abc” no es un ISBN válido: tiene que tener 13 números." + "Ir al Catálogo" | [src/app/(tabs)/(catalogo)/libro/[isbn].tsx](src/app/(tabs)/(catalogo)/libro/[isbn].tsx) l. 13–22 |
| Se escanea un ISBN que no está en el catálogo | Aviso "Ese libro no está en el catálogo de la biblioteca. Podés escanear otro."; sigue escaneando | [src/app/escanear.tsx](src/app/escanear.tsx) l. 51–60 y 70–74 |
| La cámara está bloqueada | "La cámara está bloqueada para esta app. Podés habilitarla en Ajustes o escribir el ISBN a mano." + "Abrir Ajustes" + campo manual | [src/app/escanear.tsx](src/app/escanear.tsx) l. 90–93 y 121; [src/components/PantallaPermisoBloqueado.tsx](src/components/PantallaPermisoBloqueado.tsx) |
| Las notificaciones están denegadas | Estado "Notificaciones desactivadas…"; al activar "Recordarme" bloqueado: "Las notificaciones están desactivadas. Te avisamos acá adentro." + "Abrir Ajustes" (el interruptor queda apagado); avisos del mostrador dentro de la app | [src/app/(tabs)/reservas.tsx](src/app/(tabs)/reservas.tsx) l. 76–95; [src/context/BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) l. 275–283 |
| Se intenta reservar un libro ya reservado | En el detalle el botón dice "Ya lo reservaste…" y está deshabilitado; si se llega a `/reservar/[isbn]` por link: "Ya reservaste “…”. No hace falta reservarlo de nuevo…" + "Volver" | [src/components/FichaLibro.tsx](src/components/FichaLibro.tsx) (`textoBoton`); [src/app/reservar/[isbn].tsx](src/app/reservar/[isbn].tsx) l. 46–53; [BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) l. 161–163 |
| "Entregar al siguiente" con la lista vacía | El libro no aparece en el mostrador (solo se listan colas no vacías) y el botón está deshabilitado si `enEspera === 0`; si no queda ninguno: "No hay ningún libro con lista de espera…" | [src/app/mostrador.tsx](src/app/mostrador.tsx) l. 40–43 y 71; [src/components/FilaMostrador.tsx](src/components/FilaMostrador.tsx) l. 29; [BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) (`entregarAlSiguiente` devuelve `{ tipo: 'sin-espera' }`) |
| Login con clave incorrecta | "El usuario o la clave no son correctos. Revisalos y probá de nuevo."; "Ingresar" deshabilitado si falta un campo | [src/app/login.tsx](src/app/login.tsx) l. 23–25 y 63 |

### E4. Decisiones con argumentos

**a) Identificador:** la app usa el ISBN como parámetro de ruta y como `key`. A favor: es lo que lee el escáner (EAN-13 = ISBN-13), el deep link es legible y estable. En contra: libros sin ISBN (anteriores a 1970, materiales del instituto) y dos ediciones con distinto ISBN que son "el mismo título" (o un mismo ISBN para varios ejemplares físicos). `useLocalSearchParams` devuelve **strings** (o arrays): un id numérico habría que convertirlo y validarlo igual (`Number('abc')` = `NaN`); el ISBN se valida como texto con `/^\d{13}$/` y conserva ceros a la izquierda.

**b) Estructuras:** la clase da encapsulamiento (`#items` no se puede tocar desde afuera), operaciones con nombre (`encolar`, `posicionDe`) y `desencolar` O(1) sin `shift()`. Complicó: React compara por referencia, así que hubo que agregar `clonar()`/`desde()` y no mutar nunca la instancia del estado; para persistir hay que convertir con `aArray()` y reconstruir con `desde()`.

**c) Memorización:** sí. Aporta en el `value` del Context (`useMemo`, [BibliotecaContext.tsx](src/context/BibliotecaContext.tsx) l. 303 en adelante) y en las acciones (`useCallback`): sin eso, cada render del layout raíz crearía un objeto nuevo y re-renderizaría a todos los consumidores. Sería ruido en, por ejemplo, `useMemo(() => crearEstilos(c), [c])` de componentes chicos o en cálculos triviales. Además el proyecto tiene React Compiler activado (`experiments.reactCompiler`), que memoriza automáticamente. Cómo comprobarlo: React DevTools → Profiler ("Highlight updates when components render") y comparar renders con y sin la memorización.

**d) Datos duplicados:** se calculan con `calcularDisponibles` ([src/lib/prestamos.ts](src/lib/prestamos.ts) l. 8–22). Error típico con dos lugares: se resta del contador al prestar pero se olvida sumar al devolver (o al entregar desde el mostrador), y la ficha muestra 1 disponible cuando no hay ninguno. Con un solo origen de la verdad (la lista de préstamos, incluidos los devueltos con `estado: 'devuelto'`) no hay forma de que se desincronicen. Tests en [src/lib/\_\_tests\_\_/logica.test.ts](src/lib/__tests__/logica.test.ts).
