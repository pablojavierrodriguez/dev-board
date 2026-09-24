---
id: DEV-078
title: "Separación estricta de Sprint y Estado en columnas filtros y datos"
status: Done
created_date: '2026-09-23'
updated_date: '2026-09-24 12:14'
labels: []
dependencies: []
priority: high
type: bug
milestone: "0.4.0"
sprint: "Sprint 4"
targetSprint: "Sprint 4"
release: "0.4.0"
targetRelease: "0.4.0"
order: 140
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Garantizar la independencia total y estricta entre Sprint y Estado: agregar Estado como columna configurable en SprintView, desacoplar la opción 'Backlog' cambiándola a 'Sin Sprint' en selectores de Sprint, y eliminar etiquetas cruzadas en modales y filtros.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Incluir 'estado' en ALL_OPTIONAL_COLS y en el selector de columnas de SprintView
- [x] #2 Hacer condicional el renderizado de la columna Estado en encabezado y celdas de SprintView según visibleCols.has('estado')
- [x] #3 Reemplazar la opción 'Backlog' por 'Sin Sprint' en el selector de Sprint de SprintView y filtros
- [x] #4 Remover sufijo '(Backlog)' en ItemModal, KanbanBoard y AdvancedFiltersPopover para desacoplar Estado y Sprint
- [x] #5 Verificar compilación limpia con tsc --noEmit
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Actualizar SprintView.tsx: añadir 'estado' a ALL_OPTIONAL_COLS, actualizar popover y envolver th/td de Estado con visibleCols.has('estado').
2. Reemplazar 'Backlog' por 'Sin Sprint' en el dropdown de Sprint de SprintView.tsx.
3. Actualizar ItemModal.tsx, KanbanBoard.tsx y AdvancedFiltersPopover.tsx removiendo referencias a 'Backlog' en selects de Sprint y Estado.
4. Validar compilación con tsc --noEmit.
<!-- SECTION:PLAN:END -->
