---
id: DEV-091
title: "Control formal de versiones en ItemModal y persistencia simétrica al desasignar releases"
status: Ready
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
order: 150
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bug en ItemModal: el input de releases agregaba cada prefijo intermedio a selectedReleases en cada pulsación de tecla ('v0', 'v0.', 'v0.6', etc.), inventando versiones que persistían en la UI. Además, al intentar remover un release de una tarea y guardar, el backend restauraba el valor previo ignorando la modificación debido a fallbacks que no contemplaban la desasignación explícita, y existían versiones fantasma (0.6.0) no dadas de alta en releases.json.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Selector de releases controlado en ItemModal: Dropdown y chips basados estrictamente en el registro oficial de versiones (releases.json), eliminando la generación de versiones intermedias por cada tecla pulsada.
- [x] #2 Persistencia simétrica al desasignar: al remover el release de un ítem, el guardado limpia explícitamente release, targetRelease, releases y milestone sin restaurar valores anteriores desde existingTask.
- [x] #3 Sanitización de tareas: eliminación de versiones fantasma no registradas (ej. 0.6.0 en DEV-043, DEV-057, DEV-060, DEV-061), garantizando que solo existan releases formalmente registrados en el Centro de Releases.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Reemplazar el input descontrolado de releases en ItemModal.tsx por un selector de versiones oficiales (releases.json) con dropdown, chips rápidos para versión en preparación y botón explícito para 'Sin Release'.
2. En ItemModal.tsx, enviar cadenas vacías ('') y arrays vacíos ([]) al desasignar release en lugar de undefined, para que JSON.stringify no los omita.
3. En vite.config.ts (saveBacklogMdItem), corregir el fallback de milestone para que respete cuando item.release o item.targetRelease vienen explícitamente vacíos, eliminando release, targetRelease, releases y milestone de frontmatter.
4. Limpiar las versiones 0.6.0 fantasma en DEV-043, DEV-057, DEV-060 y DEV-061, dejándolas en 'Sin Release' hasta su alta formal en releases.json.
5. Validar con tsc, npm test y npm run backlog:check.
<!-- SECTION:PLAN:END -->
