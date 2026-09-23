---
id: DEV-074
title: "Botón Deshacer Cambios en Settings (Restablecer Estado no Guardado)"
status: Ready
created_date: '2026-09-19T04:54:51.829Z'
updated_date: '2026-09-23 19:03'
labels:
  - settings
  - ux
dependencies: []
priority: medium
type: feature
milestone: "Sprint 4"
order: "10"
sprint: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Al lado del botón 'Guardar Cambios' en la vista de configuración (`SettingsView.tsx`), agregar un botón 'Deshacer Cambios' que permita descartar la configuración editada en el formulario y restablecer todas las preferencias locales al estado guardado en disco (`config`), evitando guardar modificaciones no deseadas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Mostrar botón 'Deshacer Cambios' al lado de 'Guardar Cambios' en SettingsView cuando existan modificaciones no guardadas (isDirty)
- [x] #2 Al hacer clic en 'Deshacer Cambios', restablecer inmediatamente todos los estados locales al valor persistido en config
- [x] #3 Deshabilitar u ocultar el botón 'Deshacer Cambios' cuando no haya cambios pendientes (!isDirty)
- [x] #4 Proporcionar feedback visual y toast confirmando el restablecimiento de los ajustes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `SettingsView.tsx`, identificar la bandera `isDirty` y los setters locales de configuración.
2. Implementar `handleResetChanges()` que re-inicialice los estados locales con los valores originales de `config`.
3. Renderizar el botón 'Deshacer Cambios' junto al botón 'Guardar Cambios'.
4. Validar criterios de aceptación.
<!-- SECTION:PLAN:END -->
