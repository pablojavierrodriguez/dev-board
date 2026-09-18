---
id: DEV-036
title: "Ergonomía Integral: Creación de Sprints, Navegación Home en Logo, Edición Inline de Columnas y Estabilidad de Botón Ideas"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 00:28'
labels:
  - ux
  - kanban
  - sprint
  - navigation
dependencies:
  - DEV-034
  - DEV-035
priority: medium
type: ux
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 19
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refinamientos críticos de usabilidad y feedback de producto:
1. Vista Sprint & Priorización: Agregar botón '+ Nuevo Sprint' con sugerencia automática de nombre y soporte de grupo vacío receptor para arrastrar tarjetas.
2. Navegación Header: Hacer que el logo de DevBoard conduzca al Home / Tablero principal al hacer clic.
3. Tablero Kanban: Habilitar la edición de títulos de columnas directamente desde la cabecera del tablero (edición inline con persistencia automática).
4. Toolbar del Tablero: Estabilizar el botón de Ideas para que permanezca accesible y coherente sin desaparecer ni provocar saltos de layout entre modos.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El logo de DevBoard en el Header conduce a la vista principal (Tablero o defaultView) con cursor pointer y hover feedback
- [x] #2 Incorporar botón '+ Nuevo Sprint' en SprintView que permita definir una nueva iteración y muestre drop zone receptora aunque no tenga tarjetas iniciales
- [x] #3 Habilitar edición inline de títulos de columna en KanbanBoard directamente desde cada cabecera con persistencia automática
- [x] #4 Mantener estable y visible el control de Ideas en la toolbar de KanbanBoard sin saltos entre modos Simple y Ampliada
- [x] #5 Validar con `npm run build` y sincronizar con `npm run backlog:check`
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Header (`src/components/Header.tsx`):
   - Convertir el bloque del logo en un botón accesible que ejecute `onSelectTab(config?.defaultView || 'kanban')`.
2. SprintView (`src/components/SprintView.tsx`):
   - Añadir botón '+ Nuevo Sprint' en la toolbar superior.
   - Soportar lista de sprints explícitos (`customSprints` / `availableSprints`) mostrando grupos vacíos con dropzone.
3. KanbanBoard (`src/components/KanbanBoard.tsx`):
   - Mantener el botón de Ideas visible de forma consistente en ambos modos (Simple y Ampliada) con toggle de columna.
   - Agregar edición inline de título en el header de cada columna (con estado `editingColId`, input focus y commit en Enter/Blur).
   - Añadir prop `onUpdateColumnTitle?: (colId: string, newTitle: string) => void`.
4. App (`src/App.tsx`):
   - Implementar `handleUpdateColumnTitle` para persistir el cambio en `config.kanban.columns`.
   - Conectar gestión de sprints creados.
5. Verificación y pruebas automatizadas con browser subagent.
<!-- SECTION:PLAN:END -->
