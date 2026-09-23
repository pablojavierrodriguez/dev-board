---
id: DEV-042
title: "Empaquetado y DX como devDependency (Cero Fricción con npm i -D y npx)"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-22 03:56'
labels: []
dependencies: []
priority: medium
type: feature
milestone: "Sprint 4"
sprint: "Sprint 4"
order: 70
release: "Sprint 4"
targetRelease: "Sprint 4"
targetSprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Optimizar la experiencia de desarrollador (DX) y empaquetado para que DevBoard pueda ser consumido limpiamente como devDependency en cualquier proyecto Node/TypeScript, levantando el cockpit local y el servidor MCP con cero fricción.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Habilitar instalación local mediante npm i -D devboard (o package runner) con script de inicio 'devboard'
- [ ] #2 Soporte para comando rápido de inicialización 'npx devboard --init' que prepare .devboard/ y carpetas base si no existen
- [ ] #3 Configuración automática o asistida de scripts en package.json del proyecto anfitrión (ej: "board": "devboard")
- [ ] #4 Verificar funcionamiento como devDependency aislada sin interferir con dependencias de React/Vite del proyecto anfitrión
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
