---
id: DEV-013
title: "Estandarización de storageType a 'markdown' para desacoplar de Backlog.md"
status: done
assignee:
  - Antigravity
created_date: '2026-09-16'
updated_date: '2026-09-16'
labels:
  - refactor
  - types
  - architecture
  - naming
dependencies: []
priority: medium
type: tech_debt
milestone: "v1.2.0"
order: 42
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Renombrar y estandarizar el identificador `storageType` del motor de persistencia a exclusivamente `'markdown' | 'json'`.
Al ser el almacenamiento gestionado integralmente por DevBoard sin dependencias externas, no existe necesidad de mantener múltiples valores o alias (`md`, `backlog-md`).
Esto evita cualquier confusión conceptual con proyectos externos (como la herramienta Backlog.md) y simplifica el código en frontend, backend y servidor MCP.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Definir estrictamente `StorageType = "json" | "markdown"` en `src/types.ts`
- [x] #2 Actualizar `data/projects-registry.json` con `"storageType": "markdown"`
- [x] #3 Simplificar funciones en `vite.config.ts` (`isBacklogMdProject`, `detectProjectStorage`) a `'json' | 'markdown'`
- [x] #4 Actualizar componentes UI (`Header.tsx`, `ProjectModal.tsx`, `FolderPickerModal.tsx`) con etiquetas "Markdown" y "MD"
- [x] #5 Actualizar `scripts/mcp-server.ts` y suite de tests
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Unificar `StorageType` en `src/types.ts`.
2. Actualizar configuración en `vite.config.ts` y `data/projects-registry.json`.
3. Limpiar comparaciones en `Header.tsx`, `ProjectModal.tsx`, `FolderPickerModal.tsx` y `mcp-server.ts`.
4. Verificar con `npx tsc --noEmit` y `npm run test:backlog`.
<!-- SECTION:PLAN:END -->

<!-- SECTION:NOTES:BEGIN -->
Completado exitosamente. Todo el sistema ahora utiliza de forma consistente los dos únicos valores canónicos: 'json' y 'markdown'.
<!-- SECTION:NOTES:END -->
