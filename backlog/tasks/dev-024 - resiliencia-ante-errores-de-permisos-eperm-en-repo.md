---
id: DEV-024
title: "Resiliencia ante errores de permisos (EPERM) en repositorios locales y banner en UI"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-19 04:25'
labels: []
dependencies: []
priority: high
type: bug
milestone: "v1.3.0"
release: "v1.3.0"
targetRelease: "v1.3.0"
order: 160
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Manejo tolerante a fallos en la lectura de tareas Markdown de repositorios locales:
1. Envolver la lectura de carpetas backlog/tasks en try/catch para evitar que excepciones de permisos (EPERM/EACCES) o paths inaccesibles hagan colapsar el endpoint GET /api/data con status 500.
2. Propagar el estado de error (error?: string) en la metadata del proyecto (ProjectMeta y Project).
3. Notificar visualmente en el frontend (banner de advertencia con explicación y comando de solución) cuando un proyecto seleccionado no pueda leer sus archivos por restricciones de permisos o sandbox.
4. Soporte para liberar puertos retenidos e iniciar servidores limpios.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Blindar readProjectBacklog en vite.config.ts para capturar excepciones de lectura de carpetas y no tumbar /api/data
- [x] #2 Declarar error?: string en tipos ProjectMeta (vite.config.ts, mcp-server.ts) y Project (src/types.ts)
- [x] #3 Renderizar banner de diagnóstico amigable en App.tsx ante errores de acceso a repositorios
- [x] #4 Documentar la resolución de conflictos de puertos y compatibilidad con entornos sandbox
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En vite.config.ts, envolver en try/catch la lectura del directorio de tareas Markdown y devolver { project: { ...project, error: err.message }, items: [], releases: [] }.
2. En vite.config.ts y scripts/mcp-server.ts, extender ProjectMeta con error?: string.
3. En src/types.ts, extender Project con error?: string.
4. En src/App.tsx, agregar banner condicional con AlertTriangle si el proyecto activo tiene error.
5. Registrar proyecto DOM como storageType: markdown y backlogDir: backlog en projects-registry.json.
<!-- SECTION:PLAN:END -->
