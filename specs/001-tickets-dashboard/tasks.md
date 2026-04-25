---
description: "Tareas para implementar el feature tickets-dashboard"
---

## Extension Hooks

**Optional Pre-Hook**: git
Command: `speckit.git.commit`
Description: Auto-commit before task generation

Prompt: Commit outstanding changes before task generation?
To execute: `speckit.git.commit`

# Tasks: tickets-dashboard

**Input**: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\

## Convenciones
- [P] = Tarea que puede ejecutarse en paralelo (archivos distintos, sin dependencias)
- Todas las tareas deben incluir rutas de archivo exactas (absolutas donde procede)

## Phase 1: Setup (Shared Infrastructure)

Purpose: Prepare Angular feature module, UI dependencies and core models per plan.md and data-model.md

- [ ] T001 Create feature module and lazy route at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\tickets.module.ts and C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\tickets-routing.module.ts
- [P] [ ] T002 Add/import Angular Material modules (MatTableModule, MatPaginatorModule, MatSortModule, MatFormFieldModule, MatSelectModule, MatButtonModule) into C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\tickets.module.ts
- [P] T003 Create TypeScript interfaces from data-model.md in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\models\interfaces.ts (Ticket, User, PaginationMeta)
- [P] T004 Add API base configuration and environment reference in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\environments\environment.ts and ensure usage in services
- [P] T005 Create transformers for enum label mapping and date formatting at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\utils\transformers.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

Purpose: Implement core services and infra required by all user stories (auth, error handling, API client, state)

- [ ] T006 Implement HTTP Authorization interceptor at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\core\interceptors\auth.interceptor.ts to attach Bearer token to outgoing requests (per research.md decision)
- [ ] T007 Implement centralized error handler service at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\core\services\error-handler.service.ts and register provider in AppModule
- [ ] T008 Implement tickets API client at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-api.service.ts (methods: listTickets(params), createTicket(payload)) following specs/001-tickets-dashboard/contracts/tickets-api.md
- [P] T009 Implement tickets state service for caching, refresh and observables at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-state.service.ts (exposes refresh(), tickets$)
- [ ] T010 Add Jest unit-test scaffold for tickets module and test setup at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\setup.test.ts (ensure Angular Testing Library + Jest available per plan)
- [ ] T011 Scaffold Cypress e2e spec at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\e2e\src\tickets\dashboard.spec.ts and ensure cypress.json/config references baseUrl

---

## Phase 3: User Story 1 - Dashboard list + New Ticket CTA (Priority: P1) 🎯 MVP

Goal: /tickets page shows paginated table (25, 50), filters for priority/status, sortable columns and a prominent "New Ticket" CTA that navigates to /tickets/new. Ensure re-query after creation surfaces new tickets in ≤5s.

Independent Test: Unit tests for services and components; Cypress e2e that creates a ticket (POST) and verifies it appears in listing within 5s.

### Tests for US1 (TDD)

- [P] T012 [US1] Create contract test for GET /tickets at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\contract\get-tickets.spec.ts (assert meta and items schema)
- [P] T013 [US1] Create unit tests for tickets-api.service at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\unit\tickets-api.spec.ts (params, mapping, error cases)

### Implementation for US1

- [ ] T014 [US1] Create TicketsListPage component at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\tickets-list-page\tickets-list-page.component.ts, .html, .scss (route /tickets)
- [ ] T015 [US1] Implement TicketsTableComponent using MatTable/MatPaginator/MatSort at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\tickets-table\tickets-table.component.ts, .html, .scss (supports pageSize selector 25/50)
- [P] T016 [US1] Implement TicketFiltersComponent at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\ticket-filters\ticket-filters.component.ts, .html, .scss (priority/status with 'All' option)
- [ ] T017 [US1] Add New Ticket CTA to TicketsListPage HTML at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\tickets-list-page\tickets-list-page.component.html linking to /tickets/new
- [ ] T018 [US1] Wire listing to tickets-state.service and tickets-api.service; default pageSize=25 at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\tickets-list-page\tickets-list-page.component.ts (depends on T008, T009)
- [ ] T019 [US1] Implement date formatting and label mapping usage in templates via transformers in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\utils\transformers.ts (depends on T005)
- [ ] T020 [US1] Create integration unit test for listing UI at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\integration\listing.spec.ts (mock tickets-state.service)
- [ ] T021 [US1] Create Cypress e2e test that POSTs a ticket and asserts it appears in the /tickets list within 5s at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\e2e\src\tickets\create-and-reflect.spec.ts (depends on T011)

Checkpoint: After T012–T021 US1 should be independently testable and considered MVP if tests pass.

---

## Phase 4: User Story 2 - Create Ticket Form (Priority: P2)

Goal: /tickets/new page with a reactive form to create tickets (title/asignado_a/descripcion/prioridad/estado) with client validation and server integration.

Independent Test: Unit tests for form validation + contract test for POST /tickets + e2e create flow.

### Tests for US2

- [P] T022 [US2] Create contract test for POST /tickets at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\contract\post-ticket.spec.ts
- [P] T023 [US2] Create unit tests for TicketForm validation at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\unit\create-form.spec.ts

### Implementation for US2

- [ ] T024 [US2] Create TicketCreatePage component at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\ticket-create-page\ticket-create-page.component.ts, .html, .scss (reactive form)
- [ ] T025 [US2] Implement form submission to tickets-api.service.createTicket() and handle success/errors in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\pages\ticket-create-page\ticket-create-page.component.ts (depends on T008)
- [ ] T026 [US2] On success navigate to /tickets and trigger tickets-state.service.refresh() with light backoff until new ticket appears (<=5s) in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\services\tickets-state.service.ts
- [ ] T027 [US2] Add integration/e2e test for full create flow at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\e2e\src\tickets\create-flow.spec.ts (if T021 does not fully cover)

Checkpoint: US2 delivers a validated create form and backend integration.

---

## Phase 5: User Story 3 - Sorting, Page Size & Accessibility (Priority: P3)

Goal: Robust sorting by columns (id,title,priority,status,assignedTo,createdAt), page-size selector (25/50), comprehensive a11y (ARIA/keyboard) and loading/empty/error states.

Independent Test: Unit + integration tests verify sort params and UI; e2e checks keyboard navigation and ARIA roles.

- [ ] T028 [US3] Implement page-size selector handler (25/50) in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\tickets-table\tickets-table.component.ts and .html
- [P] T029 [US3] Implement column sort handlers mapping to API sort query params in C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\tickets-table\tickets-table.component.ts
- [ ] T030 [US3] Add ARIA attributes and keyboard navigation support in tickets components under C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\ (tickets-table and filters)
- [P] T031 [US3] Add loading skeleton, empty state and error state components under C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\components\shared\states\
- [ ] T032 [US3] Add unit/integration tests for sorting, pagination and accessibility at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\src\app\tickets\__tests__\integration\sorting-pagination-accessibility.spec.ts

---

## Phase N: Polish & Cross-Cutting Concerns

- [P] T033 Update docs and quickstart at C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\quickstart.md (verify scripts/commands)
- [P] T034 Run linter/formatter and fix style issues for new files (repo root: package.json scripts)
- [P] T035 Final accessibility audit and fixes (report changes under C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\)
- [ ] T036 Run full test matrix (unit/integration/e2e), ensure coverage >=80% for new module and fix failures
 - [ ] T037 [P] Crear script de rendimiento k6 para GET /tickets en tests/performance/get-tickets-k6.js
   - Criterios de aceptación:
	 - El archivo tests/performance/get-tickets-k6.js existe y contiene un script k6 que ejecuta GET /tickets usando una URL configurable vía variable de entorno (K6_BASE_URL).
	 - El escenario simula carga realista (ramp-up, duración y VUs) y documenta el escenario en el encabezado del archivo.
	 - El script genera salida JSON/STDOUT con métricas y permite calcular p95 de latencia.
	 - Se añade README corto en tests/performance/README.md con comando de ejecución ejemplo.
   - Dependencias: Ninguna.

 - [ ] T038 [P] Crear protocolo de prueba de usabilidad cuantitativa RF-1 en specs/001-tickets-dashboard/usability/rf-1-study.md
   - Criterios de aceptación:
	 - El archivo specs/001-tickets-dashboard/usability/rf-1-study.md contiene objetivo, guion paso a paso, instrucciones de moderador y definición exacta de la métrica temporal a medir.
	 - Tamaño mínimo de muestra: 15 participantes y criterios de reclutamiento.
	 - Definición de éxito: ≥95% de participantes completan la tarea objetivo en ≤10s; incluye método de análisis y template de recogida de datos.
   - Dependencias: Acceso a una versión desplegada o entorno de test representativo para ejecución.

 - [ ] T039 Crear workflow de CI en .github/workflows/ci-perf-coverage.yml para validar coverage global >=80% y ejecutar scripts de performance
   - Criterios de aceptación:
	 - Existe .github/workflows/ci-perf-coverage.yml que instala dependencias, ejecuta tests, genera informe de coverage y falla si coverage global <80%.
	 - El workflow ejecuta los scripts de tests/performance (k6) contra K6_BASE_URL configurable y guarda resultados como artefactos.
	 - El workflow publica artefactos (coverage, k6 results) y documenta variables/secretos necesarios.
   - Dependencias: T037 y suite de tests/coverage configurada.

---

## Dependencies & Execution Order

- Phase 1 (T001–T005) must complete before Phase 2 (T006–T011).
- Phase 2 (Foundational) must be completed before starting User Stories (T012+).
- MVP priority: Complete Phase 3 (US1: T012–T021) first. Then Phase 4 (US2) and Phase 5 (US3) incrementally.
- Within each story: Tests (write & fail) → Models/Interfaces → Services → Components/Pages → Integration/E2E.

### Parallel Opportunities

- Tasks explicitly marked [P] can be worked on in parallel where no file conflicts exist (for example: T003, T005, T009, T012, T013, T016, T022, T023, T029, T031, T033–T035).

---

## Parallel Execution Example: User Story 1

Run these in parallel (separate workers):
- T012 [US1] contract test for GET /tickets
- T013 [US1] unit tests for tickets-api.service
- T003 create TypeScript interfaces

---

## Implementation Strategy

MVP First:
1. Setup (T001–T005)
2. Foundational (T006–T011)
3. US1 MVP (T012–T021) → validate
4. Proceed to US2 (T022–T027) and US3 (T028–T032)

---

## Generated artifact

- Path: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\tasks.md

## Summary (task counts by phase)

- Total tasks: 36
- Phase 1 (Setup): 5
- Phase 2 (Foundational): 6
- Phase 3 (US1 MVP): 10
- Phase 4 (US2): 6
- Phase 5 (US3): 5
- Polish & Cross-cutting: 4
