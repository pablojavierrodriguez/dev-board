---
id: DEV-040
title: "Arquitectura Autocontenida (Embedded-First) y Configuración Local en .devboard/"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-24 12:14'
labels: []
dependencies: []
priority: high
type: feature
milestone: "0.4.0"
sprints:
  - "Sprint 4"
releases:
  - "0.4.0"
sprint: "Sprint 4"
targetSprint: "Sprint 4"
order: 160
release: "0.4.0"
targetRelease: "0.4.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Desacoplar la configuración de DevBoard del registro central global (data/projects-registry.json), permitiendo que toda la configuración de columnas, metodología, vistas y preferencias viva autocontenida en .devboard/config.json dentro del repositorio del proyecto.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Almacenar configuraciones de vista, columnas y metodología en .devboard/config.json dentro del repositorio del proyecto
- [x] #2 Priorizar lectura y escritura de configuración local sobre el registro central data/projects-registry.json
- [x] #3 Garantizar que al clonar el repositorio en otra máquina o entorno, DevBoard cargue la configuración de .devboard/config.json sin pasos manuales
- [x] #4 Mantener compatibilidad hacia atrás con proyectos existentes y proyectos con múltiples carpetas
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Investigar archivos afectados.
2. Implementar solución y pruebas.
3. Validar con criterios de aceptación.
<!-- SECTION:PLAN:END -->
