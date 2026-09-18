---
id: DEV-033
title: "Refactorización Conceptual y UX: Desacople Sprint/Release, Rediseño ItemModal y Ergonomía de Vistas"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 02:27'
labels:
  - ux
  - architecture
  - backlog
dependencies: []
priority: medium
type: ux
milestone: "0.3.0"
sprint: "Sprint 1"
release: "0.3.0"
targetRelease: "0.3.0"
order: 30
targetSprint: "Sprint 1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactorización profunda de conceptos de dominio, navegación y experiencia de usuario:
- Separación tajante entre Sprint (ciclo de trabajo iterativo) y Release (etiqueta o hito de despliegue a producción).
- Rediseño de ItemModal a layout de dos columnas estilo Linear (contenido principal a la izquierda, metadatos y contexto a la derecha).
- Limpieza radical del selector de proyectos (retirar exportaciones e importaciones) y centralizarlas en Configuración.
- Disminuir el protagonismo del Archivo a un botón sutil en el Header.
- Configuración de vistas activas y vista por defecto persistente.
- Ordenamiento y ergonomía de visualización en la vista de Sprints & Backlog.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Desacoplar semánticamente Sprint vs Release/Versión en datos y UI, eliminando prefijo 'target'
- [x] #2 Rediseñar ItemModal a layout ergonómico de 2 columnas estilo Linear con panel 'Detalles y Contexto' a la derecha
- [x] #3 Limpiar menú de proyectos y reubicar Importación/Exportación en Settings -> Datos y Herramientas
- [x] #4 Reubicar Archivo como acción secundaria sutil con icono en el Header en lugar de pestaña principal
- [x] #5 Añadir selector de vista por defecto y habilitación de vistas en Settings (.devboard/config.json)
- [x] #6 Ordenar semántica y cronológicamente los grupos en SprintView con reasignación ágil
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Tipos y Backend:
   - Añadir `defaultView` y `enabledTabs` a `DevBoardConfig` en `src/types.ts`.
   - Normalizar compatibilidad bidireccional entre `sprint`/`targetSprint` y `release`/`targetRelease`.
2. Header y Navegación (`src/components/Header.tsx`):
   - Limpiar selector de proyectos: remover "Exportar & Descargas" e "Importar & Migración".
   - Renderizar pestañas centrales según `config.enabledTabs`.
   - Reemplazar la pestaña principal de Archivo por un icono sutil a la derecha del Header con contador y tooltip.
3. Configuración (`src/components/SettingsModal.tsx`):
   - Añadir sección de "Flujo de Trabajo y Vistas" (vista por defecto y selector de tabs habilitados).
   - Añadir pestaña "Datos & Herramientas" para centralizar Import Wizard, Export BACKLOG.md y Backup JSON.
4. Editor de Tareas (`src/components/ItemModal.tsx`):
   - Transformar layout a 2 columnas estilo Linear (`grid grid-cols-1 lg:grid-cols-12`).
   - Mover metadatos a la derecha en panel "Detalles y Contexto".
   - Renombrar campos a "Sprint" y "Release / Versión", con datalists inteligentes de sugerencias.
5. Vista de Sprints (`src/components/SprintView.tsx`):
   - Ordenamiento natural/cronológico de grupos de sprint.
   - Selector inline de Sprint y Release.
6. Verificación con `npm run build`, `npm run backlog:check` y browser check.
<!-- SECTION:PLAN:END -->
