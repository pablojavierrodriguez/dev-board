---
id: DEV-081
title: "cambios pendientes apenas al entrar a config"
status: Ready
created_date: '2026-09-23T23:16:34.944Z'
updated_date: '2026-09-24 18:49'
labels: []
dependencies: []
priority: medium
type: bug
milestone: "0.5.0"
sprints:
  - "Sprint 5"
releases:
  - "0.5.0"
sprint: "Sprint 5"
order: 60
release: "0.5.0"
targetRelease: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al ingresar a la vista de Configuración (SettingsView), aparece de inmediato el banner de cambios pendientes y el botón "Deshacer cambios" sin que el usuario haya modificado ningún ajuste. Esto se debe a que `isDirty` realiza un `JSON.stringify` ingenuo donde `builtConfig.customItemTypes` es `[]` mientras que en `config.json` dicha propiedad es `undefined`, produciendo un falso positivo permanente.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Al ingresar a Configuración sin editar nada, el banner de cambios pendientes y botón 'Deshacer' deben permanecer ocultos (isDirty = false).
- [x] #2 La función de detección de dirty state debe normalizar propiedades opcionales/vacías (customItemTypes, wipLimits, tabs) para evitar discrepancias estructurales.
- [x] #3 Al modificar efectivamente cualquier valor de configuración, el banner de cambios pendientes debe activarse y responder correctamente a Guardar y Deshacer.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Implementar función de comparación semántica o normalización canónica en SettingsView.tsx para isDirty.
2. Asegurar que customItemTypes vacío ([]) sea equivalente a undefined.
3. Verificar en SettingsView que isDirty sea false al cargar.
4. Validar compilación con npx tsc --noEmit.
<!-- SECTION:PLAN:END -->
