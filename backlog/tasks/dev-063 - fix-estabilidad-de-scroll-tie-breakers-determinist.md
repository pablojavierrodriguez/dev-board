---
id: DEV-063
title: "Fix: Estabilidad de Scroll, Tie-Breakers Deterministas y Normalización al Ordenar en Vista Sprint"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 06:36'
labels:
  - bug
  - sprint-view
  - ux
  - layout
dependencies: []
priority: high
type: bug
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 220
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Corrección del comportamiento de salto vertical, parpadeo y desplazamiento involuntario de la pantalla al ordenar por columnas (especialmente Prioridad) en `SprintView.tsx`:
1. **Comparador Débil y Valores No Normalizados:** Al ordenar por prioridad, si las prioridades coinciden o contienen valores textuales no estándar (`urgent`, `high`, `undefined`), el comparador produce `0` o `NaN`, corrompiendo la estabilidad del ordenamiento y alterando aleatoriamente las alturas de los bloques. Se debe normalizar la prioridad y utilizar un tie-breaker secundario determinista (desempate por `code`).
2. **Preservación de Scroll del Viewport:** Al hacer click en un header de ordenamiento en una tabla ubicada más abajo en la página (ej. Backlog), el reordenamiento de los grupos superiores altera la altura total y el navegador resetea o desplaza bruscamente `window.scrollY`. Se debe anclar o restaurar de forma fluida e instantánea la posición relativa del viewport al cambiar de orden.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Normalizar prioridades y aplicar tie-breaker determinista por código en el ordenamiento por prioridad
- [x] #2 Aplicar tie-breaker determinista por código en el ordenamiento por estado
- [x] #3 Preservar de forma instantánea y fluida la posición de scroll (`window.scrollY`) antes y después del ordenamiento
- [x] #4 Prevenir saltos de layout o scroll anchoring errático en las tablas de SprintView
- [x] #5 Verificación interactiva en navegador confirmando cero saltos de scroll al ordenar
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear tarea DEV-063 en status doing con sprint "Sprint 1".
2. En `src/components/SprintView.tsx`, corregir el comparador de `sortBy === 'priority'` y `sortBy === 'status'` con normalización segura y tie-breaker `a.code.localeCompare(b.code, undefined, { numeric: true })`.
3. Implementar preservación de scroll en `toggleSort` y `useLayoutEffect` / `requestAnimationFrame` para mantener la posición exacta de visualización.
4. Asignar `sprint: "Sprint 1"` a todas las tarjetas pendientes de la versión 0.3.0 solicitadas por el usuario.
5. Ejecutar `npm run build` y validar comportamiento visual en navegador.
<!-- SECTION:PLAN:END -->
