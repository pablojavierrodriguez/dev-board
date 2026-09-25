---
id: DEV-102
title: "Actualización integral de documentación y verificación automatizada de coherencia en releases"
status: Ready
created_date: '2026-09-25'
updated_date: '2026-09-25 00:29'
labels: []
dependencies: []
priority: high
type: docs
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Actualización integral de toda la documentación del repositorio dev-board para armonizarla con el estado de v0.5.0 y el Sprint 5 recién completado, e incorporación de salvaguarda automatizada pre-release en verify-backlog-sync.js y reglas de calidad para asegurar que ante cada release la documentación sea auditada y actualizada obligatoriamente.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Actualizar README.md a v0.5.0 (Features Overview, 12 herramientas MCP, 100+ tareas, atajos con Papelera y eliminación de Quick Start duplicado).
- [x] #2 Actualizar docs/ARCHITECTURE.md incorporando TrashView.tsx, ruta trash y registro de persistencia (releases.json, sprints.json, retros/).
- [x] #3 Armonizar docs/AGENTIC_PLAYBOOK.md y .agents/rules/backlog-dogfooding.md con el límite canónico en ready (prohibido done en sprint) y scripts/backlogMdParser.ts.
- [x] #4 Actualizar skills en .agents/skills/ (devboard con 12 tools, code-level-ux-auditor con 10 firmas, principal-engineer, rigorous-qa-auditor y list-views-filters).
- [x] #5 Extender scripts/verify-backlog-sync.js con auditoría automática de coherencia de documentación y formalizar el guardrail pre-release en AGENTS.md y QA auditor.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
