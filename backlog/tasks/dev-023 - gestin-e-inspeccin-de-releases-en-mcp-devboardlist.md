---
id: DEV-023
title: "Gestión e Inspección de Releases en MCP (devboard_list_releases)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-19 04:25'
labels: []
dependencies: []
priority: medium
type: feature
milestone: "v1.3.0"
release: "v1.3.0"
targetRelease: "v1.3.0"
order: 150
sprint: "Sprint 0"
targetSprint: "Sprint 0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir a los agentes de IA consultar releases y contrastar tareas terminadas contra versiones publicadas de forma nativa a través del protocolo MCP.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Implementar tool 'devboard_list_releases' en MCP para consultar versiones publicadas, fechas y notas de versión estructuradas
- [x] #2 Permitir consultar tareas asociadas a una versión específica o release planificado
- [x] #3 Documentar devboard_list_releases en SKILL.md para permitir contraste directo con release notes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Añadir tool devboard_list_releases en scripts/mcp-server.ts con lectura de releases.json y fallback a docs/RELEASE_NOTES.md.
2. Añadir documentación en SKILL.md.
<!-- SECTION:PLAN:END -->
