---
id: DEV-070
title: "Feature: Retro Automática al Cerrar Sprint — Template y Checklist Integrado"
status: Draft
created_date: '2026-09-19'
updated_date: '2026-09-19 19:24'
labels: []
dependencies: []
priority: medium
type: feature
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementar soporte nativo para Sprint Retrospectivas en DevBoard.

**Motivación:** Las retros manuales al final de cada sprint son valiosas pero se omiten cuando el sprint se cierra rápidamente. Se necesita un mecanismo que las haga obligatorias y estructuradas.

**Funcionalidad esperada:**
1. Al marcar el último item de un sprint como `ready` o al ejecutar 'Completar Sprint', DevBoard muestra un prompt de retro.
2. El template de retro incluye las 4 dimensiones: Problemas, Eficiencia, Fortalezas, Acciones.
3. Las acciones concretas de la retro se convierten automáticamente en nuevas tareas del backlog.
4. La retro queda guardada como archivo en `backlog/retros/sprint-N-retro.md`.
5. El MCP expone `devboard_create_retro` y `devboard_list_retros`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Al completar un sprint, CompleteSprintModal incluye paso de retro opcional pero promovido
- [ ] #2 Template de retro con secciones: ¿Qué salió bien?, ¿Qué mejorar?, ¿Qué cambiar?, Acciones concretas
- [ ] #3 Las acciones se pueden convertir en tasks con un click (Create Task from Action)
- [ ] #4 La retro se persiste en backlog/retros/ como archivo Markdown estándar
- [ ] #5 devboard_list_retros MCP tool lista las retros guardadas con resumen
- [ ] #6 La retro aparece en el timeline de la Release Notes si el sprint tiene release asociado
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
