---
id: DEV-104
title: "Estándar XDG y Home Directory para Registro Multi-Proyecto en CLI"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 15:13'
labels: []
dependencies: []
priority: high
type: feature
sprints:
  - "Sprint 6"
sprint: "Sprint 6"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Migrar la persistencia del registro global de proyectos del Hub desde el árbol de archivos del paquete instalado (PKG_ROOT/data/projects-registry.json) al directorio del usuario (~/.devboard/registry.json), cumpliendo con estándares XDG y FHS para herramientas de CLI open-source.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Persistir registry de proyectos en ~/.devboard/registry.json (o XDG_CONFIG_HOME) en lugar de PKG_ROOT/data/projects-registry.json.
- [x] #2 Fallback y migración transparente de proyectos existentes desde PKG_ROOT/data/projects-registry.json si existen.
- [x] #3 Garantizar que instalaciones globales (npm i -g) o npx devboard no fallen con EACCES por intentar escribir en node_modules.
- [x] #4 Preservar el repositorio de dev-board limpio sin mutaciones de projects-registry.json al gestionar proyectos externos.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar bin/devboard.js, scripts/mcp-server.ts, scripts/devboard-cli.ts y vite.config.ts para resolver la ruta del registro en ~/.devboard/registry.json con fallback al directorio local.
2. Añadir función de migración automática si existe data/projects-registry.json local previo.
3. Asegurar creación recursiva del directorio ~/.devboard con permisos adecuados.
4. Validar ejecución con npm test y backlog:check.
<!-- SECTION:PLAN:END -->
