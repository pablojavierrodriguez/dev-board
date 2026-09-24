---
id: DEV-083
title: "backlog no es un sprint"
status: Ready
created_date: '2026-09-24T12:13:06.693Z'
updated_date: '2026-09-24 14:56'
labels: []
dependencies: []
priority: medium
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
order: "30"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En la vista de Sprints y Backlog (SprintView), los ítems sin sprint asignado (grupo Backlog) no deben indicar porcentaje de completitud ni barra de progreso. El Backlog es un inventario continuo y abierto de tareas no planificadas o pendientes, por lo que mostrar métricas de avance de iteración (ej: '0/14 (0%)') es conceptualmente erróneo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El bloque de Backlog (ítems sin sprint) no debe mostrar indicador de porcentaje ni barra de progreso.
- [x] #2 El encabezado del Backlog debe indicar el conteo de ítems totales sin métricas de finalización de sprint.
- [x] #3 Los sprints formales continúan mostrando su barra de progreso y ratio de completitud normalmente.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Identificar en SprintView.tsx la sección del encabezado de grupo donde se renderiza el progreso.
2. Condicionar la visualización de doneCount / total y la barra de progreso a que el grupo NO sea isBacklogGroup (o que sprintObj !== undefined).
3. Para isBacklogGroup, mostrar únicamente el contador de tareas sin porcentaje ni barra verde.
4. Validar en browser y ejecutar npx tsc --noEmit.
<!-- SECTION:PLAN:END -->
