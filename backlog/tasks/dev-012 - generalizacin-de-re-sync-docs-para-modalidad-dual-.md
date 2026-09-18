---
id: DEV-012
title: "Generalización de Re-sync Docs para Modalidad Dual (JSON y Backlog.md)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-18 03:41'
labels:
  - sync
  - api
  - backlog-md
  - architecture
dependencies: []
priority: medium
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
order: "41"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Generalizar la funcionalidad de sincronización y reimportación de documentación ("Re-sync /docs") para que no dependa exclusivamente del repositorio legado `dom` (`m3/docs`) ni del formato JSON único.
Actualmente:
- El endpoint `POST /api/import` en `vite.config.ts` busca hardcodeado el proyecto con ID `dom` y ejecuta `runMigration(m3/docs, ...backlog.json)`.
- En proyectos con almacenamiento `backlog-md` (como el propio DevBoard) o en cualquier proyecto nuevo, presionar el botón "Re-sync /docs" falla o afecta al proyecto equivocado.
Se debe contextualizar la sincronización:
1. Permitir que cada proyecto configure opcionalmente su ruta de documentación o fuente de importación.
2. Soportar la sincronización tanto hacia archivos `backlog/tasks/*.md` individuales (`backlog-md`) como hacia `.devboard/backlog.json` (`json`).
3. Ocultar o deshabilitar elegantemente el botón en el Header si el proyecto activo no tiene configurada una carpeta de documentación externa para sincronizar.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Parametrizar el endpoint `POST /api/import` para recibir `projectId` del proyecto activo
- [x] #2 Implementar lógica de importación hacia archivos Markdown individuales para proyectos con `storageType: 'backlog-md'`
- [x] #3 Ocultar o desactivar el botón "Re-sync /docs" en `Header.tsx` si el proyecto seleccionado no tiene docs vinculados
- [x] #4 Proporcionar retroalimentación visual al usuario (toast o banner) indicando qué proyecto se sincronizó y cuántas tareas se actualizaron
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar `POST /api/import` en `vite.config.ts` para aceptar `{ projectId }` en el body.
2. Detectar si el proyecto es `backlog-md` o `json` y ejecutar la estrategia de sincronización correspondiente.
3. En `Header.tsx`, condicionar la visibilidad o habilitación del botón a la configuración del proyecto activo.
4. Actualizar llamadas en `App.tsx` y `api.ts`.
<!-- SECTION:PLAN:END -->
