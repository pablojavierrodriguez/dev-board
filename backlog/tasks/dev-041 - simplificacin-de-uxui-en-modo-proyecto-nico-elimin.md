---
id: DEV-041
title: "Simplificación de UX/UI en Modo Proyecto Único (Eliminación de Ruido Multi-Proyecto)"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-22 03:56'
labels: []
dependencies: []
priority: high
type: ux
milestone: "Sprint 4"
sprint: "Sprint 4"
order: 80
release: "Sprint 4"
targetRelease: "Sprint 4"
targetSprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Simplificar radicalmente la navegación y la cabecera cuando DevBoard se ejecuta en un repositorio único, eliminando el ruido de selectores de proyectos globales, modales de importación y cambio de repositorios, ofreciendo una experiencia enfocada y limpia similar a Storybook o Prisma Studio.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Detectar modo monoproyecto (Single-Project Mode) cuando devboard se ejecuta apuntando a un único repositorio local
- [ ] #2 Ocultar selector desplegable de proyectos en la cabecera cuando se ejecuta en modo monoproyecto
- [ ] #3 Ocultar botones y modales de 'Añadir Proyecto' e 'Importar Proyecto' en la navegación principal en modo monoproyecto
- [ ] #4 Mostrar en la cabecera el nombre del repositorio activo con un indicador sutil de estado local
- [ ] #5 Reservar la interfaz multi-proyecto completa para cuando se invoque explícitamente con flag --hub o --multi
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
