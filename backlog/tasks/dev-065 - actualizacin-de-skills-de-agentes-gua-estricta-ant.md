---
id: DEV-065
title: "Actualización de Skills de Agentes: Guía Estricta Anti-Scripts de Terminal y Ciclo de Vida Unreleased vs Released"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 14:57'
labels:
  - agent-skills
  - playbook
  - best-practices
dependencies:
  - DEV-064
priority: medium
type: feature
milestone: "0.3.1"
sprint: "Sprint 2"
release: "0.3.1"
targetRelease: "0.3.1"
order: 10
targetSprint: "Sprint 2"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Actualización y enriquecimiento de las Skills del repositorio (`.agents/skills/devboard`, `.agents/skills/rigorous-qa-auditor`, `AGENTS.md`):
1. **Regla Anti-Scripts Sueltos:** Establecer como principio fundamental que los agentes de IA NO deben ejecutar scripts ad-hoc de Node (`node -e ...`) ni comandos bash destructivos (`mv`, `rm` sobre el backlog) cuando operan en DevBoard. Si una operación falta, debe usarse o proponerse una herramienta MCP.
2. **Ciclo de Vida de Releases:** Documentar la distinción canónica entre `unreleased` (paquete activo en desarrollo, mutable, changelog vivo) y `released` (histórico inmutable en producción con `releasedAt`).
3. **Auditoría de Identificadores:** Instrucciones para que el auditor de QA verifique la integridad de prefijos (`DEV-XXX`), evitando duplicidades o formatos corruptos.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Actualizar .agents/skills/devboard/SKILL.md con las reglas anti-scripts y el flujo unreleased vs released
- [x] #2 Actualizar .agents/skills/rigorous-qa-auditor/SKILL.md con guardrails de integridad de IDs
- [x] #3 Reflejar las directivas clave en AGENTS.md
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Editar .agents/skills/devboard/SKILL.md.
2. Editar .agents/skills/rigorous-qa-auditor/SKILL.md.
3. Actualizar AGENTS.md con el guardrail anti-scripts y de releases.
<!-- SECTION:PLAN:END -->
