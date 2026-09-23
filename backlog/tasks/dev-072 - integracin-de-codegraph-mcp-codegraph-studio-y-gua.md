---
id: DEV-072
title: "Integración de CodeGraph MCP, Codegraph Studio y Guía de Arquitectura de Código"
status: Done
created_date: '2026-09-23'
updated_date: '2026-09-23 14:43'
labels: []
dependencies: []
priority: high
type: tech_debt
milestone: "Sprint 4"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Integración de la extensión CodeGraph MCP (Andrey Gavrilov) y Codegraph Studio en el entorno de desarrollo para agilizar el análisis semántico de código, reducir consumo de tokens y prevenir regresiones antes del Sprint 4. Incluye la documentación canónica de arquitectura y reglas de navegación para agentes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Configurar el servidor CodeGraph MCP en mcp_config.json apuntando a http://localhost:6010/mcp
- [x] #2 Crear docs/ARCHITECTURE.md con la topología integral del proyecto (Vite backend, Vistas React, Storage y MCP)
- [x] #3 Crear regla en .agents/rules/codebase-navigation.md para guiar la navegación de agentes con CodeGraph y el mapa arquitectónico
- [x] #4 Verificar que los tipos y el build continúen pasando sin regresiones
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Registrar el servidor MCP codegraph en ~/.gemini/config/mcp_config.json.\n2. Crear docs/ARCHITECTURE.md con el mapa exhaustivo de módulos y dependencias de DevBoard.\n3. Crear regla de navegación en .agents/rules/codebase-navigation.md.\n4. Validar compilación TypeScript y sincronización de backlog.
<!-- SECTION:PLAN:END -->
