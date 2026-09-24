---
id: DEV-097
title: "Simplificación de vistas: Papelera como vista directa y gestión de descartadas desde Backlog y Filtros"
status: Ready
created_date: '2026-09-24'
updated_date: '2026-09-24 20:35'
labels: []
dependencies: []
priority: high
type: ux
sprint: "Sprint 5"
targetSprint: "Sprint 5"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Simplificar la arquitectura de vistas eliminando la duplicidad entre Archivo y Backlog:
1. Las tareas descartadas/canceladas (status: dismissed/cancelled) viven naturalmente en el Backlog y Tablero Kanban, ocultas por defecto y visibles activando el filtro de estados.
2. La vista dedicada en la cabecera pasa a ser exclusivamente la 'Papelera' (TrashView), con acceso directo sin subpestañas artificiales.
3. Se remueve la vista redundante ArchiveView.tsx.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 1. En Header.tsx, reemplazar el botón de 'Archivo' por acceso directo a 'Papelera' (ícono Trash2 y badge con conteo de elementos en papelera).
- [x] #2 2. En App.tsx, transformar la vista 'archive' en 'trash' dedicada, renderizando directamente TrashView sin subpestañas redundantes.
- [x] #3 3. Garantizar que las tareas 'dismissed' / 'cancelled' se gestionen y visualicen exclusivamente desde Backlog (SprintView) y Kanban (KanbanBoard) gobernadas por filtros de estado (ocultas por defecto).
- [x] #4 4. Limpieza y remoción de ArchiveView.tsx y del estado archiveSubTab.
- [x] #5 5. Validación con npx tsc --noEmit, npm test y npm run backlog:check con 0 errores.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar Header.tsx: cambiar botón 'archive' a 'trash' con icono Trash2, badge con trashedCount y tooltip 'Ver papelera (N)'.
2. Modificar App.tsx:
   - Reemplazar activeTab 'archive' por 'trash' (o redirigir 'archive' a 'trash').
   - Eliminar archiveSubTab y renderizado de ArchiveView.
   - Renderizar directamente TrashView cuando activeTab === 'trash'.
   - Asegurar que visibleItems en SprintView y KanbanBoard muestren tareas dismissed cuando filters.includeDismissedCancelled esté activo.
3. Eliminar o desacoplar ArchiveView.tsx.
4. Ejecutar npx tsc --noEmit, npm test y npm run backlog:check.
<!-- SECTION:PLAN:END -->
