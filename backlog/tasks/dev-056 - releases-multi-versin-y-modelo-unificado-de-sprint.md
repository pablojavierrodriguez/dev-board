---
id: DEV-056
title: "Releases Multi-Versión y Modelo Unificado de Sprints Jira-Style"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-24 12:14'
labels:
  - sprints
  - releases
  - data-model
  - jira-parity
dependencies:
  - DEV-055
priority: high
type: feature
milestone: "0.4.0"
sprints:
  - "Sprint 4"
releases:
  - "0.4.0"
release: "0.4.0"
targetRelease: "0.4.0"
order: 90
sprint: "Sprint 4"
targetSprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Evolución del modelo de datos para Sprints y Releases en las tarjetas, adoptando un diseño unificado y sin redundancias:
1. **Modelo Unificado de Sprints (Jira-Style):** 
   - Se unifica en un único campo array: `sprints?: string[]`.
   - **Regla de Negocio:** Una tarjeta solo puede tener **1 sprint activo** asignado en curso a la vez.
   - **Historial de Cierres:** Cuando finaliza una iteración asociada a la tarjeta, el sprint permanece guardado en el array `sprints` como registro histórico de sprints finalizados (comportamiento idéntico al estándar de Jira). Se evita la creación de campos paralelos o duplicados como `sprintHistory`.
2. **Releases Multi-Versión:**
   - Una tarjeta puede estar asociada a múltiples versiones a lo largo de su ciclo de vida o en despliegues concurrentes (ej: release de hotfix en `0.2.1` y de release general en `0.3.0`).
   - Se amplía el campo a `releases?: string[]` manteniendo compatibilidad con `release?: string`.
3. **Persistencia Frontmatter:** Almacenamiento limpio en Markdown (`sprints: ['Sprint 1', 'Sprint 2']`, `releases: ['0.2.1', '0.3.0']`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 BacklogItem unifica los sprints en un único campo array 'sprints?: string[]' sin campos paralelos de historial
- [x] #2 Regla de negocio que valida máximo 1 sprint en estado activo asociado a la tarjeta a la vez
- [x] #3 Al completar un sprint, las tarjetas asociadas conservan el sprint finalizado en su lista 'sprints'
- [x] #4 Soporte para asociar múltiples versiones/releases por tarjeta (releases?: string[])
- [x] #5 Sincronización y persistencia transparente en frontmatter Markdown sin pérdida de datos
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/types.ts`, actualizar `BacklogItem` para incorporar `sprints?: string[]` y `releases?: string[]` con getters de retrocompatibilidad.
2. Actualizar `scripts/backlogMdParser.ts` para serializar y deserializar arrays de sprints y releases.
3. En `ItemModal.tsx`, adaptar los selectores a selección multi-release y selección de sprint activo con badges de historial.
4. En la acción de completar sprint de `DEV-055`, preservar la entrada en `sprints`.
<!-- SECTION:PLAN:END -->
