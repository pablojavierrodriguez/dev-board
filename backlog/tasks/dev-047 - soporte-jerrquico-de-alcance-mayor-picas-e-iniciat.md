---
id: DEV-047
title: "Soporte Jerárquico de Alcance Mayor: Épicas e Iniciativas con Agrupación y Progreso Consolidado"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-23 13:39'
labels:
  - epics
  - initiatives
  - hierarchy
dependencies: []
priority: high
type: feature
milestone: "0.4.0"
sprint: "Sprint 3"
release: "0.4.0"
targetRelease: "0.4.0"
order: "18"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Incorporación de entidades de gestión de alto nivel (Épicas e Iniciativas) para estructurar y agrupar tarjetas con un alcance o visión estratégica mayor:
1. **Tipos de Alto Nivel:** Extender `ItemType` para soportar `'epic'` e `'initiative'`, otorgándoles representación visual distinguida (badges con colores e iconos propios).
2. **Cálculo de Progreso Consolidado (Rollup Metrics):** Cada Épica o Iniciativa calcula dinámicamente el progreso de completitud (% completado, conteo de items cerrados vs abiertos) según el estado de las tareas hijas que la componen.
3. **Vistas Agrupadas y Filtros:** Permitir agrupar la vista de Backlog por Épica o filtrar el tablero Kanban por una Épica seleccionada.
4. **Almacenamiento Compatible:** Las Épicas e Iniciativas se almacenan como archivos `.md` estándar en `backlog/tasks/` manteniendo compatibilidad Backlog.md (`type: epic`, `type: initiative`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Extender ItemType y esquemas con 'epic' e 'initiative' con estilo visual propio (icono, bordes y badges)
- [x] #2 Las cards de tipo épica/iniciativa muestran barra de progreso porcentual consolidada según sus tareas hijas
- [x] #3 Permitir agrupar la vista Backlog por Épica en el selector 'Agrupar por'
- [x] #4 En FilterBar, añadir selector para filtrar todo el tablero por Épica/Iniciativa
- [x] #5 Sincronización bidireccional limpia con frontmatter Markdown (type: epic, type: initiative)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender `src/types.ts` con `epic` e `initiative` en `ItemType`.
2. Actualizar `typeConfig` en `src/components/ItemCard.tsx` con estilos modernos.
3. Implementar función de cálculo de métricas rollup de avance por épica.
4. Añadir agrupación por Épica en `SprintView.tsx` y filtros en `FilterBar.tsx`.
<!-- SECTION:PLAN:END -->
