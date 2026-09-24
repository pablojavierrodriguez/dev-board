---
id: DEV-080
title: "la retro no es del release"
status: Ready
created_date: '2026-09-23T23:04:56.271Z'
updated_date: '2026-09-24 14:56'
labels: []
dependencies: []
priority: medium
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
order: "10"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
la retro debe estar asignada al sprint no al release, es un error conceptual
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Eliminar la pestaña errónea de Retrospectivas en el Drawer de Releases (`ReleaseAssembler.tsx`), desacoplando conceptualmente la ceremonia de sprint del release.
- [x] #2 Incorporar en `SprintView.tsx` un botón "Ver Retrospectiva" en la cabecera de sprints completados (`status === 'completed'`).
- [x] #3 Diseñar modal para visualizar el acta Markdown de la retrospectiva del sprint completado correspondiente.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `ReleaseAssembler.tsx`, remover la pestaña 'retro' del Drawer de Releases y limpiar estados asociados.
2. En `SprintView.tsx`, consultar retrospectivas por sprint y añadir botón "Ver Retrospectiva" en sprints con estado 'completed'.
3. Crear o integrar modal de visualización de retrospectiva en `SprintView.tsx`.
4. Validar visualmente y con `tsc`.
<!-- SECTION:PLAN:END -->
