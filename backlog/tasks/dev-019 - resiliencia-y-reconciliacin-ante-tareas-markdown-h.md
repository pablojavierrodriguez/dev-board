---
id: DEV-019
title: "Resiliencia y reconciliación ante tareas Markdown huérfanas o renombradas"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-19 04:25'
labels: []
dependencies: []
priority: medium
type: bug
milestone: "v1.2.0"
release: "v1.2.0"
targetRelease: "v1.2.0"
order: 110
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Hacer que el servidor MCP y la API de DevBoard sean tolerantes a fallos si un desarrollador renombra manualmente un archivo de tarea en su editor (ej. VS Code), reconciliando la tarea a través del ID declarado en su frontmatter YAML.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Escanear el frontmatter YAML ('id:' o 'code:') para localizar tareas en disco cuando el nombre de archivo no coincide con el prefijo esperado
- [x] #2 Actualizar el servidor MCP (devboard_get_task, devboard_update_task) para encontrar tareas independientemente del nombre del archivo en backlog/tasks/
- [x] #3 Actualizar la API backend (PUT /api/items/:id, DELETE /api/items/:id) para reconciliar por frontmatter si falla la coincidencia por nombre de archivo
- [x] #4 Normalizar y renombrar el archivo en disco automáticamente al estándar '<ID> - <Title>.md' al guardar la tarea para mantener el repositorio ordenado
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Actualizar vite.config.ts (saveBacklogMdItem, deleteBacklogMdItem, readProjectBacklog) para buscar por frontmatter si no hay match por nombre de archivo.
2. Actualizar scripts/mcp-server.ts (readTasksForProject, devboard_get_task, devboard_update_task) con la misma lógica de reconciliación.
3. Asegurar que al guardar se renombre el archivo a la convención canónica.
<!-- SECTION:PLAN:END -->
