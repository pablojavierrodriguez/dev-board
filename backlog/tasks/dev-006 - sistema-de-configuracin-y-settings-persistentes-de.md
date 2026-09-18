---
id: DEV-006
title: "Sistema de Configuración y Settings Persistentes (.devboard/config.json y UI)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-18 03:41'
labels:
  - settings
  - configuration
  - persistence
  - ui
dependencies: []
priority: high
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
order: "35"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Crear un sistema integral de configuración persistente para que el usuario pueda personalizar su experiencia en DevBoard.
Permite definir qué opciones visuales y funcionales están activas (densidad visual, tema por defecto, visibilidad de columna Ideas, WIP limits, columnas personalizadas).
La configuración debe guardarse en el repositorio local en un archivo JSON predeterminado (`.devboard/config.json`) con valores por defecto bien estructurados.
El usuario debe tener la flexibilidad de modificar las opciones tanto editando directamente el archivo JSON como desde una interfaz gráfica de Settings accesible desde la UI.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Diseñar el esquema y valores predeterminados para el archivo local `.devboard/config.json`
- [x] #2 Implementar endpoints `GET /api/settings` y `POST /api/settings` en la API local de Vite
- [x] #3 Crear componente modal `SettingsModal.tsx` accesible desde un botón de engranaje en el Header
- [x] #4 Implementar hot-reload o sincronización cuando el usuario modifica `.devboard/config.json` directamente en el editor
- [x] #5 Permitir alternar preferencias visuales (modo compacto, tema predeterminado, animaciones) y funcionales desde la UI
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Definir tipos en `src/types.ts`: `DevBoardConfig` con opciones de interfaz, kanban y persistencia.
2. Añadir endpoints en `vite.config.ts` para leer y guardar `.devboard/config.json` (con fallback si no existe).
3. Diseñar `SettingsModal.tsx` con tabs: General, Kanban, Visual & Editor.
4. Conectar botón de Settings en `Header.tsx`.
5. Probar persistencia dual (edición desde UI y edición manual en disco).
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Requerimiento originado del feedback de personalización de experiencia de usuario y persistencia git-friendly.
<!-- SECTION:NOTES:END -->
