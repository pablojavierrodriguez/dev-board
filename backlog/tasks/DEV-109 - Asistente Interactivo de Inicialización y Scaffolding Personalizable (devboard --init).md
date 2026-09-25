---
id: DEV-109
title: "Asistente Interactivo de Inicialización y Scaffolding Personalizable (devboard --init)"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 15:46'
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
Implementar un asistente interactivo y personalizable en 'devboard --init' (con soporte interactivo mediante readline nativo y flags no interactivas --yes / --defaults). El asistente permite al usuario elegir: (1) Modo de operación: Single Project (autocontenido y aislado) o Multi-Project (registrado en el Hub global ~/.devboard/registry.json), (2) Inclusión de la skill de agente (.agents/skills/devboard/SKILL.md), (3) Inclusión de reglas de gobernanza AGENTS.md, (4) Inclusión de scripts en package.json ('board', 'mcp'), (5) Reglas preventivas en .gitignore. Todo el proceso debe ser idempotente, no destructivo y permitir re-ejecución para modificar preferencias en el mismo dispositivo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Asistente interactivo en 'devboard --init' con preguntas claras (modo single vs hub, skills, AGENTS.md, package.json scripts, .gitignore) y flag no interactiva '--yes' / '-y'.
- [x] #2 Soporte de selección de modo: en single project mode no registra en el Hub y configura .devboard/config.json con 'mode: single'; en multi project mode registra en ~/.devboard/registry.json.
- [x] #3 Scaffolding opcional y limpio de '.agents/skills/devboard/SKILL.md' con la documentación canónica de herramientas MCP y mejores prácticas de agente.
- [x] #4 Scaffolding opcional de 'AGENTS.md' con reglas de gobernanza adaptadas para el proyecto anfitrión.
- [x] #5 Configuración opcional de scripts en package.json ('board': 'devboard', 'mcp': 'devboard-mcp') e inclusión defensiva de reglas en .gitignore sin duplicados.
- [x] #6 Idempotencia y no destructividad: si el proyecto ya fue inicializado, permite cambiar opciones sin alterar ni borrar tareas existentes en backlog/tasks/.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear módulo scripts/initScaffold.js con prompts nativos (readline/promises) y resolución no interactiva si se pasa -y/--yes o flags específicas (--single/--hub, --skill, --agents, etc.).
2. Incorporar templates canónicos embebidos para SKILL.md, AGENTS.md, .gitignore y scripts de package.json.
3. Integrar initScaffold en bin/devboard.js sustituyendo el bloque inicial rígido.
4. Añadir tests de scaffolding interactivo y no interactivo en scripts/verify-integration.js.
5. Validar con tsc, npm test y backlog:check.
<!-- SECTION:PLAN:END -->
