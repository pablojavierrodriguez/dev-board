---
id: DEV-022
title: "Métricas, Estadísticas y Agrupación por Prefijo (devboard_get_stats y CLI --stats)"
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
order: 140
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Provee herramientas nativas para que los agentes y desarrolladores obtengan métricas de salud del backlog y desgloses por tipología de tarea sin necesidad de parsear y agrupar manualmente mediante scripts de consola.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Implementar tool 'devboard_get_stats' en MCP retornando total, abiertos, cerrados, porcentaje completado y distribución por estado y prioridad
- [x] #2 Calcular agrupación y recuento automático por prefijo de código (ej: DOM-P, DOM-BUG, DOM-FEAT, DOM-SPEC)
- [x] #3 Extender 'devboard_list_tasks' para soportar filtros por 'prefix' y lista explícita de 'taskIds'
- [x] #4 Implementar flag '--stats' en CLI ('npm run tasks -- --stats') mostrando un resumen gráfico y métricas en terminal
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Añadir handler y schema de devboard_get_stats en scripts/mcp-server.ts.
2. Añadir soporte para prefix y taskIds en devboard_list_tasks.
3. Incorporar modo --stats en scripts/devboard-cli.ts.
4. Documentar en SKILL.md.
<!-- SECTION:PLAN:END -->
