# Research: tickets-dashboard

Fecha: 2026-04-24

Contexto: Resolver incertidumbres técnicas necesarias para implementar el dashboard de tickets y documentar decisiones con su justificación.

Decisiones y hallazgos

1) API contract y paginación
- Decision: Adoptar un API REST paginado estándar: GET /tickets?page={page}&pageSize={pageSize}. La respuesta incluirá un objeto "meta" con { total, page, pageSize, totalPages } y un array "items" con los tickets.
- Rationale: Es una convención bien soportada por clientes y facilita control de paginación en servidor.
- Alternativas: Cursor-based pagination (beneficios para datasets muy grandes), pero se descarta por complejidad adicional sin evidencia de necesidad.

2) Autenticación
- Decision: Usar Authorization: Bearer <token> (JWT) en cabeceras para las llamadas API desde el frontend.
- Rationale: Encaja con APIs REST modernas y permite middleware de backend para validar permisos. Si el backend usa cookies, adaptar implementando HttpClient con credenciales.
- Alternativas: Cookies de sesión (más seguro frente a XSS si httpOnly) — sólo si el backend lo exige.

3) Formato de fechas
- Decision: Usar ISO 8601 (UTC) en la API, y renderizar en cliente según locale con date-fns o Intl.DateTimeFormat.
- Rationale: ISO 8601 es interoperable y evita ambigüedades. El cliente debe convertir a zona local para visualización.

4) Enumeraciones (prioridad / estado)
- Decision: Prioridad: ["low","medium","high"]. Estado: ["open","in_progress","closed"]. Mapear a labels legibles en UI (Baja/Media/Alta; Abierto/En progreso/Cerrado).
- Rationale: Strings predecibles facilitan debugging y serialización.

5) Error handling y UX
- Decision: Mostrar estados explícitos: loading skeleton, empty state (mensaje y CTA), error state con botón reintentar. Los errores de API mostrados con mensajes amables; detalles técnicos opcionales en consola o logs.
- Rationale: Mejora experiencia y cumple Constitución (UX y observabilidad).

6) Reconsulta tras creación de ticket
- Decision: Al crear ticket, navegar de vuelta al dashboard y reconsultar la primera página; usar stratégie optimista si el backend devuelve el recurso creado inmediatamente. Implementar un pequeño backoff para reintentos si la reconsulta falla.
- Rationale: Reconsulta garantiza consistencia; optimista mejora percepción si respuesta inmediata.

7) Rates y performance
- Decision: Implementar debounce y cancelación de requests cuando cambian parámetros de paginación/consulta; evitar llamadas duplicadas. Usar lazy-loading de módulo tickets.
- Rationale: Minimiza requests innecesarios y reduce carga en backend.

Tareas de investigación generadas

- Verificar con el equipo de backend el endpoint exacto, esquema de paginación y método de auth (Ticket: confirmar GET/POST /tickets, cabeceras, y formato de respuesta).
- Confirmar si el backend ofrece fecha de creación y si incluye metadata de paginación.
- Confirmar límites de pageSize y rate limits.

Conclusión

Se han resuelto las incertidumbres principales con decisiones que priorizan interoperabilidad, accesibilidad y cumplimiento de la Constitución. La implementación procederá con las especificaciones de API arriba indicadas; se recomienda confirmar detalles menores con el equipo de backend antes de implementar el servicio de integración.
