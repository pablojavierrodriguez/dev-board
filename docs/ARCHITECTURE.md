# Arquitectura del Sistema DevBoard

Este documento describe la topología, capas, flujo de datos y mapa de componentes de **DevBoard**. Está diseñado como referencia rápida y canónica tanto para desarrolladores humanos como para agentes de IA (Antigravity, Cursor, Claude Code) con el fin de agilizar la navegación del código y el análisis de impacto.

---

## 1. Visión General del Sistema

DevBoard es un cockpit ágil *embedded-first* y orientado a la colaboración entre desarrolladores humanos y agentes de IA:
- **Local-first & Zero-cloud**: Todos los datos residen en el repositorio local en formato Markdown (`backlog/tasks/*.md`) o JSON.
- **Dogfooding estricto**: Cada cambio de código se asocia y sincroniza con tareas vivas del backlog.
- **Doble Interfaz**:
  1. **UI Web Visual**: Desarrollada en React 18 + Vite + TailwindCSS.
  2. **Agente / Protocolo MCP**: Expuesta a través de servidores MCP (`devboard` y `codegraph`) para interacción programática por IA.

---

## 2. Mapa de Capas y Componentes

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTACIÓN (React UI)                       │
│                                                                        │
│  src/App.tsx ── (Orquestador principal, estado global y routing)       │
│    ├── src/components/Header.tsx (Selector proyecto, filtros, vistas) │
│    ├── src/components/KanbanBoard.tsx (Tablero interactivo D&D)        │
│    ├── src/components/SprintView.tsx (Gestión de Sprints y métricas)   │
│    ├── src/components/ReleaseAssembler.tsx (Releases y Changelogs)     │
│    ├── src/components/SettingsView.tsx (Configuración y MCP)           │
│    ├── src/components/FilterBar.tsx + AdvancedFiltersPopover.tsx       │
│    └── Modales: ItemModal, ProjectModal, ConfirmModal, etc.            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ llamadas tipadas
┌───────────────────────────────────▼────────────────────────────────────┐
│                          CLIENTE API & TIPOS                           │
│                                                                        │
│  src/api.ts (Endpoints cliente /api/*)                                 │
│  src/types.ts (Interfaces de dominio: Task, Release, Sprint, Project)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / Vite Dev Server
┌───────────────────────────────────▼────────────────────────────────────┐
│                    BACKEND EMBEBIDO & MIDDLEWARE                       │
│                                                                        │
│  vite.config.ts (Middleware de endpoints API /api/backlog, /api/tasks) │
│  scripts/backlogMdParser.ts (Parser y serializador Markdown/YAML)      │
│  scripts/verify-backlog-sync.js (Guard de sincronización viva)         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ I/O Archivos
┌───────────────────────────────────▼────────────────────────────────────┐
│                    PERSISTENCIA & SISTEMA DE ARCHIVOS                  │
│                                                                        │
│  backlog/tasks/*.md (Tareas individuales con YAML frontmatter)         │
│  BACKLOG.md (Backlog monolítico compilado)                             │
│  data/projects-registry.json (Registro local de proyectos)             │
│  .devboard/ (Configuraciones locales de proyecto)                      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Catálogo de Archivos Clave

### Frontend (`src/`)

| Archivo | Responsabilidad Principal |
| :--- | :--- |
| [src/App.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/App.tsx) | Punto de entrada UI. Mantiene estado del proyecto activo, tareas, vistas activas (`kanban`, `sprint`, `releases`, `archive`, `settings`), handlers de modales y atajos de teclado. |
| [src/components/Header.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/Header.tsx) | Barra superior con switcher de proyecto, selector de vista principal, triggers de búsqueda, badges de sincronización y estado. |
| [src/components/KanbanBoard.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/KanbanBoard.tsx) | Tablero visual Kanban con columnas por estado (`draft`, `doing`, `review`, `ready`, `done`), drag & drop, agrupación y colapso de columnas. |
| [src/components/SprintView.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/SprintView.tsx) | Vista de planificación de sprints, cálculo de velocidad, métricas de avance y burndown. |
| [src/components/ReleaseAssembler.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/ReleaseAssembler.tsx) | Ensamblador de versiones (`unreleased` y `released`), generación de changelogs y vinculación con tags Git. |
| [src/components/SettingsView.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/SettingsView.tsx) | Panel de configuración del proyecto, opciones de almacenamiento (Markdown vs JSON), rutas de repositorio y estado de MCP. |
| [src/components/FilterBar.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/FilterBar.tsx) | Barra de filtrado unificada con chips interactivos para búsqueda rápida, tipos, prioridades y asignados. |
| [src/components/AdvancedFiltersPopover.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/AdvancedFiltersPopover.tsx) | Popover con filtros avanzados combinados. |
| [src/components/ItemModal.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/ItemModal.tsx) | Modal de detalle, creación y edición de tareas. Incluye el editor dinámico de Criterios de Aceptación (AC) y plan técnico. |
| [src/api.ts](file:///Users/adrisol/Pablo/code/dev-board/src/api.ts) | Capa de abstracción cliente con llamadas `fetch` tipadas a los endpoints del servidor embebido. |
| [src/types.ts](file:///Users/adrisol/Pablo/code/dev-board/src/types.ts) | Definiciones de tipos TypeScript: `Project`, `Item` / `Task`, `AcceptanceCriterion`, `Release`, `Sprint`, `FilterState`. |

### Backend Embebido & Scripts (`vite.config.ts`, `scripts/`, `bin/`)

| Archivo | Responsabilidad Principal |
| :--- | :--- |
| [vite.config.ts](file:///Users/adrisol/Pablo/code/dev-board/vite.config.ts) | Configuración de Vite y plugin de middleware que implementa los endpoints `/api/*` para lectura/escritura de tareas, proyectos y sincronización. |
| [scripts/backlogMdParser.ts](file:///Users/adrisol/Pablo/code/dev-board/scripts/backlogMdParser.ts) | Motor de parsing y serialización bidireccional entre archivos Markdown individuales (`backlog/tasks/*.md`), `BACKLOG.md` y objetos JSON en memoria. |
| [scripts/verify-backlog-sync.js](file:///Users/adrisol/Pablo/code/dev-board/scripts/verify-backlog-sync.js) | Auditor de coherencia entre criterios de aceptación, estados de tareas y código fuente. Se ejecuta en `.githooks/pre-commit`. |
| [bin/devboard-mcp.js](file:///Users/adrisol/Pablo/code/dev-board/bin/devboard-mcp.js) | Servidor MCP que expone las herramientas de DevBoard (`devboard_list_tasks`, `devboard_update_task`, etc.) a agentes de IA. |

---

## 4. Ecosistema de Herramientas Semánticas (CodeGraph)

Para evitar la sobrecarga de lectura en archivos de gran volumen:

1. **Codegraph Studio (Extensión de Editor)**:
   - Permite al desarrollador abrir cualquier componente en un canvas interactivo para visualizar el árbol de llamadas, ramas de render y referencias.
2. **CodeGraph MCP (`http://localhost:6010/mcp`)**:
   - Conectado a la Language Feature API (TypeScript LSP) del editor.
   - Permite a los agentes de IA consultar definiciones de símbolos y mapeo de referencias de forma instantánea y token-efficient.

---

## 5. Tabla de Impacto Rápido

| Si necesitas modificar... | Archivos principales a intervenir | Efecto colateral a vigilar |
| :--- | :--- | :--- |
| **Estados o campos de una tarea** | [src/types.ts](file:///Users/adrisol/Pablo/code/dev-board/src/types.ts), [scripts/backlogMdParser.ts](file:///Users/adrisol/Pablo/code/dev-board/scripts/backlogMdParser.ts), [vite.config.ts](file:///Users/adrisol/Pablo/code/dev-board/vite.config.ts) | Verificar parser de markdown y consistencia de frontmatter YAML. |
| **Visualización de tarjetas en tablero** | [src/components/ItemCard.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/ItemCard.tsx), [src/components/KanbanBoard.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/KanbanBoard.tsx) | Comportamiento del drag-and-drop y render a 60 FPS. |
| **Criterios de Aceptación o checklist** | [src/components/ItemModal.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/ItemModal.tsx), [scripts/backlogMdParser.ts](file:///Users/adrisol/Pablo/code/dev-board/scripts/backlogMdParser.ts) | Formato de checkboxes `- [x]` y guard pre-commit. |
| **Filtrado y búsqueda** | [src/components/FilterBar.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/FilterBar.tsx), [src/components/AdvancedFiltersPopover.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/AdvancedFiltersPopover.tsx), [src/App.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/App.tsx) | Filtrado reactivo en vistas de Kanban y Sprints. |
| **Endpoints API locales** | [vite.config.ts](file:///Users/adrisol/Pablo/code/dev-board/vite.config.ts), [src/api.ts](file:///Users/adrisol/Pablo/code/dev-board/src/api.ts) | Contratos de respuesta JSON y persistencia en disco. |
| **Herramientas MCP** | [scripts/mcp-server.ts](file:///Users/adrisol/Pablo/code/dev-board/scripts/mcp-server.ts), [bin/devboard-mcp.js](file:///Users/adrisol/Pablo/code/dev-board/bin/devboard-mcp.js) | Compatibilidad de parámetros con `AGENTS.md`. |
