---
id: DEV-088
title: "No es posible cambiar un item a Idea / Discovery"
status: Ready
created_date: '2026-09-24T14:05:25.732Z'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: medium
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
order: 120
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al seleccionar un item del backlog, el cambio de "estado" a Idea no se persiste y por ende no se visualiza el item en la columna de ideas / discovery. CanonicalStatus y normalizeStatus en backlogMdParser normalizaban ideas a draft, impidiendo su almacenamiento y visualización en la columna col-ideas del tablero Kanban.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 CanonicalStatus y normalizeStatus en backlogMdParser.ts reconocen ideas, idea y discovery como estado 'ideas', y formatStatusForMd formatea 'Ideas'.
- [x] #2 Al cambiar el estado a '💡 Idea / Discovery' desde ItemModal.tsx o arrastrando en KanbanBoard, el estado 'ideas' se persiste en memoria y disco sin degradarse a 'draft'.
- [x] #3 Los items en estado 'ideas' son correctamente filtrados y visibles en la columna 'Ideas' (col-ideas) del KanbanBoard al activar la visualización de ideas.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender CanonicalStatus en backlogMdParser.ts para incluir 'ideas'.
2. Ajustar normalizeStatus y formatStatusForMd para mapear y formatear 'ideas' / 'Ideas'.
3. Actualizar grouped y statuses en generateMonolithicBacklogMd para soportar 'ideas'.
4. Actualizar test-parser.js y ejecutar pruebas de integridad.
5. Validar en vivo en KanbanBoard e ItemModal.
<!-- SECTION:PLAN:END -->
