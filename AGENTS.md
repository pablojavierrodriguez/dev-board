# Guía de Contribución para Agentes de IA (AGENTS.md)

Bienvenido a **DevBoard**. Al trabajar en este repositorio, tanto agentes de IA (Antigravity, Cursor, Claude Code) como desarrolladores humanos deben adherirse estrictamente a las siguientes normas:

## 1. Dogfooding & Sincronización Viva del Backlog
- **Toda modificación de código debe estar asociada a una tarea en `backlog/tasks/`.**
- Pasa la tarea a `doing` antes de codificar.
- Tilda los criterios de aceptación (`- [x]`) en vivo.
- Promociona la tarea a `ready` o `done` antes de proponer o ejecutar un commit.
- **Incluye el archivo `.md` de la tarea en el mismo commit que el código.**

## 2. Herramientas MCP Disponibles
Usa el servidor MCP de DevBoard (`npm run mcp` o `bin/devboard-mcp.js`) para interactuar con el backlog:
- `devboard_list_tasks`: Lista y filtra tareas de forma token-efficient.
- `devboard_get_stats`: Consulta el estado de salud y métricas de avance del proyecto.
- `devboard_get_task`: Lee detalles y criterios de aceptación.
- `devboard_update_task`: Actualiza estado, plan y tilda criterios.
- `devboard_bulk_update_tasks`: Actualiza decenas de tareas en una sola llamada.
- `devboard_list_releases`: Consulta versiones (unreleased en preparación y released históricas).
- `devboard_export_backlog`: Genera el archivo consolidado `BACKLOG.md`.
- `devboard_sync_backlog`: Reconcilia tareas desfasadas y sincroniza `BACKLOG.md` nativamente.

> [!CAUTION]
> **Regla Anti-Scripts Sueltos:** NUNCA ejecutes scripts de terminal ad-hoc (`node -e ...`) ni comandos bash destructivos (`mv`, `rm` sobre tareas del backlog). Usa siempre las herramientas MCP provistas.

## 3. Comandos de Verificación de Integridad y Releases
- `npm run backlog:check`: Audita la coherencia entre código, criterios y estados.
- `npm run backlog:sync`: Auto-reconcilia tareas completadas y actualiza `BACKLOG.md`.
- `npm run build`: Valida tipado TypeScript, bundle Vite y binarios standalone.
- **Ciclo Canónico de Releases:** Las versiones en desarrollo son `unreleased` (mutables). Solo pasan a `released` (inmutables) al ser formalmente desplegadas a producción.

## 4. Git Hooks y Salvaguardas Pre-Commit
El repositorio utiliza `.githooks/pre-commit` para impedir commits con tareas desactualizadas o desincronizadas. Se configura automáticamente con `npm install` (vía script `prepare`).

## 5. Metodología de Referencia
- **[Agentic Team Playbook](docs/AGENTIC_PLAYBOOK.md):** Guía metodológica para colaboración estructurada entre humanos y agentes de IA, definición de roles y guardrails anti-alucinación.
