---
id: DEV-039
title: "Sincronización no invasiva de árbol Git con estados de backlog y releases"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-19 04:25'
labels: []
dependencies: []
priority: low
type: feature
order: 190
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Inspección de solo lectura del árbol Git local (commits, ramas, tags) para correlacionar tareas y releases sin alterar el repositorio ni requerir permisos especiales. Modo sugerencia asistida.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Lector pasivo de Git usando child_process.execFile con sanitización estricta y timeout
- [ ] #2 Mapeo de tags de release semánticos a entidades Release de DevBoard
- [ ] #3 Detección de commits asociados a tareas mediante regex sobre mensajes de commit
- [ ] #4 Indicador de estado Git no invasivo en la UI (asistente de sugerencias, sin mutación forzada)
- [ ] #5 Garantía estricta de cero comandos de escritura de Git en cumplimiento con .agents/rules/git-approval.md
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
