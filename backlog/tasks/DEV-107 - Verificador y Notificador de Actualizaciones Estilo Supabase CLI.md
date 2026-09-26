---
id: DEV-107
title: "Verificador y Notificador de Actualizaciones Estilo Supabase CLI"
status: done
created_date: '2026-09-25'
updated_date: '2026-09-25 15:20'
labels: []
dependencies: []
priority: medium
type: feature
milestone: "0.6.0"
sprints:
  - "Sprint 6"
releases:
  - "0.6.0"
sprint: "Sprint 6"
targetSprint: "Sprint 6"
release: "0.6.0"
targetRelease: "0.6.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementar un sistema de notificación de versiones disponibles similar a Supabase CLI o Homebrew, que verifique en segundo plano si existe un release más nuevo en GitHub, cachee el resultado por 24 horas y notifique al desarrollador en consola y en la interfaz visual sin retrasar el tiempo de respuesta.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Verificación no bloqueante en background al ejecutar bin/devboard.js y bin/devboard-mcp.js consultando la versión más reciente en GitHub Releases.
- [x] #2 Almacenamiento en caché local de la última verificación (TTL: 24 horas) en ~/.devboard/update-cache.json para no demorar el inicio del CLI ni saturar la API.
- [x] #3 Mostrar un banner informativo y amigable en terminal cuando exista una versión más reciente con instrucciones claras de actualización.
- [x] #4 Exponer endpoint o flag de actualización para mostrar un badge sutil en el Header de la UI cuando haya una versión nueva.
- [x] #5 Permitir silenciar la verificación mediante variable de entorno (DEVBOARD_NO_UPDATE_CHECK=1).
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear módulo scripts/updateChecker.ts (o helper en bin/) que consulte la API pública de GitHub de releases en segundo plano.
2. Implementar persistencia de caché con timestamp para ejecutar la comprobación como máximo una vez al día.
3. Formatear banner de aviso en bin/devboard.js y bin/devboard-mcp.js.
4. Integrar con el endpoint de estado de la app para reflejar el estado en el Header de la UI.
5. Probar con mock de versión superior y validar con npm test.
<!-- SECTION:PLAN:END -->
