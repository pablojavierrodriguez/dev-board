---
id: DEV-103
title: "Compatibilidad canónica de sincronización y exportación con estándar Backlog.md"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 01:30'
labels: []
dependencies: []
priority: high
type: feature
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Adaptar el motor de sincronización y exportación de tareas en dev-board para que sea 100% compatible con el estándar canónico de Backlog.md: nombres de archivo canónicos con ID en mayúsculas y espacios (sin slugify a minúsculas), sobreescritura de archivos existentes por ID, serialización de status estrictamente en minúsculas (sin 'Ideas'), mapeo de sprints exclusivamente a nombres registrados en sprints.json (sin inventar 'backlog-futuro') y preservación absoluta de itemCodes en releases.json.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Nombres de archivo canónicos en backlogMdParser.ts (${task.id.toUpperCase()} - ${task.title}.md) preservando mayúsculas y espacios sin slugify forzado a minúsculas.
- [x] #2 Sobreescritura in-place de archivos existentes por ID en vite.config.ts, mcp-server.ts y devboard-cli.ts sin generar nombres slug duplicados ni borrar el archivo previo.
- [x] #3 Serialización de status estrictamente en minúsculas (draft, doing, review, ready, done, dismissed) mapeando Ideas/Backlog a draft y prohibiendo mayúsculas o 'Ideas' en frontmatter YAML.
- [x] #4 Mapeo de sprint exclusivamente al name legible registrado en sprints.json (activo/planificado), omitiendo el campo si no pertenece a un sprint válido y eliminando creación de sprints espurios como 'backlog-futuro'.
- [x] #5 Preservación estricta del array itemCodes en releases.json en lecturas, escrituras y mutaciones de tareas en vite.config.ts.
- [x] #6 Validación con suite de tests de parser, integración y verificación de coherencia de backlog (npm test, npm run backlog:check).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
