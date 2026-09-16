---
id: DEV-001
title: Interoperabilidad nativa con Backlog.md y motor Markdown
status: done
assignee: Antigravity
labels:
  - architecture
  - markdown
  - backlog-md
priority: high
created_date: 2026-09-16
updated_date: 2026-09-16
milestone: v1.1.0
type: feature
---

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementar soporte nativo para el estándar Backlog.md (MrLesk/Backlog.md) en DevBoard.
Permite almacenar cada ítem del backlog como un archivo Markdown individual en `backlog/tasks/*.md`
con YAML frontmatter y delimitadores estandarizados, resolviendo conflictos de Git concurrentes.
<!-- SECTION:DESCRIPTION:END -->

<!-- AC:BEGIN -->
- [x] #1 Parser y serializador en TypeScript sin dependencias externas
- [x] #2 Normalización bidireccional de estados a vocabulario limpio (draft, doing, review, ready, done)
- [x] #3 Soporte dual de persistencia (JSON y Backlog.md) en la API de Vite
- [x] #4 Herramienta de migración 1-click y exportación consolidada a BACKLOG.md
<!-- AC:END -->

<!-- SECTION:PLAN:BEGIN -->
1. Crear `scripts/backlogMdParser.ts` con manejo robusto de frontmatter y delimitadores.
2. Adaptar `vite.config.ts` para leer y escribir en `backlog/tasks/`.
3. Actualizar `types.ts`, `KanbanBoard.tsx`, `ItemCard.tsx` y `Header.tsx`.
4. Probar con tests automatizados.
<!-- SECTION:PLAN:END -->

<!-- SECTION:NOTES:BEGIN -->
Validado con `npm run test:backlog`. Compatible con repositorios existentes.
<!-- SECTION:NOTES:END -->
