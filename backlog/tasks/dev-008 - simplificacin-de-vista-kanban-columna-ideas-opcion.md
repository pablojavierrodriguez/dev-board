---
id: DEV-008
title: "Simplificación de Vista Kanban: Columna Ideas Opcional y Oculta por Defecto"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-18 03:41'
labels:
  - kanban
  - ux
  - views
  - backlog
dependencies: []
priority: medium
type: feature
milestone: "0.3.0"
order: "37"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Simplificar la vista simplificada del Kanban distinguiendo claramente entre el backlog crudo de "Ideas" (sin discovery, sin refinamiento ni priorización) y el verdadero "Backlog" de trabajo listo (filtrado, priorizado y en refinamiento).
En la vista simplificada, la columna de "Ideas" debe permanecer oculta por defecto para evitar ruido cognitivo. La vista simplificada por defecto mostrará el flujo esencial de 3 columnas: `Backlog` -> `In Progress / Doing` (agrupando review) -> `Done`.
Si el usuario desea incorporar o visualizar las Ideas, podrá hacerlo explícitamente a través de un botón/toggle dedicado (ej. "+ Mostrar Ideas" o switch en toolbar).
El selector de vistas existente de la barra superior debe mantenerse intacto con sus 2 modos ("Simple" y "Ampliada") sin añadir más opciones al selector principal.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Ocultar por defecto la columna de Ideas al entrar en la vista Simplificada
- [x] #2 Mantener intacto el selector de 2 opciones (Simple / Ampliada) en la barra superior
- [x] #3 Renderizar por defecto las columnas base: Backlog, In Progress (Doing + Review) y Done en vista Simple
- [x] #4 Añadir un botón o toggle explícito accesible (ej. en la cabecera del Kanban o toolbar) para mostrar/ocultar la columna Ideas a demanda
- [x] #5 Persistir la preferencia de visibilidad de Ideas (en local storage o en `.devboard/config.json`)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/KanbanBoard.tsx`, añadir estado local / prop `showIdeasInSimpleView` (default `false`).
2. Actualizar la lógica de filtrado y definición de columnas para la vista simplificada.
3. Incorporar botón discreto estilo chip "+ Ideas" / "Ocultar Ideas" en la barra de filtros o cabecera de columnas.
4. Conectar con el sistema de configuración (DEV-006) para persistir la preferencia.
<!-- SECTION:PLAN:END -->
