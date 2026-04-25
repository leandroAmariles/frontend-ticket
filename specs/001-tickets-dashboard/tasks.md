---
description: "Tareas para implementar el feature tickets-dashboard"
---

# Tasks: tickets-dashboard

Input: specs/001-tickets-dashboard/
Prerequisites: plan.md (required), spec.md (required), data-model.md, contracts/tickets-api.md

## Convenciones
- [P] = Tarea que puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- Incluir rutas de archivo exactas en cada tarea

## Phase 1: Setup (Infraestructura compartida)

- [P] T001 [Setup] Crear estructura de directorios del feature
  - Crear: frontend/src/app/tickets/{components,containers,services} y frontend/src/app/tickets/tickets.module.ts
  - Ruta: frontend/src/app/tickets/

- [P] T002 [Setup] Añadir dependencias si faltan: Angular Material, @angular/flex-layout (si procede)
  - Archivos: package.json (raíz del frontend)

- [P] T003 [Setup] Configurar linter/formatter según la Constitución del proyecto
  - Archivos: .eslintrc.json (o tslint), .prettierrc

## Phase 2: Foundational (Bloqueante)

⚠️ Ninguna historia de usuario puede comenzar hasta completar estas tareas.

- [ ] T004 [P] [Foundation] Crear TicketsApiService: frontend/src/app/tickets/services/tickets-api.service.ts
  - Implementar métodos básicos: listTickets(page, size), createTicket(payload)
  - Usar contratos: specs/001-tickets-dashboard/contracts/tickets-api.md

- [ ] T005 [P] [Foundation] Definir modelos/DTOs: frontend/src/app/tickets/models/ticket.model.ts
  - Campos: id, asignadoA, fechaCreacion, descripcion, prioridad, estado

- [ ] T006 [P] [Foundation] Configurar routing del feature: frontend/src/app/tickets/tickets-routing.module.ts
  - Rutas: /tickets (Dashboard container), /tickets/new (NewTicket container)

- [ ] T007 [P] [Foundation] Crear módulo del feature: frontend/src/app/tickets/tickets.module.ts
  - Declarar containers y componentes base

- [ ] T008 [P] [Foundation] Añadir guard de autenticación si procede (usar guard global): frontend/src/app/tickets/guards/auth.guard.ts

- [ ] T009 [P] [Foundation] Añadir utilidades de paginación y tipos: frontend/src/app/tickets/models/pagination.model.ts

- [ ] T010 [P] [Foundation] Documentar contrato API y ejemplos de respuesta: specs/001-tickets-dashboard/contracts/tickets-api.md (actualizar si falta)

## Phase 3: User Story US1 - Dashboard + Mostrar todos los tickets (Priority: P1)

Goal: Implementar el dashboard con botones "Crear nuevo ticket" y "Mostrar todos los tickets" y la tabla paginada que lista tickets.

Independent Test: Manual + e2e que verifique los botones y que la tabla lista filas (paginación funcional)

### Tests (TDD-first)
- [P] T011 [US1] Unit tests (Jest) para TicketsApiService: frontend/src/app/tickets/services/tickets-api.service.spec.ts
- [P] T012 [US1] Unit tests para TicketTable component: frontend/src/app/tickets/components/ticket-table/ticket-table.component.spec.ts
- [P] T013 [US1] E2E (Playwright) para flujo: tests/e2e/tickets/dashboard.spec.ts
  - Caso: al cargar dashboard los dos botones son visibles; al pulsar "Mostrar todos los tickets" se muestra tabla con hasta 25 filas y controles de paginación

### Implementation
- [P] T014 [US1] Crear container DashboardPage: frontend/src/app/tickets/containers/dashboard/dashboard.page.ts(+html/scss)
  - Incluir botones accesibles con ARIA: "Crear nuevo ticket" y "Mostrar todos los tickets"

- [P] T015 [US1] Crear componente TicketTable: frontend/src/app/tickets/components/ticket-table/ticket-table.component.ts(+html/scss)
  - Props: tickets[], page, pageSize, total
  - Eventos: pageChange
  - Columnas: Asignado a, ID, Fecha, Descripción, Prioridad, Estado

- [ ] T016 [US1] Integrar TicketsApiService en DashboardPage para consultar lista paginada
  - Archivo: frontend/src/app/tickets/containers/dashboard/dashboard.page.ts
  - Default pageSize = 25

- [ ] T017 [US1] Implementar paginación en servidor y controles Prev/Next en TicketTable
  - Archivos: frontend/src/app/tickets/components/ticket-table/*

- [ ] T018 [US1] Accesibilidad: Asegurar navegación por teclado y labels ARIA para botones y tabla
  - Archivos: dashboard.page.html, ticket-table.component.html

- [ ] T019 [US1] Logging y manejo de errores: mostrar spinner y mensajes de error en caso de fallo de carga
  - Archivos: dashboard.page.ts, ticket-table.component.ts

Checkpoint: US1 debe poder ser probado independientemente (tests unitarios y e2e)

## Phase 4: User Story US2 - Crear nuevo ticket (Priority: P2)

Goal: Implementar página dedicada /tickets/new con formulario para crear tickets.

Independent Test: e2e que cree un ticket y verifique que la lista se actualiza (<5s)

### Tests
- [P] T020 [US2] Unit tests para TicketForm component: frontend/src/app/tickets/components/ticket-form/ticket-form.component.spec.ts
- [P] T021 [US2] Integration test (Jest) para flow de creación llamando a TicketsApiService: frontend/src/app/tickets/containers/new-ticket/new-ticket.page.spec.ts
- [P] T022 [US2] E2E (Playwright) para crear ticket y verificar actualización en dashboard: tests/e2e/tickets/create-ticket.spec.ts

### Implementation
- [P] T023 [US2] Crear container NewTicketPage: frontend/src/app/tickets/containers/new-ticket/new-ticket.page.ts(+html/scss)
- [P] T024 [US2] Crear componente TicketForm: frontend/src/app/tickets/components/ticket-form/ticket-form.component.ts(+html/scss)
  - Campos: asignado_a, descripcion, prioridad (baja/media/alta), estado (inicial)
  - Validaciones: campos requeridos

- [ ] T025 [US2] Integrar form con TicketsApiService.createTicket() y manejar redirección/feedback
  - Al crear: navegar a /tickets y refrescar la página de listados (o emitir evento para reconsulta)

- [ ] T026 [US2] Asegurar que después de crear, el dashboard reconsulte la página actual y muestre el nuevo ticket en <=5s
  - Implementar polling ligero o usar evento/subject compartido en servicio

## Phase 5: Polish & Cross-Cutting

- [P] T027 [Polish] Documentación: actualizar specs/001-tickets-dashboard/quickstart.md y README del feature
- [P] T028 [Polish] Tests adicionales unitarios para alcanzar cobertura >=80% en el módulo tickets
- [P] T029 [Polish] Revisar estilos/responsive: frontend/src/app/tickets/**/*.scss
- [P] T030 [Polish] Revisión de accesibilidad (A11y): ejecutar checklist en specs/001-tickets-dashboard/quickstart.md

## Dependencias & Orden de ejecución
- Phase 1 → Phase 2 (FOUNDATIONAL) es bloqueante → Phase 3 (US1) → Phase 4 (US2) → Phase 5
- Dentro de cada historia seguir orden: tests (escribir y fallar) → modelos → servicios → components → containers → e2e

## Notas
- Las rutas y nombres de archivos son sugeridos y deben adaptarse a convenciones del repo si difieren.
- Priorizar T014..T018 para entregable MVP (Dashboard + Listado paginado)
- Usar specs/001-tickets-dashboard/contracts/tickets-api.md como fuente de verdad para payloads y respuestas.

---

