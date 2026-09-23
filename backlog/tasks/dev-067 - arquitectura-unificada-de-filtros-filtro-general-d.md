---
id: DEV-067
title: "Arquitectura Unificada de Filtros: Filtro General de Estados (Inclusión/Exclusión), Quick Filters y Popover Multiselect"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-23 13:40'
labels:
  - ux
  - filters
  - status-filter
dependencies: []
priority: urgent
type: ux
milestone: "0.3.3"
sprint: "Sprint 3"
release: "0.3.3"
targetRelease: "0.3.3"
order: "55"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Evolución integral del sistema de filtrado de DevBoard hacia un modelo limpio, escalable y unificado:
1. **Filtro General de Estados (Inclusión / Exclusión):** Unificación de la visibilidad de estados activos (draft, doing, review, ready), tareas completadas (done) y tareas de descarte/cancelación (dismissed, cancelled).
   - Política predeterminada: tareas activas y completadas de la iteración actual incluidas; completadas de iteraciones pasadas y descartadas/canceladas excluidas por defecto.
   - Flexibilidad total: activación bajo demanda para auditar descartadas o consultar completadas históricas sin cambiar de pestaña.
2. **Estrategia Dual de Interfaz:**
   - **Quick Filters en Encabezado:** Acceso inmediato con un clic a búsquedas (⌘K), selector de Sprint Goal, toggles de estado (✓ Completadas anteriores, ✕ Descartadas) y pills rápidas.
   - **Popover de Filtros Avanzados (Filtros ▾ (N)):** Panel desplegable extensible con soporte multiselect para Tipos, Prioridades, Estados, Sprints, Releases y Módulos.
   - **Chips Activos Descartables y Reset:** Visualización de chips con ✕ y botón universal de 'Limpiar filtros'.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Extender FilterState en types.ts para soportar multiselect (types, priorities) y filtro general de estados (includePreviousDone, includeDismissedCancelled)
- [x] #2 Implementar AdvancedFiltersPopover.tsx con interfaz multiselect por categorías y contador de filtros activos
- [x] #3 Actualizar FilterBar.tsx para incorporar el botón desplegable de Filtros y Quick Filters en el encabezado con chips activos
- [x] #4 Actualizar lógica central en App.tsx para procesar la inclusión/exclusión de estados y multiselect
- [x] #5 Refactorizar KanbanBoard.tsx eliminando botones ad-hoc y vinculando la columna Done y las completadas anteriores al filtro unificado
- [x] #6 Verificación con npm run build y sincronización limpia del backlog
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender interfaces en src/types.ts.
2. Crear src/components/AdvancedFiltersPopover.tsx.
3. Actualizar src/components/FilterBar.tsx con botón popover, chips y quick toggles.
4. Conectar en src/App.tsx la lógica de filtrado de estados y multiselect.
5. Limpiar KanbanBoard.tsx eliminando el botón bespoke y clarificando la columna Done.
6. Validar tipado TypeScript (npm run build) y sincronizar backlog (npm run backlog:sync).
<!-- SECTION:PLAN:END -->
