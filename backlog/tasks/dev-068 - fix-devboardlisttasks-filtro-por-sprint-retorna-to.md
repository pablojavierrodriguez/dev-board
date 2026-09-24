---
id: DEV-068
title: "Fix: devboard_list_tasks — Filtro por Sprint Retorna Todos los Tasks"
status: Done
created_date: '2026-09-19'
updated_date: '2026-09-24 12:14'
labels: []
dependencies: []
priority: medium
type: bug
milestone: "Sprint 4"
sprints:
  - "Sprint 4"
releases:
  - "Sprint 4"
sprint: "Sprint 4"
targetSprint: "Sprint 4"
order: 60
release: "Sprint 4"
targetRelease: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
El filtro `{ "sprint": "Sprint 3" }` en `devboard_list_tasks` no filtra por sprint: retorna todos los tasks del proyecto. Esto genera confusión en auditorías de sprint y obliga al agente a filtrar manualmente el JSON.

**Root cause posible:** El campo `sprint` en el frontmatter Markdown puede estar bajo nombres alternativos (`targetSprint`, `milestone`) que el parser no mapea al filtro `sprint` de la API.

**Fix esperado:** El filtro `sprint` en `devboard_list_tasks` debe matchear los campos `sprint`, `targetSprint`, y el frontmatter `sprint:` del archivo Markdown.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 devboard_list_tasks con { sprint: 'Sprint 3' } retorna solo tasks cuyo frontmatter contiene sprint: Sprint 3
- [x] #2 El filtro también matchea el campo targetSprint cuando coincide con el valor buscado
- [x] #3 Test con proyecto dev-board: filtrar por Sprint 3 retorna exactamente DEV-047, DEV-049, DEV-051, DEV-052, DEV-053, DEV-055, DEV-067 y nada más
- [x] #4 Documentar el filtro corregido en el schema MCP
- [x] #5 La corrección es backwards-compatible con el CLI devboard list
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
