# Especificación de Feature: Corrección del Selector de Tamaño de Página en el Dashboard de Tickets

**Rama de feature**: `003-fix-page-size-selector`
**Creado**: 2026-05-01
**Estado**: Draft
**Input**: "Arreglar el selector de items per page en el dashboard de tickets. Actualmente el selector de página (pageSizeOptions: 10, 20, 50) no funciona correctamente: cuando el usuario selecciona un tamaño de página diferente, la tabla no se actualiza con el número correcto de elementos, o el selector vuelve al valor anterior. El comportamiento esperado es que al cambiar el selector de tamaño de página, la tabla recargue con el nuevo número de items por página solicitado al backend, y el selector refleje el valor seleccionado de forma persistente."

---

## Resumen

El dashboard de tickets incluye un control de paginación que permite al usuario elegir cuántos tickets se muestran por página (10, 20 o 50). Este control presenta un defecto: al cambiar el número de ítems por página, la tabla no se refresca correctamente con la cantidad solicitada, o el selector recupera visualmente el valor anterior tras la recarga. El objetivo de esta feature es garantizar que el selector de tamaño de página funcione de forma fiable: el valor elegido persiste visualmente, la tabla se actualiza con el número correcto de tickets y el backend recibe la consulta con el tamaño de página apropiado.

---

## Actores

- **Agente autenticado**: usuario que gestiona y consulta tickets en el dashboard.
- **Lector autenticado**: usuario que solo visualiza tickets sin poder modificarlos.

---

## Alcance

**Incluye:**

- Corrección del comportamiento del selector de tamaño de página para que la lista de tickets refleje el número de ítems seleccionado tras cada cambio.
- Persistencia visual del valor seleccionado en el selector durante la sesión de navegación activa.
- Sincronización del estado del paginador con los datos devueltos por el backend para la combinación activa de página e ítems por página.
- Manejo correcto del estado de paginación cuando el usuario cambia el tamaño de página mientras está en una página que ya no existe (por ejemplo, página 5 con 10 ítems cuando se cambia a 50 ítems).

**Excluye:**

- Cambios en el backend o en el contrato de la API de tickets.
- Modificaciones en otros controles de filtrado del dashboard (prioridad, estado, asignado, etc.).
- Persistencia del tamaño de página entre sesiones o recargas completas del navegador.
- Cambios en el diseño visual del paginador.

---

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 — Cambiar tamaño de página actualiza la tabla (Prioridad: P1)

El usuario navega al dashboard de tickets, donde actualmente se muestran 20 tickets por página (valor por defecto). Al utilizar el selector de tamaño de página y elegir 10, la tabla se recarga mostrando únicamente 10 tickets, y el selector permanece con el valor "10" seleccionado. Al elegir 50, la tabla muestra hasta 50 tickets.

**Por qué esta prioridad**: Es el comportamiento central que está roto. Sin esta corrección el selector no cumple ninguna función útil para el usuario.

**Test independiente**: Se puede probar de forma aislada cargando el dashboard con cualquier usuario autenticado, cambiando el selector de tamaño de página y verificando que el número de filas en la tabla coincide con el valor seleccionado.

**Escenarios de aceptación**:

1. **Dado** que el usuario está en el dashboard de tickets con el tamaño de página en 20, **cuando** selecciona 10 en el selector, **entonces** la tabla muestra 10 tickets o menos (si hay menos de 10 en total) y el selector permanece en "10".
2. **Dado** que el usuario está en el dashboard de tickets con el tamaño de página en 20, **cuando** selecciona 50 en el selector, **entonces** la tabla muestra hasta 50 tickets y el selector permanece en "50".
3. **Dado** que el usuario está en el dashboard de tickets con el tamaño de página en 10, **cuando** selecciona 20 en el selector, **entonces** la tabla muestra hasta 20 tickets y el selector no vuelve a 10.

---

### Historia de Usuario 2 — El selector no pierde su valor durante la carga de datos (Prioridad: P1)

Cuando el usuario cambia el tamaño de página, el sistema muestra una indicación de carga mientras consulta los datos al backend. Durante este período y al finalizar la carga, el selector debe mantener el valor que el usuario seleccionó, sin revertir al valor anterior ni al valor por defecto.

**Por qué esta prioridad**: La reversión visual del selector es uno de los síntomas reportados del defecto y confunde al usuario haciéndole creer que su acción no tuvo efecto.

**Test independiente**: Puede probarse simulando una carga lenta de datos (red con latencia) y verificando que el selector muestra el valor elegido tanto durante como después de la operación de carga.

**Escenarios de aceptación**:

1. **Dado** que el usuario selecciona un nuevo tamaño de página, **cuando** el sistema está cargando los datos del backend, **entonces** el selector muestra el nuevo valor seleccionado (no el anterior).
2. **Dado** que la carga de datos finaliza correctamente, **cuando** la tabla se actualiza, **entonces** el selector sigue mostrando el valor que eligió el usuario.
3. **Dado** que la carga de datos finaliza con un error, **cuando** la tabla no puede actualizarse, **entonces** el selector muestra el valor intentado y se presenta al usuario un mensaje de error claro.

---

### Historia de Usuario 3 — Restablecer a la primera página al cambiar el tamaño de página (Prioridad: P2)

Cuando el usuario está en una página que no es la primera (por ejemplo, página 3) y cambia el tamaño de página, el sistema debe redirigirlo automáticamente a la primera página. Esto evita estados incoherentes en los que la página activa no existiría con el nuevo tamaño de página seleccionado.

**Por qué esta prioridad**: Es necesario para la coherencia de la experiencia, pero es un caso secundario respecto a la corrección principal del selector.

**Test independiente**: Se puede probar navegando a una página distinta de la primera y luego cambiando el tamaño de página, verificando que el paginador vuelve a la página 1 y la tabla muestra los resultados correspondientes.

**Escenarios de aceptación**:

1. **Dado** que el usuario está en la página 3 del listado con tamaño de página 10, **cuando** cambia el tamaño de página a 50, **entonces** el paginador vuelve a la página 1 y la tabla muestra los primeros 50 tickets.
2. **Dado** que el usuario está en la página 1, **cuando** cambia el tamaño de página a cualquier valor disponible, **entonces** permanece en la página 1 y la tabla se refresca con el nuevo tamaño.

---

### Casos de Borde

- ¿Qué ocurre cuando el total de tickets es menor al tamaño de página seleccionado? → La tabla muestra todos los tickets disponibles y el paginador refleja que solo existe una página.
- ¿Qué ocurre si el backend devuelve más tickets de los solicitados? → La tabla debe mostrar exactamente el número de registros devueltos y el tamaño de página del paginador debe permanecer en el valor seleccionado.
- ¿Qué ocurre si hay 0 tickets? → La tabla muestra el estado vacío correspondiente y el selector de tamaño de página permanece funcional para cuando haya datos.
- ¿Qué ocurre si el usuario cambia el tamaño de página rápidamente varias veces seguidas? → Solo se aplica el último valor seleccionado; las solicitudes intermedias pueden descartarse o ignorarse si llegan fuera de orden.
- ¿Qué ocurre si la sesión expira mientras el usuario cambia el tamaño de página? → El sistema redirige al usuario al flujo de autenticación habitual.

---

## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **RF-001**: El sistema DEBE actualizar la lista de tickets con el número de elementos correspondiente al nuevo tamaño de página inmediatamente después de que el usuario realice la selección.
- **RF-002**: El selector de tamaño de página DEBE mantener visualmente el valor elegido por el usuario durante y después del proceso de carga de datos, sin revertir al valor anterior.
- **RF-003**: Al cambiar el tamaño de página, el sistema DEBE solicitar al backend los tickets usando el nuevo tamaño de página y la primera página del listado.
- **RF-004**: El paginador DEBE reflejar de forma coherente el estado real de la paginación (página actual, total de páginas, total de tickets) tras cada cambio de tamaño de página.
- **RF-005**: El sistema DEBE mostrar una indicación de carga mientras los datos del backend se están obteniendo, sin ocultar ni destruir el control de paginación durante ese período.
- **RF-006**: El sistema DEBE gestionar correctamente los cambios sucesivos y rápidos de tamaño de página, garantizando que el estado final corresponde al último valor seleccionado por el usuario.
- **RF-007**: El sistema DEBE mostrar un mensaje de error comprensible al usuario si la consulta al backend falla tras un cambio de tamaño de página, y el paginador debe reflejar el estado del último resultado exitoso.

### Entidades Clave

- **Ticket**: { id, título, prioridad, estado, asignado_a, fecha_creación }
- **EstadoPaginación**: { página_actual, tamaño_página, total_tickets, total_páginas }
- **ConfiguracionPaginador**: { opciones_de_tamaño: [10, 20, 50], tamaño_por_defecto: 20 }

---

## Criterios de Éxito *(obligatorio)*

### Resultados Medibles

- **CE-001**: El 100% de los cambios de tamaño de página realizados por el usuario resultan en una tabla que muestra exactamente la cantidad de tickets solicitada (o todos si hay menos), sin necesidad de acciones adicionales por parte del usuario.
- **CE-002**: El selector de tamaño de página mantiene el valor elegido en el 100% de los casos tras completarse la carga de datos, sin reversión al valor anterior.
- **CE-003**: Los datos de la tabla se actualizan en menos de 3 segundos tras un cambio de tamaño de página en condiciones de red normales (sin contar latencias de red excepcionalmente altas).
- **CE-004**: El comportamiento es reproducible y consistente en el 100% de las ejecuciones de las pruebas de aceptación automatizadas y manuales definidas para esta feature.
- **CE-005**: Los casos de borde identificados (0 tickets, menos tickets que el tamaño seleccionado, cambios rápidos sucesivos) se resuelven sin errores visibles para el usuario ni estados incoherentes del paginador.

---

## Suposiciones

- El backend responde correctamente a la combinación de parámetros `página` y `tamaño` y devuelve el número de tickets solicitado (o todos los disponibles si hay menos).
- Los valores válidos de tamaño de página son 10, 20 y 50; no se añadirán nuevos valores como parte de esta corrección.
- El tamaño de página por defecto al cargar el dashboard es 20.
- No se requiere persistir el tamaño de página seleccionado entre sesiones distintas del navegador; la corrección aplica únicamente a la sesión activa.
- El dashboard ya dispone de un mecanismo de indicación de carga que el usuario puede percibir mientras se obtienen los datos.
- Los cambios en el backend o en el contrato de la API están fuera del alcance de esta corrección.
- La funcionalidad de filtrado por otros campos (prioridad, estado, etc.) no se ve afectada y continúa funcionando independientemente.

---

## Dependencias

- Endpoint de backend que acepta parámetros de página y tamaño de página y devuelve la información de paginación (total de tickets, total de páginas).
- El control de paginación existente en el dashboard de tickets.

---

## Pruebas y Verificación

- Pruebas de aceptación manuales: cambiar el tamaño de página a cada uno de los tres valores disponibles desde distintas páginas del listado y verificar el comportamiento esperado.
- Prueba de carga lenta: simular latencia de red elevada para verificar que el selector no revierte su valor durante la espera.
- Prueba de cambios rápidos sucesivos: seleccionar múltiples tamaños de página en sucesión rápida y verificar que el estado final es coherente.
- Prueba de estado vacío: verificar el comportamiento cuando no hay tickets en el sistema.
- Prueba con número de tickets menor al tamaño de página seleccionado.

---

**Estado**: LISTO PARA PLANIFICACIÓN

---

*Generado por /speckit.specify*

