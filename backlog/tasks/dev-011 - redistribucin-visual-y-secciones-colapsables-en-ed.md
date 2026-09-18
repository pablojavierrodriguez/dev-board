---
id: DEV-011
title: "Redistribución Visual y Secciones Colapsables en Editor de Card (ItemModal)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-18 03:41'
labels:
  - ux
  - ui
  - forms
  - item-modal
dependencies: []
priority: medium
type: ux
milestone: "0.3.0"
sprint: "Sprint 1"
order: "40"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mejorar la distribución visual, ergonomía y aprovechamiento del espacio en el modal de edición/creación de tarjetas (`ItemModal.tsx`).
Actualmente, el modal apila todos los campos verticalmente en un único scroll largo:
- Varios campos del modelo de datos (`risk` y `fix`) ni siquiera se muestran en pantalla por falta de espacio.
- Cuando una tarea tiene múltiples Criterios de Aceptación (AC) o un Plan de Implementación técnico detallado, la altura del modal desborda la pantalla obligando al usuario a realizar scrolls excesivos.
- Se debe reestructurar el formulario con una jerarquía visual limpia:
  1. Cabecera compacta con Título, Código, Tipo, Prioridad, Estado y Proyecto en grilla balanceada.
  2. Secciones colapsables tipo acordeón (o pestañas internas) para:
     - **Criterios de Aceptación (AC)**: con contador en cabecera (ej. `3/5 cumplidos`) y colapsar/expandir.
     - **Plan de Implementación & Plan Guard**: colapsable para desarrollo técnico y agentes de IA.
     - **Metadatos Técnicos**: archivo impactado, sprint/release objetivo, riesgos (`risk`) y solución propuesta (`fix`).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Implementar secciones colapsables (acordeón o tabs) con estado recordado para AC, Plan Técnico y Metadatos
- [x] #2 Incorporar inputs editables para campos omitidos actualmente (`risk` y `fix`)
- [x] #3 Mostrar indicador resumen en el encabezado de la sección de AC (ej. "3 de 5 criterios completados")
- [x] #4 Mejorar el aprovechamiento horizontal en pantallas medianas y grandes con un layout en 2 columnas o panel lateral
- [x] #5 Mantener atajos de teclado (`⌘+Enter` para guardar, `Esc` para cancelar)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Refactorizar `src/components/ItemModal.tsx` introduciendo componentes de acordeón colapsable con animaciones suaves (`framer-motion` o CSS transitions).
2. Conectar los campos `risk` y `fix` que ya existen en el estado pero carecían de inputs en el JSX.
3. Añadir badges de progreso de AC en el encabezado del acordeón.
4. Ajustar altura máxima (`max-h-[85vh]`) y scroll interno optimizado.
<!-- SECTION:PLAN:END -->
