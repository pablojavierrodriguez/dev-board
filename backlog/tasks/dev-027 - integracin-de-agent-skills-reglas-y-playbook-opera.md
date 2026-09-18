---
id: DEV-027
title: "Integración de Agent Skills, Reglas y Playbook Operativo (m3 y c3admin)"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 06:36'
labels: []
dependencies: []
priority: high
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 100
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transferir y adaptar las mejores skills, reglas y herramientas de automatización de m3 y c3admin hacia dev-board para erradicar ineficiencias de desarrollo, inconsistencias de UX y falta de rigor en QA.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Crear regla estricta de aprobación de Git en .agents/rules/git-approval.md
- [x] #2 Adaptar e incorporar skills operativas en .agents/skills/ (code-level-ux-auditor, rigorous-qa-auditor, worldclass-product-designer, principal-engineer, market-researcher, list-views-filters)
- [x] #3 Crear playbook operativo multi-agente en .agents/TEAM_PLAYBOOK.md con matriz de decision y directrices de subagentes
- [x] #4 Incorporar script scripts/audit-ux-code.cjs y añadir comando npm run audit:ux a package.json
- [x] #5 Validar integridad ejecutando npm run audit:ux, npm run build y npm run backlog:check
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear .agents/rules/git-approval.md
2. Crear las 6 skills en .agents/skills/ adaptadas al stack de DevBoard
3. Crear .agents/TEAM_PLAYBOOK.md
4. Crear scripts/audit-ux-code.cjs y actualizar package.json
5. Ejecutar verificaciones automáticas y tildar criterios de aceptación
<!-- SECTION:PLAN:END -->
