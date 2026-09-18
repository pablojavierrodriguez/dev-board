---
id: DEV-045
title: "Estabilidad Visual del Botón de Ideas (Cero CLS) y Estado Destino por Defecto a 'Ready' en Vista Simplificada"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 00:02'
labels:
  - ux
  - kanban
  - layout
dependencies: []
priority: medium
type: ux
milestone: "0.3.1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mejora de estabilidad visual y coherencia del ciclo de vida en el tablero Kanban:
1. **Prevención de Layout Shift (CLS) en Botón de Ideas:** En `KanbanBoard.tsx`, el botón de alternar visibilidad de ideas cambiaba de texto dinámicamente (`Ideas Visibles` vs `+ Mostrar Ideas`), lo que alteraba su ancho intrínseco y desplazaba horizontalmente los botones adyacentes de selector de vista (`simplificada` / `ampliada`). El botón debe mantener un ancho o etiqueta fija (ej. icono con texto "Ideas" y dot/badge de estado) para que la barra de controles permanezca perfectamente estática al interactuar.
2. **Estado al Soltar por Defecto en Vista Simplificada:** En `SIMPLIFIED_BASE_COLUMNS`, el `dropTargetStatus` de la columna `Done` debe ser `ready` en lugar de `done`. El paso formal a `done` depende de la liberación o release del software, no únicamente de finalizar la etapa de desarrollo/QA.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Mantener ancho fijo o etiqueta invariable en el botón de toggle de ideas para garantizar cero Cumulative Layout Shift (CLS)
- [ ] #2 Los botones adyacentes de vista simplificada/ampliada no experimentan ningún desplazamiento al conmutar la visibilidad de ideas
- [ ] #3 En SIMPLIFIED_BASE_COLUMNS, configurar dropTargetStatus: 'ready' en la columna Done (col-done)
- [ ] #4 Al arrastrar una tarjeta a la columna Done en vista simplificada, su estado se actualiza a 'ready' por defecto
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/KanbanBoard.tsx`, ajustar el contenedor y texto del botón de ideas para que tenga dimensiones estables.
2. Actualizar `SIMPLIFIED_BASE_COLUMNS` estableciendo `dropTargetStatus: 'ready'` para `col-done`.
3. Validar con `npm run build` y comprobar visualmente que no existan micro-janks o saltos de layout.
<!-- SECTION:PLAN:END -->
