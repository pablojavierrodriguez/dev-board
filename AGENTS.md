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

---

## 6. Gotchas Críticos del MCP — Reglas Anti-Regresión

Estas reglas provienen de errores detectados en sesiones reales. Son **obligatorias**.

> [!CAUTION]
> **`devboard_update_task` — `status` siempre como campo top-level**
>
> ```
> ROTO  → { "taskId": "DEV-001", "updates": { "status": "ready" } }
> OK    → { "taskId": "DEV-001", "status": "ready" }
> ```
> El campo `status` dentro de `updates` se ignora silenciosamente.

> [!WARNING]
> **`toggleAcIndex` — NUNCA paralelizar sobre el mismo task**
>
> Llamadas paralelas al mismo task generan race conditions y solo algunos ACs quedan tildados.
> Tickear ACs de un mismo task en secuencia. Llamadas sobre tasks distintos pueden ir en paralelo.

> [!NOTE]
> **`devboard_list_tasks` con filtro `sprint` no es confiable**
>
> El filtro `{ "sprint": "Sprint 3" }` puede devolver todos los tasks, no solo los del sprint.
> Para verificar estado de tasks de un sprint específico, usar `devboard_get_task` por ID
> o filtrar manualmente el JSON resultante de `devboard_list_tasks`.

---

## 7. Gate de Calidad Antes de Marcar `ready`

Antes de pasar cualquier tarea a `ready`, el agente DEBE verificar en orden:

1. ✅ **`npx tsc --noEmit` pasa con código 0** — sin errores de tipado
2. ✅ **Los ACs del task están todos tildados** — verificar con `devboard_get_task`
3. ✅ **Sin regresiones visuales obvias** — el componente renderiza en el browser sin errores de consola

> [!IMPORTANT]
> **Refinements UX pedidos durante el sprint van al tope de la cola**
>
> Si el usuario corrige o ajusta algo visual mientras se trabaja (aunque no sea una tarea formal),
> ese feedback se atiende inmediatamente — no al final del sprint. El feedback en caliente
> tiene el mayor valor de retorno y el menor costo de contexto.

---

## 8. Retrospectiva Obligatoria al Cerrar un Sprint

**Al completar todos los items de un sprint, el agente DEBE ejecutar una retrospectiva** antes de declarar el sprint cerrado. No es opcional.

### Formato de la Retro

| Dimensión | Pregunta |
|-----------|----------|
| 🔴 **Problemas** | ¿Qué falló, se rompió o tomó más tiempo del esperado? ¿Por qué? |
| 🟡 **Eficiencia** | ¿Qué podría haberse hecho en menos pasos o con menos tokens? |
| 🟢 **Fortalezas** | ¿Qué funcionó bien y debe repetirse? |
| 📌 **Acciones** | ¿Qué regla, tarea o cambio concreto evitaría los problemas identificados? |

### Salidas Obligatorias de la Retro

Después de la retrospectiva, el agente DEBE:

1. **Actualizar este `AGENTS.md`** con cualquier gotcha o regla nueva descubierta.
2. **Actualizar los skills relevantes** en `.agents/skills/` con las lecciones técnicas.
3. **Crear tareas en el backlog** para mejoras de proceso o producto identificadas.
4. **Confirmar al usuario** que el sprint está cerrado y la retro ejecutada.

### Trigger Automático de la Retro

La retro se dispara cuando:
- Todos los items del sprint activo están en estado `ready` o `done`
- El usuario solicita cerrar el sprint
- El agente detecta que completó el último item del sprint en curso
