---
id: DEV-052
title: "Zonas de Soltado Multi-Estado (Drop Targets Específicos) en Columnas Kanban Agrupadas"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 00:05'
labels:
  - ux
  - kanban
  - drag-and-drop
dependencies: []
priority: high
type: ux
milestone: "0.4.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Resolución del problema de asignación de estados cuando una columna Kanban agrupa más de un estado:
1. **Limitación Actual:** Actualmente, si una columna agrupa varios estados (por ejemplo, la columna In Progress agrupa `doing`, `in_progress`, `review`, `testing_qa`), al soltar una tarjeta se le asigna de forma fija el `dropTargetStatus` por defecto de la columna, lo cual es solo un fallback insuficiente y no cubre todos los casos de uso reales.
2. **Subzonas de Soltado Dinámicas:** Cuando el usuario arrastra una tarjeta sobre una columna que tiene múltiples estados asignados (`statuses.length > 1`), la interfaz debe desplegar bloques o zonas de soltado (drop zones) claramente diferenciadas para cada uno de los estados mapeados (ej: bloque para `doing`, bloque para `review`, etc.).
3. **Selección Directa y Fallback:**
   - Si el usuario suelta la tarjeta dentro de una subzona específica, la tarjeta asume inmediatamente ese estado exacto.
   - Si el usuario suelta en el cuerpo general de la columna fuera de las subzonas, se utiliza el `dropTargetStatus` como fallback seguro.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Detectar columnas Kanban con más de un estado mapeado (statuses.length > 1)
- [ ] #2 Al sobrevolar la columna con una tarjeta arrastrada, desplegar subzonas de drop claramente delimitadas con el nombre de cada estado
- [ ] #3 Soltar sobre una subzona específica transiciona la tarjeta a ese estado exacto
- [ ] #4 Soltar en la zona neutra de la columna aplica dropTargetStatus como fallback
- [ ] #5 Animación fluida de apertura de subzonas sin provocar jank ni saltos bruscos en el scroll
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/KanbanBoard.tsx`, enriquecer la zona de arrastre `onDragOver` de cada columna.
2. Renderizar overlay interactivo con slots de soltado por cada estado en `col.statuses`.
3. Pasar el estado seleccionado al handler `onMoveItem(itemId, specificStatus)`.
4. Validar experiencia táctil y con mouse.
<!-- SECTION:PLAN:END -->
