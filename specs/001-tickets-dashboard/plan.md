# Implementation Plan: tickets-dashboard

**Branch**: `001-tickets-dashboard` | **Date**: 2026-04-24 | **Spec**: `specs/001-tickets-dashboard/spec.md`
**Input**: Feature specification from `/specs/001-tickets-dashboard/spec.md`

## Summary

Implementar un dashboard de tickets en el frontend con dos acciones principales: crear nuevo ticket (navegar a /tickets/new) y mostrar todos los tickets (tabla paginada con columnas: Asignado a, ID, Fecha, Descripción, Prioridad, Estado). La implementación seguirá la Constitución del proyecto (Angular, accesibilidad, TDD) y garantizará pruebas unitarias y e2e para flujos críticos (crear ticket y listar tickets).

## Technical Context

**Language/Version**: TypeScript (TS 5.x) — Decision: usar versiones contemporáneas compatibles con la base del proyecto; si el repo ya define otra versión, adaptar.  
**Primary Dependencies**: Angular (framework para frontend) + Angular Material para componentes UI, RxJS, tslib, y utilidades internas del proyecto.  
**Storage**: N/A (datos provistos por el servicio backend vía API REST paginada).  
**Testing**: Jest para unitarios + Playwright para e2e (decisión para velocidad y robustez en 2026).  
**Target Platform**: Navegadores modernos (desktop y mobile) con soporte a ES2022+; objetivo mobile-first responsive.  
**Project Type**: Web application (frontend single-page app).  
**Performance Goals**: Renderizar hasta 50 filas en la tabla sin degradación perceptible; tiempo de respuesta <200ms p95 para la carga de la página de dashboard en condiciones normales de red; reconsulta tras creación del ticket visible en <5s.  
**Constraints**: Paginación en servidor obligatoria (no cargar todos los tickets en memoria); accesibilidad (A11y) obligatoria; cobertura de tests >=80% global.  
**Scale/Scope**: Interfaz para gestión interna: esperado soporte para miles de usuarios concurrentes en el sistema global, pero la UI está optimizada para sesiones de agentes individuales.

## Constitution Check

La Constitución exige (entre otros) TDD obligatorio, accesibilidad, cobertura mínima 80% y uso de arquitectura Angular (modules, services, smart/dumb components). Este plan cumple las puertas requeridas mediante las siguientes acciones: 
- TDD: se escribirán pruebas unitarias (Jest) antes de las implementaciones y pruebas e2e (Playwright) para flujos críticos (crear/listar).  
- Accesibilidad: botones y formularios con roles ARIA, foco visible y navegación por teclado; ver quickstart.md para criterios de comprobación.  
- Cobertura: objetivo >=80% global; las nuevas unidades añadirán tests para alcanzar el umbral.

GATE RESULT: PASSED — no se identifican violaciones de la Constitución que requieran excepciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-tickets-dashboard/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tickets-api.md
└── tasks.md (Phase 2 output)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── tickets/
│   │   │   ├── components/        # dumb/presentational components
│   │   │   ├── containers/        # smart components / pages (dashboard, new ticket)
│   │   │   ├── services/          # API integration, data layer
│   │   │   └── tickets.module.ts
│   └── assets/
└── tests/
    ├── unit/
    └── e2e/
```

**Structure Decision**: Proyecto frontend Angular SPA. La implementación añadirá un feature module `tickets` bajo `frontend/src/app/tickets` con containers (DashboardPage, NewTicketPage), components (TicketTable, TicketRow, TicketForm), y servicios (TicketsApiService). Tests unitarios y e2e se ubicarán en `frontend/tests` o en el propio `src` junto a los spec files según la convención del repo.

## Complexity Tracking

No se requieren excepciones a la Constitución. Las decisiones priorizan simplicidad (server-side pagination, formulario en página dedicada) y cumplimiento de A11y y TDD.
