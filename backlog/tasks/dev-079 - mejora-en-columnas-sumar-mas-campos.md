---
id: DEV-079
title: "mejora en columnas / sumar mas campos"
status: Ready
created_date: '2026-09-23T22:28:17.255Z'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: medium
type: ux
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
order: 80
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir agregar y ocultar columnas adicionales de tareas en la vista de Sprints y Backlog. Específicamente, incorporar campos estructurados no extensos: Criterios de Aceptación (ACs ratio/progreso), Responsables/Asignados (assignees), Etiquetas (labels) y Épica (epic). Cada columna puede activarse u ocultarse dinámicamente desde el popover de Columnas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El popover de Columnas permite activar/desactivar Criterios de Aceptación (acProgress), Asignados (assignees), Etiquetas (labels) y Épica (epic).
- [x] #2 Cada nueva columna cuenta con su celda th en el encabezado y su renderizado correspondiente con diseño visual pulido en las filas de tareas.
- [x] #3 Las selecciones de columnas se persisten de forma transparente en localStorage y se sincronizan al modificar opciones.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ampliar ALL_OPTIONAL_COLS en SprintView.tsx con 'acProgress', 'assignees', 'labels', 'epic'.
2. Añadir las etiquetas legibles en la lista del popover de columnas.
3. Renderizar las cabeceras th y las celdas td correspondientes en la tabla de ítems.
4. Validar compilación con npx tsc --noEmit.
<!-- SECTION:PLAN:END -->
