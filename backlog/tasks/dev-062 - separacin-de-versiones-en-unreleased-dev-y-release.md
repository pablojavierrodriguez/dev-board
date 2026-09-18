---
id: DEV-062
title: "Separación de Versiones en Unreleased (Dev) y Released (Producción) en Release Hub y Modelo de Datos"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 06:36'
labels:
  - releases
  - architecture
  - ux
dependencies: []
priority: high
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 200
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Corrección conceptual integral del ciclo de vida de versiones: una versión en desarrollo (staging/dev) es 'unreleased' independientemente de si tiene tareas listas o commits. Solo pasa a 'released' (histórico inmutable) al ser explícitamente promovida/desplegada a producción.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Soporte explícito para status 'unreleased' en Release y migración de v0.3.0 de released a unreleased en releases.json
- [x] #2 vite.config.ts no asigna releasedAt ni fuerza status done salvo que la versión sea explícitamente 'released'
- [x] #3 ReleaseAssembler.tsx divide claramente 'Unreleased / En Preparación' de 'Releases Históricos (Producción)'
- [x] #4 Botón 'Guardar Borrador Unreleased' para actualizar changelog continuo en dev sin sellar histórico
- [x] #5 Modal/Acción deliberada 'Liberar a Producción' que solicita confirmación antes de marcar como 'released' y registrar releasedAt
- [x] #6 MCP server (devboard_list_releases) expone el campo status ('unreleased' | 'released' | 'planned') de cada versión
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear tarea y pasar a doing. 2. Actualizar types.ts con ReleaseStatus. 3. Ajustar backend en vite.config.ts. 4. Actualizar mcp-server.ts. 5. Refactorizar ReleaseAssembler.tsx con secciones Unreleased vs Released y acciones explícitas. 6. Actualizar releases.json pasando 0.3.0 a unreleased. 7. Validar build, tsc, backlog:sync y UX.
<!-- SECTION:PLAN:END -->
