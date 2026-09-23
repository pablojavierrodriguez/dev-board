---
id: DEV-075
title: "Mostrar/ocultar sprint como columna en SprintView"
status: Done
created_date: '2026-09-23'
updated_date: '2026-09-23 21:41'
labels: []
dependencies: []
priority: medium
type: bug
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir que la activación/desactivación de la columna Sprint en el popover de Columnas refleje visualmente la columna en la tabla tanto en agrupamiento por sprint como en otros agrupamientos.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Eliminar el bloqueo condicional groupBy !== 'sprint' para los encabezados y celdas de la columna Sprint en SprintView
- [x] #2 Asegurar que cuando visibleCols incluya 'sprint', la columna Sprint se visualice con su selector/etiqueta interactiva
- [x] #3 Verificar que al desmarcar 'sprint' en el popover de columnas, la columna se oculte adecuadamente
- [x] #4 Validar compilación con tsc --noEmit
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar SprintView.tsx removiendo la restricción groupBy !== 'sprint' en encabezado y celda de Sprint.
2. Comprobar renderizado y select de sprint interactivo.
3. Validar con tsc --noEmit.
<!-- SECTION:PLAN:END -->
