---
id: DEV-037
title: "Reasignación Dinámica y Visual de Estados a Columnas Kanban (Modo Simple y Ampliado)"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 06:36'
labels:
  - ux
  - kanban
  - settings
dependencies:
  - DEV-036
priority: high
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 30
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir a los usuarios y equipos reasignar qué estados del ciclo de vida de una tarea pertenecen a cada columna del tablero Kanban:
1. Vista Simple por Defecto: Mapear `ready` y `finish` a la columna `Done` en `SIMPLIFIED_BASE_COLUMNS` (dejando In Progress con `doing`, `in_progress`, `review`, `testing_qa`).
2. Configuración Visual en Settings: En la sección 'Tablero Kanban' de Ajustes, permitir agregar y remover estados en cada columna interactivamente (chips con botón 'x' y selector '+ Estado') y elegir el dropTargetStatus.
3. Soporte Dual Simple/Ampliada: Permitir personalizar las columnas tanto de la vista Simple (`simplifiedColumns`) como de la vista Ampliada (`columns`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En la vista simple por defecto, el estado 'ready' (y 'finish') mapea a la columna 'Done' (col-done)
- [x] #2 En SettingsView pestaña 'Tablero Kanban', permitir reasignar estados a cada columna mediante badges interactivos (remover y agregar estados disponibles)
- [x] #3 Soportar edición de dropTargetStatus por columna para definir el estado destino al arrastrar tarjetas
- [x] #4 Soportar personalización y persistencia de columnas tanto para modo Simple como Ampliado en .devboard/config.json
- [x] #5 Validar con `npm run build` y sincronizar con `npm run backlog:check`
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. `src/components/KanbanBoard.tsx`:
   - Actualizar `SIMPLIFIED_BASE_COLUMNS` para que `col-done` incluya `['done', 'ready', 'finish']` y `col-doing` solo `['doing', 'in_progress', 'review', 'testing_qa']`.
   - Permitir que `columns` lea `config.kanban.simplifiedColumns` cuando `viewMode === 'simplificada'`.
2. `src/types.ts`:
   - Extender `KanbanSettings` con `simplifiedColumns?: ColumnConfig[]`.
3. `src/components/SettingsView.tsx`:
   - Añadir selector de modo a configurar: [ ⚡ Modo Simple (3 cols) | 🔍 Modo Ampliado (5 cols) ].
   - En cada tarjeta de columna, reemplazar el listado pasivo de estados con badges interactivos con botón 'x' para quitar estados y un selector '+ Estado' para agregarlos.
   - Selector interactivo de 'Estado al soltar tarjeta' (`dropTargetStatus`).
   - Sincronizar y persistir ambos modos en `config.kanban`.
4. Verificación con `npm run build` y auditoría de interacción con `browser_subagent`.
<!-- SECTION:PLAN:END -->
