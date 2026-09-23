---
id: DEV-016
title: "Empaquetado y distribución simplificada del servidor MCP (npx devboard-mcp)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-19 04:25'
labels: []
dependencies: []
priority: high
type: feature
milestone: "v1.3.0"
release: "v1.3.0"
targetRelease: "v1.3.0"
order: 80
sprint: "Sprint 0"
targetSprint: "Sprint 0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Empaquetar el servidor MCP para eliminar la necesidad de configurar rutas locales absolutas y flags experimentales en los archivos mcp_config.json de los IDEs, permitiendo integración de agentes con un único comando agnóstico.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Empaquetar scripts/mcp-server.ts a un ejecutable autónomo en JavaScript (dist/mcp-server.cjs o bin/mcp.js) sin requerir flags experimentales de node
- [x] #2 Habilitar ejecución directa vía npx devboard-mcp sobre stdio para integración transparente en IDEs (Antigravity, Cursor, Claude Code)
- [x] #3 Detectar automáticamente el repositorio actual o aceptar argumento --repo / -p con la ruta del proyecto
- [x] #4 Actualizar documentación y Skill de devboard para reflejar la configuración simplificada de una sola línea
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Añadir script de build para compilar mcp-server.ts con esbuild/tsup a bin/devboard-mcp.js.
2. Añadir soporte para flag --repo o autodetección de cwd.
3. Actualizar SKILL.md y README.md con la nueva configuración.
<!-- SECTION:PLAN:END -->
