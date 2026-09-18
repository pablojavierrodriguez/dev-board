---
id: DEV-055
title: "Ciclo de Vida Integral de Sprints: Objetivo, Fechas con Presets, Estados y Autofiltrado"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 00:07'
labels:
  - sprint
  - scrum
  - lifecycle
dependencies: []
priority: high
type: feature
milestone: "0.4.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Formalización del ciclo de vida y metadatos de los Sprints como entidad ágil de primera clase:
1. **Metadatos Enriquecidos:** Cada Sprint debe contar con:
   - Nombre o identificador (ej: "Sprint 1", "Sprint 2").
   - Descripción / Objetivo del Sprint (Sprint Goal, notas de alcance y acuerdos de la iteración).
   - Fechas de Inicio y Fin con presets rápidos de cálculo automático:
     - 1 semana
     - 2 semanas (estándar común)
     - 3 semanas
     - 4 semanas
     - Personalizado (fechas manuales).
2. **Ciclo de Vida (Estados):** Un sprint transiciona por los estados `planned` (planificado), `active` (en curso) y `completed` (finalizado).
   - Botón "Iniciar Sprint" (con restricción estricta de máximo 1 sprint activo por proyecto).
   - Botón "Completar Sprint" con resumen de cierre.
3. **Autofiltrado en Sprint Board (Scrumban):** Al conmutar a la vista de Tablero de Sprint, el tablero autofiltra su contenido exclusivamente a las tarjetas dentro del alcance del sprint activo.
4. **Orden Cronológico:** Los agrupadores de sprint deben mostrarse predeterminadamente ordenados del más viejo al más nuevo, finalizando siempre en el contenedor "Backlog".
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Entidad Sprint estructurada con id, nombre, objetivo/descripción, fechas inicio/fin y estado (planned, active, completed)
- [ ] #2 Presets de duración en formulario de sprint (1, 2, 3, 4 semanas y custom) que calculan automáticamente la fecha de fin
- [ ] #3 Acciones de 'Iniciar Sprint' (máximo 1 activo a la vez) y 'Completar Sprint'
- [ ] #4 En modo Scrumban, el Tablero de Sprint se autofiltra automáticamente al Sprint Activo
- [ ] #5 En la vista de Sprints y Priorización, los sprints se ordenan cronológicamente del más viejo al más nuevo, con 'Backlog' al final
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender `src/types.ts` con interfaz formal `Sprint` y colección `sprints` en `BoardData` / `.devboard/config.json`.
2. Crear modal/popover para creación y edición de Sprints con selectores de presets.
3. Implementar lógica de activación y cierre de sprints.
4. Conectar autofiltrado en `KanbanBoard.tsx` y orden cronológico en `SprintView.tsx`.
<!-- SECTION:PLAN:END -->
