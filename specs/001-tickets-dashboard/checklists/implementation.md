# Checklist de implementación — tickets-dashboard

Ruta: C:\Users\Leandro\IdeaProjects\api-tickets-tfm-ssd\frontend\specs\001-tickets-dashboard\

## Pre-implementación
- [ ] Confirmar contrato API con backend (contracts/tickets-api.md)
- [ ] Asegurar variables de entorno: apiBaseUrl, requery flags
- [ ] Revisar y configurar Jest y Cypress en el repo

## Desarrollo (por historia de usuario)

US1 — Dashboard (MVP)
- [ ] Escribir tests (contrato GET /tickets, unit tests para tickets-api.service)
- [ ] Implementar tickets.module y rutas lazy
- [ ] Implementar tickets-api.service y tickets-state.service (debounce, cancelación)
- [ ] Implementar TicketsListPage, TicketsTableComponent, TicketFiltersComponent
- [ ] Implementar reconsulta tras creación del ticket y tests e2e (≤5s)

US2 — Formulario de creación
- [ ] Escribir tests de contrato POST /tickets y unit tests de validación
- [ ] Implementar TicketCreatePage y manejo de éxito/errores

US3 — Pulido
- [ ] Implementar selector page-size (25/50) y sorting
- [ ] A11y: añadir atributos ARIA y tests de accesibilidad
- [ ] Ejecutar linters, formateo y pruebas completas

## Verificación final
- [ ] Cobertura >= 80% para el módulo tickets
- [ ] Pruebas e2e pasan en CI y localmente
- [ ] Documentación actualizada: quickstart.md, README de la feature

