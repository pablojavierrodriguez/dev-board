---
id: DEV-014
title: "Sincronización en vivo en la UI ante cambios en disco (Live File Watcher / SSE)"
status: Ready
created_date: '2026-09-16'
updated_date: '2026-09-16'
labels: []
dependencies: []
priority: high
type: feature
milestone: "v1.3.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permite que la interfaz web abierta en el navegador actualice el tablero en tiempo real cuando un agente de IA o un comando git modifique archivos Markdown en disco, evitando que el usuario trabaje sobre datos obsoletos o genere colisiones.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Configurar watcher activo en backend (Vite middleware / server) monitoreando archivos en backlog/tasks/*.md y .devboard/
- [x] #2 Establecer canal de eventos reactivo (SSE en /api/events o WebSocket HMR) para notificar cambios de disco a la UI
- [x] #3 El frontend React escucha los eventos y actualiza silenciosamente los datos sin perder filtros ni posición de scroll
- [x] #4 Mostrar notificación o badge visual no intrusivo ('Sincronizado con disco') confirmando la actualización externa
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Implementar endpoint SSE /api/events y watcher con chokidar o fs.watch en vite.config.ts.
2. Añadir listener SSE en frontend (api.ts / App.tsx) para refrescar datos con debounce.
3. Incorporar indicador visual de sincronización en tiempo real en la cabecera.
<!-- SECTION:PLAN:END -->
