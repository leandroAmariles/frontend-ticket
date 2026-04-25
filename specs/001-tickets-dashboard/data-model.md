# Data Model: tickets-dashboard

## Entities

### Ticket
- id: string (UUID) — required
- asignado_a: string — required (nombre del usuario asignado)
- fecha_creacion: string (ISO 8601 UTC) — required
- descripcion: string — required, minLength 5, maxLength 2000
- prioridad: enum { "low", "medium", "high" } — required
- estado: enum { "open", "in_progress", "closed" } — required

Validation rules:
- id debe ser único y no mutable.
- descripcion no puede estar vacía; longitud mínima 5 caracteres.
- prioridad debe ser una de las opciones enumeradas.
- estado inicial al crear ticket: "open" (a menos que el usuario explícitamente elija otro estado, validar permisos).

Relationships:
- Ticket.asignado_a -> Usuario.nombre (string). Si se dispone de un modelo Usuario enlazado por id, preferir asignado_a_id: string (foreign key) y resolver nombre vía relación.

State transitions (simplified):
- open -> in_progress
- in_progress -> closed
- open -> closed (si se cierra sin pasar por in_progress)
- Transiciones deben validarse en backend; la UI debe impedir transiciones inválidas.

### Usuario (client-side representation)
- id: string
- nombre: string
- rol: string (por ejemplo: "agent", "reader")

Notes:
- Mantener interfaces TypeScript en `frontend/src/app/tickets/interfaces.ts`:
  - export interface Ticket { id: string; asignado_a: string; fecha_creacion: string; descripcion: string; prioridad: 'low'|'medium'|'high'; estado: 'open'|'in_progress'|'closed'; }
  - export interface User { id: string; nombre: string; rol?: string }

- Los modelos deben ser inmutables por convención en la UI; cualquier transformación para presentación (p. ej. formateo de fecha o labels) se hace en selectores/transformers.

- Pagination metadata (from API):
  - meta: { total: number; page: number; pageSize: number; totalPages: number }


Generated artifacts:
- Place TypeScript interfaces in `frontend/src/app/tickets/models` or `interfaces.ts` within the feature module.

