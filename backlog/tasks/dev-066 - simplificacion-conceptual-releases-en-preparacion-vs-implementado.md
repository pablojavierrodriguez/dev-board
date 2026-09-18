---
id: DEV-066
title: "Simplificación Conceptual de Releases: Lista Unificada (En Preparación vs Implementado) y Detalle Progresivo"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 02:58'
labels:
  - releases
  - ux
  - architecture
dependencies:
  - DEV-062
priority: high
type: feature
milestone: "0.3.1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactorización y simplificación radical del modelo y la interfaz de Releases:
1. **Unificación Conceptual:** 'Planning', 'Target' y 'Unreleased' son conceptualmente lo mismo: una versión **En Preparación**. Eliminar la división artificial en bloques separados redundantes.
2. **Modelo Binario Puro:**
   - **En Preparación (Unreleased / Dev):** Trabajo activo, editable, mutable.
   - **Implementado / Entregado (Released / Prod):** Desplegado a producción, histórico e inmutable.
3. **Ergonomía de Lista y Detalle Progresivo:** Presentar las versiones en una lista limpia y concisa (vista compacta / feed simple). Desplegar metadatos extensos, notas de cambio y edición únicamente cuando el usuario selecciona o expande una versión específica.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Unificar los estados del modelo de Release a exclusivamente 'unreleased' y 'released'
- [ ] #2 Rediseñar ReleaseAssembler.tsx hacia una vista tipo lista compacta y clara sin divisiones redundantes
- [ ] #3 Implementar panel de detalle progresivo (drawer o split-view) para inspección y edición bajo demanda
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Simplificar interfaz y tipos en `src/types.ts`.
2. Refactorizar `ReleaseAssembler.tsx` eliminando la duplicidad entre Target planning y Unreleased.
3. Probar ergonomía con lista compacta y detalle desplegable.
<!-- SECTION:PLAN:END -->
