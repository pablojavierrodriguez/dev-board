---
id: DEV-044
title: "Fix: Persistencia de Prioridad P0 en Backlog Markdown y Dirty Checking en Edición de Campos"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 06:36'
labels:
  - bug
  - parser
  - backlog
dependencies: []
priority: high
type: bug
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 40
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Corrección de dos problemas críticos de sincronización y persistencia en la vista de Backlog:
1. **Fix de Prioridad P0 (Causa Raíz):** En `scripts/backlogMdParser.ts`, la función `formatPriorityForMd(p)` mapeaba `p === 'p0'` a `'high'`. Al re-parsear el Markdown, `'high'` era normalizado de vuelta a `'p1'`. Por esta razón, cuando el usuario seleccionaba P0 en el dropdown de prioridad, se mostraba el mensaje de éxito pero el valor se revertía inmediatamente a P1 en disco y en la interfaz. Corregir el mapeo a `'urgent'` o `'critical'` tanto en `formatPriorityForMd` como en el parser.
2. **Dirty Checking en Edición de Campos:** Al editar valores en celdas, nombres de columna o dropdowns con autoguardado, verificar si el nuevo valor difiere del preexistente (`newValue !== oldValue`). Si el valor es idéntico, abortar la llamada a la API y no emitir eventos redundantes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En scripts/backlogMdParser.ts, formatPriorityForMd('p0') serializa a 'urgent' o 'critical' y parseBacklogMd normaliza a 'p0'
- [x] #2 Al cambiar la prioridad a P0 desde el selector en la vista de Backlog, el valor persiste en disco sin revertirse a P1 tras refrescar
- [x] #3 Implementar dirty checking estricto en edición rápida de celdas y nombres de columnas (abortar si el valor no cambia)
- [x] #4 Añadir tests unitarios en scripts/test-parser.js verificando ida y vuelta de todas las prioridades (p0, p1, p2, p3)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar `scripts/backlogMdParser.ts` para que `formatPriorityForMd('p0')` retorne `'urgent'`.
2. Verificar `bin/devboard-mcp.js` y `vite.config.ts` para asegurar congruencia en la normalización de prioridades.
3. Incorporar dirty checking en `SprintView.tsx` y componentes con autoguardado.
4. Validar con `node scripts/test-parser.js` y `npm run backlog:check`.
<!-- SECTION:PLAN:END -->
