---
id: DEV-086
title: "Visibilidad de Sprints planificados vacíos en vista de Sprint & Priorización"
status: Ready
created_date: '2026-09-24'
updated_date: '2026-09-24 14:56'
labels: []
dependencies: []
priority: urgent
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
order: "20"
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al crear un nuevo Sprint en estado 'planned' (como Sprint 5 recien creado), no se visualiza en la vista de Sprint & Priorización porque el filtro de agrupación excluye sprints planned con 0 tareas, impidiendo planificar y arrastrar o asignar tareas al nuevo sprint.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Los sprints en estado planned vacíos deben mostrarse en la vista de Sprint & Priorización con su drop zone para permitir la planificación.
- [x] #2 El selector inline de sprints en las filas del backlog debe listar todos los sprints disponibles incluyendo sprints planificados.
- [x] #3 El nuevo Sprint 5 debe renderizarse inmediatamente en la vista y permitir arrastrar y soltar tareas desde el Backlog.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Remover la exclusión de sprints planned vacíos en groupedData de SprintView.tsx.
2. Asegurar fallback para availableSprints en SprintView.tsx a partir de sprints.
3. Verificar en browser que Sprint 5 aparece con su dropzone en Sprint & Priorización.
4. Validar compilación con npx tsc --noEmit.
<!-- SECTION:PLAN:END -->
