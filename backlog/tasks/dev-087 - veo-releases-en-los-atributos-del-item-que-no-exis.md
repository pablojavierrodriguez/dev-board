---
id: DEV-087
title: "veo releases en los atributos del item que no existen en la tab release"
status: Done
created_date: '2026-09-24T13:08:33.316Z'
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
order: 110
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
ej. vv1.1.0, vSprint 4, etc no son releases ni en preparacion ni finalizados
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 No extraer valores arbitrarios o desalineados de `item.release`/`targetRelease` para las sugerencias de versiones; tomar como fuente canónica las versiones declaradas en `releases.json` (`boardData.releases`).
- [x] #2 En el selector/chips de versiones en `ItemModal`, mostrar únicamente versiones oficiales existentes, priorizando por defecto las versiones `unreleased` (en preparación).
- [x] #3 Permitir tipeo manual libre si el usuario necesita especificar una versión nueva o no listada aún.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajustar `availableReleases` en `App.tsx` para basarse exclusivamente en `boardData.releases` y pasar metadata de releases a `ItemModal`.
2. En `ItemModal.tsx`, separar sugerencias activas (unreleased) y permitir expandir o buscar versiones históricas (released).
3. Validar con pruebas y tsc.
<!-- SECTION:PLAN:END -->
