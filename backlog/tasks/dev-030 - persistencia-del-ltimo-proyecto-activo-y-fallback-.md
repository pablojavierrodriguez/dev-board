---
id: DEV-030
title: "Persistencia del Último Proyecto Activo y Fallback Seguro"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 06:36'
labels:
  - ux
  - state
  - persistence
  - projects
dependencies: []
priority: medium
type: bug
milestone: "0.3.0"
sprint: "Sprint 1"
order: 110
release: "0.3.0"
targetRelease: "0.3.0"
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al iniciar o recargar la aplicación en el navegador, DevBoard seleccionaba por defecto el proyecto inicial del registro o el repositorio legado 'dom', ignorando en qué proyecto estuvo trabajando el usuario por última vez.
Dado que el proyecto es el filtro de contexto por excelencia en DevBoard, la interfaz debe recordar el último proyecto activo seleccionado para que el usuario mantenga su contexto de trabajo entre recargas y sesiones.
Se debe almacenar la preferencia en `localStorage` y sincronizarla con `projects-registry.json` mediante la API. Si el proyecto guardado fue desvinculado o su ruta ya no existe, el sistema debe aplicar un fallback seguro al primer proyecto válido disponible sin provocar estados inconsistentes ni fallos de renderizado.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Guardar el último `projectId` seleccionado en `localStorage` ('devboard_active_project_id') ante cada cambio en el selector de proyectos
- [x] #2 Restaurar automáticamente el último proyecto activo al cargar o recargar la aplicación en `App.tsx`
- [x] #3 Validar existencia del proyecto: aplicar fallback seguro al primer proyecto disponible si el ID guardado fue eliminado o no existe
- [x] #4 Sincronizar el campo `activeProjectId` en `data/projects-registry.json` a través del endpoint de selección de proyectos
- [x] #5 Garantizar que los componentes de navegación (Header, Kanban, Sprint, Releases) rendericen directamente con el proyecto restaurado sin parpadeos
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/App.tsx`, inicializar `selectedProjectId` leyendo de `localStorage.getItem('devboard_active_project_id')`.
2. Añadir validación en el efecto de carga de proyectos: si `selectedProjectId` no está en la lista de IDs, seleccionar `projects[0]?.id`.
3. Actualizar `localStorage` y llamar a `api.setActiveProject(id)` al cambiar de proyecto en `Header.tsx`.
4. Verificar persistencia recargando el navegador y probando cambios entre proyectos.
<!-- SECTION:PLAN:END -->
