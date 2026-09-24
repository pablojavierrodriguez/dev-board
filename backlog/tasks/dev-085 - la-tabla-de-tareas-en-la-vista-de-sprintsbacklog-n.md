---
id: DEV-085
title: "La tabla de tareas en la vista de Sprints/Backlog no muestra columnas de Tipo, Estado y Release"
status: Ready
created_date: '2026-09-24'
updated_date: '2026-09-24 14:56'
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
targetSprint: "Sprint 5"
order: "90"
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En la vista de Sprints y Backlog, al desplegar la lista de tareas del Backlog (o de un sprint), la tabla solo mostraba las columnas `#`, `Prio`, `Código` y `Título`. Las columnas `Tipo`, `Estado` y `Release` no se renderizaban en navegadores con un `localStorage` antiguo porque la migración solo forzó la inclusión de `estado`. Se requiere una inicialización defensiva que garantice que las columnas núcleo estén visibles por defecto y un botón de restablecimiento.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 La tabla de tareas en Sprints y Backlog renderiza por defecto las columnas Tipo, Estado y Release sin requerir configuración manual.
- [x] #2 Se implementa migración defensiva para usuarios existentes con localStorage desfasado garantizando la visualización de columnas esenciales.
- [x] #3 El popover de Columnas incluye la opción de 'Restablecer por defecto' para recuperar la configuración canónica en un solo clic.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Actualizar el estado inicial de visibleCols en SprintView.tsx para asegurar que DEFAULT_COLS incluya tipo, estado, modulo, release y sprint.
2. Añadir migración automática si el set guardado carece de tipo o release.
3. Añadir botón 'Restablecer por defecto' en el popover de columnas.
4. Validar con npx tsc --noEmit.
<!-- SECTION:PLAN:END -->
