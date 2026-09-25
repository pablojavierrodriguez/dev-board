---
id: DEV-106
title: "Higiene de Código Abierto: Erradicación de Fallbacks Residuales Propietarios"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 15:03'
labels: []
dependencies: []
priority: medium
type: tech_debt
sprints:
  - "Sprint 6"
sprint: "Sprint 6"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Limpieza de código para eliminar residuos y fallbacks hardcodeados con nombres de proyectos privados ('dom') presentes en el frontend, asegurando que la resolución de proyecto activo sea 100% neutral y dinámica para cualquier usuario de la comunidad open-source.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Reemplazar todos los fallbacks al string literal 'dom' en src/App.tsx por resolución dinámica neutral (activeProjectId || projects[0]?.id).
- [x] #2 Reemplazar fallbacks 'dom' en src/components/ItemModal.tsx.
- [x] #3 Reemplazar fallbacks 'dom' en src/components/ImportWizardModal.tsx.
- [x] #4 Garantizar que ningún identificador de proyecto privado quede hardcodeado en la base de código abierta.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Identificar todas las ocurrencias del string literal 'dom' en src/App.tsx, src/components/ItemModal.tsx y src/components/ImportWizardModal.tsx.
2. Sustituir por la resolución canónica: activeProjectId || projects[0]?.id || 'default'.
3. Ejecutar npx tsc --noEmit y pruebas automatizadas para asegurar cero regresiones.
<!-- SECTION:PLAN:END -->
