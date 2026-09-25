---
id: DEV-111
title: "Soporte Interactivo de Visualización y Edición de Labels y Assignees en ItemModal"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 16:30'
labels: []
dependencies: []
priority: medium
type: ux
sprints:
  - "Sprint 6"
sprint: "Sprint 6"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Completitud de UX en el modal de ítem (ItemModal): permitir la visualización y edición interactiva de etiquetas (labels) y personas/agentes asignados (assignees), cerrando la brecha entre el modelo de persistencia Markdown y la interfaz gráfica.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Permitir visualizar y editar etiquetas (labels) en ItemModal mediante input de tags y chips eliminables con click
- [x] #2 Permitir visualizar y editar asignados (assignees) en ItemModal mediante chips con botón de remover
- [x] #3 Transmitir labels y assignees en el payload de onSave hacia la API de backend sin perder datos en disco
- [x] #4 Validar que los ítems con labels y assignees se persistan correctamente en backlog/tasks/*.md y se reflejen en la UI
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Registrar DEV-111 en el sprint backlog de Sprint 6.
2. Incorporar estados locales y handlers de labels y assignees en ItemModal.tsx (con chips y botón para remover).
3. Renderizar campos de Etiquetas y Asignados en la barra lateral de atributos de ItemModal.
4. Mapear labels y assignees en onSave y en populateFromItem.
5. Probar con tests y verificar persistencia en disco y sincronización de backlog.
<!-- SECTION:PLAN:END -->
