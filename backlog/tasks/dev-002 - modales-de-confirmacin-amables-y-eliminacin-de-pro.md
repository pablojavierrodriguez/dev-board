---
id: DEV-002
title: "Modales de confirmación amables y eliminación de proyectos"
status: Draft
assignee:
  - "Antigravity"
created_date: '2026-09-16'
updated_date: '2026-09-16 20:28'
labels:
  - ux
  - ui
  - bugfix
dependencies: []
priority: high
type: ux
milestone: "v1.1.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reemplazar todas las alertas y confirmaciones nativas del navegador (`alert()` y `confirm()`)
por un modal in-app (`ConfirmModal`) con estética premium Linear/Raycast dark-mode.
Solucionar el fallo en el tacho de basura al eliminar o desvincular proyectos (incluso el demo).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Crear componente `ConfirmModal.tsx` con variantes danger/warning/info y atajos de teclado
- [x] #2 Reemplazar confirms en Header, ItemCard, ItemModal, SprintView y ArchiveView
- [x] #3 Reemplazar alerts por banners de error inline y toasts
- [x] #4 Permitir eliminar/desvincular proyectos y restaurar proyecto Demo
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear `src/components/ConfirmModal.tsx`.
2. Actualizar `Header.tsx` para eliminar la restricción `projects.length > 1` y renderizar `ConfirmModal`.
3. Actualizar `ItemCard.tsx`, `ItemModal.tsx`, `SprintView.tsx`, `ArchiveView.tsx` y `ProjectModal.tsx`.
4. Añadir endpoint `POST /api/projects/restore-demo` en `vite.config.ts`.
<!-- SECTION:PLAN:END -->
