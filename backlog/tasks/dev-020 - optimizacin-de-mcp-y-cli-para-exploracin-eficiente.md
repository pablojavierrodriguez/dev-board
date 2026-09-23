---
id: DEV-020
title: "Optimización de MCP y CLI para exploración eficiente del Backlog por Agentes de IA"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-19 04:25'
labels: []
dependencies: []
priority: high
type: feature
milestone: "v1.2.0"
release: "v1.2.0"
targetRelease: "v1.2.0"
order: 120
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Los agentes de IA suelen recurrir a scripts ad-hoc 'node -e' para filtrar y listar tareas abiertas en consola, arriesgando romper el storage Markdown/JSON y desperdiciando tokens. Esta tarea dota al MCP y al CLI de herramientas ergonómicas de consulta compacta y paginada.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Añadir parámetros 'openOnly' (excluye done/dismissed), 'limit', 'search' y 'format: compact | detailed' en devboard_list_tasks
- [x] #2 Implementar comando CLI nativo (ej: 'npm run devboard:list' o 'npx devboard list --open') para agentes que operan en consola
- [x] #3 Garantizar respuesta token-efficient en formato compacto de 1 línea por ítem tanto para almacenamiento Markdown como JSON
- [x] #4 Actualizar SKILL.md documentando el uso de devboard_list_tasks con filtros compactos y desaconsejando scripts ad-hoc 'node -e'
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En scripts/mcp-server.ts: agregar openOnly, limit, format y search en el schema y handler de devboard_list_tasks.
2. Crear comando CLI scripts/devboard-cli.ts ('npm run devboard:list') para consulta directa desde terminal.
3. Actualizar .agents/skills/devboard/SKILL.md con ejemplos claros de consulta eficiente.
<!-- SECTION:PLAN:END -->
