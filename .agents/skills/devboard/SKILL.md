---
name: devboard
description: DevBoard Agile Cockpit & Backlog management skill. Guides AI agents and LLMs (Antigravity, Cursor, Claude Code) to seamlessly query, pick, update, plan, and complete backlog tasks using the DevBoard MCP server or native Markdown files.
---

# DevBoard Agent Skill

Esta skill instruye a agentes de IA y LLMs para interactuar con **DevBoard**, el cockpit ágil local de alta fidelidad y motor compatible con el estándar **Backlog.md**.

---

## 1. Configuración del Servidor MCP

DevBoard incluye un servidor MCP nativo sobre `stdio` en `scripts/mcp-server.ts`. Para integrarlo en Antigravity, Cursor o Claude Code, agrega lo siguiente a tu configuración MCP (`mcp_config.json` o configuración del IDE):

```json
{
  "mcpServers": {
    "devboard": {
      "command": "node",
      "args": [
        "--experimental-strip-types",
        "/Users/adrisol/Pablo/code/dev-board/scripts/mcp-server.ts"
      ]
    }
  }
}
```

O si el agente se ejecuta en el workspace de `dev-board`:
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
| **`devboard_list_tasks`** | Obtiene la lista de tareas del proyecto activo. | `projectId`, `status`, `priority`, `milestone` |
| **`devboard_get_task`** | Lee el detalle completo de una tarea. | `taskId` (ej: `"DEV-001"`, `"DOM-012"`) |
| **`devboard_create_task`** | Registra una nueva tarea en el backlog. | `title`, `description`, `type`, `priority`, `acceptanceCriteria`, `milestone` |
| **`devboard_update_task`** | Actualiza estado, plan o tilda criterios (AC). | `taskId`, `status`, `toggleAcIndex`, `implementationPlan` |
| **`devboard_export_backlog`**| Genera o actualiza el archivo `BACKLOG.md` consolidado. | `projectId` |

---

## 3. Ciclo de Trabajo Recomendado para Agentes de IA

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

## 4. Convención de Estados Unificada

- **`draft`**: En backlog o triaged (las ideas son tareas en `draft` con etiqueta `idea`).
- **`doing`**: Desarrollo activo por el agente o desarrollador.
- **`review`**: Code review, validación de diseño o pruebas de QA.
- **`ready`**: Merged y listo para deploy o empaquetado en release.
- **`done`**: Desplegado en producción o liberado en una versión.
- **`dismissed` / `cancelled`**: Archivadas fuera del tablero.

---

## 5. Edición Directa en Sistema de Archivos

Si no tienes acceso a herramientas MCP en tu entorno, puedes manipular directamente los archivos en disco:
- Ruta: `<repoPath>/backlog/tasks/<ID> - <Título>.md`
- Formato: YAML frontmatter + delimitadores de sección HTML comentados (`<!-- AC:BEGIN -->`, `<!-- SECTION:PLAN:BEGIN -->`).
- Al guardar el archivo en disco, DevBoard detecta los cambios automáticamente mediante Hot-Reload.
