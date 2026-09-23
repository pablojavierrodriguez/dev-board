---
id: DEV-004
title: "Servidor MCP y Skills para Agentes de IA"
status: Done
assignee:
  - "Antigravity"
created_date: '2026-09-16'
updated_date: '2026-09-19 04:25'
labels:
  - mcp
  - agents
  - ai
dependencies: []
priority: high
type: feature
milestone: "v1.1.0"
order: 230
release: "v1.1.0"
targetRelease: "v1.1.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Construir un servidor MCP (Model Context Protocol) sobre stdio y una Skill documental para que
agentes de IA y LLMs (Claude Code, Cursor, Antigravity, Gemini) puedan inspeccionar, crear,
actualizar y completar tareas del backlog de forma autónoma y sin fricciones.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Crear script `scripts/mcp-server.ts` con protocolo JSON-RPC 2.0 stdio
- [x] #2 Implementar tools MCP: list_projects, list_tasks, get_task, create_task, update_task, export_backlog
- [x] #3 Añadir comando npm `npm run mcp` en package.json
- [x] #4 Crear `.agents/skills/devboard/SKILL.md` con documentación y guía de flujo para agentes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Implementar `scripts/mcp-server.ts` leyendo del registry y usando `backlogMdParser`.
2. Probar interactividad con mensajes JSON-RPC simulados en CLI.
3. Crear la skill en `.agents/skills/devboard/SKILL.md`.
<!-- SECTION:PLAN:END -->
