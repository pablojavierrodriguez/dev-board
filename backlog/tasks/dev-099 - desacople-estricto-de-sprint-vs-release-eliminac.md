---
id: DEV-099
title: "Desacople estricto de Sprint vs Release: eliminación de versión falsa vSprint5 y prevención de label smuggling"
status: ready
created_date: '2026-09-24 20:47'
updated_date: '2026-09-24 20:52'
labels: []
dependencies: []
priority: high
type: bug
sprints:
  - "Sprint 5"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
created: "2026-09-24"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al crear o leer tareas pertenecientes a un sprint (como Sprint 5), se producía una sobrecarga semántica ("label smuggling") donde el valor del sprint se propagaba indebidamente a las propiedades `milestone` y `release`. Esto provocaba que en la UI (tablas de `SprintView`, badges de `ItemCard` y selectores de `ItemModal`) apareciera una versión falsa `vSprint 5` / `vSprint5` como si fuera un release oficial, en lugar de dejar la versión vacía (`—`) hasta que el usuario decida formalmente en qué versión se liberará la tarea.

Causa raíz:
1. En `backlog/tasks/dev-096*.md` y `dev-097*.md`, el agente escribió `milestone: "Sprint 5"` en el frontmatter, violando la ortogonalidad entre Sprint y Release.
2. En `vite.config.ts` (`readProjectBacklog`), existía un fallback `milestone: task.milestone || releaseVal || sprintVal`, asignando el `sprintVal` como `milestone` por defecto. A su vez, `releaseVal` leía `task.milestone`, contaminando `release`, `targetRelease` y `releases` con nombres de sprint.
3. El formateo de releases en la interfaz anteponía prefijos `v` indiscriminadamente sobre cualquier texto (`vSprint 5`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Corregir `vite.config.ts` eliminando cualquier fallback de `sprintVal` a `milestone` o `releaseVal`, y garantizando que valores que contengan "sprint" nunca sean interpretados ni guardados como versiones de release.
- [x] #2 Limpiar `milestone: "Sprint 5"` de los archivos de tareas en `backlog/tasks/` (`DEV-096`, `DEV-097`, etc.) dejando sus campos de release vacíos.
- [x] #3 Asegurar que las tarjetas en `ItemCard`, la columna Release en `SprintView` y el selector de `ItemModal` muestren `—` (sin versión asignada) cuando un ítem no tenga release formal.
- [x] #4 Validar compilación (`npx tsc --noEmit`), suite de pruebas (`npm test`) y sincronización (`npm run backlog:check`).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Corregir resolución de `sprint` vs `release` en `readProjectBacklog` y `saveBacklogMdItem` en `vite.config.ts`.
2. Sanitizar frontmatter de tareas en `backlog/tasks/`.
3. Proteger `ItemCard.tsx`, `SprintView.tsx` e `ItemModal.tsx` con guards defensivos.
4. Validar integridad global con `tsc`, `test` y `backlog:check`.
<!-- SECTION:PLAN:END -->
