---
id: DEV-026
title: "Unificación de Nombres Binarios CLI (devboard / devboard-mcp) y Limpieza de isDemo en Registry"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-17'
labels:
  - cli
  - dx
  - clean-code
  - configuration
dependencies: []
priority: high
type: chore
milestone: "v1.2.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Unificar la convención de nomenclatura de binarios en package.json eliminando la asimetría entre dev-board y devboard-mcp (estableciendo devboard y devboard-mcp como comandos canónicos y soportando alias retrocompatibles). Eliminar la propiedad ruidosa isDemo: false del archivo data/projects-registry.json tratándola como false por defecto si está ausente.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Configurar bin en package.json con devboard y devboard-mcp como principales, y alias compatibles
- [x] #2 Limpiar data/projects-registry.json eliminando isDemo: false innecesario
- [x] #3 Actualizar vite.config.ts para que saveRegistry y la creación de proyectos no serialicen isDemo cuando sea falsy
- [x] #4 Actualizar referencias en README.md a devboard y devboard-mcp
- [x] #5 Validar con npm run backlog:check y npm run build
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Crear tarea DEV-026 y ponerla en doing.
2. Modificar package.json con los binarios unificados y alias.
3. Limpiar data/projects-registry.json y ajustar vite.config.ts.
4. Actualizar README.md.
5. Ejecutar npm run build y npm run backlog:check.
6. Tildar criterios y pasar tarea a done.
<!-- SECTION:PLAN:END -->
