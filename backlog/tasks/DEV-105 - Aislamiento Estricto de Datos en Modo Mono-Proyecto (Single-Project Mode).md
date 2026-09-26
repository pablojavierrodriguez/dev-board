---
id: DEV-105
title: "Aislamiento Estricto de Datos en Modo Mono-Proyecto (Single-Project Mode)"
status: done
created_date: '2026-09-25'
updated_date: '2026-09-25 15:06'
labels: []
dependencies: []
priority: high
type: feature
milestone: "0.6.0"
sprints:
  - "Sprint 6"
releases:
  - "0.6.0"
sprint: "Sprint 6"
targetSprint: "Sprint 6"
release: "0.6.0"
targetRelease: "0.6.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Garantizar que la ejecución de DevBoard en un repositorio único limite estrictamente las consultas de la API, el estado y el socket SSE al repositorio actual, evitando que tareas de otros repositorios previamente registrados en el Hub se mezclen o transfieran al cliente web.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En modo monoproyecto (ejecutado sin --hub o con DEVBOARD_MODE=single), la API /api/data debe retornar únicamente el proyecto activo local y sus tareas.
- [x] #2 Evitar la carga y el cómputo en memoria de tareas de repositorios externos cuando no se esté en modo Hub.
- [x] #3 Asegurar que Header.tsx renderice el badge local sin desplegar el dropdown de proyectos cuando singleProject es true.
- [x] #4 Preservar el comportamiento multi-proyecto íntegro e intacto cuando se invoque con --hub o --multi.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajustar el endpoint GET /api/data en vite.config.ts para que cuando singleProject sea true sólo procese el proyecto activo.
2. Corregir la detección de isSingleMode para que sea consistente si se lanza vía vite directamente o vía bin/devboard.js.
3. Validar con pruebas de integración y verificar que el modo --hub siga funcionando sin regresiones.
<!-- SECTION:PLAN:END -->
