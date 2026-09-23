---
id: DEV-071
title: "Fix: Aislamiento estricto de Sprints por Proyecto y Prevención de Fugas Cross-Project"
status: Done
created_date: '2026-09-23'
updated_date: '2026-09-23 13:40'
labels: []
dependencies: []
priority: high
type: bug
sprint: "Sprint 4"
targetSprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En instalaciones multi-proyecto, los sprints registrados en otros proyectos (ej. dom/m3) se filtraban hacia el proyecto activo (dev-board), generando agrupadores de sprints vacíos con badge 'Activo' ('Integridad Financiera', 'Performance y Escala', etc.) que no existen en el sprints.json local y no pueden ser eliminados.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Garantizar que readProjectBacklog en backend asigne siempre projectId a cada sprint cargado desde sprints.json
- [x] #2 En App.tsx, derivar projectSprints filtrando boardData.sprints estrictamente por selectedProjectId
- [x] #3 Pasar projectSprints y availableSprints contextuales a SprintView, KanbanBoard y selectores de modal
- [x] #4 En handleDeleteSprint y mutaciones de sprints, enviar el projectId específico del sprint para permitir su eliminación adecuada
- [x] #5 Eliminar la fuga de sprints de proyectos foráneos en la vista Sprint & Priorización
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar vite.config.ts en readProjectBacklog para asegurar que cada sprint tenga projectId asignado.
2. En src/App.tsx, crear useMemo projectSprints y conectar con SprintView, KanbanBoard y availableSprints.
3. Actualizar handleDeleteSprint en src/App.tsx para utilizar sprint.projectId al enviar la llamada a la API.
4. Validar compilación con npx tsc --noEmit y verificar en navegador.
<!-- SECTION:PLAN:END -->
