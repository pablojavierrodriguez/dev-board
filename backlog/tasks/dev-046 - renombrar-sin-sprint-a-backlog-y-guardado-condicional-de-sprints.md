---
id: DEV-046
title: "Renombrar Agrupador 'Sin Sprint' a 'Backlog' y Guardado Condicional al Mover Tarjetas entre Agrupadores"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 01:25'
labels:
  - ux
  - sprint
  - backlog
dependencies: []
priority: medium
type: ux
milestone: "0.3.0"
sprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajustes conceptuales y de eficiencia en la vista de Sprints y Priorización:
1. **Renombrar a 'Backlog':** El contenedor de tareas no asignadas a ninguna iteración debe llamarse **"Backlog"** (en lugar de "Sin Sprint" o "Sin Asignar"), alineándose con los estándares metodológicos ágiles y Scrum.
2. **Guardado Condicional Estricto (Dirty Check en D&D):** Al arrastrar y soltar una tarjeta dentro de un sprint o dentro del contenedor Backlog, comprobar previamente si el valor de asignación de la tarjeta cambió (`item.sprint !== targetSprintVal`). Si la tarjeta se suelta dentro de su mismo contenedor actual, no disparar mutaciones a la API ni alterar los archivos Markdown en disco.
3. **Posicionamiento:** El contenedor "Backlog" debe situarse siempre como el último bloque en la vista agrupada de Sprints.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En SprintView.tsx, renombrar el grupo de tarjetas no asignadas a 'Backlog' con icono representativo
- [x] #2 Al soltar una tarjeta en un contenedor, comprobar si el sprint destino es idéntico al actual y abortar la mutación si no hay cambios
- [x] #3 Asegurar que el contenedor Backlog se ubica de forma consistente como el último agrupador en la vista
- [x] #4 En los selectores rápidos de la tabla de SprintView, la opción vacía muestra 'Backlog' en lugar de 'Sin Sprint'
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/SprintView.tsx`, reemplazar los textos "Sin Sprint" / "Sin Asignar" por "Backlog".
2. En los handlers `handleDrop` y de reasignación rápida, añadir guardrails para evitar mutaciones redundantes.
3. Verificar la función de ordenamiento de grupos para que "Backlog" siempre quede al fondo.
<!-- SECTION:PLAN:END -->
