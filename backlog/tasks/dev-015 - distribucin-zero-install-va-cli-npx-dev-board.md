---
id: DEV-015
title: "Distribución Zero-Install vía CLI (npx dev-board)"
status: Done
created_date: '2026-09-16'
updated_date: '2026-09-17 02:50'
labels: []
dependencies: []
priority: high
type: feature
milestone: "v1.3.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Publicar y empaquetar DevBoard como herramienta de línea de comandos para que cualquier desarrollador pueda ejecutar 'npx dev-board' dentro de cualquier repositorio y visualizar/gestionar su backlog al instante sin dependencias previas.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Configurar punto de entrada CLI ejecutable (bin/devboard.js) con shebang y declaración en package.json
- [x] #2 Detectar automáticamente el proyecto objetivo en process.cwd() (soporte de backlog/tasks/*.md y .devboard/backlog.json)
- [x] #3 Iniciar servidor HTTP estático y de API en un puerto disponible sin requerir clonación del repositorio dev-board
- [x] #4 Abrir automáticamente el navegador web predeterminado al estar listo el servidor
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear script bin/devboard.js que resuelva cwd y opciones de puerto.
2. Adaptar el servidor para servir el bundle compilado de frontend (dist) y middleware de API.
3. Actualizar package.json con campo bin y preparar publicación.
<!-- SECTION:PLAN:END -->
