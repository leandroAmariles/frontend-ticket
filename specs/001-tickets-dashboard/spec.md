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
- Tabla paginada de tickets con columnas: id, title, priority, status, assignedTo, createdAt (mostrar etiquetas localizadas en UI).
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
- Criterio de aceptación: El formulario permite ingresar title, assignedTo, description, priority y status inicial.
- Decisión: El formulario abrirá en una página dedicada (/tickets/new). Tras creación, la lista reconsultará datos y mostrará el nuevo ticket en ≤5s.

RF-3: Listado, paginación y tamaños de página

- La lista se muestra como tabla paginada en servidor. Tamaño por defecto 25; selector de tamaño con opciones 25 y 50.
- Criterio de aceptación: La tabla renderiza correctamente 50 filas cuando se selecciona ese tamaño de página sin overflow o degradación UX.

RF-4: Ordenación

- Las columnas id, title, priority, status, assignedTo, createdAt deben ser ordenables; la interacción es mediante clic en cabecera con indicador asc/desc.
- Criterio de aceptación: Orden ascendente/descendente funciona y los datos se actualizan en la tabla.

RF-5: Filtrado básico

- Controles para filtrar por priority (low/medium/high) y status (open/in_progress/closed). Filtros ofrecen opción "All" para quitar filtro.
- Criterio de aceptación: Aplicar filtro reduce el conjunto visible y se mantiene la paginación coherente.

RF-6: Actualización tras creación

- Nuevo ticket aparece en la lista en ≤5s tras la confirmación de creación (por reconsulta o evento push).

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
  - id: string (UUID or numeric identifier, canonical name: id)
  - title: string
  - description: string
  - priority: enum (low, medium, high) — canonical snake_case in API
  - status: enum (open, in_progress, closed) — canonical snake_case in API
  - assignedTo: string (display name or user id)
  - createdAt: timestamp
}
- Usuario: id, nombre, rol

API contract and UI mapping

- Backend API uses snake_case enums and field names (priority: low/medium/high; status: open/in_progress/closed).
- Decision: Keep canonical snake_case at data layer; implement a UI mapping layer that converts canonical values to localized, human-friendly labels (e.g., "low" -> "Baja"). This preserves contract stability while allowing localized display.

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
