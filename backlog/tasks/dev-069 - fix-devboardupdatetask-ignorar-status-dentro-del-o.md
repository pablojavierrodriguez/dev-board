---
id: DEV-069
title: "Fix: devboard_update_task — Ignorar status dentro del objeto updates silenciosamente"
status: Done
created_date: '2026-09-19'
updated_date: '2026-09-24 12:14'
labels: []
dependencies: []
priority: high
type: bug
milestone: "Sprint 4"
sprints:
  - "Sprint 4"
releases:
  - "Sprint 4"
sprint: "Sprint 4"
targetSprint: "Sprint 4"
order: 70
release: "Sprint 4"
targetRelease: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cuando se pasa `{ "taskId": "DEV-001", "updates": { "status": "ready" } }`, el servidor MCP ignora el campo `status` dentro de `updates` sin retornar error. El task mantiene su estado anterior.

Esto genera un bug silencioso muy difícil de detectar: el agente cree que actualizó el status, pero el archivo Markdown no cambia.

**Fix esperado:** El servidor MCP debe aceptar `status` tanto como campo top-level como dentro de `updates`, O retornar un error claro indicando que `status` no es válido dentro de `updates` para evitar la confusión.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 devboard_update_task acepta status dentro de updates Y lo aplica correctamente
- [x] #2 O bien: devboard_update_task retorna un warning/error cuando se detecta status dentro de updates (para que el agente pueda corregirlo)
- [x] #3 Documentar claramente en el schema MCP el campo correcto para cambiar status
- [x] #4 Añadir test unitario que valide ambas formas de pasar el status
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
