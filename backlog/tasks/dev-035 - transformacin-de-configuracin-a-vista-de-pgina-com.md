---
id: DEV-035
title: "Transformación de Configuración a Vista de Página Completa (SettingsView)"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 06:36'
labels:
  - ux
  - architecture
  - settings
dependencies:
  - DEV-033
  - DEV-034
priority: urgent
type: ux
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 50
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Reemplazar el modal comprimido de configuración (`SettingsModal.tsx`) por una vista de página completa (`SettingsView.tsx`):
- El crecimiento de opciones (vistas por defecto, pestañas del header, límites WIP de columnas, importación/exportación, apariencia, editor de configuración JSON) desbordaba el tamaño de un modal emergente.
- La nueva vista de página completa adopta un patrón maestro-detalle estándar de herramientas de clase mundial (Linear / GitHub Settings): sidebar lateral de categorías, panel amplio de configuración, botón de retorno ágil al tablero y barra de guardado con atajo ⌘S.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Crear componente SettingsView.tsx con layout maestro-detalle (sidebar lateral de categorías + panel amplio de contenido)
- [x] #2 Migrar e integrar todas las secciones: Flujo & Vistas, Tablero Kanban, Apariencia, Datos & Herramientas, y Avanzado (JSON)
- [x] #3 Integrar navegación a Settings en App.tsx como pestaña/vista completa ('settings') con botón de retorno al Tablero
- [x] #4 Actualizar el botón de Settings en Header.tsx para alternar la vista completa y reflejar estado activo
- [x] #5 Validar compilación con `npm run build` y sincronización con `npm run backlog:check`
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Tipos (`src/types.ts`):
   - Definir `export type ActiveTab = 'kanban' | 'sprint' | 'release' | 'archive' | 'settings';`
   - Ampliar `defaultView` en `DevBoardConfig` para soportar `'settings'`.
2. Componente `src/components/SettingsView.tsx`:
   - Construir vista de página completa con Sidebar lateral y panel principal.
   - Implementar las 5 categorías con diseño espacioso y responsive.
   - Header con botón de volver, estado de cambios y botón de guardar con atajo ⌘S.
3. Integración en `src/App.tsx`:
   - Reemplazar `isSettingsModalOpen` por la vista `activeTab === 'settings'`.
   - Ocultar FilterBar cuando activeTab sea 'settings'.
4. Header (`src/components/Header.tsx`):
   - Conectar el botón de Settings al flujo de pestañas principales con estilo activo cuando `activeTab === 'settings'`.
5. Verificación:
   - `npx tsc --noEmit` y `npm run build`.
   - Validación visual interactiva con `browser_subagent`.
   - Sincronización del backlog con `npm run backlog:sync`.
<!-- SECTION:PLAN:END -->
