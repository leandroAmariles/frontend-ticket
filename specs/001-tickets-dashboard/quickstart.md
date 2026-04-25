# Quickstart: tickets-dashboard

Objetivo: Integrar y ejecutar rápidamente la UI del dashboard de tickets.

## Prerequisitos

- Node.js 18+ y gestor de paquetes (npm/pnpm/yarn) según el repo.
- Backend con endpoints /tickets (GET/POST) accesible y CORS configurado.
- Variables de entorno (p. ej. API_BASE_URL) según configuración del proyecto.
- Angular 15+ (o versión según package.json del repo).

## Pasos rápidos

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**:
   - Editar `src/environments/environment.ts` para ajustar `apiBaseUrl` y configuración de re-query.
   - Para producción, usar `src/environments/environment.prod.ts`.

3. **Ejecutar servidor de desarrollo del frontend**:
   ```bash
   npm run start
   # or (si está configurado así):
   ng serve
   ```

4. **Abrir la ruta del dashboard en el navegador**:
   - Dashboard: `http://localhost:4200/tickets`
   - Crear nuevo ticket: `http://localhost:4200/tickets/new`

## Pruebas

### Pruebas unitarias (Jest)
```bash
npm run test:unit
# o
jest
```

### Pruebas de contrato (Jest)
```bash
npm run test:contract
# o
jest -- contract
```

### Pruebas de integración (Jest)
```bash
npm run test:integration
# o
jest -- integration
```

### Pruebas e2e (Cypress)
```bash
npm run test:e2e
# o ejecutar con UI:
npx cypress open

# o ejecutar en headless:
npx cypress run
```

### Ejecutar todas las pruebas
```bash
npm run test:all
```

### Verificar cobertura de tests
```bash
npm run test:coverage
```

## Configuración

### API Base URL
Por defecto, la configuración apunta a `http://localhost:8080/api` en desarrollo.
Para cambiar, editar:
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

### Re-query Configuration
La estrategia de re-query está configurada en `src/environments/environment.ts`:
- `initialInterval`: 500ms (intervalo inicial de polling)
- `maxInterval`: 2000ms (intervalo máximo)
- `maxDuration`: 5000ms (duración máxima: 5 segundos)
- `backoffMultiplier`: 2 (multiplicador exponencial)

Estos valores aseguran que tickets creados aparezcan en la lista dentro de 5 segundos.

## Estructura del módulo

```
src/app/tickets/
├── components/              # Componentes UI reutilizables
│   ├── tickets-table/
│   ├── ticket-filters/
│   └── ticket-row/
├── pages/                   # Páginas/rutas
│   ├── tickets-list-page/   # Ruta: /tickets
│   └── ticket-create-page/  # Ruta: /tickets/new
├── services/                # Servicios de datos y estado
│   ├── tickets-api.service.ts
│   └── tickets-state.service.ts
├── models/                  # Interfaces TypeScript
├── utils/                   # Utilidades (transformers, etc.)
├── __tests__/               # Tests
│   ├── unit/
│   ├── integration/
│   └── contract/
└── tickets.module.ts        # Declaraciones y configuración del módulo
```

## Tareas completadas

✅ **MVP (User Story 1) - Dashboard**
- Tabla paginada con soporte para 25/50 filas
- Filtros por priority y status
- Ordenación por columnas  
- Botón "New Ticket" prominente
- Re-query automática para mostrar tickets nuevos en ≤5s
- Tests de contrato, unitarios de integración y e2e

✅ **User Story 2 - Formulario de creación**
- Formulario reactivo con validación cliente
- Campos: title, description, priority, status, assigned_to
- Manejo de errores con mensajes amigables
- Integración con re-query para reflejar ticket creado
- Tests completos (contrato, validación, flujo e2e)

⏳ **User Story 3 - Accesibilidad y refinamientos** (pendiente)
- Mejoras de accesibilidad ARIA
- Estados visuales (loading, empty, error)
- Optimizaciones de rendimiento

## Notas importantes

- La autenticación se maneja via `Authorization: Bearer <token>` header en las peticiones HTTP.
- El token se obtiene de `localStorage.auth_token` (ver `src/app/core/interceptors/auth.interceptor.ts`).
- El modulo `TicketsModule` es lazy-loaded y se carga bajo el path `/tickets`.
- Para desarrollo local, asegurar que el backend está corriendo y CORS está configurado.

## Recursos adicionales

- Plan de implementación: [plan.md](./plan.md)
- Especificación: [spec.md](./spec.md)
- Modelo de datos: [data-model.md](./data-model.md)
- Contrato API: [contracts/tickets-api.md](./contracts/tickets-api.md)
- Decisiones de investigación: [research.md](./research.md)

## Troubleshooting

**Error: No se puede conectar al API**
- Verificar que el backend está corriendo en `http://localhost:8080`
- Revisar CORS configuration en backend
- Ajustar `apiBaseUrl` en environment.ts si es necesario

**Los tests fallan con "Cannot find module"**
- Ejecutar `npm install` para asegurar que todas las dependencias están instaladas
- Si persiste, limpiar `node_modules` y reinstalar: `rm -rf node_modules && npm install`

**La tabla no muestra datos**
- Abrir DevTools (F12) y revisar Network tab
- Verificar que el endpoint GET /tickets devuelve datos válidos
- Revisar los logs en la consola del navegador

