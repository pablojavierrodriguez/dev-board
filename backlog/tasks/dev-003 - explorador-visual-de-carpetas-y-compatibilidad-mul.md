---
id: DEV-003
title: "Explorador visual de carpetas y compatibilidad multiplataforma"
status: Done
assignee:
  - "Antigravity"
created_date: '2026-09-16'
updated_date: '2026-09-19 04:25'
labels:
  - filesystem
  - cross-platform
  - ui
dependencies: []
priority: high
type: feature
milestone: "v1.1.0"
release: "v1.1.0"
targetRelease: "v1.1.0"
order: 50
sprint: "Sprint 0"
targetSprint: "Sprint 0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir a los desarrolladores explorar el sistema de archivos local de su máquina visualmente
sin tener que escribir manualmente la ruta del repositorio. Asegurar compatibilidad multiplataforma
con Windows (`\`), macOS (`/`) y Linux (`/`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Implementar endpoint `GET /api/fs/browse` con normalización multiplataforma
- [x] #2 Crear componente `FolderPickerModal.tsx` con navegación jerárquica y badges Git/Backlog.md
- [x] #3 Integrar botón "Explorar" en `ProjectModal.tsx` con autocompletado y detección de motor
- [x] #4 Detectar si la carpeta seleccionada ya es un repositorio Git o tiene tareas Backlog.md
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Endpoint `GET /api/fs/browse` en `vite.config.ts`.
2. Componente modal `FolderPickerModal.tsx`.
3. Conexión en `ProjectModal.tsx` con auto-sugerencia de nombre y prefijo de proyecto.
<!-- SECTION:PLAN:END -->
