---
id: DEV-092
title: "Alineación de métricas de progreso de Sprint: Ready como estado terminal del desarrollo en KanbanBoard"
status: Done
created_date: '2026-09-24'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: high
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
order: 160
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En KanbanBoard.tsx, el banner de Sprint Goal calculaba el progreso considerando únicamente status === 'done' y clasificaba erróneamente 'ready' como 'inProgress', arrojando 0/14 (0%) de progreso y 14 en curso cuando todas las tareas estaban terminadas en 'ready'. En la metodología ágil de DevBoard, 'ready' es el estado terminal del desarrollo en el sprint (Ready for Release), mientras que 'done' pertenece exclusivamente a las tareas ya liberadas en producción.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 sprintStats en KanbanBoard.tsx contabiliza como terminadas las tareas con estado ready, done o finish (alineado con App.tsx y SprintView.tsx).
- [x] #2 Tareas en estado ready son excluidas de inProgress en el banner de Sprint Goal, reflejando exclusivamente el trabajo activo en doing o review.
- [x] #3 El indicador porcentual, la barra de progreso y la insignia Objetivo cumplido reflejan fielmente el 100% al alcanzarse el desarrollo completo en ready.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar el cálculo de sprintStats en src/components/KanbanBoard.tsx para computar completadas (ready, done, finish) y en curso (doing, in_progress, review, testing_qa).
2. Asegurar que pct y los badges de Objetivo cumplido y en curso reaccionen consistentemente.
3. Validar con tsc, npm test y backlog:check.
<!-- SECTION:PLAN:END -->
