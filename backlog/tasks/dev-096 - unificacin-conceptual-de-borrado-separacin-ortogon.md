---
id: DEV-096
title: "Unificación conceptual de borrado: separación ortogonal de Descartar vs Papelera y persistencia de soft-delete"
status: Ready
created_date: '2026-09-24'
updated_date: '2026-09-24 19:20'
labels: []
dependencies: []
priority: high
type: ux
sprint: "Sprint 5"
targetSprint: "Sprint 5"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Resolver la inconsistencia conceptual y de UX en la eliminación de tareas (Opción A):
1. Separación ortogonal estricta entre la dimensión de Estado de Producto ('dismissed' / Descartada) y el Ciclo de Vida Físico ('isDeleted' / Papelera).
2. Eliminar el laberinto de 3 instancias (Backlog -> Archivo -> Papelera -> Purgar): el botón de eliminar envía directo a la Papelera sin pasar por Descartada.
3. Reparar el bug en readProjectBacklog (vite.config.ts) que omitía isDeleted/deletedAt/previousStatus provocando el rebote de tareas a 'Descartada'.
4. En la Papelera, permitir Restaurar al estado original o Purgar definitivamente de forma directa con 1 confirmación.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 1. Backend readProjectBacklog mapea de forma determinista isDeleted, deletedAt y previousStatus desde el frontmatter Markdown.
- [x] #2 2. La acción de descartar (status: dismissed) es exclusivamente un cambio de estado de producto sin modales de advertencia destructiva.
- [x] #3 3. El botón de eliminar (tachito) envía directamente a la Papelera (isDeleted: true) con mensaje claro y sin mutar el status a dismissed ni pasar por la vista de Descartados.
- [x] #4 4. En la vista de Archivo y Papelera se resuelven los bucles: la Papelera permite Restaurar al estado anterior o Purgar definitivamente con 1 confirmación.
- [x] #5 5. Limpieza de datos en dev-060 y compatibilidad case-insensitive con claves de frontmatter isdeleted / isDeleted.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar vite.config.ts en readProjectBacklog para extraer y mapear isDeleted, deletedAt y previousStatus (soportando case-insensitivity: isdeleted e isDeleted).
2. Actualizar softDeleteBacklogMdItem y restoreBacklogMdItem en vite.config.ts para preservar el status real del ítem sin forzarlo a 'dismissed' (o preservando previousStatus fielmente).
3. Modificar App.tsx:
   - handleDeleteItem / handleSoftDeleteItem: enviar a papelera marcando isDeleted: true sin alterar status a 'dismissed'.
   - ArchiveView: el tachito de eliminar en Archivo envía a la papelera o purga directamente según corresponda.
   - Ajustar textos de modales de confirmación para que no digan 'eliminar permanentemente' cuando sólo se envía a la Papelera.
4. Ajustar TrashView: purga física directa sin fricciones innecesarias y restauración fiel al estado previo.
5. Reconciliar archivo dev-060.md.
6. Validar con npx tsc --noEmit, npm test y npm run backlog:check.
<!-- SECTION:PLAN:END -->
