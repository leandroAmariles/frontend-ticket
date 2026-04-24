# Constitución — Frontend: API Tickets TFM (SSD)

## Contexto del Proyecto
- Aplicación frontend para la gestión de tickets de soporte de usuarios (API Tickets TFM - SSD). Los principios y reglas de esta Constitución están pensados para un producto donde la trazabilidad, rendimiento, accesibilidad y calidad de pruebas son críticos.

## Principios Fundamentales

### I. Código Limpio (Clean Code)
El código debe ser legible, explícito y fácil de mantener. Seguir convenciones de estilo (TSLint/ESLint, formateo) y principios SOLID. Cada componente o servicio tiene una única responsabilidad; evitar código duplicado y preferir pequeñas funciones puras y testables.

### II. Consistencia de UX
Mantener una guía de estilo visual y comportamental. Reutilizar componentes de diseño (design system / Angular Material) para asegurar coherencia: tipografías, colores, espaciado, estados interactivos y microinteracciones.

### III. Frontend Responsivo y Accesible
Diseñar para múltiples tamaños de pantalla (mobile-first). Usar Angular, HTML semántico y CSS (preferible SCSS) para crear layouts adaptables. Priorizar accesibilidad (a11y): navegación por teclado, roles ARIA, contraste de colores y etiquetado correcto de formularios.

### IV. Arquitectura Angular y Reutilización
Organizar el proyecto en módulos claros: feature modules, shared, core e interfaces. Preferir entrada por servicios inyectables, evitar lógica en templates y favorecer smart/dumb components. Exportar componentes reutilizables y documentarlos.

### V. Desarrollo Guiado por Tests (TDD) — Obligatorio
Adoptar TDD: escribir tests antes de implementar nuevas funciones. Todos los cambios deben acompañarse de tests unitarios y, cuando corresponda, tests de integración y e2e.

### VI. Cobertura Mínima y Calidad de Tests
Mantener una cobertura de pruebas mínima del 80% por proyecto (cobertura global). Definir métricas de calidad: tests unitarios con Jasmine/Karma o Jest, e2e con Cypress/Playwright. Los pipelines CI deben fallar si la cobertura global es inferior al umbral.

### VII. Observabilidad y Manejo de Errores
Registrar errores y eventos significativos con un formato estructurado. Manejar errores de forma centralizada; exponer suficientes trazas para debugging sin filtrar datos sensibles.

### VIII. Rendimiento y Carga Inicial
Optimizar lazy-loading de módulos, minimizar bundles y usar técnicas de caching. Priorizar experiencia percibida: mostrar skeletons/placeholders y evitar bloqueos de la UI.

### IX. Simplicidad y Evolución Controlada
Preferir soluciones simples y bien justificadas. Cambios grandes deben acompañarse de una migración y plan de pruebas; evitar optimizaciones prematuras.

## Principios Adicionales (enfocados)
### X. Enfoque en el Dominio de Soporte (Tickets)
- Modelar claramente entidades del dominio (Ticket, Usuario, Comentario, Estado) en interfaces TypeScript y servicios transaccionales. Priorizar la consistencia en nombres y contratos con la API.

### XI. Pruebas y TDD — Reglas Claras
- TDD obligatorio: escribir tests antes de la implementación funcional. Los tests deben cubrir casos felices y de error relevantes al flujo de soporte.
- Cobertura mínima: 80% a nivel de proyecto. Las pipelines CI deben bloquear merges si la cobertura global es < 80%.
- Tests recomendados: Jest para unitarios (rápido), Cypress o Playwright para e2e. Usar test doubles (mocks/spies) para aislar unidades.
- Cada feature debe incluir: tests unitarios, y cuando afecte flujos críticos (creación/actualización/cierre de ticket) tests e2e.

### XII. Componentes y Arquitectura UI
- Smart/Dumb: los containers (smart) gestionan estado y efectos; los presentacionales (dumb) reciben datos por @Input y emiten eventos por @Output.
- Reutilización: componentes UI deben ser desacoplados y documentados. Preferir composición sobre herencia.
- Design system: usar Angular Material y tokens de diseño (colores, tipografías, espaciado) para consistencia visual.

### XIII. Calidad de Código y Herramientas
- Linters y formateadores obligatorios (ESLint + Prettier). Definir reglas compartidas en el repo (config base en /config o package.json).
- Commits: convenciones (Conventional Commits) y hooks pre-commit (husky) para ejecutar linters/tests rápidos.

### XIV. Accesibilidad y UX
- A11y no opcional: roles ARIA, foco visible, labels, y contraste mínimo. Validar con herramientas automáticas y revisiones manuales.
- UX consistente: interacciones y estados (loading, error, empty) deben ser explícitos y reutilizables.

### XV. Observabilidad y Errores
- Errores centralizados: servicio de manejo de errores con niveles (info/warn/error) y posibilidad de alimentar observabilidad (Sentry u otra).
- Logs estructurados y no almacenar datos sensibles.

### XVI. Entregables y PRs
- Cada PR debe incluir: descripción, alcance, capturas o recording si cambia UI, lista de tests añadidos/actualizados, y comprobante de cobertura.

## Restricciones Técnicas
- Stack preferido: Angular (TypeScript), HTML5, SCSS/CSS3. 
- Librerías UI compatibles: Angular Material o librerías aprobadas por el equipo.
- Tests: Jasmine/Karma o Jest para unitarios; Cypress/Playwright para e2e.
- Accesibilidad y rendimiento como requisitos obligatorios en PRs.

## Flujo de Desarrollo y Puertas de Calidad
- Workflow basado en PRs: cada PR debe incluir descripción, screenshots o recording si cambia UI y pruebas asociadas.
- Revisiones de código obligatorias (min. 1 revisor además del autor).
- CI: ejecutar linters, tests unitarios, coverage y e2e. El merge está condicionado a: linters verdes, coverage >= 80% y aprobación de revisores.
- Branching: feature/*, fix/*, chore/* y release/* según semver.

## Gobernanza
La Constitución tiene prioridad sobre prácticas informales; las enmiendas requieren documento con motivos, plan de migración y aprobación de al menos un mantenedor senior. Todas las PRs deben demostrar cumplimiento con la Constitución.

**Versión**: 1.0.0 | **Ratificada**: 2026-04-24 | **Última Enmienda**: 2026-04-24
