---
id: DEV-053
title: "Configuración Visual de Tablero por Drag & Drop en Settings (Arrastre de Estados entre Columnas)"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-23 13:39'
labels:
  - ux
  - settings
  - drag-and-drop
  - kanban
dependencies: []
priority: low
type: ux
milestone: "0.4.0"
sprint: "Sprint 3"
release: "0.4.0"
targetRelease: "0.4.0"
order: "20"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Evolución de la experiencia de usuario en la configuración del tablero en `SettingsView`:
1. **Experiencia Actual:** La asignación de estados a columnas se realiza mediante badges estáticos y selectores desplegables '+ Estado'.
2. **Experiencia por Drag & Drop:** Permitir que los badges de estado sean arrastrables (`draggable`) entre las tarjetas de columnas. El usuario puede tomar un estado (ej. `review`) de una columna y arrastrarlo visualmente hacia otra (ej. de "In Progress" a una columna "Testing"), reasignándolo instantáneamente de manera intuitiva.
3. **Soporte Dual:** Funcionamiento tanto en la pestaña de configuración del Modo Simple (3 columnas) como del Modo Ampliado (5 columnas).
4. **Validaciones:** Prevenir estados huérfanos y asegurar que cada columna conserve un `dropTargetStatus` coherente con sus estados contenidos.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 En SettingsView (pestaña Tablero Kanban), los chips de estados son arrastrables entre columnas
- [x] #2 Indicador visual claro del contenedor destino durante el arrastre (hover highlight)
- [x] #3 Al soltar un estado en otra columna, se actualiza la configuración en memoria y se persiste en .devboard/config.json
- [x] #4 Soporte para reconfigurar tanto columnas en modo Simple como en modo Ampliado
- [x] #5 Validación para garantizar que todos los estados esenciales pertenezcan a al menos una columna
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Implementar eventos nativos de drag & drop (`onDragStart`, `onDragOver`, `onDrop`) en los chips de estado de `SettingsView.tsx`.
2. Actualizar las funciones de mutación de columnas para mover el estado del array origen al array destino.
3. Ajustar automáticamente `dropTargetStatus` si la columna de origen queda sin su estado default.
4. Validar persistencia en `.devboard/config.json`.
<!-- SECTION:PLAN:END -->
