---
id: DEV-073
title: "Documentación técnica de CodeGraph MCP y refinamiento de skills de ingeniería"
status: Done
created_date: '2026-09-23'
updated_date: '2026-09-23 15:57'
labels: []
dependencies: []
priority: medium
type: tech_debt
milestone: "Sprint 4"
sprint: "Sprint 4"
targetSprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refinar la documentación y skills de DevBoard incorporando las herramientas de CodeGraph MCP, sus comandos de consulta semántica, el gotcha de activación del Language Server de TypeScript y la estrategia de fallback con docs/ARCHITECTURE.md.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Documentar el servidor CodeGraph MCP y su gotcha de activación en AGENTS.md
- [x] #2 Actualizar la regla .agents/rules/codebase-navigation.md con el protocolo de fallback inteligente
- [x] #3 Actualizar el skill .agents/skills/principal-engineer/SKILL.md con las directivas de análisis semántico e impacto antes de refactors
- [x] #4 Validar compilación tsc y sincronización de backlog
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Actualizar AGENTS.md con la sección de CodeGraph MCP y sus gotchas.\n2. Actualizar .agents/rules/codebase-navigation.md con la estrategia de 2 pasos (CodeGraph -> ARCHITECTURE.md + grep focalizado).\n3. Actualizar .agents/skills/principal-engineer/SKILL.md incorporando el análisis semántico de impacto previo a cambios.\n4. Validar tsc y sincronizar backlog.
<!-- SECTION:PLAN:END -->
