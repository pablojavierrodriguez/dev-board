---
name: devboard
description: DevBoard Agile Cockpit & Backlog management skill. Guides AI agents and LLMs (Antigravity, Cursor, Claude Code) to seamlessly query, pick, update, plan, and complete backlog tasks using the DevBoard MCP server or native Markdown files.
---

# DevBoard Agent Skill

Esta skill instruye a agentes de IA y LLMs para interactuar con **DevBoard**, el cockpit ágil local de alta fidelidad y motor compatible con el estándar **Backlog.md**.

---

## 1. Configuración del Servidor MCP

DevBoard incluye un servidor MCP autónomo empaquetado sobre `stdio` (`bin/devboard-mcp.js`). Para integrarlo en Antigravity, Cursor o Claude Code en cualquier repositorio:

```json
{
  "mcpServers": {
    "devboard": {
      "command": "npx",
      "args": ["devboard-mcp"]
    }
  }
}
```

O apuntando explícitamente a un repositorio específico:
```json
{
  "mcpServers": {
    "devboard": {
      "command": "npx",
      "args": ["devboard-mcp", "--repo", "/Users/usuario/proyectos/mi-app"]
    }
  }
}
```

O si estás desarrollando en el workspace local de `dev-board`:
```json
{
  "mcpServers": {
    "devboard": {
      "command": "npm",
      "args": ["run", "mcp"]
    }
  }
}
```

---

## 2. Herramientas MCP Disponibles

| Tool | Propósito | Parámetros Clave |
| :--- | :--- | :--- |
| **`devboard_list_projects`** | Lista los proyectos registrados en el cockpit. | Ninguno |
| **`devboard_get_stats`** | Obtiene métricas de salud (total, % completado, conteo agrupado por prefijos como `FEAT-`, `BUG-`, `CORE-`). | `projectId` |
| **`devboard_list_tasks`** | Obtiene la lista de tareas del proyecto activo. Soporta filtros compactos para mínimo consumo de tokens. | `projectId`, `status`, `openOnly`, `prefix`, `taskIds`, `priority`, `milestone`, `search`, `limit`, `format` |
| **`devboard_bulk_update_tasks`** | Actualiza masivamente decenas de tareas por IDs o prefijo en una sola llamada. | `projectId`, `taskIds`, `filterPrefix`, `filterStatus`, `updates` |
| **`devboard_list_releases`** | Consulta releases publicados, notas de cambio y tareas asociadas a una versión. | `projectId`, `version` |
| **`devboard_get_task`** | Lee el detalle completo de una tarea. | `taskId` (ej: `"DEV-001"`, `"AUTH-012"`, `"TASK-005"`) |
| **`devboard_create_task`** | Registra una nueva tarea en el backlog. | `title`, `description`, `type`, `priority`, `acceptanceCriteria`, `milestone` |
| **`devboard_update_task`** | Actualiza estado, plan o tilda criterios (AC). | `taskId`, `status`, `toggleAcIndex`, `implementationPlan` |
| **`devboard_export_backlog`**| Genera o actualiza el archivo `BACKLOG.md` consolidado. | `projectId` |
| **`devboard_sync_backlog`** | Audita y reconcilia tareas desfasadas con criterios de aceptación y regenera `BACKLOG.md` nativamente. | `projectId`, `autoFix` |

---

## 3. Consulta, Análisis y Mutaciones Eficientes (Token-Efficient)

> [!IMPORTANT]
> **REGLA DE ORO ESTRICTA:** **NUNCA ejecutes scripts de terminal ad-hoc como `node -e 'fs.readFileSync(...)'` ni comandos destructivos de bash (`mv`, `rm` sobre `backlog/`)** para inspeccionar o actualizar `.devboard/backlog.json` o `backlog/tasks/`.
> Cualquier operación sobre tareas, estados o consolidación debe realizarse a través de las herramientas MCP provistas (`devboard_update_task`, `devboard_sync_backlog`, etc.). Esto garantiza desacoplamiento, integridad de archivos Markdown y previene saturación de tokens en la ventana de contexto.

### A. Obtener Métricas y Salud del Backlog
Para ver el estado general y desglose por prefijos (`FEAT`, `BUG`, `SPEC`, `CORE`, etc.):
* **MCP:** `devboard_get_stats`
* **CLI:** `npm run tasks -- --stats`

### B. Listar Tareas con Mínimo Consumo de Tokens
Para listar tareas abiertas sin saturar la ventana de contexto:
```json
{
  "name": "devboard_list_tasks",
  "arguments": {
    "openOnly": true,
    "limit": 30,
    "format": "compact"
  }
}
```
O filtrar por prefijo o IDs específicos:
```json
{
  "name": "devboard_list_tasks",
  "arguments": {
    "prefix": "BUG-",
    "openOnly": true
  }
}
```

### C. Actualizaciones Masivas en 1 Sola Llamada
Para pasar decenas de épicas o specs históricas a `done` o cambiarles el milestone:
```json
{
  "name": "devboard_bulk_update_tasks",
  "arguments": {
    "filterPrefix": "EPIC-",
    "updates": {
      "status": "done"
    }
  }
}
```
### D. Consultar Releases y Tareas Asociadas (DEV-023)
Para auditar qué tareas pertenecen a una versión publicada o contrastar contra notas de release sin parsear manualmente archivos:
```json
{
  "name": "devboard_list_releases",
  "arguments": {
    "version": "v1.2.0"
  }
}
```

---

## 4. Ciclo de Trabajo Recomendado para Agentes de IA

Cuando un usuario te pida implementar una tarea del backlog o avanzar con un requerimiento:

### Paso 1: Localizar la Tarea
Usa `devboard_get_task` (o lee directamente el archivo `backlog/tasks/<ID> - <Título>.md`).
Revisa:
- Requerimiento en `<!-- SECTION:DESCRIPTION:BEGIN -->`.
- Criterios de Aceptación (AC) en `<!-- AC:BEGIN -->`.

### Paso 2: Pasar la Tarea a `doing`
Antes de comenzar a escribir código, actualiza el estado de la tarea a `doing`:
```json
{
  "name": "devboard_update_task",
  "arguments": {
    "taskId": "DEV-002",
    "status": "doing"
  }
}
```

### Paso 3: Registrar el Plan Técnico (Plan Guard)
Registra los pasos técnicos que vas a ejecutar en la sección `<!-- SECTION:PLAN:BEGIN -->` usando el parámetro `implementationPlan`.

### Paso 4: Tildar Criterios a Medida que Avanzas
A medida que completes cada criterio de aceptación, tilda su checkbox (`toggleAcIndex` o cambiando `- [ ]` por `- [x]` en el archivo Markdown).

### Paso 5: Pasar a `review` o `ready`
Cuando termines la implementación y las pruebas automáticas pasen:
- Pasa la tarea a `review` (si requiere revisión humana o testing de QA).
- Pasa la tarea a `ready` (si está lista para ser empaquetada en el próximo release).

---

## 5. Convención de Estados Unificada

- **`draft`**: En backlog o triaged (las ideas son tareas en `draft` con etiqueta `idea`).
- **`doing`**: Desarrollo activo por el agente o desarrollador.
- **`review`**: Code review, validación de diseño o pruebas de QA.
- **`ready`**: Merged y listo para deploy o empaquetado en release.
- **`done`**: Desplegado en producción o liberado en una versión.
- **`dismissed` / `cancelled`**: Archivadas fuera del tablero.

### Ciclo de Vida Canónico de Versiones y Releases (DEV-062 y DEV-065)
- **`unreleased` (En Preparación / Staging / Dev):**
  La versión activa actualmente en desarrollo. Es **mutable**, permite incorporar o retirar tarjetas, y sus notas de cambio evolucionan continuamente a medida que se completan requerimientos.
- **`released` (Implementado / Producción):**
  La versión ha sido desplegada formalmente y etiquetada en Git. Representa un **histórico inmutable** con fecha oficial de cierre (`releasedAt`), inamovible para garantizar trazabilidad y auditoría.

---

## 6. Edición Directa en Sistema de Archivos

Si no tienes acceso a herramientas MCP en tu entorno, puedes manipular directamente los archivos en disco:
- Ruta: `<repoPath>/backlog/tasks/<ID> - <Título>.md`
- Formato: YAML frontmatter + delimitadores de sección HTML comentados (`<!-- AC:BEGIN -->`, `<!-- SECTION:PLAN:BEGIN -->`).
- Al guardar el archivo en disco, DevBoard detecta los cambios automáticamente mediante Hot-Reload y SSE en vivo.

---

## 7. Buenas Prácticas de Privacidad y Git (Repositorios Públicos vs Privados)

> [!CAUTION]
> **En repositorios públicos (GitHub/GitLab), TODAS las ramas remotas (`main`, `dev`, `feature/*`) son visibles para todo el mundo.**
> Subir tareas con secretos, costes, vulnerabilidades no divulgadas o ideas confidenciales a una rama secundaria remota **NO las oculta del público**.

### Reglas Clave para Agentes de IA:
1. **Respetar `.gitignore`:** Si el proyecto incluye `.devboard/` o `backlog/` en `.gitignore`, **NUNCA ejecutes `git add -f`** para forzar el versionado del backlog.
2. **Backlog Local Soberano:** En repositorios públicos donde la planificación sea confidencial, el backlog se mantiene localmente en la máquina. Las herramientas MCP (`devboard_create_task`, `devboard_update_task`, etc.) funcionan perfectamente sin requerir `git push`.
3. **Cero Secretos en Tareas:** Nunca agregues claves de API, contraseñas, URLs privadas con tokens o datos sensibles de clientes en títulos, descripciones o planes de tareas.
4. **Trazabilidad y No Destrucción:** NUNCA elimines físicamente archivos de tareas resueltas (`done`). Las tareas completadas son la justificación histórica de los cambios en el código. Si una tarea es descartada, márcala como `dismissed` (DevBoard la preservará automáticamente en `backlog/archive/`).

---

## 8. Gotchas Conocidos del MCP — Errores Detectados en Producción

> [!CAUTION]
> **`devboard_update_task` — El campo `status` DEBE ser top-level, nunca dentro de `updates`**
>
> El wrapper `updates: { status: "ready" }` se ignora silenciosamente. El task mantiene su estado anterior sin error visible.
> ```json
> // ❌ ROTO — el status NO cambia
> { "taskId": "DEV-001", "updates": { "status": "ready" } }
>
> // ✅ CORRECTO — el status SÍ cambia
> { "taskId": "DEV-001", "status": "ready" }
> ```

> [!WARNING]
> **`toggleAcIndex` — No paralelizar sobre el mismo task**
>
> Si se lanzan múltiples llamadas `toggleAcIndex` al mismo task en paralelo (mismo `taskId`),
> ocurren race conditions en la escritura del archivo Markdown y solo algunos ACs quedan tildados.
>
> **Regla:** Llamadas secuenciales para el mismo task, paralelas OK entre tasks distintos.

> [!NOTE]
> **`devboard_list_tasks` con filtro `sprint` puede no filtrar correctamente**
>
> El parámetro `{ "sprint": "Sprint 3" }` en `devboard_list_tasks` puede devolver todos los tasks
> del proyecto en lugar de filtrar por sprint. No confiar en este filtro para auditorías críticas.
>
> **Alternativa segura:** Usar `devboard_get_task` por ID individual para verificar tareas concretas,
> o parsear manualmente el resultado de `devboard_list_tasks` buscando el campo `sprint` en el output.

> [!TIP]
> **Browser subagent tiene cuota separada — usar con moderación**
>
> El browser subagent consume una cuota distinta a la del LLM principal y puede agotarse (429).
> Preferir verificación determinista vía código:
> - `npx tsc --noEmit` → garantiza 0 errores de tipado
> - `grep` sobre archivos fuente → confirma implementación
> - Reservar el browser subagent solo para validaciones UX que no pueden verificarse por código
