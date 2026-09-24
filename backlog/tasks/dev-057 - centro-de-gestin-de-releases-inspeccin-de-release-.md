---
id: DEV-057
title: "Centro de Gestión de Releases: Inspección de Release Notes, Conjunto de Cards y Sincronización con Git"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-19 04:25'
labels:
  - releases
  - changelog
  - git
dependencies:
  - DEV-039
  - DEV-056
priority: high
type: feature
order: 20
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Evolución integral del módulo de Releases hacia un centro de control y auditoría de entregas:
1. **Inspección de Releases:** Permitir visualizar en la aplicación la lista completa de releases gestionados con DevBoard, incluyendo:
   - Resumen y notas de release generadas (Markdown renderizado con títulos, mejoras y fixes).
   - Tabla interactiva con el conjunto exacto de tarjetas asociadas a esa versión (con código, título, autor y estado).
2. **Sincronización Pasiva con Git (Dependencia DEV-039):**
   - Correlacionar los releases declarados en DevBoard con los tags y commits reales del repositorio Git local mediante la inspección no invasiva de DEV-039.
   - Detectar discrepancias (ej: un release con tareas marcadas como listas pero sin tag Git generado, o commits en la rama que hacen referencia a tareas aún abiertas).
3. **Exportación de Changelog:** Botones de copia rápida en Markdown y exportación para GitHub Releases o actualización de `CHANGELOG.md`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Vista de detalle por release con notas de cambio completas en Markdown renderizado
- [ ] #2 Listado filtrable de todas las tarjetas asociadas a cada versión gestionada
- [ ] #3 Correlación y badge de coherencia con tags locales de Git proveniente de la integración DEV-039
- [ ] #4 Asistente para detectar discrepancias entre código tageado y tareas asociadas
- [ ] #5 Botón de copiado en un click del changelog formateado para GitHub Releases
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Refactorizar `src/components/ReleaseView.tsx` para incorporar split-view: lista lateral de versiones y panel principal de notas + tarjetas asociadas.
2. Consumir el estado de tags de Git provisto por el módulo de `DEV-039`.
3. Añadir botón de exportación y copiado al portapapeles.
4. Validar integridad de datos con releases históricos.
<!-- SECTION:PLAN:END -->
