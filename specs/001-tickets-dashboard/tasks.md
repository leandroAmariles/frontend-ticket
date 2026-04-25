description: "Tareas para implementar la característica tickets-dashboard"
---

## Input / Precondiciones

- Ruta de especificaciones: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\
- Artefactos usados: plan.md, spec.md, data-model.md, research.md, contracts/tickets-api.md

Supuestos (documentados):
- El proyecto es una aplicación Angular en frontend/ con soporte de Jest para unit y Cypress para e2e (según plan.md). Si la configuración difiere, adaptar las tareas de test.
- Las rutas de código se crean bajo: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\ (módulo lazy-loaded).
- El API expone GET /tickets y POST /tickets según contracts/tickets-api.md; usar Authorization: Bearer <token> en cabeceras.

Tests: TDD obligatorio para funciones críticas (crear ticket, listado). Las tareas incluyen la creación de tests unitarios, de contrato e e2e según spec.md.

Nota: Si falta alguna configuración de repo (linters, CI), las tareas de Foundational (Phase 2) incluyen pasos bloqueantes para añadirlas.

## Convenciones

- Formato de tarea: - [ ] T### [P?] [USx?] Descripción (ruta de archivo)
- [P] indica que la tarea se puede ejecutar en paralelo (archivos distintos y sin dependencias).
- Las tareas de User Story deben incluir la etiqueta [US1], [US2], etc.

## Phase 1: Setup (Infraestructura compartida)

Propósito: Preparar módulo feature, imports de UI y modelos según plan.md y data-model.md.

- [X] T001 Crear módulo feature y rutas lazy: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\tickets.module.ts y C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\tickets-routing.module.ts (definir rutas /tickets y /tickets/new)
- [X] T002 [P] Importar y configurar Angular Material modules (MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatSelectModule, MatButtonModule) en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\tickets.module.ts
- [X] T003 [P] Crear interfaces TypeScript desde data-model.md en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\models\index.ts (exportar Ticket, User, PaginationMeta)
- [X] T004 [P] Añadir configuración de base API y referencia en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\environments\environment.ts (agregar apiBaseUrl y flags de requery) y documentar uso
- [X] T005 [P] Crear transformadores para mapeo UI↔API y formateo de fecha en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\utils\transformers.ts (mapApiTicketToUi, mapCreateFormToApi, label mappings)

---

## Phase 2: Foundational (Prerequisitos bloqueantes)

Propósito: Implementar servicios core, interceptores y scaffolds de test necesarios para las User Stories.

- [X] T006 Implementar interceptor HTTP de autorización que adjunte Authorization: Bearer <token> en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\core\interceptors\auth.interceptor.ts (registrar provider en AppModule)
- [X] T007 Implementar servicio centralizado de manejo de errores en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\core\services\error-handler.service.ts y registrar en AppModule
- [X] T008 Implementar cliente API de tickets en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-api.service.ts con métodos listTickets(params) y createTicket(payload) conforme a contracts/tickets-api.md
- [X] T009 Implementar tickets-state.service en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-state.service.ts (exponer tickets$, refresh(params), getTicketById(id)) y soportar cancelación/debounce
- [X] T010 Añadir scaffold de tests unitarios (Jest + Angular Testing Library) para el módulo tickets en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\setup.test.ts (configurar mocks globales si procede)
- [X] T011 Crear scaffold de e2e (Cypress) para tickets en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\e2e\src\tickets\dashboard.spec.ts y asegurar config baseUrl en cypress.json o cypress.config.ts
- [X] T012 [BLOCKING] Reconciliar y publicar contrato API canónico: actualizar specs/001-tickets-dashboard/contracts/tickets-api.md y confirmar con backend (documentar resultado en contracts/tickets-api.md)
- [X] T013 Implementar transformadores y tests unitarios que validen mapApiTicketToUi y mapCreateFormToApi en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\utils\transformers.ts y tests en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\unit\transformers.spec.ts

---

## Phase 3: User Story 1 - Dashboard (P1) — MVP

Objetivo: /tickets muestra tabla paginada (25,50), filtros por priority/status, ordenación por columnas y CTA "New Ticket" que navega a /tickets/new. Reconsulta tras creación asegura aparición ≤5s.

Independent test: unit + integration tests para servicios y componentes; Cypress e2e que crea ticket y verifica aparición en listado <=5s.

### Tests (TDD) para US1

- [X] T014 [P] [US1] Crear test de contrato GET /tickets en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\contract\get-tickets.spec.ts (verificar meta e items schema)
- [X] T015 [P] [US1] Crear tests unitarios para tickets-api.service en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\unit\tickets-api.spec.ts (validar params, mapping y errores)

### Implementación para US1

- [X] T016 [US1] Crear componente TicketsListPage en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\tickets-list-page\tickets-list-page.component.ts, .html, .scss (ruta /tickets)
- [X] T017 [US1] Implementar TicketsTableComponent con MatTable/MatPaginator/MatSort en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\tickets-table\tickets-table.component.ts, .html, .scss (soporta selector 25/50)
- [X] T018 [P] [US1] Implementar TicketFiltersComponent en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\ticket-filters\ticket-filters.component.ts, .html, .scss (priority/status con opción 'All')
- [X] T019 [US1] Añadir CTA "New Ticket" en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\tickets-list-page\tickets-list-page.component.html apuntando a /tickets/new
- [X] T020 [US1] Conectar listing con tickets-state.service y tickets-api.service, establecer pageSize por defecto 25 en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\tickets-list-page\tickets-list-page.component.ts
- [X] T021 [US1] Usar transformers para formateo de fecha y mapeo de etiquetas en plantillas en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\utils\transformers.ts
- [X] T022 [US1] Crear test de integración unitario para la UI del listado en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\integration\listing.spec.ts (mock tickets-state.service)
- [X] T023 [US1] Crear Cypress e2e que POSTea un ticket y verifica su aparición en /tickets en ≤5s en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\e2e\src\tickets\create-and-reflect.spec.ts (dependencia: T011)

Checkpoint: Tras T014–T023, US1 debe ser testeable de forma independiente y considerado MVP si los tests pasan.

---

## Phase 4: User Story 2 - Formulario de creación (P2)

Objetivo: /tickets/new página con formulario reactivo para crear tickets (title, description, priority, status, assigned_to) con validación cliente e integración con backend.

Independent test: unit tests de validación, contract test POST /tickets, e2e del flujo de creación.

- [X] T024 [P] [US2] Crear test de contrato POST /tickets en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\contract\post-ticket.spec.ts
- [X] T025 [P] [US2] Crear tests unitarios para validación del formulario en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\unit\create-form.spec.ts
- [X] T026 [US2] Crear componente TicketCreatePage en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\ticket-create-page\ticket-create-page.component.ts, .html, .scss (form reactivo)
- [X] T027 [US2] Implementar envío del formulario a tickets-api.service.createTicket() y manejo de éxito/errores en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\ticket-create-page\ticket-create-page.component.ts
- [X] T028 [US2] Al éxito navegar a /tickets y disparar tickets-state.service.refresh() con re-query/backoff hasta ver el ticket (<=5s) en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-state.service.ts
- [X] T029 [US2] Añadir integración/e2e de flujo de creación en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\e2e\src\tickets\create-flow.spec.ts
- [X] T030 [US2] Implementar y testear los valores por defecto de re-query en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-state.service.ts (initialInterval=500ms, backoff, maxInterval=2000ms, maxDuration=5s) y tests en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\unit\requery.defaults.spec.ts

Checkpoint: US2 entrega formulario validado e integrado con backend.

---

## Phase 5: User Story 3 - Ordenación, tamaño de página y accesibilidad (P3)

Objetivo: Ordenación robusta por columnas, selector de tamaño de página (25/50), accesibilidad (ARIA/keyboard) y estados (loading/empty/error).

Independent test: unit + integration tests para sort/pagination; e2e para accesibilidad.

- [ ] T031 [US3] Implementar selector de page-size (25/50) en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\tickets-table\tickets-table.component.ts y .html
- [ ] T032 [P] [US3] Implementar manejadores de sort por columna y mapear a query param sort en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\tickets-table\tickets-table.component.ts
- [ ] T033 [US3] Añadir atributos ARIA y soporte de navegación por teclado en componentes bajo C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\ (tickets-table y ticket-filters)
- [ ] T034 [P] [US3] Añadir componentes/shared para loading skeleton, empty state y error state en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\shared\states\
- [ ] T035 [US3] Añadir tests unit/integration para sorting, pagination y accesibilidad en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\integration\sorting-pagination-accessibility.spec.ts
- [ ] T036 [US3] Implementar fallback de sort en cliente cuando backend no soporte sort por assigned_to_name en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-state.service.ts y añadir tests en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\integration\sorting-fallback.spec.ts

---

## Phase Final: Pulido y aspectos transversales

- [X] T037 [P] Actualizar docs y quickstart en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\quickstart.md (verificar comandos y scripts)
- [ ] T038 [P] Ejecutar linter/formatter y arreglar estilos en nuevos archivos (package.json scripts en la raíz del repo)
- [ ] T039 [P] Auditoría final de accesibilidad y correcciones; documentar en C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\accessibility-report.md
- [ ] T040 Ejecutar matriz completa de tests (unit/integration/e2e) y asegurar coverage >=80% para el nuevo módulo; arreglar fallos
- [ ] T041 Crear script k6 para GET /tickets en tests/performance/get-tickets-k6.js y README en tests/performance/README.md
- [ ] T042 Añadir protocolo de estudio de usabilidad RF-1 en specs/001-tickets-dashboard/usability/rf-1-study.md
- [ ] T043 Añadir pruebas visuales/regresión para tabla (25/50 filas) en specs/001-tickets-dashboard/tests/visual/ y job opcional en CI
- [ ] T044 Añadir workflow CI .github/workflows/ci-perf-coverage.yml que valide coverage >=80% y ejecute scripts de performance (depende de T041)
- [ ] T045 Integrar umbral p95 en CI (falla si p95 GET /tickets > 200ms) en .github/workflows/ci-perf-coverage.yml (depende de T041, T044)
- [ ] T046 Añadir plantilla PR y checklist en .github/PULL_REQUEST_TEMPLATE.md y actualizar CONTRIBUTING.md

---

## Dependencies y orden de ejecución

- Fase 1 (T001–T005) debe completarse antes de Fase 2 (T006–T013).
- Fase 2 (Foundational) debe completarse antes de comenzar las User Stories (T014+).
- Prioridad MVP: completar Fase 3 (US1: T014–T023) primero; luego Fase 4 (US2) y Fase 5 (US3) incrementalmente.
- Dentro de cada historia: Tests (escribir y fallar) → Modelos/Interfaces → Servicios → Componentes/Páginas → Integración/E2E.

### Oportunidades de paralelismo

- Las tareas marcadas [P] pueden ejecutarse en paralelo si no hay conflicto de archivos (por ejemplo: T002, T003, T005, T014, T015, T018, T024, T025, T032, T034, T037–T039).

---

## Ejemplo de ejecución paralela: User Story 1

- Trabajadores separados pueden ejecutar en paralelo:
  - T014 [US1] test de contrato GET /tickets
  - T015 [US1] tests unitarios tickets-api.service
  - T003 crear interfaces TypeScript

---

## Estrategia de implementación

- MVP primero: implementar Fase 1 → Fase 2 → US1 (T014–T023) y validar con tests y e2e. Avanzar a US2 y US3 incrementalmente.
- Entregar increments independientes por User Story para permitir despliegues y pruebas aisladas.

---

## Resumen

- Total estimado de tareas: 46
- Tareas por fase (estimación): Fase 1:5, Foundational:8, US1:10, US2:7, US3:6, Pulido:10

---

## Archivo generado

- Ruta: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\tasks.md

