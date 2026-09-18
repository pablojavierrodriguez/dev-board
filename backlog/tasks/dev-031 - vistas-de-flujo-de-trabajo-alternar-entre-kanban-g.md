---
id: DEV-031
title: "Vistas de Flujo de Trabajo: Alternar entre Kanban Global y Sprint/Release Board Acotado"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 03:41'
labels:
  - kanban
  - scrum
  - workflow
  - views
  - sprint
dependencies: []
priority: high
type: feature
milestone: "0.3.0"
order: "31"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
DevBoard debe responder de forma flexible a los dos paradigmas de trabajo ágil más extendidos:
1. **Kanban Puro (Flujo Continuo):** Visualiza todo el backlog del proyecto activo a lo largo de las columnas, permitiendo gestionar el flujo constante de trabajo continuo sin cortes artificiales.
2. **Scrum / Kanban Acotado:** Cuando el equipo trabaja enfocado en un objetivo acotado (Sprint) o en un paquete de entrega (Release), el tablero Kanban debe restringirse exclusivamente a las tareas comprometidas para ese objetivo.

Actualmente, el componente Kanban renderiza indiscriminadamente todas las tareas del proyecto y la pestaña "Sprint & Priorización" se limita a una lista vertical plana.
Esta tarea introduce la capacidad de alternar el alcance del tablero Kanban entre la visión global del proyecto y un tablero acotado al Sprint o Release seleccionado, incorporando indicadores de progreso hacia el objetivo del ciclo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Incorporar selector de alcance de flujo en el Kanban: opción "Todo el Backlog" (Kanban continuo) y "Sprint / Release Objetivo" (Scrum)
- [x] #2 Permitir seleccionar qué Sprint o Milestone activo visualizar en el modo acotado mediante un selector desplegable
- [x] #3 Filtrar las tarjetas del tablero para mostrar exclusivamente las tareas que coincidan con el `milestone` o `targetSprint` seleccionado
- [x] #4 Mostrar un banner de resumen del ciclo con título del Sprint/Release, contador de tareas completadas y barra de progreso porcentual
- [x] #5 Permitir añadir tareas al sprint activo directamente desde el selector o arrastre sin perder el contexto del proyecto
- [x] #6 Persistir el modo de alcance y el último sprint seleccionado en `localStorage`
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/KanbanBoard.tsx`, añadir estado `kanbanScope` ('all' | 'sprint') y `selectedMilestone`.
2. Extraer la lista única de milestones activos presentes en las tareas del proyecto.
3. Incorporar barra de control en la cabecera del Kanban con selector de modo y dropdown de milestones.
4. Aplicar filtro sobre `items` cuando el alcance sea 'sprint'.
5. Renderizar banner resumen de sprint con métricas `[Terminadas / Total]`.
6. Probar persistencia de selección en navegador.
<!-- SECTION:PLAN:END -->
