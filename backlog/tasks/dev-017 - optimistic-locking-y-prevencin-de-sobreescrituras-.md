---
id: DEV-017
title: "Optimistic Locking y prevención de sobreescrituras silenciosas (ETag / Mtime)"
status: ready
created_date: '2026-09-16'
updated_date: '2026-09-16 23:59'
labels: []
dependencies: []
priority: medium
type: feature
milestone: "v1.3.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementar un mecanismo de control de concurrencia optimista para evitar que ediciones concurrentes entre usuarios de la UI y agentes de IA en disco se pisen silenciosamente sin advertencia.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Incluir timestamp de modificación (mtime) o hash en la respuesta de /api/data para cada tarea del backlog
- [x] #2 Comprobar en PUT /api/items/:id si el archivo en disco cambió después de la fecha en que la UI leyó los datos
- [x] #3 Retornar código HTTP 409 Conflict si se detecta modificación concurrente externa
- [x] #4 Mostrar diálogo amigable de resolución de conflicto en la UI permitiendo al usuario ver cambios o recargar datos frescos sin perder su edición local
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Incluir mtime/hash en endpoints de lectura de tareas en vite.config.ts.
2. Añadir validación de versión previa en guardado de tareas.
3. Integrar modal/aviso de colisión en ItemModal del frontend.
<!-- SECTION:PLAN:END -->
