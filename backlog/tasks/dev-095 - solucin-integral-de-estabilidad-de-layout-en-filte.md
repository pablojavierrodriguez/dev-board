---
id: DEV-095
title: "Solución integral de estabilidad de layout en FilterBar ante activación de filtros (Zero-CLS)"
status: Done
created_date: '2026-09-24'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: high
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
order: 20
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Eliminación integral de desplazamientos de controles en FilterBar al activar cualquier filtro: 1) Badge numérico de filtros activos desacoplado con position: absolute en la esquina superior derecha del botón Filtros, manteniendo su ancho estrictamente constante y evitando empujar la botonera de filtros rápidos (Todos, Bug, Feature, etc.). 2) Supresión de saltos de ancho por cambio de font-weight en píldoras rápidas de tipo y prioridad (uso de font-medium uniforme). 3) Prevención de salto vertical de FilterBar mediante contenedor nowrap con control de overflow horizontal.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Badge absoluto en botón Filtros: posicionar el contador de filtros activos con position: absolute (-top-1.5 -right-1.5) para que el botón mantenga un ancho idéntico (cero píxeles de desplazamiento hacia los controles de la derecha).
- [x] #2 Estabilidad métrica en píldoras de tipo y prioridad: mantener font-medium tanto en estado activo como inactivo, diferenciando la selección mediante fondo, borde y sombra sin alterar el ancho del texto ni desfasar botones adyacentes.
- [x] #3 Prevención de wrap vertical en FilterBar: contenedor de barra configurado para prevenir que la aparición de Limpiar fuerce salto a una segunda línea o altere la altura del toolbar.
- [x] #4 Botón Limpiar desacoplado: asegurar que el botón Limpiar no altere el alineamiento de los filtros rápidos a su izquierda al montarse o desmontarse.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En src/components/FilterBar.tsx, modificar el badge del botón Filtros a position: absolute (-top-1.5 -right-1.5) con z-index adecuado y ring sutil.
2. Estandarizar las píldoras de tipo y prioridad a font-medium constante para eliminar micro-janks tipográficos al alternar selecciones.
3. Ajustar los contenedores flex en FilterBar.tsx para que no hagan wrap vertical inesperado en anchos de escritorio estándar.
4. Validar con tsc, npm test y backlog:check.
<!-- SECTION:PLAN:END -->
