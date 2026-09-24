---
id: DEV-089
title: "Persistencia del campo sprint al guardar desde ItemModal"
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
order: 10
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al seleccionar un sprint y guardar desde el modal de edición de tarea (ItemModal), el item no persiste el campo de sprint en disco ni se refleja correctamente en la vista de Sprints & Priorización, quedando ubicado en Backlog. Debe asegurarse la serialización atómica y bidireccional de sprint/sprints tanto en ItemModal, la API y el parser de Backlog.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 ItemModal envía el valor de sprint y targetSprint (y limpia adecuadamente si se desasigna el sprint) hacia la API PUT /api/items/:id.
- [x] #2 La API y saveBacklogMdItem sincronizan taskData.sprint, targetSprint y taskData.sprints, escribiendo correctamente la propiedad sprint en el frontmatter del archivo Markdown.
- [x] #3 readProjectBacklog y parseBacklogMd resuelven de forma robusta el sprint activo ya sea desde sprint, targetSprint o sprints array.
- [x] #4 Al cambiar el sprint desde ItemModal y recargar la vista, el ítem permanece en la columna del sprint asignado en la vista de Sprints y en el selector del modal.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajustar ItemModal.tsx para enviar sprint de forma explícita (incluso al desasignar).
2. Actualizar saveBacklogMdItem en vite.config.ts para sincronizar taskData.sprint y taskData.sprints.
3. Robustecer readProjectBacklog para extraer sprint desde task.sprint || task.targetSprint || task.sprints.
4. Probar en vivo y verificar con tests.
<!-- SECTION:PLAN:END -->
