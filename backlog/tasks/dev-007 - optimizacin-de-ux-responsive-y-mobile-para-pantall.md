---
id: DEV-007
title: "Optimización de UX Responsive y Mobile para Pantallas Pequeñas"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-18 03:41'
labels:
  - mobile
  - responsive
  - ux
  - layout
dependencies: []
priority: high
type: ux
milestone: "0.3.0"
order: "36"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Optimizar de forma integral la experiencia de usuario (UX/UI) de DevBoard en dispositivos móviles y pantallas pequeñas (< 768px).
Actualmente la interfaz sufre de desbordamientos horizontales, la cabecera se satura de botones, las múltiples columnas del Kanban se comprimen haciéndose ilegibles y los modales se salen de los límites de la pantalla.
Se requiere un diseño adaptativo mobile-first: navegación colapsable en Header, selector de columna por tabs o scroll-snap para el tablero Kanban, y modales que se transformen en bottom-sheets o vistas de pantalla completa en mobile.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Adaptar Header para mobile: menú colapsable (hamburguesa/drawer) o barra inferior para selector de proyectos y acciones
- [x] #2 Implementar vista mobile para el Kanban: selector de columna tipo tabs/pills o swipe horizontal con snap para ver una columna a la vez
- [x] #3 Adaptar modales (`ItemModal`, `ProjectModal`, `ConfirmModal`, `SettingsModal`) a modo bottom-sheet o pantalla completa en pantallas < 640px
- [x] #4 Garantizar áreas táctiles mínimas de 44x44px para botones e interactivos en mobile
- [x] #5 Eliminar cualquier scroll horizontal indeseado a nivel de ventana (`overflow-x-hidden` seguro en layout principal)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Evaluar breakpoints en `src/components/Header.tsx` y extraer navegación secundaria a un menú drawer en mobile.
2. Actualizar `KanbanBoard.tsx` agregando una barra de selector de columnas mobile cuando `window.innerWidth < 768px`.
3. Ajustar contenedores de modales en `ItemModal.tsx`, `ProjectModal.tsx` y `FolderPickerModal.tsx` con clases responsive (`h-full sm:h-auto`, `rounded-t-2xl sm:rounded-2xl`).
4. Probar en emulador de dispositivos móviles (375px, 414px, 768px).
<!-- SECTION:PLAN:END -->
