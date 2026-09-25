---
id: DEV-110
title: "Actualización de Documentación del CLI y Especificación Canónica del Modelo de Datos"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 16:22'
labels: []
dependencies: []
priority: medium
type: tech_debt
sprints:
  - "Sprint 6"
sprint: "Sprint 6"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Actualización integral de la documentación del proyecto DevBoard para reflejar las capacidades de empaquetado, scaffolding interactivo y ejecución del CLI introducidas durante el Sprint 6, junto con la especificación canónica del modelo de datos de tareas en la arquitectura.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Actualizar README.md con las nuevas capacidades del CLI de Sprint 6 (devboard --init interactivo y flag -y, modos --single y --hub, parámetro --port, y verificador de actualizaciones) manteniendo la versión en desarrollo en el sprint
- [x] #2 Documentar en docs/ARCHITECTURE.md el Modelo de Datos Canónico completo (YAML frontmatter, secciones Markdown delimitadas y mapeo con TypeScript y UI)
- [x] #3 Documentar en docs/ARCHITECTURE.md los nuevos módulos de persistencia y configuración (initScaffold.js, registryConfig.js, updateChecker.js y estándar XDG)
- [x] #4 Validar que npm run backlog:check y npm test pasen con código 0
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear DEV-110 en Sprint 6 y pasar a doing.
2. Actualizar README.md con la documentación del CLI (scaffolding devboard --init, aislamiento mono-proyecto vs multi-proyecto hub, banderas --single/--hub/--port y update checker).
3. Actualizar docs/ARCHITECTURE.md incorporando la sección canónica del Modelo de Datos de Tareas (YAML frontmatter + Secciones Markdown) y los nuevos módulos de scripts/.
4. Ejecutar npm run backlog:check y npm test para asegurar integridad total.
5. Tildar criterios de aceptación de DEV-110 y pasar a ready.
<!-- SECTION:PLAN:END -->
