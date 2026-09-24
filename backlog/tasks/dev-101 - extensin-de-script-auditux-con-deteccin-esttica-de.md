---
id: DEV-101
title: "Extensión de script audit:ux con detección estática de anti-patrones UX-009 y UX-010"
status: Draft
created_date: '2026-09-24'
updated_date: '2026-09-24 21:43'
labels: []
dependencies: []
priority: medium
type: ux
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tras los aprendizajes de la retrospectiva de Sprint 5, se requiere enriquecer la herramienta de análisis estático local `scripts/audit-ux-code.cjs` para detectar preventivamente el uso de `truncate` en textos explicativos de diálogos y verificar que los estilos globales mantengan la reserva de espacio de la barra de desplazamiento para evitar layout shifts (CLS).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Incorporar regla UX-009 en scripts/audit-ux-code.cjs para reportar warning si se detecta 'truncate' en componentes modales o de diálogo (ej: *Modal.tsx).
- [ ] #2 Incorporar regla UX-010 en scripts/audit-ux-code.cjs para verificar la presencia de 'overflow-y: scroll' y 'scrollbar-gutter: stable' en el archivo principal CSS.
- [ ] #3 Ejecutar npm run audit:ux y comprobar que no genere falsos positivos en celdas de tabla o headers.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Abrir scripts/audit-ux-code.cjs y añadir detectores de expresiones regulares para 'truncate' en archivos cuyo nombre contenga 'Modal'.\n2. Añadir chequeo en index.css para validar la regla de scrollbar estable.\n3. Probar con npm run audit:ux.
<!-- SECTION:PLAN:END -->
