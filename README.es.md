# DevBoard ⚡

> **Tablero Kanban ágil, gestor de Sprints y Cockpit de Releases soberano y local-first, diseñado para desarrolladores y desarrollo pair-programming con agentes de IA.**

🌐 **[English](README.md)** | **[Español](README.es.md)**

[![Metodología: Agentic Team Playbook](https://img.shields.io/badge/Metodolog%C3%ADa-Agentic%20Team%20Playbook-purple.svg)](https://github.com/pablojavierrodriguez/agentic-team-playbook)
[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-blue.svg)](LICENSE)
[![Protocolo MCP: 2024-11-05](https://img.shields.io/badge/MCP-Protocolo%20Listo-6366f1.svg)](https://modelcontextprotocol.io/)

DevBoard es un cockpit autónomo para desarrolladores diseñado para eliminar la fricción de gestionar tareas, deuda técnica, backlogs de sprint y releases directamente junto a tu código fuente.

Construido con **React 18**, **Vite**, **TypeScript** y **Tailwind CSS**. Diseñado para operacionalizar la metodología [**Agentic Team Playbook**](docs/AGENTIC_PLAYBOOK.md).

---

## 💡 ¿Por qué DevBoard?

### El Problema
Al gestionar bases de código, el seguimiento de tareas suele comenzar como archivos Markdown estáticos (`BACKLOG.md`, `TODO.md`). Con el tiempo, se convierten en cementerios desestructurados de sólo escritura: difíciles de priorizar entre sprints, imposibles de filtrar interactivamente y dolorosos de reconciliar al redactar notas de release.

Las herramientas de gestión en la nube (Jira, Trello, Asana) caen en el extremo opuesto: tiempos de carga lentos, sobrecarga corporativa, desconexión de los commits de Git y la obligación de almacenar arquitectura privada, deuda técnica y fallos de seguridad en servidores de terceros.

### Ventajas de DevBoard frente a Herramientas en la Nube

| Factor | Herramientas Cloud (Jira, Trello, Asana) | DevBoard ⚡ |
| :--- | :--- | :--- |
| **Privacidad de Datos** | Alojado en la nube. Roadmaps y vulnerabilidades en servidores remotos. | **100% Soberano y Local-First**. Cero telemetría, cero fugas. Almacenado en tu repo local. |
| **Alineación con Git** | Desconectado del código; requiere sincronización manual o webhooks frágiles. | **Versionado junto a tu código**. Comitea estados de tareas junto a pull requests y ramas. |
| **Velocidad y Peso** | Bundles pesados, segundos de carga, spinners constantes. | **Arranque instantáneo en <200ms**. Cero sobrecarga, corre localmente en un único puerto. |
| **Foco del Flujo** | Sobrecargado de formularios corporativos, permisos y ruido de notificaciones. | **Enfocado en flujos de desarrollo**: Ideas → Sprint → Plan → Release. |
| **Pair-Programming con IA** | Campos de texto genéricos sin contexto estructurado para agentes de código. | **Puente Nativo para IA**: Plan Guard, Servidor MCP sobre stdio y prompts listos para agentes. |

---

## 🗄️ Motor Dual de Almacenamiento Flexible

DevBoard te otorga control explícito sobre cómo se almacena cada proyecto en disco, con **cero dependencias externas**:

### 1. Markdown Distribuido (`backlog-md`)
- **Formato**: `backlog/tasks/<CODIGO> - <Titulo>.md` con frontmatter YAML limpio y secciones delimitadas (`<!-- AC:BEGIN -->`, `<!-- SECTION:PLAN:BEGIN -->`).
- **Por qué usarlo**: Ideal para equipos o flujos multi-agente. Al ser cada tarea un archivo independiente, ramas concurrentes de Git y agentes de IA pueden crear, actualizar y resolver tareas con **cero conflictos de fusión (merge conflicts)**.

### 2. Archivo Único JSON (`json`)
- **Formato**: `.devboard/backlog.json`
- **Por qué usarlo**: Ideal si prefieres una huella compacta en un solo archivo sin crear archivos individuales de tareas en tu repositorio.

### 🔄 Conversión Bidireccional en 1 Clic
Desde la configuración del proyecto en DevBoard, puedes convertir entre motores de almacenamiento en cualquier momento sin pérdida de datos:
- **"Pasar a archivos .md individuales"**: Toma `.devboard/backlog.json` y lo divide en `backlog/tasks/*.md`.
- **"Unificar en un solo archivo JSON"**: Toma `backlog/tasks/*.md` y compacta todo en `.devboard/backlog.json`.

### 💾 Exportación y Descargas
- **Reporte Documental (`BACKLOG.md`)**: Exporta un resumen consolidado en Markdown de tu tablero o sprint activo para PRs, issues o documentación.
- **Copia de Seguridad Completa (`backlog.json`)**: Exporta todos los datos del proyecto (tareas, criterios de aceptación, planes técnicos, releases) para archivo offline o migración.

---

## 📐 Metodología: Agentic Team Playbook

DevBoard está diseñado desde sus cimientos para operacionalizar el [**Agentic Team Playbook**](docs/AGENTIC_PLAYBOOK.md), un marco de ingeniería riguroso para equipos que colaboran con agentes de IA (Antigravity, Cursor, Claude Code, GitHub Copilot).

Reemplaza el caos del *"vibe coding"* con salvaguardas estrictas y transparentes:
- **Fase 1: Contexto y Anclaje** — Ningún agente modifica código sin anclarse a una tarea atómica en `backlog/tasks/`.
- **Fase 2: Plan Guard** — Arquitectura explícita y plan de implementación paso a paso antes de escribir código.
- **Fase 3: Ejecución Atómica Incremental** — Seguimiento interactivo con casillas (`- [x]`) y estricto aislamiento de alcance.
- **Fase 4: Gates Automatizados de Verificación** — Hooks pre-commit (`.githooks/pre-commit`) previenen desincronizaciones entre código y backlog.
- **Fase 5: Release Hub y Trazabilidad** — Versionado histórico, compilación automática de changelogs y cero conflictos de Git.

👉 Consulta la metodología completa en [**docs/AGENTIC_PLAYBOOK.md**](docs/AGENTIC_PLAYBOOK.md).

---

## 🎯 Elige tu Camino: ¿Para Quién es DevBoard?

DevBoard atiende a dos perfiles principales. Elige el camino según tu objetivo:

| 👤 Perfil 1: Usuario de Producto / Desarrollador de Aplicaciones | 🛠️ Perfil 2: Contribuidor y Desarrollador del Core |
| :--- | :--- |
| **"Quiero gestionar tareas y usar IA en mi proyecto existente"** | **"Quiero modificar el código de DevBoard, personalizarlo o hacer un fork"** |
| ✅ Cero necesidad de clonar el repositorio de DevBoard | ✅ Clona o bifurca el repositorio de DevBoard |
| ✅ Configuración guiada en 1 minuto vía CLI (`devboard --init`) | ✅ Modifica componentes React, Tailwind y código TypeScript |
| ✅ Tablero web local + integración de IA en Cursor / Claude / Antigravity | ✅ Ejecuta servidor Vite con Hot Module Reload (`npm run dev`) |
| ⏩ **[Ir a Guía de Onboarding e Inicio Rápido](#-guía-de-onboarding-e-inicio-rápido-perfil-1)** | ⏩ **[Ir a Guía para Desarrolladores y Contribuidores](#-guía-para-desarrolladores-y-contribuidores-perfil-2)** |

---

## 🚀 Guía de Onboarding e Inicio Rápido (Perfil 1)
*Usa DevBoard en cualquier repositorio sin clonar ni modificar el código fuente de DevBoard.*

### Paso 1: Instalación Global (Recomendado, sólo una vez en tu equipo)
Instala el CLI directamente desde el repositorio oficial de GitHub:
```bash
npm install -g github:pablojavierrodriguez/dev-board
```
*(O ejecútalo bajo demanda sin instalación global: `npx github:pablojavierrodriguez/dev-board`)*

### Paso 2: Inicializa tu Repositorio (Configuración guiada en 1 minuto)
Abre un terminal en la raíz de tu proyecto (ej: `mi-app`) y ejecuta:
```bash
devboard --init
```
*(O vía npx: `npx github:pablojavierrodriguez/dev-board --init`)*

El asistente interactivo en español te guiará a través de 5 decisiones:
1. **Modo de Instanciación**: Elige **Mono-Proyecto** (aislado y autocontenido para este repo) o **Multi-Proyecto Hub** (registrado en el Hub global `~/.devboard/registry.json`).
2. **Skill para Agentes de IA**: Instala `.agents/skills/devboard/SKILL.md` para que Cursor, Antigravity y Claude Code conozcan las herramientas MCP.
3. **Guía de Gobernanza (AGENTS.md)**: Genera `AGENTS.md` con reglas de dogfooding, salvaguardas pre-commit y flujos de trabajo con agentes.
4. **Scripts en package.json**: Agrega scripts inteligentes `"board"` y `"mcp"` con fallback automático a GitHub (`devboard 2>/dev/null || npx -y github:pablojavierrodriguez/dev-board`).
5. **Reglas para Git**: Añade exclusiones recomendadas (`.devboard/update-cache.json`, etc.) a tu `.gitignore`.

*Modo no interactivo para integración continua (CI) o scripts:*
```bash
devboard --init -y
```

### Paso 3: Uso Diario — Abrir tu Tablero
Cada vez que vayas a trabajar en tu proyecto, ejecuta:
```bash
devboard
```
*(O `npm run board` si configuraste los scripts durante la inicialización).*  
*DevBoard iniciará el cockpit visual en tu navegador predeterminado en `http://localhost:4100` en menos de 200ms.*

### Paso 4 (Opcional): Conectar tu Agente de IA (Cursor / Claude / Antigravity)
Agrega DevBoard a la configuración MCP de tu entorno (`.cursor/mcp.json`, Claude Desktop o Antigravity):

#### Opción A: Mediante npm run (Recomendado en el repositorio)
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

#### Opción B: Mediante binario global
```json
{
  "mcpServers": {
    "devboard": {
      "command": "devboard-mcp"
    }
  }
}
```

*Tu agente de IA detectará automáticamente `backlog/tasks/` en tu repositorio y gestionará tareas a través de 12 herramientas dedicadas.*

---

## 🛠️ Guía para Desarrolladores y Contribuidores (Perfil 2)
*Para desarrolladores que desean extender DevBoard, personalizar componentes visuales o contribuir al core.*

### 1. Clonar y Ejecutar el Entorno de Desarrollo
Clona el repositorio e inicia Vite con recarga rápida (HMR):
```bash
git clone https://github.com/pablojavierrodriguez/dev-board.git
cd dev-board
npm install
npm run dev
```
*Abre `http://localhost:4100`. Los hooks de pre-commit se configuran automáticamente mediante `npm install`.*

### 2. Enlace Local de Desarrollo (`npm link`)
Para usar tu fork local de forma global en otros proyectos de tu máquina:
```bash
npm link
```
*Ahora los comandos `devboard` y `devboard-mcp` ejecutarán directamente tu versión local.*

### 3. Modos y Banderas Avanzadas del CLI
- `--single` / `--mono`: Fuerza el modo mono-proyecto aislado (bloquea el contexto a la carpeta actual e ignora otros repositorios).
- `--hub`: Fuerza el modo hub multi-proyecto (carga y gestiona todos los proyectos registrados en `~/.devboard/registry.json`).
- `--port <número>`: Especifica un puerto personalizado (ej: `devboard --port 4200`).
- `--repo <ruta>`: Apunta a una ruta de repositorio explícita en lugar de la carpeta actual.
- `--no-open`: Inicia el servidor sin abrir el navegador automáticamente.

**Silenciar Verificación de Actualizaciones:**
Al igual que Supabase CLI, DevBoard consulta lanzamientos de GitHub Releases una vez cada 24 horas en segundo plano. Para deshabilitarlo:
```bash
DEVBOARD_NO_UPDATE_CHECK=1 devboard
```

---

## 🤖 Herramientas del Servidor MCP (12 Tools)

DevBoard incluye un servidor MCP autónomo sobre `stdio` (`bin/devboard-mcp.js`):

| Herramienta | Propósito | Parámetros Clave |
| :--- | :--- | :--- |
| `devboard_list_projects` | Lista los proyectos registrados en el cockpit y su motor de almacenamiento (`backlog-md` o `json`). | Ninguno |
| `devboard_get_stats` | Consulta métricas consolidadas (% completado, abiertas vs cerradas, agrupadas por prefijo). | `projectId` |
| `devboard_list_tasks` | Consulta de tareas con filtros de alta eficiencia de tokens (formato `compact` de 1 línea, `openOnly`, `prefix`). | `projectId`, `status`, `openOnly`, `prefix`, `taskIds`, `format`, `limit` |
| `devboard_get_task` | Obtiene el detalle completo de una tarea, sus criterios de aceptación y plan de implementación. | `taskId` (ej: `"DEV-001"`, `"TASK-010"`) |
| `devboard_create_task` | Registra una nueva tarea en el formato nativo del proyecto (`backlog/tasks/*.md` o JSON). | `title`, `description`, `type`, `priority`, `acceptanceCriteria` |
| `devboard_update_task` | Actualiza estado (`draft`, `doing`, `review`, `ready`, `done`), tilda criterios secuencialmente o define planes técnicos. | `taskId`, `status`, `toggleAcIndex`, `implementationPlan` |
| `devboard_bulk_update_tasks` | Actualización masiva de decenas de tareas en una sola llamada (por prefijo o lista de IDs). | `projectId`, `taskIds`, `filterPrefix`, `updates` |
| `devboard_list_releases` | Consulta versiones publicadas, notas de changelog y tareas asociadas. | `projectId`, `version` |
| `devboard_export_backlog` | Genera o actualiza el informe consolidado `BACKLOG.md`. | `projectId` |
| `devboard_sync_backlog` | Audita y reconcilia tareas completadas con criterios de aceptación y sincroniza `BACKLOG.md`. | `projectId`, `autoFix` |
| `devboard_create_retro` | Genera un archivo estructurado de retrospectiva para un sprint finalizado. | `projectId`, `sprintId`, `sprintName`, `date`, `author` |
| `devboard_list_retros` | Lista retrospectivas históricas registradas en `backlog/retros/`. | `projectId` |

---

## 🔒 Privacidad y Estrategias Git: Repositorios Públicos vs Privados

DevBoard es **100% soberano y local-first**: tus datos nunca se envían a servidores externos ni plataformas de telemetría. Al residir los datos directamente en tu disco como archivos, puedes elegir la estrategia adecuada según la visibilidad de tu repositorio:

### ⚠️ Principio Crítico de Git en Repositorios Públicos
En repositorios públicos de Git (ej: GitHub, GitLab), **todas las ramas y commits enviados (`git push`) son públicos para el mundo**, no únicamente la rama `main`. ¡Comitear un roadmap confidencial a una rama `dev` o `feature` lo expone públicamente!

### Estrategias Recomendadas

#### Estrategia 1: "Backlog as Code" (Recomendada para Repos Privados u Open-Source Público)
- **Archivos**: Comitea `backlog/tasks/*.md` (o `.devboard/backlog.json`) directamente en Git.
- **Beneficios**: Tareas, criterios de aceptación y planes viajan en las mismas Pull Requests que el código implementado. Auditoría completa en el historial de Git.
- **Cuándo usarla**: El repositorio es privado dentro de tu organización, O es un proyecto de código abierto con un roadmap deliberadamente público.

#### Estrategia 2: Backlog Soberano Local mediante `.gitignore` (Recomendada para Repos Públicos con Roadmap Interno)
- **Configuración**: Añade las carpetas de DevBoard a tu `.gitignore`:
  ```gitignore
  # Ignorar backlog interno de DevBoard en repositorios públicos
  .devboard/
  backlog/
  ```
- **Beneficios**: Disfrutas de todo el cockpit visual, gestión de sprints y MCP localmente, sin que detalles de negocio, deuda técnica o vulnerabilidades sin parchear se suban a GitHub.
- **Cuándo usarla**: Trabajas en repositorios públicos o de clientes donde el seguimiento de tareas debe permanecer estrictamente confidencial.

#### Estrategia 3: Repositorio Dedicado de Backlog Privado
- Mantén el repositorio público limpio de tareas y gestiona un repositorio privado independiente (ej: `mi-proyecto-backlog`).
- Apunta DevBoard o el MCP a ese directorio:
  ```bash
  devboard-mcp --repo /ruta/a/mi-proyecto-backlog
  ```

---

## 📜 Política de Backlog Histórico y Cero Pérdida de Datos

En DevBoard, **ninguna tarea, fix o decisión arquitectónica debe desaparecer jamás sin dejar rastro en Git**:

1. **Inmutabilidad de Tareas Resueltas (`done` / `released`)**:
   - Las tareas completadas **nunca se eliminan**. Permanecen indefinidamente en `backlog/tasks/*.md` como documentación viva para desarrolladores y agentes de IA futuros.
   - Al cerrar un release, las tareas se consolidan en notas de versión (`docs/RELEASE_NOTES.md`), vinculando commits de código con IDs de tarea (`DEV-001`, `DEV-014`).

2. **Archivado Suave No Destructivo (`backlog/archive/`)**:
   - Cuando una tarea se descarta, cancela o reemplaza, DevBoard **nunca realiza un borrado destructivo de disco**.
   - En su lugar, el archivo se traslada a `backlog/archive/<ID> - <Titulo>.md` con estado `dismissed`. Al comitearse a Git, la justificación de por qué se descartó la solución queda preservada para siempre.

3. **Aislamiento Estricto de Fixtures de Prueba**:
   - Las suites de tests automatizados operan sobre carpetas temporales aisladas (`data/test-repo-*`), garantizando que datos sintéticos de prueba nunca contaminen el backlog de producción.

---

## 🛠️ Comandos de Verificación e Integridad

DevBoard incluye salvaguardas integradas para garantizar cero desincronización entre código fuente, criterios de aceptación y documentación:

```bash
# Audita coherencia entre código, criterios tildados y estados de tareas
npm run backlog:check

# Auto-reconcilia tareas completadas y actualiza el BACKLOG.md consolidado
npm run backlog:sync

# Auditoría estática de UX y rendimiento (zero CLS, saltos de layout, touch targets)
npm run audit:ux

# Valida tipado estricto TypeScript, bundle Vite y empaqueta binarios standalone
npm run build
```

---

## ✨ Resumen de Características (v0.6.1)

- **⚡ Resiliencia Zero-Install y Scaffolding (Hotfix v0.6.1)**: Hook `prepare` resiliente en `package.json` y scripts generados con fallback automático (`devboard 2>/dev/null || npx -y github:pablojavierrodriguez/dev-board`), garantizando cero abortos en `npx` y ejecución inmediata de `npm run board` sin requerir instalaciones globales (`DEV-112`, `DEV-113`).
- **📦 Distribución Global por CLI y Empaquetado**: Binarios ejecutables nativos `devboard` y `devboard-mcp` con resolución absoluta de rutas en Tailwind CSS y bundler Vite (`DEV-108`).
- **🔒 Modo Mono-Proyecto Aislado y Hub Multi-Proyecto**: Aislamiento estricto de repositorios (`--single`) para impedir fugas de datos entre proyectos, junto con gestión centralizada (`--hub`) bajo el estándar XDG (`~/.devboard/registry.json`) (`DEV-104`, `DEV-105`).
- **🧙 Asistente Interactivo de Inicialización (`devboard --init`)**: Asistente guiado de onboarding interactivo mediante readline nativo con soporte de modo silencioso `--yes`/`-y`, configuración personalizada de skills de IA, reglas `AGENTS.md`, scripts y exclusiones Git (`DEV-109`).
- **🔔 Notificador Silencioso de Actualizaciones**: Verificador no intrusivo inspirado en Supabase CLI con caché local de 24 horas y opt-out mediante `DEVBOARD_NO_UPDATE_CHECK=1` (`DEV-107`).
- **🏷️ Etiquetas y Asignados Interactivos en ItemModal**: Editor interactivo de tags con adición/eliminación por teclado y selector visual de asignados en el modal de detalle (`DEV-111`).
- **📋 Compatibilidad Canónica con Motor Backlog.md**: Preservación estricta de mayúsculas/minúsculas en IDs, actualizaciones atómicas en el archivo, mapeo canónico de sprints y conservación de `itemCodes` en releases (`DEV-103`).
- **🛡️ Auditoría Automatizada Pre-Release**: Verificador de integridad en `verify-backlog-sync.js` que impide documentación desfasada o tareas huérfanas antes de sellar versiones (`DEV-102`, `DEV-110`).
- **🎨 Estética Linear y Raycast**: Glassmorphism refinado, paleta semántica oscura, alternancia con modo claro y estabilidad de layout sin saltos (zero CLS: `overflow-y: scroll`, `scrollbar-gutter: stable`).
- **🔄 Metodologías Ágiles Duales (Kanban vs Scrumban)**: 
  - **Kanban**: Flujo continuo de entrega de valor sobre todas las tareas sin empaquetado artificial.
  - **Scrumban**: Tablero enfocado en el **Sprint Goal** activo con seguimiento visual de progreso (% completado, tareas en curso, indicador de cumplimiento de objetivo).
- **🎛️ Modos Dinámicos de Columnas**:
  - **Modo Simple (3 columnas)**: Optimizado para velocidad y claridad (*Draft*, *Doing*, *Done*).
  - **Modo Ampliado (5 columnas)**: Ciclo completo de calidad (*Draft*, *Doing*, *Review*, *Ready*, *Done*).
  - **Columna de Descubrimiento (Ideas)**: Canal toggleable dedicado a ideas preliminares sin causar saltos de layout.
- **🎯 Hub de Sprints y Priorización**: Ciclo de vida completo de sprints (planificación, desarrollo activo, cierre con generación automática de retrospectivas), tablas de datos densas, grupos colapsables y ordenamiento natural.
- **🌳 Relaciones Jerárquicas y Grafo de Épicas**: Relaciones padre-hijo, subtareas y grafos de dependencia.
- **🧪 Soporte Nativo BDD**: Especificación Given/When/Then de primera clase en historias de usuario y criterios de aceptación.
- **🗑️ Papelera Directa y Ciclo Seguro**: Vista de primer nivel (`TrashView`) con soft-delete, restauración en un clic o purgado permanente, desacoplada de tareas descartadas.
- **🔔 Diálogos Contextuales y Accesibles**: Componente `ConfirmModal` de nivel profesional para acciones destructivas y promoción de releases a producción.
- **⚙️ Configuración Dedicada de Proyecto (`SettingsView`)**: Configuración persistente guardada en `.devboard/config.json` (metodología, taxonomía de tipos personalizados, columnas, límites WIP y preferencias de tema).
- **🚀 Gestión Soberana de Releases**: Seguimiento estricto entre versiones en preparación (*unreleased*) y desplegadas a producción (*released*), con compilación automatizada de changelogs y ortogonalidad absoluta entre sprints y releases.
- **🛡️ Plan Guard**: Asegura que cualquier tarea que pase a `doing` cuente con criterios de aceptación documentados y plan de implementación antes de codificar.
- **📂 Explorador de Archivos Multiplataforma**: Selector visual de carpetas (`FolderPickerModal`) para macOS, Linux y Windows con detección automática de repositorios.
- **🤖 Puente MCP Autónomo**: 12 herramientas dedicadas para agentes de IA con filtros de mínimo consumo de tokens, actualizaciones atómicas por lotes, generadores de retrospectivas y sincronización en vivo.

---

## 🐶 Dogfooding ("Git Building Git")

DevBoard se construye utilizando DevBoard para gestionar su propio desarrollo.

Este repositorio contiene una carpeta [`backlog/tasks/`](backlog/tasks/) gestionada en modo `backlog-md`, registrando funcionalidades reales, pulido de UX y releases a lo largo de **110+ tareas** (`DEV-001` a `DEV-113`), 7 sprints completados (Sprint 0 al 6) y 6 releases formales (`v0.2.0` a `v0.6.1`).

---

## ⌨️ Atajos de Teclado

- `N`: Crear nueva tarea en el backlog
- `⌘K` / `Ctrl+K`: Enfocar barra de búsqueda instantánea
- `1` - `5`: Cambiar de pestaña (`1`: Tablero Kanban, `2`: Sprint y Priorización, `3`: Releases, `4`: Papelera, `5`: Configuración)
- `Esc`: Cerrar modales activos
- `⌘+Enter`: Guardar tarea / formulario

---

## 🤝 Ecosistema e Interoperabilidad

DevBoard promueve flujos de desarrollo abiertos y soberanos sin ataduras propietarias. Su motor de almacenamiento en Markdown distribuido adopta la convención de archivos independientes (`backlog/tasks/*.md`) popularizada por estándares comunitarios como [MrLesk/Backlog.md](https://github.com/MrLesk/Backlog.md).

Este diseño permite a los equipos de ingeniería combinar libremente herramientas CLI de terminal con el cockpit visual de DevBoard y agentes de IA en el mismo repositorio, fomentando un ecosistema colaborativo, interoperable y basado en archivos.

---

## 📄 Licencia

MIT © 2026 Contribuidores de DevBoard
