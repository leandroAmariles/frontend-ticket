# Data Model: tickets-dashboard

## Entities

### Ticket (canonical)
- id: string (UUID v4) — required
- title: string — required
- description: string — required, minLength 5, maxLength 2000
- priority: enum { "low", "medium", "high" } — required (canonical values)
- status: enum { "open", "in_progress", "closed" } — required (canonical values)
- assigned_to_id: string | null — UUID v4 of assigned user or null
- assigned_to_name: string | null — display name of assigned user or null
- created_at: string (ISO 8601 UTC) — required

Validation rules:
- id debe ser único y no mutable.
- description no puede estar vacía; longitud mínima 5 caracteres.
- priority debe ser una de las opciones enumeradas.
- estado inicial al crear ticket: "open" (a menos que el usuario explícitamente elija otro estado; validar permisos en backend).

Relationships:
- Si existe un modelo Usuario enlazado por id, preferir `assigned_to_id: string` (foreign key) y resolver `assigned_to_name` vía relación o denormalización.

State transitions (simplified):
- open -> in_progress
- in_progress -> closed
- open -> closed (si se cierra sin pasar por in_progress)
- Transiciones deben validarse en backend; la UI debe impedir transiciones inválidas.

### Usuario (client-side representation)
- id: string
- name: string
- role: string (por ejemplo: "agent", "reader")

Notes:
- Mantener interfaces TypeScript en `frontend/src/app/tickets/models/index.ts` (o `interfaces.ts` si se prefiere):
  - export interface Ticket { id: string; title: string; description: string; priority: 'low'|'medium'|'high'; status: 'open'|'in_progress'|'closed'; assigned_to_id?: string | null; assigned_to_name?: string | null; created_at: string }
  - export interface User { id: string; name: string; role?: string }

- Los modelos deben ser inmutables por convención en la UI; cualquier transformación para presentación (p. ej. formateo de fecha o labels) se hace en selectores/transformers.

- Pagination metadata (from API):
  - meta: { total: number; page: number; page_size: number; total_pages: number }

Generated artifacts:
- Place TypeScript interfaces in `frontend/src/app/tickets/models` (recommend `index.ts` exporting interfaces).

Mapping note (backwards compatibility):
- Si existen versiones antiguas del API con campos en español (`asignado_a`, `fecha_creacion`), implementar un transformador central que convierta esos campos al modelo canónico (`assigned_to_name`, `created_at`) antes de exponerlos al resto de la UI.
