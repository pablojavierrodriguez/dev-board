---
id: DEV-021
title: "Mutaciones Masivas y Actualizaciones por Lote en MCP y CLI (devboard_bulk_update_tasks)"
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
order: 130
sprint: "Sprint 0"
targetSprint: "Sprint 0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permite a los agentes de IA realizar actualizaciones masivas de estado y metadatos sobre decenas de tareas en una única llamada, evitando decenas de llamadas individuales lentas o la necesidad de escribir scripts de consola ad-hoc.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Implementar tool 'devboard_bulk_update_tasks' en MCP para actualizar múltiples tareas por 'taskIds: string[]' o por condición de filtro ('prefix', 'status')
- [x] #2 Permitir mutaciones simultáneas de estado ('status'), milestone, etiquetas ('labels') y notas técnicas
- [x] #3 Incorporar comando por lotes en CLI ('npm run tasks -- --update-status <estado> --ids <id1,id2>' o '--prefix <prefijo>')
- [x] #4 Garantizar consistencia y actualización atómica tanto en almacenamiento Markdown distribuido como en JSON
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Añadir tool devboard_bulk_update_tasks en scripts/mcp-server.ts con soporte para batching por IDs o por prefijo/filtro.
2. Actualizar scripts/devboard-cli.ts para soportar --update-status, --ids y --prefix.
3. Documentar devboard_bulk_update_tasks en .agents/skills/devboard/SKILL.md.
<!-- SECTION:PLAN:END -->
