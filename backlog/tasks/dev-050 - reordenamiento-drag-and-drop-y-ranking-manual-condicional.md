---
id: DEV-050
title: "Reordenamiento Drag & Drop en Backlog / Sprint y Priorización con Setting de Ranking Manual Condicional"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 00:04'
labels:
  - ux
  - drag-and-drop
  - ranking
  - backlog
dependencies: []
priority: high
type: feature
milestone: "0.4.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Soporte integral para reordenamiento manual de ítems en la vista de Backlog y Sprint & Priorización:
1. **Drag & Drop en Backlog:** Permitir arrastrar y soltar verticalmente filas de la tabla de Backlog para priorizarlas interactivamente, al igual que se hace entre columnas del tablero Kanban.
2. **Ranking Manual Condicional (Setting de Proyecto):** Incorporar en Settings el interruptor `rankingEnabled` (Habilitar Ranking Manual):
   - **Cuando está ACTIVADO:** El usuario puede reubicar libremente las filas mediante drag & drop, persistiendo el orden manual (`order` / `ranking`).
   - **Cuando está DESACTIVADO:** Se bloquea el reordenamiento manual; la tabla respeta estrictamente el orden predefinido (ej. por prioridad descendente o por fecha) y oculta los controles de arrastre para evitar alteraciones accidentales.
3. **Persistencia en Frontmatter:** El valor numérico de ranking se conserva en frontmatter Markdown (`order: 10`, `order: 20`, espaciado para reordenamiento sin colisiones).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Soporte de Drag & Drop vertical fluido para reordenar filas en la tabla de Backlog y contenedores de sprint
- [ ] #2 Setting 'rankingEnabled' en SettingsView para activar o desactivar el ranking manual
- [ ] #3 Cuando el ranking está desactivado, el arrastre manual queda bloqueado y se respeta el orden estricto de columnas
- [ ] #4 Al reordenar filas con ranking activo, se actualiza el campo 'order' y se persiste en los archivos Markdown
- [ ] #5 Rendimiento optimizado a 60 FPS durante la interacción de arrastre en listas largas
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender `DevBoardConfig` con `rankingEnabled?: boolean`.
2. Añadir control en `SettingsView.tsx` para conmutar la configuración.
3. En `SprintView.tsx`, integrar handlers de drag-and-drop vertical condicionados a `config.rankingEnabled`.
4. Implementar endpoint/mutación en lote para actualizar `order` con espaciado aritmético.
<!-- SECTION:PLAN:END -->
