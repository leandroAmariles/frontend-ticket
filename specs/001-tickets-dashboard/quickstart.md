# Quickstart: tickets-dashboard

Objetivo: Integrar y ejecutar rápidamente la UI del dashboard de tickets.

Prerequisitos
- Node.js 18+ y gestor de paquetes (npm/pnpm/yarn) según el repo.
- Backend con endpoints /tickets (GET/POST) accesible y CORS configurado.
- Variables de entorno (p. ej. API_BASE_URL) según configuración del proyecto.

Pasos rápidos
1. Instalar dependencias:
   - npm install
2. Ejecutar servidor de desarrollo del frontend:
   - npm run start
3. Abrir la ruta del dashboard en el navegador:
   - http://localhost:4200/tickets

Pruebas
- Unitarios (Jest): npm run test:unit
- e2e (Playwright): npm run test:e2e

Notas
- Para desarrollo local con backend en otra URL configurar API_BASE_URL y asegurar tokens de autenticación.
- Implementar lazy-loading del módulo tickets para mejorar rendimiento.
- Ver data-model.md y contracts/tickets-api.md para detalles de integración con backend.

