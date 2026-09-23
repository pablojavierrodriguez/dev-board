---
id: DEV-048
title: "Grafo de Relaciones entre Cards: Jerarquías Verticales (Padre/Hijo Estricto 1-a-N) y Enlaces Horizontales (Bloquea/Depende/Relacionado)"
status: Ready
created_date: '2026-09-18'
updated_date: '2026-09-23 17:24'
labels:
  - relations
  - dependencies
  - graph
dependencies:
  - DEV-047
priority: high
type: feature
milestone: "0.4.0"
release: "0.4.0"
targetRelease: "0.4.0"
order: "40"
sprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modelado completo de relaciones entre tarjetas tanto a nivel vertical como horizontal:
1. **Jerarquías Verticales (Padre / Hijo Estricto):** Un ítem solo puede tener un único padre (`parentId` / `parent`), pero un padre puede tener múltiples tareas hijas. Permite asociar cualquier tarea a una Épica o Historia contenedora.
2. **Relaciones Horizontales entre Vecinos / Hermanos:** Soporte para enlaces cruzados entre tarjetas del backlog:
   - `blocks` / `blocked_by`: Card A bloquea a Card B (y recíprocamente Card B está bloqueada por Card A).
   - `related_to`: Tareas relacionadas conceptualmente sin dependencia dura.
   - `depends_on`: Dependencia funcional.
3. **Indicadores de Bloqueo Visual:** Si una tarea tiene dependencias no resueltas (tareas bloqueantes en `doing`, `draft` o `review`), mostrar un badge visual de advertencia roja ("Bloqueada por DEV-XXX") en la tarjeta Kanban y en el detalle.
4. **Persistencia Frontmatter:** Almacenamiento directo en frontmatter Markdown (`parent: 'DEV-010'`, `blocks: ['DEV-020']`, `dependencies: ['DEV-015']`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Un ítem solo puede tener asignado un único padre (parentId), con selector modal interactivo
- [x] #2 Soporte de relaciones horizontales bidireccionales automáticas (blocks <-> blocked_by, related_to)
- [x] #3 Badge indicador en tarjetas Kanban que señala dependencias bloqueadas y advertencias de precedencia
- [x] #4 En ItemModal, sección interactiva 'Relaciones y Dependencias' para vincular y desvincular ítems
- [x] #5 Persistencia transparente en frontmatter Markdown sin pérdida de datos en hot-reload
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender `BacklogItem` en `src/types.ts` con `parentId?: string`, `blocks?: string[]`, `blockedBy?: string[]`, `relatedTo?: string[]`.
2. Actualizar parser y serializador en `scripts/backlogMdParser.ts` para persistir estos campos en frontmatter.
3. Añadir selector de Padre y gestor de enlaces en `src/components/ItemModal.tsx`.
4. Mostrar badges de relación y alerta de bloqueo en `src/components/ItemCard.tsx`.
<!-- SECTION:PLAN:END -->
