---
id: DEV-090
title: "Sincronización bidireccional de tareas en releases y rediseño UX/UI del drawer"
status: Ready
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
order: 140
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Inconsistencia entre tareas con release asignado en Sprint/Backlog y el panel de releases (se mostraba 0 tareas asociadas en el drawer y métrica divergente en la tarjeta). Adicionalmente, el popup/drawer de releases presenta deficiencias graves de UX/UI: el desenfoque de fondo no cubre el 100% de la pantalla (deja la barra de navegación expuesta) y la disposición/alineación de elementos dentro del drawer es deficiente.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Sincronización bidireccional estricta de tareas asociadas a releases: tareas con release/targetRelease v0.5.0 se reflejan inmediatamente en la pestaña de Tareas del drawer y en rel.itemCodes.
- [x] #2 Consistencia en métricas de alcance y progreso del release card con las tareas realmente asociadas al paquete en el drawer y sprint backlog.
- [x] #3 Rediseño UX/UI del drawer de releases: overlay con backdrop-blur 100% viewport (createPortal), cabecera estilizada, tabs modernas y ergonomía refinada de tarjetas y botones de vinculación.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En App.tsx, asegurar que el filtro visibleItems y onToggleIdeas sincronicen el estado 'ideas' correctamente.
2. En ReleaseAssembler.tsx, resolver las tareas asociadas mediante la unión de rel.itemCodes y tareas con release/targetRelease coincidente, sincronizando editItemCodes al abrir y guardar.
3. Actualizar el cálculo de progreso y alcance del release card para basarse consistentemente en las tareas del paquete.
4. Renderizar el drawer mediante createPortal a document.body con backdrop-blur-md fixed inset-0 z-[100] para cobertura total de la pantalla.
5. Rediseñar integralmente la cabecera, tabs, lista de tareas del paquete y sección de tareas disponibles para vincular con estética moderna y consistente.
6. Validar tipado TypeScript (tsc), pruebas unitarias e integridad del backlog.
<!-- SECTION:PLAN:END -->
