# Especificación: Panel de Tickets

Nombre corto: tickets-dashboard

Resumen

Crear un panel (dashboard) en la aplicación frontend con dos botones principales: uno para crear un nuevo ticket y otro para mostrar la lista completa de tickets en la página. La lista de tickets se presenta en columnas con: nombre de la persona asignada, id del ticket, fecha, descripción, prioridad y estado.

Actores

- Usuario autenticado (empleado/agente) que crea o consulta tickets.
- Usuario (lector) que solo necesita ver la lista de tickets.
- Permiso de creación: cualquier usuario autenticado puede crear tickets.

Alcance

Incluye:
- Interfaz de dashboard con dos botones claramente etiquetados: "Crear nuevo ticket" y "Mostrar todos los tickets".
- Vista de lista de tickets en formato tabular con las columnas: Asignado a, ID, Fecha, Descripción, Prioridad, Estado.
- Flujo para crear un ticket que lleve al usuario a un formulario o modal (verclarificación 1).

Excluye:
- Edición avanzada de tickets, asignación automática, notificaciones por correo, y filtros/paginación complejos (a menos que se solicite).

Requisitos funcionales

RF-1: El dashboard debe mostrar dos botones visibles y accesibles: "Crear nuevo ticket" y "Mostrar todos los tickets".
- Criterio de aceptación: Ambos botones son visibles en la carga inicial del dashboard en pantalla de escritorio y móvil.

RF-2: Al activar "Crear nuevo ticket" el sistema debe abrir un formulario para crear un ticket.
- Criterio de aceptación: El formulario permite ingresar: nombre de la persona asignada, descripción, prioridad, y estado inicial.
- Decisión: El formulario se abrirá en una página dedicada (/tickets/new).  
- Comportamiento post-creación: Después de crear un ticket, la vista de listados reconsultará automáticamente al servidor para obtener la página actual de tickets y reflejar el nuevo registro (nuevo ticket aparece en la lista en <=5s).
- Decisión de permisos: Cualquier usuario autenticado puede crear tickets.

RF-3: Al activar "Mostrar todos los tickets" el sistema debe renderizar una tabla en la misma página que lista todos los tickets disponibles.
- Criterio de aceptación: La tabla muestra las columnas: Asignado a, ID, Fecha, Descripción, Prioridad, Estado.
- Decisión: La tabla usará paginación en servidor. Tamaño de página por defecto: 25; controles de paginación (Anterior/Siguiente) y soporte para solicitar páginas específicas.

RF-4: Los campos mostrados para cada ticket deben corresponder a los datos reales del ticket (ID único, fecha de creación, texto descriptivo, prioridad categorizada, estado).
- Criterio de aceptación: Al menos 5 tickets con datos distintos se muestran correctamente en las columnas solicitadas.

Escenarios de usuario (Acceptance Scenarios)

Escenario 1: Crear un nuevo ticket
- Dado un usuario autenticado en el dashboard
- Cuando pulsa "Crear nuevo ticket"
- Entonces se presenta un formulario en una página dedicada donde completa los campos y confirma
- Y la lista de tickets se reconsulta automáticamente desde el servidor y el ticket recién creado aparece en la lista en menos de 5 segundos

Escenario 2: Mostrar todos los tickets
- Dado un usuario en el dashboard
- Cuando pulsa "Mostrar todos los tickets"
- Entonces la página muestra una tabla con filas por cada ticket y columnas: Asignado a, ID, Fecha, Descripción, Prioridad, Estado

Criterios de éxito (medibles)

- 95% de los usuarios puede localizar y usar ambos botones en menos de 10 segundos desde la carga del dashboard (medible con tests de usabilidad).
- La tabla muestra correctamente hasta 50 tickets sin provocar fallo de renderizado en la vista principal.
- Al crear un ticket, el nuevo registro aparece en la lista en menos de 5 segundos después de la confirmación.
- Usuarios informan satisfacción de navegación ≥ 4/5 en pruebas de usabilidad básicas para las tareas de crear y ver tickets.

Entidades clave

- Ticket: id, asignado_a (nombre), fecha_creacion, descripcion, prioridad (baja/media/alta), estado (abierto/en progreso/cerrado)
- Usuario: id, nombre, rol

Restricciones y supuestos

- Se asume que la autenticación y las APIs de backend para crear y recuperar tickets ya existen o serán provistas.
- La prioridad se limita a las categorías baja/media/alta por defecto.
- La interfaz debe ser responsive para pantallas de escritorio y móviles.

Dependencias

- Servicio backend que suministre lista de tickets y permita crear tickets.
- Estilos globales y componentes UI compartidos del proyecto.

Pruebas y criterios de verificación

- Prueba manual: Crear 5 tickets, pulsar "Mostrar todos los tickets" y verificar que las 5 filas aparecen con datos correctos.
- Prueba de rendimiento básica: Cargar 50 tickets y verificar que la tabla renderiza sin errores visuales.

Documentación adicional

- Incluir notas de accesibilidad: ambos botones deben ser navegables por teclado y tener labels ARIA adecuados.

Asunciones realizadas

- El formulario de creación requiere los campos mínimos: asignado_a, descripcion, prioridad, estado inicial.
- Se implementará paginación en servidor para la lista de tickets (no se cargan todos en memoria).  
- No se implementan filtros o búsqueda avanzados a menos que se confirme lo contrario.

Estado: READY FOR PLANNING

## Clarifications

### Session 2026-04-24
- Q: ¿El formulario debe abrirse como modal o navegar a una página distinta? → A: Navegar a una página dedicada (/tickets/new).
- Q: ¿La tabla debe soportar paginación o mostrar todos los tickets en una sola vista? → A: Paginación en servidor (consultas paginadas, controles de página; tamaño por defecto 25).
- Q: ¿Cómo debe actualizarse la lista tras crear un ticket? → A: Reconsultar automáticamente desde el servidor (refresh de página/datos; aparecer < =5s).
- Q: ¿Quién puede crear tickets? → A: Cualquier usuario autenticado puede crear tickets.

---

Archivo creado automáticamente por /speckit.specify
