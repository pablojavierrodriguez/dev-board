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
│    ├── src/components/TrashView.tsx (Papelera y soft-delete directo)   │
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
│  backlog/tasks/*.md (Tareas individuales con YAML frontmatter)         │
│  backlog/releases.json (Registro histórico y versiones activas)        │
│  backlog/sprints.json (Ciclo de vida y balance de sprints)             │
│  backlog/retros/*.md (Retrospectivas de sprint)                        │
│  BACKLOG.md (Backlog monolítico compilado)                             │
│  ~/.devboard/registry.json (Registro global XDG Multi-Proyecto)        │
│  .devboard/config.json (Configuración local de proyecto)               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Catálogo de Archivos Clave

### Frontend (`src/`)

| Archivo | Responsabilidad Principal |
| :--- | :--- |
| [src/App.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/App.tsx) | Punto de entrada UI. Mantiene estado del proyecto activo, tareas, vistas activas (`kanban`, `sprint`, `releases`, `trash`, `settings`), handlers de modales y atajos de teclado. |
| [src/components/Header.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/Header.tsx) | Barra superior con switcher de proyecto, selector de vista principal, triggers de búsqueda, badges de sincronización y estado. |
| [src/components/KanbanBoard.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/KanbanBoard.tsx) | Tablero visual Kanban con columnas por estado (`draft`, `doing`, `review`, `ready`, `done`), drag & drop, agrupación y colapso de columnas. |
| [src/components/SprintView.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/SprintView.tsx) | Vista de planificación de sprints, cálculo de velocidad, métricas de avance y burndown. |
| [src/components/ReleaseAssembler.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/ReleaseAssembler.tsx) | Ensamblador de versiones (`unreleased` y `released`), generación de changelogs y vinculación con tags Git. |
| [src/components/TrashView.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/TrashView.tsx) | Vista directa de Papelera. Gestiona el ciclo de vida de tareas en borrado lógico (`isDeleted: true`), restauración al estado previo y purga definitiva. |
| [src/components/SettingsView.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/SettingsView.tsx) | Panel de configuración del proyecto, opciones de almacenamiento (Markdown vs JSON), rutas de repositorio y estado de MCP. |
| [src/components/FilterBar.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/FilterBar.tsx) | Barra de filtrado unificada con chips interactivos para búsqueda rápida, tipos, prioridades y asignados. |
| [src/components/AdvancedFiltersPopover.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/AdvancedFiltersPopover.tsx) | Popover con filtros avanzados combinados. |
| [src/components/ItemModal.tsx](file:///Users/adrisol/Pablo/code/dev-board/src/components/ItemModal.tsx) | Modal de detalle, creación y edición de tareas. Incluye el editor dinámico de Criterios de Aceptación (AC) y plan técnico. |
| [src/api.ts](file:///Users/adrisol/Pablo/code/dev-board/src/api.ts) | Capa de abstracción cliente con llamadas `fetch` tipadas a los endpoints del servidor embebido. |
| [src/types.ts](file:///Users/adrisol/Pablo/code/dev-board/src/types.ts) | Definiciones de tipos TypeScript: `Project`, `Item` / `Task`, `AcceptanceCriterion`, `Release`, `Sprint`, `FilterState`. |

### Backend Embebido, Scripts & CLI (`vite.config.ts`, `scripts/`, `bin/`)

| Archivo | Responsabilidad Principal |
| :--- | :--- |
| [bin/devboard.js](file:///Users/adrisol/Pablo/code/dev-board/bin/devboard.js) | CLI binario principal (`devboard`). Inicializa servidor Vite embebido con opciones `--single`, `--hub`, `--port`, `--init`, comprobación de actualizaciones y resolución absoluta de rutas. |
| [bin/devboard-mcp.js](file:///Users/adrisol/Pablo/code/dev-board/bin/devboard-mcp.js) | Servidor MCP que expone las 12 herramientas de DevBoard (`devboard_list_tasks`, `devboard_sync_backlog`, `devboard_create_retro`, etc.) a agentes de IA. |
| [vite.config.ts](file:///Users/adrisol/Pablo/code/dev-board/vite.config.ts) | Configuración de Vite y plugin de middleware que implementa los endpoints `/api/*` para lectura/escritura de tareas, proyectos y sincronización. |
| [scripts/backlogMdParser.ts](file:///Users/adrisol/Pablo/code/dev-board/scripts/backlogMdParser.ts) | Motor de parsing y serialización bidireccional entre archivos Markdown individuales (`backlog/tasks/*.md`), `BACKLOG.md` y objetos JSON en memoria. |
| [scripts/initScaffold.js](file:///Users/adrisol/Pablo/code/dev-board/scripts/initScaffold.js) | Asistente interactivo de inicialización y onboarding (`devboard --init`), con soporte de modo silencioso `-y` y scaffolding no destructivo. |
| [scripts/registryConfig.js](file:///Users/adrisol/Pablo/code/dev-board/scripts/registryConfig.js) | Manejo canónico del registro de proyectos multi-repositorio bajo el estándar XDG en `~/.devboard/registry.json` con migración transparente. |
| [scripts/updateChecker.js](file:///Users/adrisol/Pablo/code/dev-board/scripts/updateChecker.js) | Verificador no bloqueante de actualizaciones contra GitHub Releases con caché de 24 horas y notificaciones en CLI y UI. |
| [scripts/verify-backlog-sync.js](file:///Users/adrisol/Pablo/code/dev-board/scripts/verify-backlog-sync.js) | Auditor de coherencia entre criterios de aceptación, estados de tareas y código fuente. Se ejecuta en `.githooks/pre-commit`. |

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

---

## 6. Modelo de Datos Canónico de Tareas (Task Data Specification)

Cada tarea en DevBoard cuando se almacena en modo `backlog-md` reside en `backlog/tasks/<ID> - <slug>.md`. Se compone de metadatos estructurados en YAML frontmatter y secciones de contenido delimitadas por comentarios HTML.

### A. Metadatos de YAML Frontmatter

| Campo Frontmatter | Tipo TypeScript / Valores | Semántica y Propósito | Ámbito de Interfaz |
| :--- | :--- | :--- | :--- |
| `id` | `string` (ej. `DEV-110`) | Identificador canónico e inmutable. | ItemModal, Cards, Tablas |
| `title` | `string` | Título del requerimiento o bug. | ItemModal, Cards, Tablas |
| `status` | `CanonicalStatus` (`ideas`, `draft`, `doing`, `review`, `ready`, `done`, `dismissed`, `cancelled`) | Estado en el flujo de valor normalizado. | ItemModal, Columnas Kanban, Filtros |
| `type` | `ItemType` (`feature`, `bug`, `tech_debt`, `ux`, `epic`, `initiative` + personalizados) | Taxonomía del ítem. Soporta tipos dinámicos. | ItemModal, Badges, Filtros |
| `priority` | `Priority` (`p0`/`urgent`, `p1`/`high`, `p2`/`medium`, `p3`/`low`) | Nivel de urgencia o severidad. | ItemModal, Badges, Filtros |
| `assignee` / `assignees` | `string[]` o `string` | Agentes o desarrolladores asignados. | Tabla SprintView / Backlog |
| `labels` | `string[]` | Etiquetas transversales libres. | Tabla SprintView / Backlog |
| `sprint` / `targetSprint` | `string` (ej. `"Sprint 6"`) | Sprint de trabajo actual. | ItemModal, Sprints Hub |
| `sprints` | `string[]` | Historial multi-sprint (sprints cerrados + actual). | ItemModal (historial) |
| `release` / `targetRelease` | `string` (ej. `"0.6.0"`) | Versión formal planificada o entregada. | ItemModal, Releases Hub |
| `releases` | `string[]` | Array multi-versión asignado. | ItemModal (multi-versión) |
| `parent` / `parentId` | `string` (ej. `"DEV-040"`) | Padre único 1-a-N (Épica / Historia contenedora). | ItemModal (relaciones) |
| `blocks` | `string[]` | Códigos de tareas que dependen de esta tarea. | ItemModal (relaciones) |
| `blocked_by` / `blockedBy` | `string[]` | Tareas que bloquean el inicio de esta tarea. | ItemModal (relaciones) |
| `related_to` / `relatedTo` | `string[]` | Vínculos conceptuales horizontales. | ItemModal (relaciones) |
| `dependencies` | `string[]` | Lista de dependencias funcionales (MrLesk alias). | Persistencia / MCP |
| `created_date` | `string` (datetime/ISO) | Fecha de creación del archivo. | Auditoría / Orden |
| `updated_date` | `string` (datetime/ISO) | Última modificación en disco. | Concurrencia / Sincronización |
| `order` | `number` | Orden relativo en columnas. | D&D Kanban |
| `isDeleted` | `boolean` | Flag de borrado lógico (Papelera). | TrashView |
| `deletedAt` | `string` (ISO) | Fecha de envío a papelera. | TrashView |
| `previousStatus` | `string` | Estado previo para restauración limpia. | TrashView |
| *Arbitrarios* (`rawExtraFrontmatter`) | `Record<string, string>` | Claves YAML adicionales preservadas en round-trip. | Persistencia sin pérdida |

### B. Secciones Delimitadas en el Cuerpo Markdown

| Sección | Delimitador Canónico | Propósito |
| :--- | :--- | :--- |
| `## Description` | `<!-- SECTION:DESCRIPTION:BEGIN -->` ... `<!-- SECTION:DESCRIPTION:END -->` | Requerimiento detallado, contexto o Historia BDD (`COMO/QUIERO/PARA`). |
| `## Acceptance Criteria` | `<!-- AC:BEGIN -->` ... `<!-- AC:END -->` | Criterios de aceptación con checklist `- [x] #1` o `- [ ] #1` y BDD Scenarios. |
| `## Implementation Plan` | `<!-- SECTION:PLAN:BEGIN -->` ... `<!-- SECTION:PLAN:END -->` | Plan de ingeniería paso a paso (Plan Guard). |
| `## Implementation Notes` | `<!-- SECTION:NOTES:BEGIN -->` ... `<!-- SECTION:NOTES:END -->` | Notas técnicas de desarrollo, fixes y riesgos aplicados. |
| `## Final Summary` | `<!-- SECTION:FINAL_SUMMARY:BEGIN -->` ... `<!-- SECTION:FINAL_SUMMARY:END -->` | Resumen de cierre o entrega de la tarea. |

