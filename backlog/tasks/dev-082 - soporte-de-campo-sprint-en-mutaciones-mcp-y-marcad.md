---
id: DEV-082
title: "Soporte de campo sprint en mutaciones MCP y marcado masivo de criterios de aceptación (ACs)"
status: Ready
created_date: '2026-09-24'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: medium
type: feature
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
order: 90
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Requerimiento de usuario originado desde el proyecto consumidor DOM (m3). Disculpas al equipo de DevBoard por cualquier intromisión previa con specs técnicas no solicitadas.

Como consumidores del servidor MCP de DevBoard al gestionar tareas bajo el estándar Backlog.md, encontramos las siguientes oportunidades de mejora para su evaluación:
1. Poder asignar o mover tareas de sprint directamente vía MCP (actualmente `devboard_update_task` y `devboard_bulk_update_tasks` no admiten el campo `sprint`).
2. Permitir marcar todos los criterios de aceptación en una sola llamada (actualmente sólo existe `toggleAcIndex` individual, lo que en tareas con muchos ACs genera lentitud y riesgo de race conditions).
3. Asegurar que el filtro `sprint` en `devboard_list_tasks` restrinja correctamente las tareas devueltas.
4. Robustecer el formateo de frontmatter cuando los títulos incluyen comillas o tags como `<input ...>`.

Queda a total consideración y diseño del equipo de DevBoard.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El servidor MCP permite actualizar el campo sprint en devboard_update_task y devboard_bulk_update_tasks
- [x] #2 Se dispone de un parámetro (ej: checkAllAcs: true) para alternar todos los ACs en una sola operación sin requerir múltiples tool calls secuenciales
- [x] #3 El filtro sprint en devboard_list_tasks filtra adecuadamente por la propiedad sprint del frontmatter
- [x] #4 El serializador de frontmatter YAML maneja defensivamente caracteres especiales y comillas en títulos
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
