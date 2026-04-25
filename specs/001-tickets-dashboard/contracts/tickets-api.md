# API Contract — Tickets

## GET /tickets
Listado paginado de tickets.

Query parameters:
- page: integer (1-based). Default: 1
- page_size: integer. Opciones soportadas: 25, 50. Default: 25
- priority: string | omitted. Valores: "low", "medium", "high"
- status: string | omitted. Valores: "open", "in_progress", "closed"
- sort: string | omitted. Formato: `<field>:<direction>` donde direction ∈ {asc, desc}. Ejemplos:
  - `sort=created_at:desc`
  - `sort=priority:asc`
  - `sort=assigned_to_name:asc` (ver nota de sorting por asignado más abajo)

Notes:
- El API acepta múltiples parámetros combinados: por ejemplo `?page=1&page_size=50&priority=high&sort=created_at:desc`.
- El API devolverá metadatos de paginación en la respuesta (total, page, page_size, total_pages).

Response (200 OK) — esquema simplificado:
{
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "title": "No puedo iniciar sesión",
      "description": "El usuario reporta error 500 al iniciar sesión",
      "priority": "high",
      "status": "open",
      "assigned_to_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479", // o null
      "assigned_to_name": "María Pérez", // o null
      "created_at": "2026-04-25T10:15:30Z"
    }
  ],
  "meta": {
    "total": 1234,
    "page": 1,
    "page_size": 25,
    "total_pages": 50
  }
}

## POST /tickets
Crear un nuevo ticket.

Request body (application/json):
{
  "title": "string",
  "description": "string",
  "priority": "low" | "medium" | "high",
  "status": "open" | "in_progress" | "closed",
  "assigned_to_id": "UUIDv4" | null,
  "assigned_to_name": "string" | null
}

Response 201: 201 Created + body with the created Ticket (same shape as GET /tickets data[])

Errors:
- 400: Validation error (include details)
- 401: Unauthorized
- 403: Forbidden (if user can't create tickets)
- 500: Server error

## Notes & Mapping
- Authorization: `Authorization: Bearer <token>` header by default; if backend uses cookies adapt HttpClient accordingly.
- Content-Type: `application/json`.
- El API siempre usa nombres canónicos en snake_case (ej.: `assigned_to_id`, `created_at`) y valores canónicos (priority/status en snake_case).
- La UI debe convertir valores canónicos a etiquetas localizadas para mostrar (ej.: "high" -> "Alta").

## Nota de mapeo y sorting por asignado
- El endpoint admite `sort=assigned_to_name:<asc|desc>` para ordenar por el nombre del asignado cuando sea necesario en la UI.
- Si el backend no puede realizar sorting por `assigned_to_name`, el contrato debe documentar esa limitación y la UI realizará el ordenamiento del subconjunto de resultados recibido.
- Documentar la collation/locale usada para ordenamiento (ej.: `locale: es-ES, caseInsensitive: true`) o acordar que el frontend aplicará sort locale-aware si el backend no lo soporta.
