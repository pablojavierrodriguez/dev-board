---
id: DEV-058
title: "Política de Visualización Limpia en Tablero: Ocultamiento por Defecto de Cards en 'Done' y Toggle de Histórico"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 14:57'
labels:
  - ux
  - kanban
  - performance
dependencies: []
priority: medium
type: ux
milestone: "0.3.2"
sprint: "Sprint 2"
release: "0.3.2"
targetRelease: "0.3.2"
order: 50
targetSprint: "Sprint 2"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Optimización de la visualización de tareas finalizadas en el tablero Kanban (especialmente en la vista simplificada y en el tablero de sprint goal):
1. **Problema de Acumulación:** En tableros ágiles, acumular decenas de tarjetas históricas cerradas en la columna `Done` no aporta valor operativo al día a día del equipo y satura la pantalla, provocando desorden y lentitud de renderizado.
2. **Ocultamiento por Defecto:**
   - En la vista simplificada y tableros acotados a sprint, ocultar por defecto las tarjetas en `done` que pertenezcan a iteraciones pasadas o finalizadas hace más de un intervalo configurable.
   - Mostrar un indicador limpio y sutil al tope de la columna Done con el conteo de tarjetas históricas archivadas (ej: "+18 tareas completadas anteriormente").
3. **Toggle Bajo Demanda (Estilo Ideas):** Incorporar un botón o selector interactivo (similar al de Ideas) para mostrar u ocultar el histórico de Done cuando el usuario explícitamente desee auditarlo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En vista simplificada, no acumular tareas finalizadas históricas en la columna Done por defecto
- [x] #2 Indicador visual sutil al tope de la columna con el conteo de tareas completadas ocultas
- [x] #3 Botón interactivo o toggle para revelar el histórico completo de Done bajo demanda
- [x] #4 Persistencia de la preferencia de visualización en Settings (.devboard/config.json)
- [x] #5 Reducción comprobable del número de nodos DOM y mejora en fluidez de render
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/KanbanBoard.tsx`, implementar filtro inteligente para la columna `col-done` que filtre tareas que no pertenezcan al sprint activo o sean antiguas cuando `showDoneHistory === false`.
2. Añadir botón toggle en la cabecera de la columna o barra de controles.
3. Extender `KanbanSettings` con `showDoneHistoryByDefault?: boolean`.
4. Verificar con tests de render y medición de nodos DOM.
<!-- SECTION:PLAN:END -->
