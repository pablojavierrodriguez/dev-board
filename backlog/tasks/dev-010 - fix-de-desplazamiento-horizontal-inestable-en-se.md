---
id: DEV-010
title: "Fix de Desplazamiento Horizontal Inestable en Selector de Navegación de Pestañas"
status: Draft
assignee: []
created_date: '2026-09-16'
updated_date: '2026-09-16'
labels:
  - bugfix
  - layout
  - header
  - ui
dependencies: []
priority: high
type: bug
milestone: "v1.2.0"
order: 39
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Resolver el defecto visual en la barra superior (`Header.tsx`) donde el bloque central de navegación por pestañas (Tablero, Sprint & Priorización, Releases, Archivo) se desplaza horizontalmente (layout shift) de forma errática:
1. Al cambiar de proyecto: la longitud variable del nombre del proyecto y los badges ('Backlog.md' vs 'JSON' vs 'Demo') cambian el ancho del contenedor izquierdo. Como la barra utiliza `flex justify-between`, el cambio de ancho en la izquierda empuja o tira del contenedor central de pestañas.
2. Al cambiar de pestaña: cuando la pestaña activa es 'Tablero', se muestra el selector de modo de vista (Simple / Ampliada) en el contenedor derecho; al cambiar a 'Sprint', 'Releases' o 'Archivo', dicho selector desaparece, reduciendo el ancho del bloque derecho en ~120px y provocando que el selector central de pestañas pegue un salto horizontal notable.
La navegación debe permanecer centrada o fija sin saltos visuales molestos al interactuar con proyectos o pestañas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Estabilizar el layout del Header mediante un sistema de 3 columnas fijas (ej. CSS Grid `grid-cols-[1fr_auto_1fr]` o flexboxes balanceados)
- [ ] #2 Garantizar que el selector central de navegación (`<nav>`) no se mueva horizontalmente al cambiar de proyecto (independientemente de la longitud de su nombre o badge)
- [ ] #3 Garantizar que el selector central de navegación (`<nav>`) permanezca completamente estático al cambiar entre pestañas (Tablero, Sprint, Releases, Archivo)
- [ ] #4 Preservar la visibilidad y estética de los botones de acciones y selectores en desktop y mobile
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar el contenedor principal en `src/components/Header.tsx` de `flex justify-between` a `grid grid-cols-3` o `grid grid-cols-[1fr_auto_1fr] items-center`.
2. Asignar alineación `justify-start` al bloque de proyecto/marca, `justify-center` al bloque `<nav>` de pestañas, y `justify-end` al bloque de acciones y herramientas.
3. Verificar transiciones y comprobar visualmente en el navegador alternando proyectos y tabs.
<!-- SECTION:PLAN:END -->
