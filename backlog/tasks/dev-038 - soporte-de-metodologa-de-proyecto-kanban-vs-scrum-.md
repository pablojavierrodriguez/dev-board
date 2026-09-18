---
id: DEV-038
title: "Soporte de Metodología de Proyecto (Kanban vs Scrum) en Settings para Liberar la Interfaz"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 00:38'
labels:
  - ux
  - settings
  - kanban
  - scrum
dependencies:
  - DEV-037
priority: high
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
targetSprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 22
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Diferenciación conceptual y visual estricta entre metodologías de proyecto (Kanban Continuo, Scrum Puro y Scrumban Híbrido), con ajuste de vistas por defecto y libertad de personalización manual para el usuario:
1. **Scrum Puro**:
   - Por definición, el tablero de flujo continuo es Kanban. En Scrum Puro NO hay vista de tablero por defecto (`enabledTabs.kanban = false`, `defaultView = 'sprint'`).
   - El centro de operaciones es la vista de Sprints & Priorización / Backlog.
   - El logo de DevBoard y navegación redirigen a 'Sprint & Priorización'.
2. **Scrumban (Híbrido)**:
   - Fusión de Scrum y Kanban: El Tablero es **únicamente del Sprint Goal / Sprint Activo** en curso (no de todo el backlog).
   - Identificación visual clara: `Sprint Board (Scrumban)` con selector de Sprint Goal, progreso de la iteración y empty state si el sprint no tiene tareas.
   - La priorización y grooming general se realiza en 'Sprint & Priorización'.
3. **Kanban Continuo**:
   - Tablero continuo de todo el backlog sin iteraciones.
   - Oculta pestaña de Sprints y campos de Sprint en cards.
4. **Personalización Manual**:
   - El usuario puede cambiar la metodología y luego conmutar manualmente cualquier pestaña (`enabledTabs`) según su preferencia.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En Scrum Puro, deshabilitar la vista Tablero por defecto y establecer 'Sprint & Priorización' como vista principal
- [x] #2 En Scrumban, el Tablero debe ser exclusivamente del Sprint Goal / Sprint Activo, sin conmutador de 'Todo el Backlog'
- [x] #3 En Kanban Continuo, el Tablero muestra todo el backlog sin referencias a sprints y oculta la pestaña de Sprints
- [x] #4 En SettingsView, permitir seleccionar la metodología aplicando presets inteligentes pero permitiendo al usuario activar/desactivar pestañas manualmente
- [x] #5 En Header, navegación móvil y redirección inicial, sincronizar la visibilidad de pestañas y destino del logo según la configuración
- [x] #6 Validar tipado y build con `npm run build` y auditar visualmente con subagente de navegador
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. `src/types.ts`: Garantizar coherencia en `ProjectMethodology` y `DevBoardConfig`.
2. `src/components/SettingsView.tsx`:
   - Configurar presets de `enabledTabs` y `defaultView` para cada metodología:
     - `kanban`: `{ kanban: true, sprint: false, release: true }`, defaultView `kanban`.
     - `scrum`: `{ kanban: false, sprint: true, release: true }`, defaultView `sprint`.
     - `scrumban`: `{ kanban: true, sprint: true, release: true }`, defaultView `kanban`.
   - Permitir toggles manuales sin sobrescritura forzada.
3. `src/components/Header.tsx` & `src/App.tsx`:
   - Ocultar o mostrar pestañas de Tablero y Sprint evaluando `isTabEnabled`.
   - Clic en el logo redirige a `config?.defaultView || (config?.methodology === 'scrum' ? 'sprint' : 'kanban')`.
   - Enrutamiento suave en `App.tsx`: si la pestaña activa queda deshabilitada, conmutar a la vista disponible.
   - Barra de navegación móvil sincronizada con las pestañas activas.
4. `src/components/KanbanBoard.tsx`:
   - Si `methodology === 'scrumban'` (o en Sprint Board): el tablero es exclusivamente del Sprint Goal seleccionado. Banner de progreso destacado y empty state guiado a 'Sprint & Priorización' si no hay tareas en el sprint.
   - Si `methodology === 'kanban'`: flujo continuo de todo el backlog.
5. Verificación con `npm run build`, auditoría E2E en browser y `npm run backlog:check`.
<!-- SECTION:PLAN:END -->
