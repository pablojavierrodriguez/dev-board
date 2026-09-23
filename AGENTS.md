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

### Herramientas de Análisis Semántico (`codegraph` MCP)
- `analyze_references`: Encuentra todos los lugares donde se consume un símbolo (`symbolName`).
- `find_definitions`: Ubica la declaración canónica de un símbolo en el workspace.
- `find_type_definitions`, `find_declarations`, `find_implementations`: Navegación de interfaces y tipos.

> [!CAUTION]
> **Regla Anti-Scripts Sueltos:** NUNCA ejecutes scripts de terminal ad-hoc (`node -e ...`) ni comandos bash destructivos (`mv`, `rm` sobre tareas del backlog). Usa siempre las herramientas MCP provistas.

## 3. Comandos de Verificación de Integridad y Releases
- `npm run backlog:check`: Audita la coherencia entre código, criterios y estados.
- `npm run backlog:sync`: Auto-reconcilia tareas completadas y actualiza `BACKLOG.md`.
- `npm run build`: Valida tipado TypeScript, bundle Vite y binarios standalone.
- **Ciclo Canónico de Releases:** Las versiones en desarrollo son `unreleased` (mutables). Solo pasan a `released` (inmutables) al ser formalmente desplegadas a producción.

## 4. Git Hooks y Salvaguardas Pre-Commit
El repositorio utiliza `.githooks/pre-commit` para impedir commits con tareas desactualizadas o desincronizadas. Se configura automáticamente con `npm install` (vía script `prepare`).

> [!CAUTION]
> **Regla de Cero Commits No Solicitados — Prohibido `git commit` por Deducción**
>
> El agente NUNCA debe ejecutar `git commit` por iniciativa propia. Resolver un bug, tildar ACs, sincronizar el backlog o empaquetar archivos NO autoriza a hacer commit.
> - El agente sólo prepara los cambios en el árbol de trabajo y los valida (`tsc`, `build`, `backlog:check`).
> - Se ejecuta `git commit` **única y exclusivamente ante una orden textual y explícita del usuario** (ej: *"hacé el commit"*, *"comiteá"*).

## 5. Metodología de Referencia
- **[Agentic Team Playbook](docs/AGENTIC_PLAYBOOK.md):** Guía metodológica para colaboración estructurada entre humanos y agentes de IA, definición de roles y guardrails anti-alucinación.
- **[Arquitectura de DevBoard](docs/ARCHITECTURE.md):** Mapa canónico de capas, componentes y tabla de impacto rápido.

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

> [!WARNING]
> **`CodeGraph MCP` — Activación del Language Server y Protocolo de Fallback**
>
> `CodeGraph MCP` consulta `vscode.executeWorkspaceSymbolProvider` del TypeScript Language Server (`tsserver`).
> Si en el editor no hay ningún archivo `.ts`/`.tsx` activo, o si el compilador aún no indexó el workspace, devolverá `"Symbol not found in workspace"`.
> **Protocolo obligatorio:** Si `codegraph` no encuentra el símbolo, NO reintentes en bucle ni leas archivos gigantes a ciegas:
> 1. Ubica el subsistema responsable en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
> 2. Ejecuta `grep_search` focalizado en el directorio específico (`SearchPath: ".../src"` o `SearchPath: ".../scripts"`).
> 3. Realiza lecturas quirúrgicas con `view_file` (máx. 50-80 líneas) en el punto exacto.

> [!TIP]
> **Convención de Slugs de Tareas — Prohibido el doble guión (`--`)**
>
> Los nombres de archivo en `backlog/tasks/` deben seguir estrictamente el patrón `dev-XXX - slug-descriptivo.md`.
> Nunca generar prefijos con doble guión como `dev--XXX`. Si se detecta un archivo malformado, renómbralo o re-créalo canónicamente.

> [!NOTE]
> **Soberanía y Tipos Dinámicos — Patrón Proxy Defensivo**
>
> Al renderizar tarjetas con tipos de datos definidos dinámicamente por el usuario (`CustomItemTypeConfig` en `config.customItemTypes`), utiliza siempre un Proxy defensivo o `getItemTypeInfo(item.type, customItemTypes)` para asegurar que cualquier clave arbitraria cuente con icono, badge y paleta semántica por defecto sin provocar fallas de renderizado.

> [!CAUTION]
> **Prohibido `curl http://localhost:4100` — Restricción de Sandbox del Terminal**
>
> El terminal corre en `Standard Sandbox Mode`, el cual bloquea peticiones HTTP salientes locales/remotas no permitidas y devuelve `Port 4100 not allowed for HTTP`.
> **Protocolo canónico para validar el servidor local:**
> 1. **Para saber si el servidor está escuchando:** usar `lsof -nP -iTCP:4100 -sTCP:LISTEN` (inspección de procesos/sockets a nivel kernel, 100% sandboxed y sin fallas).
> 2. **Para validar la interfaz y comportamiento visual:** usar `browser_subagent` (el motor Chromium tiene acceso directo a `http://localhost:4100` sin pasar por el sandbox del shell).

> [!IMPORTANT]
> **Principio de Ortogonalidad de Dimensiones y Anti-Sobrecarga Semántica ("Anti-Label-Smuggling")**
>
> Toda dimensión de datos del modelo (Estado, Sprint, Release, Módulo, Prioridad, Tipo, Asignado, etc.) debe ser 100% ortogonal, independiente y coherente a través de las 3 capas:
> 1. **Modelo/Storage**: Cada atributo almacena exclusivamente su tipo de dato propio. Prohibido mezclar conceptos (ej: usar términos de una dimensión para representar el estado de otra).
> 2. **Prohibido el "Label Smuggling" (sobrecarga semántica)**: Nunca usar un término genérico o global del dominio (como *"Backlog"*, *"General"*, *"Default"*, *"None"*) para ocultar o sustituir un valor ausente de un campo específico. Si un campo no tiene asignación, su valor visual canónico debe ser unívoco y transparente: `Sin Sprint`, `Sin Módulo`, `Sin Épica`, `Sin Asignar` o `—`.
> 3. **Filtros Independientes**: Cada filtro opera exclusivamente sobre su campo sin efectos colaterales en otras dimensiones.
> 4. **UI, Tablas y Formularios**: Cada columna o campo de entrada es independiente. Ocultar o alterar una columna en una tabla (ej. en `SprintView` o `KanbanBoard`) jamás debe ocultar, desplazar ni mutar la visualización de otra columna.

> [!WARNING]
> **Protocolo de Inspección Previa — Prohibido Formular Preguntas Especulativas**
>
> Cuando el usuario reporte una falla visual, confusión de campos o comportamiento anómalo:
> 1. **Cero deducciones al aire**: Prohibido formular cuestionarios teóricos o preguntar *"¿qué preferís hacer?"* antes de haber leído el código y el DOM vivo.
> 2. **Inspección quirúrgica obligatoria**: El agente DEBE abrir inmediatamente el componente TSX responsable (`view_file`) y contrastar con el DOM en el navegador (`browser_subagent`).
> 3. Las preguntas se reservan únicamente para decisiones de producto genuinamente ambiguas tras haber identificado y explicado con precisión técnica la causa raíz en el código.

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

### Auditoría de Alcance Pre-Release (Regla del 100% en Producción)
Antes de promover cualquier versión a `released` en `backlog/releases.json`:
- Ninguna versión en producción puede tener tareas incompletas asociadas (`draft`, `doing`, `review`).
- El agente DEBE verificar que el 100% de las tareas con `milestone` o `targetRelease` asignado a esa versión estén en estado `done`.
- Si existen tareas no terminadas, DEBEN ser formalmente reasignadas a la siguiente versión planificada (ej: `0.5.0`) antes de sellar el release, garantizando que el indicador de Alcance de la versión entregada sea estrictamente del **100%**.

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
