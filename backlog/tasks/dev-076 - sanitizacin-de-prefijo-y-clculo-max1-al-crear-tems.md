---
id: DEV-076
title: "Sanitización de prefijo y cálculo max+1 al crear ítems en la API web"
status: Done
created_date: '2026-09-23'
updated_date: '2026-09-24 12:14'
labels: []
dependencies: []
priority: high
type: bug
milestone: "0.4.0"
sprints:
  - "Sprint 4"
releases:
  - "0.4.0"
sprint: "Sprint 4"
targetSprint: "Sprint 4"
release: "0.4.0"
targetRelease: "0.4.0"
order: 130
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Corregir POST /api/items en vite.config.ts para sanitizar codePrefix (evitar dobles guiones DEV--) y calcular el correlativo usando max+1 sobre backlog.items y archivos en disco, alineándolo con el MCP server.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Sanitizar codePrefix en data/projects-registry.json (remover guión final) y en vite.config.ts
- [x] #2 Implementar cálculo max+1 sobre tareas existentes y archivos en disco en POST /api/items de vite.config.ts
- [x] #3 Sanitizar generateTaskFilename en scripts/backlogMdParser.ts para prevenir dobles guiones accidentales
- [x] #4 Validar creación de tareas y consistencia con npm run test:backlog y tsc --noEmit
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Actualizar data/projects-registry.json corrigiendo codePrefix a DEV.
2. Modificar vite.config.ts en POST /api/items con cleanPrefix y algoritmo max+1.
3. Actualizar scripts/backlogMdParser.ts para sanitizar dobles guiones en generateTaskFilename.
4. Validar con npm run test:backlog y tsc.
<!-- SECTION:PLAN:END -->
