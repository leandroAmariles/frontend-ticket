# Especificación: Tickets Dashboard

Nombre corto: tickets-dashboard

Resumen

Crear una página de dashboard en el frontend que liste tickets de soporte en una tabla con paginación y filtros básicos. La tabla debe mostrar hasta 50 filas correctamente sin desbordes de diseño, permitir ordenación por columnas y filtrado por prioridad y estado. Debe existir un botón claro y prominente "New Ticket" que abra el formulario de creación; los tickets nuevos deben aparecer en el listado en menos de 5 segundos.

Actores

- Agente / Usuario autenticado: crea y gestiona (ver) tickets.
- Lector: usuario que solo consulta la lista de tickets.

Alcance

Incluye:

- Página de dashboard con una acción primaria prominente: "New Ticket".
 - Tabla paginada de tickets con columnas: id, title, priority, status, assigned_to_id, assigned_to_name, created_at (mostrar etiquetas localizadas en UI; ver mapeo UI↔API).
- Ordenación por columna (asc/desc) y filtros básicos para priority y status.
- Soporte de tamaños de página hasta 50 filas (opciones: 25, 50).

Excluye:

- Edición avanzada de tickets desde la tabla (solo lectura en lista; edición vía formulario detallado fuera de alcance).
- Búsqueda libre o filtros complejos (por ahora solo priority/status).

Requisitos funcionales

RF-1: Acciones primarias visibles

- El dashboard debe mostrar de forma prominente el botón "New Ticket" y controles de filtrado/ordenación accesibles.
- Criterio de aceptación: 95% de los usuarios de prueba localizan las acciones primarias (New Ticket, filtros, orden) en ≤10s.

RF-2: Creación de ticket

- El botón "New Ticket" abre un formulario para crear tickets.
- Criterio de aceptación: El formulario permite ingresar title, description, priority, status inicial y seleccionar un asignado. Datos emitidos al API deben usar campos canónicos: assigned_to_id (UUID v4 | null) y assigned_to_name (string | null) cuando proceda.
- Decisión: El formulario abrirá en una página dedicada (/tickets/new). Tras creación, la lista reconsultará datos y mostrará el nuevo ticket en ≤5s (por reconsulta o evento push). El comportamiento de reconsulta deberá documentarse en la implementación (intervalos, backoff ligero y cancelación si procede).

RF-3: Listado, paginación y tamaños de página

- La lista se muestra como tabla paginada en servidor. Tamaño por defecto 25; selector de tamaño con opciones 25 y 50.
- Criterio de aceptación: La tabla renderiza correctamente 50 filas cuando se selecciona ese tamaño de página sin overflow o degradación UX.

RF-4: Ordenación

- Las columnas id, title, priority, status, assigned_to_name, created_at deben ser ordenables; la interacción es mediante clic en cabecera con indicador asc/desc. Para orden por asignado se usará assigned_to_name en la UI y assigned_to_id en requests si procede.
- Criterio de aceptación: Orden ascendente/descendente funciona y los datos se actualizan en la tabla.

Aclaración sobre ordenación por asignado:
- Comportamiento acordado: La UI muestra y permite ordenar por el nombre del asignado (`assigned_to_name`). El API idealmente soportará la misma operación mediante `sort=assigned_to_name:<asc|desc>`.
- Si el backend no soporta sorting por `assigned_to_name`, el contrato debe indicar la limitación y la UI realizará el ordenamiento del conjunto de resultados recibido (nota: esto puede aplicarse tras la paginación y requiere documentar la limitación de consistencia entre páginas).
- Para evitar ambigüedades de collation/locale, documentar la collation usada por el backend (ej.: `locale: es-ES`) o acordar que el frontend aplique sort locale-aware cuando realice el ordenamiento.

RF-5: Filtrado básico

- Controles para filtrar por priority (low/medium/high) y status (open/in_progress/closed). Filtros ofrecen opción "All" para quitar filtro.
- Criterio de aceptación: Aplicar filtro reduce el conjunto visible y se mantiene la paginación coherente.

<!-- RF-6 consolidado en RF-2: Nuevo ticket aparece en la lista en ≤5s -->

Escenarios de usuario (Acceptance Scenarios)

Escenario 1: Crear y ver nuevo ticket

- Dado un agente autenticado en el dashboard
- Cuando pulsa "New Ticket" y completa el formulario
- Entonces el sistema crea el ticket y la lista refleja el nuevo registro en ≤5s

Escenario 2: Ver y navegar páginas

- Dado una lista grande de tickets
- Cuando el usuario cambia a tamaño de página 50 o navega a la página siguiente
- Entonces la tabla muestra las filas correctas sin errores de layout y los controles de paginación funcionan

Escenario 3: Ordenar y filtrar

- Dado la tabla de tickets
- Cuando el usuario aplica filtro por priority=status y ordena por createdAt
- Entonces la lista muestra solo los tickets filtrados en el orden solicitado y mantiene la paginación

Criterios de éxito (medibles)

1. Localización de acciones: 95% de participantes localizan New Ticket y controles (filtros/orden) en ≤10s.
2. Renderizado masivo: La UI puede renderizar 50 filas en la tabla sin overflow ni degradación perceptible del UX (ver pruebas visuales y manuales).
3. Propagación rápida: Tickets creados aparecen en la lista en ≤5s.
4. Responsividad: UI usable en breakpoints comunes (mobile, tablet, desktop) sin pérdida de funcionalidad.
5. Rendimiento API (non-functional): p95 de peticiones relacionadas con listado de tickets < 200 ms (requiere pruebas de rendimiento y puede ajustarse en planificación).
6. Accesibilidad: Cumplir con estándares a11y básicos (navegación por teclado, roles ARIA en controles, contraste suficiente).

Entidades clave

 - Ticket: {
  - id: string (UUID v4) — identificador canónico del ticket en API
  - title: string
  - description: string
  - priority: enum (low, medium, high) — valores canónicos en snake_case
  - status: enum (open, in_progress, closed) — valores canónicos en snake_case
  - assigned_to_id: string | null — id del usuario asignado (UUID v4), null si no hay asignado
  - assigned_to_name: string | null — nombre para mostrar del usuario asignado, null si no hay asignado
  - created_at: timestamp (ISO 8601 recomendado en API)
}
- Usuario: id, nombre, rol

API contract and UI mapping

 - Backend API usa nombres de campo y valores canónicos en snake_case (ej.: priority: "low"/"medium"/"high"; status: "open"/"in_progress"/"closed").

Clarificación de contratos y mapeo UI↔API

- Campos canónicos del Ticket (API) que el frontend debe consumir/emitir: id, title, description, priority, status, assigned_to_id, assigned_to_name, created_at.
- Formato de id: UUID v4 (por ejemplo: "3fa85f64-5717-4562-b3fc-2c963f66afa6"). El frontend debe validar este formato en entradas y aceptar null/omisión donde el API lo permita.
- División de assigned_to para eliminar ambigüedad:
  - assigned_to_id: identificador del usuario asignado (UUID v4) o null
  - assigned_to_name: nombre para mostrar del asignado o null

- Mapeo UI↔API y localización:
  - El API mantiene valores canónicos y no localizados. La UI presenta etiquetas y formatos localizados (ej.: "low" -> "Baja").
  - Al enviar datos al API, usar siempre los nombres y valores canónicos (assigned_to_id, etc.). Al mostrar en la UI, convertir a etiquetas/localización.
  - Documentar en el equipo dónde se realiza este mapeo y asegurar pruebas que verifiquen la correspondencia UI↔API.

Esta sección resuelve la inconsistencia I1 (nombres mixtos camelCase/snake_case) y las ambigüedades A1/A2 sobre el formato de id y el significado del campo assigned_to.

Restricciones y supuestos

- Se asume que las APIs para listado (paginado), creación y ordenación existen y respetan el contrato snake_case.
- Se aplican normas del proyecto: TDD, cobertura mínima en tests, cobertura de pruebas automatizadas en CI.
- Se prioriza accesibilidad y rendimiento en la implementación.

Dependencias

- Endpoint backend: GET /tickets (paginated, sort, filter), POST /tickets (create).
- Componentes UI compartidos, estilos y utilidades de i18n del proyecto.

Pruebas y criterios de verificación

- Tests de aceptación manual: crear ticket, verificar aparición en ≤5s; navegar paginación y verificar 50 filas.
- Pruebas de usabilidad: medir tiempo de localización de acciones (target ≤10s, 95% users).
- Pruebas de rendimiento: medir p95 de list API y UI render con 50 filas.
- Pruebas de accesibilidad: keyboard navigation, ARIA labels, contrast checks.

Casos límite identificados

- Tickets con campos faltantes (sin assignedTo): mostrar "Unassigned"/localizado en UI.
- Tickets con títulos muy largos: truncar visualmente con tooltip para texto completo.
- Paginación en la última página con menos filas: controles deshabilitados adecuadamente.

Asunciones realizadas

- Localización: UI puede mostrar etiquetas en español; los valores internos permanecen snake_case.
- Tamaño máximo relevante para UX: probar hasta 50 filas por página.

Estado: READY FOR PLANNING

---

Archivo actualizado por /speckit.specify
