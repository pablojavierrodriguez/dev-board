---
id: DEV-059
title: "Administración y Personalización de Tipos de Cards y Flujos de Trabajo por el Usuario (Admin Soberano)"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 00:09'
labels:
  - customization
  - settings
  - admin
  - workflow
dependencies: []
priority: medium
type: feature
milestone: "0.5.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Otorgar soberanía total y personalización al usuario/admin para definir y gestionar la taxonomía de tipos de tarjeta y flujos de trabajo de su proyecto:
1. **Soberanía Administrativa:** Aunque DevBoard incluye tipos predeterminados (`feature`, `bug`, `tech_debt`, `ux`, etc.), el usuario es el dueño de su proyecto y flujo. Debe poder crear nuevos tipos personalizados (ej. `spike`, `research`, `design`, `meeting`, `infra`), editar los existentes (nombre, color semántico, icono) o eliminar los que no utilice.
2. **Editor de Tipos en Settings:** Incorporar en `SettingsView` una sección dedicada "Tipos de Tarjeta y Taxonomía" donde se listen los tipos actuales con acciones de edición inline, cambio de paleta cromática, asignación de icono de Lucide y botón "+ Nuevo Tipo".
3. **Integración Universal:** Los nuevos tipos creados deben poblarse automáticamente en los modales de creación y edición (`ItemModal.tsx`), filtros de búsqueda (`FilterBar.tsx`) y badges de las tarjetas (`ItemCard.tsx`).
4. **Persistencia Local:** Almacenamiento directo en `.devboard/config.json` bajo `config.customItemTypes`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Sección 'Tipos de Tarjeta' en SettingsView con gestión CRUD completa (crear, editar, eliminar)
- [ ] #2 Formulario de configuración de tipo: identificador clave, nombre legible, color semántico e icono
- [ ] #3 Los tipos personalizados se reflejan automáticamente en los selectores de ItemModal y FilterBar
- [ ] #4 Los badges de ItemCard renderizan adecuadamente el color e icono del tipo personalizado
- [ ] #5 Persistencia automática y aislada en .devboard/config.json sin romper esquemas preexistentes
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extender `src/types.ts` con interfaz `CustomItemTypeConfig` y añadirla a `DevBoardConfig`.
2. Implementar componente gestor de tipos en `src/components/SettingsView.tsx`.
3. Actualizar `typeConfig` en `src/components/ItemCard.tsx` para combinar los tipos nativos con los tipos definidos en la configuración activa.
4. Conectar selectores de tipo en `ItemModal.tsx` y `FilterBar.tsx`.
<!-- SECTION:PLAN:END -->
