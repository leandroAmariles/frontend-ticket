# API Contract: Tickets API

Ruta base: /api

## GET /tickets
Descripción: Recupera una página de tickets.
Query parameters:
- page: number (opcional, default 1)
- pageSize: number (opcional, default 25)

Response 200:
{
  "meta": { "total": 123, "page": 1, "pageSize": 25, "totalPages": 5 },
  "items": [
    {
      "id": "uuid",
      "asignado_a": "Nombre Apellido",
      "fecha_creacion": "2026-04-24T12:34:56Z",
      "descripcion": "Descripción del ticket",
      "prioridad": "medium",
      "estado": "open"
    }
  ]
}

Errors:
- 400: Bad request (invalid pagination params)
- 401: Unauthorized
- 500: Server error

Notes: Prefer page-based pagination as especificado en research.md. Fecha en ISO 8601 UTC.

## POST /tickets
Descripción: Crear un nuevo ticket.
Request body (application/json):
{
  "asignado_a": "Nombre Apellido",
  "descripcion": "Texto de la incidencia",
  "prioridad": "low|medium|high",
  "estado": "open|in_progress|closed"  // opcional; por defecto "open"
}

Response 201:
{
  "id": "uuid",
  "asignado_a": "Nombre Apellido",
  "fecha_creacion": "2026-04-24T12:34:56Z",
  "descripcion": "Texto de la incidencia",
  "prioridad": "medium",
  "estado": "open"
}

Errors:
- 400: Validation error (include details)
- 401: Unauthorized
- 403: Forbidden (if user can't create tickets)
- 500: Server error

## Contracts notes
- Authorization: Authorization: Bearer <token> header by default; if backend uses cookies adapt HttpClient accordingly.
- Content-Type: application/json
- Clients must handle pagination metadata in `meta`.
- Enum values for prioridad and estado must match the data-model definitions.

