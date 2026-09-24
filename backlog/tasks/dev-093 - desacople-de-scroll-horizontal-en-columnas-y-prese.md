---
id: DEV-093
title: "Desacople de scroll horizontal en columnas y preservación de sprint al togglear Ideas en KanbanBoard"
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
order: 170
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dos defectos de UX en KanbanBoard: 1) El contenedor principal con overflow-x-auto arrastraba la barra de herramientas, selector de sprint, toggle de vistas y banner de progreso al hacer scroll horizontal para ver columnas derechas (ej. Ready y Done). 2) Al encender o apagar la columna de Ideas, un useEffect con dependencias inestables sobreescribía la selección del usuario (ej. 'all') forzando la vuelta al sprint activo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El scroll horizontal del tablero Kanban queda encapsulado exclusivamente en el contenedor de columnas, manteniendo fija la barra superior (Sprint Goal, selector de sprint, vista Simple/Ampliada, toggle Ideas) y el banner de progreso sin desplazarse con el scroll.
- [x] #2 La selección del selector de sprint (ej. 'all' / Todos los ítems) se preserva estrictamente al activar o desactivar la columna de ideas, eliminando el re-filtrado forzado al sprint activo.
- [x] #3 Eliminación de anchos mínimos artificiales (md:min-w-[960px]) en la barra superior y banner para que ocupen fluidamente el 100% del ancho del viewport.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En src/components/KanbanBoard.tsx, desacoplar el scroll horizontal: mover overflow-x-auto exclusivamente al contenedor de las columnas, dejando la barra superior y el banner de Sprint Goal en el flujo normal (100% width, fijos).
2. Remover md:min-w-[960px] de la barra superior y del banner de Sprint Goal.
3. Corregir el useEffect de selección de sprint en KanbanBoard.tsx para no sobreescribir 'all' ni re-ejecutarse ante cambios de items/ideas, respetando la elección persistida del usuario.
4. Validar con tsc, npm test y backlog:check.
<!-- SECTION:PLAN:END -->
