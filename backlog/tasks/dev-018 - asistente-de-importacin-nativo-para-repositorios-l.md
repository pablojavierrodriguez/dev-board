---
id: DEV-018
title: "Asistente de importación nativo para repositorios legacy (Import Wizard)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-17 02:50'
labels: []
dependencies: []
priority: medium
type: ux
milestone: "v1.3.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Proveer un asistente visual e interactivo en la interfaz para importar proyectos legacy que actualmente gestionan su backlog en un único archivo plano (BACKLOG.md o TODO.md), convirtiéndolos al estándar atómico distribuido.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Crear parser heurístico capaz de procesar archivos Markdown planos tipo TODO.md o BACKLOG.md estructurados con listas de tareas (- [ ] Título) y encabezados
- [x] #2 Diseñar modal 'Importar Backlog Legacy' en la UI con soporte para carga de archivo y previsualización de ítems detectados antes de confirmar
- [x] #3 Generar archivos atómicos en backlog/tasks/<CODE> - <Title>.md respetando la convención de almacenamiento Markdown distribuido
- [x] #4 Integrar las tareas importadas al tablero y al registro del proyecto en tiempo real sin reiniciar el servidor
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear parser para formatos Markdown planos (listas de tareas, encabezados de sprint/fase).
2. Desarrollar componente modal ImportWizardModal con dropzone y previsualización de tabla.
3. Exponer endpoint POST /api/import/legacy-md para generar los archivos en lote.
<!-- SECTION:PLAN:END -->
