---
id: DEV-009
title: "Personalización de Columnas Kanban: Reordenar, Renombrar, Mapeo de Estados y WIP Limits"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-18 03:41'
labels:
  - kanban
  - workflow
  - wip-limits
  - customization
dependencies: []
priority: medium
type: feature
milestone: "0.3.0"
order: "38"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permitir a los usuarios personalizar dinámicamente la configuración del tablero Kanban:
1. Renombrar el título de las columnas.
2. Reordenar las columnas según la preferencia del equipo.
3. Configurar qué estados canónicos (`draft`, `doing`, `review`, `ready`, `done`) pertenecen a cada columna visual.
4. Validar y alertar al usuario si algún estado queda desasignado o huérfano (para evitar que tareas existentes desaparezcan visualmente del tablero).
5. Configurar límites de trabajo en progreso (WIP Limits) por columna (ejemplo: máximo 10 cards en 'Doing'), mostrando indicadores de capacidad y alertas visuales al superar el umbral.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Configuración dinámica de columnas con título editable y orden personalizable
- [x] #2 Asignación flexible de estados a columnas visuales
- [x] #3 Validación de estados huérfanos: mostrar banner de advertencia si algún estado activo no está asignado a ninguna columna
- [x] #4 Soporte para WIP Limits numéricos por columna (ej. `doing: 10`, `review: 5`)
- [x] #5 Indicadores visuales en la cabecera de la columna cuando se alcanza o sobrepasa el WIP limit (ej. badge amarillo/rojo `11/10 WIP`)
- [x] #6 Guardado de la configuración en `.devboard/config.json` o settings del proyecto
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Diseñar interfaz en Settings (o modal contextual de configuración de tablero) para gestionar columnas.
2. Refactorizar la definición estática de columnas en `src/components/KanbanBoard.tsx` para aceptar un array dinámico de columnas desde la configuración.
3. Añadir función de comprobación de integridad que verifique cobertura de los estados `draft`, `doing`, `review`, `ready`, `done`.
4. Implementar badges y estilos de saturación visual para WIP limits en la cabecera de cada columna.
<!-- SECTION:PLAN:END -->
