---
id: DEV-094
title: "Estabilización de layout, scrollbar-gutter y alineación de márgenes al alternar Ideas y filtros"
status: Ready
created_date: '2026-09-24'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: high
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
sprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
order: 180
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Eliminación de saltos visuales de layout (jank) al activar/desactivar Ideas o aplicar filtros: 1) Scrollbar layout shift solucionado con scrollbar-gutter: stable en html. 2) Contenedor KanbanBoard alineado con max-w-[1680px] mx-auto. 3) FilterBar desacoplada para no contabilizar includeIdeas como filtro activo. 4) Ancho estable del botón Ideas en la barra de herramientas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Estabilidad global de scrollbar: incorporar scrollbar-gutter: stable en html para evitar el salto de layout (15px) al filtrar o variar la altura de las tarjetas.
- [x] #2 Alineación de contenedor en KanbanBoard: agregar max-w-[1680px] mx-auto para que coincida exactamente con Header, FilterBar y SprintView, eliminando desfasajes de márgenes en pantallas medianas y anchas.
- [x] #3 Eliminación de sobrecarga semántica en FilterBar: aislar includeIdeas para que no altere hasCustomStatuses ni inserte el botón Limpiar (1) que desplazaba la fila de filtros rápidos.
- [x] #4 Dimensionado estable del botón Ideas en el toolbar de KanbanBoard mediante conteo independiente de ideas disponibles, evitando cambios de ancho y saltos de controles adyacentes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Agregar scrollbar-gutter: stable en src/index.css en html para estabilizar el ancho del viewport.
2. Añadir max-w-[1680px] mx-auto al contenedor raíz de KanbanBoard.tsx para emparejarlo con Header, FilterBar y SprintView.
3. En src/components/FilterBar.tsx, excluir 'ideas' del cómputo de hasCustomStatuses para que alternar la columna de ideas no active el contador de filtros ni monte/desmonte el botón de limpiar filtros.
4. En src/components/KanbanBoard.tsx y App.tsx, pasar allItems para computar ideasCount de forma estable sin que el botón de Ideas sufra layout shift al ocultar la columna.
5. Validar con tsc, npm test y backlog:check.
<!-- SECTION:PLAN:END -->
