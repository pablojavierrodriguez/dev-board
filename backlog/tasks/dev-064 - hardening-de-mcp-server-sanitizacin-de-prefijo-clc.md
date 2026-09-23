---
id: DEV-064
title: "Hardening de MCP Server: Sanitización de Prefijo, Cálculo Robusto de IDs Secuenciales y Herramienta devboard_sync_backlog"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 14:57'
labels:
  - mcp
  - architecture
  - resilience
dependencies: []
priority: high
type: feature
milestone: "0.3.1"
sprint: "Sprint 2"
release: "0.3.1"
targetRelease: "0.3.1"
order: 30
targetSprint: "Sprint 2"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Hardening integral del servidor MCP (`scripts/mcp-server.ts` y binario standalone `bin/devboard-mcp.js`):
1. **Sanitización de Prefijos de Proyecto:** Eliminar caracteres no alfanuméricos en `codePrefix` (ej. `dev-board` extraía `"DEV-"`, produciendo dobles guiones `DEV--060`). Limpiar con `.replace(/[^A-Z0-9]/g, '')`.
2. **Cálculo Robusto de IDs Secuenciales:** Reemplazar `tasks.length + 1` por una búsqueda de `max(num) + 1` parseando los códigos existentes mediante regex para evitar colisiones numéricas cuando hay tareas eliminadas o no correlativas.
3. **Herramienta `devboard_sync_backlog`:** Nueva tool JSON-RPC que reconcilia tareas y genera `BACKLOG.md` sin requerir que agentes de IA ejecuten comandos de shell sueltos (`npm run backlog:sync`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Sanitización de prefijo en mcp-server.ts impidiendo dobles guiones en IDs generados
- [x] #2 Cálculo de nuevo ID basado en max(existentes) + 1 con fallback seguro
- [x] #3 Implementación de tool devboard_sync_backlog en el servidor MCP
- [x] #4 Reconstrucción del binario standalone bin/devboard-mcp.js y validación con scripts/verify-mcp-binary.js
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar función de generación de IDs en scripts/mcp-server.ts.
2. Añadir herramienta devboard_sync_backlog al schema y handlers de JSON-RPC.
3. Reconstruir con npm run build:bin.
4. Validar integridad y tests de MCP.
<!-- SECTION:PLAN:END -->
