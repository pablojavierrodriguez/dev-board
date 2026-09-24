---
id: DEV-098
title: "Estabilización de layout de scrollbar: eliminación de layout shift en Header entre vistas Home y Papelera"
status: ready
created_date: '2026-09-24 20:43'
updated_date: '2026-09-24 20:45'
labels: []
dependencies: []
priority: high
type: bug
sprints:
  - "Sprint 5"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
created: "2026-09-24"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al alternar entre vistas que tienen scroll vertical (como Home/Tablero o Configuración) y vistas cuyo contenido entra completamente en el viewport sin desbordar (como Papelera cuando tiene pocos o ningún elemento), la aparición y desaparición de la barra de desplazamiento vertical de la ventana altera el ancho disponible del viewport (`window.innerWidth - scrollbarWidth`). Esto provocaba un desplazamiento ("layout shift" horizontal) hacia la derecha del encabezado superior (`Header`), el cual está centrado con `max-w-[1680px] mx-auto`.

Causa raíz:
1. `html` contaba con `scrollbar-gutter: stable`, pero sin `overflow-y: scroll`, los navegadores en macOS/Windows con mouse clásico o scrollbars persistentes liberan el espacio del gutter cuando el contenedor no tiene overflow activo.
2. `TrashView` no contaba con el contenedor canónico `max-w-[1680px] mx-auto w-full px-4 sm:px-6` presente en el Header y el Tablero.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Configurar `overflow-y: scroll` en `html` (combinado con `scrollbar-gutter: stable`) en `src/index.css` para garantizar que el ancho del layout viewport permanezca 100% invariable entre todas las vistas.
- [x] #2 Alinear el contenedor de `TrashView` en `App.tsx` y `TrashView.tsx` con el estándar `max-w-[1680px] mx-auto w-full px-4 sm:px-6`.
- [x] #3 Resolver advertencias y variables sin usar en `src/App.tsx` y `src/components/Header.tsx` asegurando compilación TypeScript estricta con 0 errores (`npx tsc --noEmit`).
- [x] #4 Verificar ausencia total de layout shift horizontal del `Header` y validar integridad del backlog con `npm run backlog:check` y `npm test`.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Agregar `overflow-y: scroll` a `html` en `src/index.css`.
2. Actualizar el contenedor de `TrashView.tsx` a `max-w-[1680px] mx-auto px-4 sm:px-6 py-6`.
3. Validar con `npx tsc --noEmit`, `npm test` y `npm run backlog:check`.
<!-- SECTION:PLAN:END -->
