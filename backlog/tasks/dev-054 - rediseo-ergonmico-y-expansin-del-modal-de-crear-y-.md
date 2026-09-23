---
id: DEV-054
title: "Rediseño Ergonómico y Expansión del Modal de Crear y Editar Card (Layout de 2 Columnas)"
status: Done
created_date: '2026-09-18'
updated_date: '2026-09-18 14:57'
labels:
  - ux
  - modal
  - linear-style
dependencies: []
priority: medium
type: ux
milestone: "0.3.2"
sprint: "Sprint 2"
release: "0.3.2"
targetRelease: "0.3.2"
order: 40
targetSprint: "Sprint 2"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rediseño integral de ergonomía y distribución visual en el modal de creación y edición de tarjetas (`ItemModal.tsx`):
1. **Problema de Espacio:** El modal actual es angosto y verticalmente apretado para la alta densidad de información que maneja (criterios de aceptación dinámicos, descripción técnica, plan de implementación, contexto, dependencias y metadatos).
2. **Arquitectura de 2 Columnas (Estilo Linear / GitHub Projects):**
   - **Columna Principal (Izquierda ~65-70%):** Área amplia y despejada dedicada al contenido sustantivo: Título grande, Descripción con soporte enriquecido, Criterios de Aceptación con espacio cómodo de escritura por ítem, y Plan Técnico de Implementación.
   - **Sidebar Lateral de Atributos (Derecha ~30-35%):** Panel lateral estilizado con selectores rápidos y limpios para metadatos: Tipo de Card, Prioridad, Estado, Épica/Padre, Sprints, Release, Enlaces/Dependencias, Etiquetas, Módulo y Archivo Impactado.
3. **Dimensiones:** Ampliar el ancho del modal a `max-w-6xl` en pantallas de escritorio con scrolls independientes para evitar saltos.
4. **Mobile First:** Mantenimiento de la experiencia como bottom-sheet táctil fluido en pantallas pequeñas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Modal expandido a max-w-6xl en escritorio con distribución moderna de 2 columnas
- [x] #2 Panel principal izquierdo espacioso para título, descripción, criterios de aceptación y plan técnico
- [x] #3 Sidebar lateral derecha compacta y alineada para atributos clave (tipo, prioridad, estado, padre, sprint, release)
- [x] #4 Entradas de criterios de aceptación con altura cómoda y auto-creación fluida
- [x] #5 Adaptación responsive elegante a bottom-sheet en pantallas móviles
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Reestructurar el JSX de `src/components/ItemModal.tsx` separando contenido principal y sidebar lateral.
2. Añadir clases Tailwind con CSS Grid / Flexbox responsive (`grid grid-cols-1 lg:grid-cols-12`).
3. Refinar estilos visuales con estética glassmorphism y micro-animaciones en focus.
4. Validar legibilidad en resoluciones 1080p, laptops y dispositivos móviles.
<!-- SECTION:PLAN:END -->
