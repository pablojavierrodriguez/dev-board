---
id: DEV-034
title: "Reubicación del Selector de Columnas (Simple/Ampliada) al Contenedor del Tablero Kanban"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 06:36'
labels:
  - ux
  - layout
  - kanban
dependencies:
  - DEV-033
priority: medium
type: ux
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 10
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reubicar el conmutador de modo de columnas ("Simple" vs "Ampliada") desde el Header principal hacia la barra de herramientas interna del contenedor del Tablero Kanban:
- En el Header, este control contamina la navegación global y no tiene sentido fuera del contexto del Tablero Kanban.
- En el contenedor de KanbanBoard, se sitúa de forma contextualmente coherente en la barra superior junto al botón de "+ Mostrar Ideas", logrando una jerarquía visual limpia y ergonómica.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Retirar el conmutador de modo de vista (Simple / Ampliada) de Header.tsx tanto en versión de escritorio como en el menú móvil
- [x] #2 Incorporar el selector de columnas (Simple / Ampliada) en la barra de herramientas superior de KanbanBoard.tsx junto al botón de Mostrar Ideas
- [x] #3 Asegurar respuesta responsiva y diseño visual consistente (tokens de color, bordes, estados activos)
- [x] #4 Validar compilación con `npm run build` y sincronización con `npm run backlog:check`
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Header (`src/components/Header.tsx`):
   - Remover el renderizado de `viewMode` switcher (escritorio y menú móvil).
   - Limpiar props no requeridas en `HeaderProps` si `viewMode` y `onChangeViewMode` ya no se necesitan en el Header.
2. KanbanBoard (`src/components/KanbanBoard.tsx`):
   - Añadir `onChangeViewMode: (mode: ViewMode) => void` a `KanbanBoardProps`.
   - Renderizar el control de selección de modo (⚡ Simple / 🔍 Ampliada) en la barra de cabecera del tablero, agrupado junto al botón de "+ Mostrar Ideas".
3. App (`src/App.tsx`):
   - Pasar `onChangeViewMode={setViewMode}` a `<KanbanBoard ... />`.
   - Quitar `viewMode` y `onChangeViewMode` de `<Header ... />`.
4. Verificación y sincronización:
   - `npx tsc --noEmit` y `npm run build`.
   - `npm run backlog:sync` y `npm run backlog:check`.
<!-- SECTION:PLAN:END -->
