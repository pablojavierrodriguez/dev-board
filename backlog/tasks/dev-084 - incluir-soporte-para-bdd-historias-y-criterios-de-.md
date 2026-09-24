---
id: DEV-084
title: "incluir soporte para BDD (historias y criterios de aceptacion)"
status: Ready
created_date: '2026-09-24T12:21:25.797Z'
updated_date: '2026-09-24 14:56'
labels: []
dependencies: []
priority: medium
type: feature
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
order: "80"
sprint: "Sprint 5"
targetSprint: "Sprint 5"
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
incluir la posibilidad de que se completen los requerimientos en formato historia de usuario con el framework BDD

Historia de usurario / Feature / Requerimiento > COMO (rol) QUIERO (necesidad) PARA (beneficio)
Criterios de aceptacion > Scenario/GIVEN/WHEN/THEN
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Agregar botón/atajo en ItemModal para insertar plantilla de Historia de Usuario BDD en la Descripción: COMO (rol) / QUIERO (acción) / PARA (beneficio).
- [x] #2 Agregar botón/atajo en ItemModal para insertar Criterios de Aceptación con formato BDD Scenario: DADO (contexto) / CUANDO (evento) / ENTONCES (resultado).
- [x] #3 Mantener compatibilidad total con texto libre y criterios existentes.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `ItemModal.tsx`, incorporar selector o botones de inserción de plantillas BDD para Descripción y Criterios.
2. Formatear las plantillas con sintaxis BDD estándar tanto en español (COMO/QUIERO/PARA, DADO/CUANDO/ENTONCES) como con soporte de GIVEN/WHEN/THEN.
3. Probar en la interfaz y validar con `tsc`.
<!-- SECTION:PLAN:END -->
