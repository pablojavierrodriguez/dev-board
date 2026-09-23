---
id: DEV-051
title: "Configuración y Parametrización de Columnas Visibles en la Vista de Backlog"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-23 13:39'
labels:
  - ux
  - backlog
  - customization
dependencies: []
priority: low
type: ux
milestone: "0.4.0"
sprint: "Sprint 3"
release: "0.4.0"
targetRelease: "0.4.0"
order: "19"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir a los usuarios personalizar qué columnas de información se muestran en la tabla de la vista de Backlog:
1. **Selector de Columnas:** Añadir un menú desplegable/popover "Columnas" en la barra superior de la vista de Backlog con checkboxes para activar u ocultar campos.
2. **Campos Parametrizables:** Posibilidad de alternar:
   - Columnas base: Prioridad, Código, Título, Estado, Tipo.
   - Columnas opcionales: Módulo, Archivo Impactado, Épica/Padre, Dependencias, Release/Versión, Sprints, Fecha de Creación.
3. **Persistencia Local:** Guardar las preferencias de columnas visibles en la configuración local del proyecto (`.devboard/config.json`) para que se mantengan entre sesiones y recargas.
4. **Ergonomía:** Asegurar layout elástico sin scrolls horizontales rotos al alternar columnas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Popover interactivo 'Columnas' en la barra de herramientas de la vista Backlog
- [x] #2 Capacidad de conmutar visibilidad de columnas opcionales (módulo, parent, release, dependencias, etc.)
- [x] #3 Las columnas obligatorias (código, título) permanecen ancladas para preservar usabilidad mínima
- [x] #4 Persistencia de las columnas activas en .devboard/config.json
- [x] #5 La tabla adapta su distribución de anchos de celda de forma fluida sin romper el layout
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender `DevBoardConfig` con `backlogVisibleColumns?: string[]`.
2. Crear componente `ColumnVisibilityPopover` en `src/components/`.
3. Conectar la visibilidad condicional de `<th>` y `<td>` en `SprintView.tsx`.
4. Persistir selecciones mediante `updateProjectConfig`.
<!-- SECTION:PLAN:END -->
