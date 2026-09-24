---
id: DEV-100
title: "Eliminación de confirmación nativa del navegador en vista de Releases y UX de Promoción a Producción"
status: ready
created_date: '2026-09-24 21:07'
updated_date: '2026-09-24 21:12'
labels: []
dependencies: []
priority: medium
type: ux
sprints:
  - "Sprint 5"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
created: "2026-09-24"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al presionar "Liberar" o "Eliminar borrador" en el Centro de Releases (`ReleaseAssembler.tsx`), se invocaba la función nativa del navegador `window.confirm()`. Este diálogo gris del sistema operativo rompía por completo la coherencia estética, diseño y accesibilidad de la aplicación.

Solución:
1. Se clarificó la función del botón "Liberar": promueve una versión en estado 'unreleased' (en preparación) a 'released' (inmutable y desplegada en producción), sella la fecha de publicación oficial y promueve las tareas en 'ready' al estado final 'done'.
2. Se incorporó la variante 'success' en `ConfirmModal` (con icono `Rocket` y paleta esmeralda) para confirmaciones de publicación formal.
3. Se reemplazaron todos los llamados a `window.confirm()` en `ReleaseAssembler.tsx` por instancias de `ConfirmModal` con títulos, mensajes explicativos y detalles precisos del impacto.
4. Se corrigió el contenedor de detalle en `ConfirmModal` removiendo `truncate` y permitiendo multilínea fluida (`break-words text-[11px]`), sintetizando el copy para que sea conciso y armonioso con el espacio.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Extender `ConfirmModal` con la variante 'success' (icono Rocket, acento esmeralda) manteniendo soporte accesible de teclado (Escape/Enter).
- [x] #2 Reemplazar el `window.confirm` de "Liberar" en `ReleaseAssembler.tsx` por `ConfirmModal` descriptivo que aclare que la versión pasará a ser inmutable y promoverá las tareas en 'ready' a 'done'.
- [x] #3 Reemplazar el `window.confirm` de "Eliminar borrador" en `ReleaseAssembler.tsx` por `ConfirmModal` (variante 'danger').
- [x] #4 Ajustar `ConfirmModal` para permitir multilínea sin recorte por `truncate` y sintetizar los textos para óptima proporción visual.
- [x] #5 Validar compilación TypeScript (`npx tsc --noEmit`), suite de pruebas (`npm test`) y sincronización viva (`npm run backlog:check`).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender ConfirmModal con variante 'success' e icono Rocket.
2. Reemplazar window.confirm en ReleaseAssembler.tsx con estados reactivos y ConfirmModal.
3. Validar con pruebas y tsc.
<!-- SECTION:PLAN:END -->
