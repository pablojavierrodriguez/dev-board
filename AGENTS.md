# Guía de Contribución para Agentes de IA (AGENTS.md)

Bienvenido a **DevBoard**. Al trabajar en este repositorio, tanto agentes de IA (Antigravity, Cursor, Claude Code) como desarrolladores humanos deben adherirse estrictamente a las siguientes normas:

## 1. Dogfooding & Sincronización Viva del Backlog
- **Toda modificación de código debe estar asociada a una tarea en `backlog/tasks/`.**
- Pasa la tarea a `doing` antes de codificar.
- Tilda los criterios de aceptación (`- [x]`) en vivo.
- **Límite Canónico del Desarrollo: Sólo hasta `ready`.** El agente NUNCA promueve una tarea a `done` durante el sprint. El estado `ready` (Ready for Release) es el estado terminal del desarrollo en el sprint.
- **El estado `done` pertenece exclusivamente al Release liberado:** Una tarea pasa a `done` única y exclusivamente cuando la versión formal a la que pertenece es promovida a `released` en `backlog/releases.json`.
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
> **Regla Anti-Scripts Sueltos y Anti-Node Ad-Hoc:** NUNCA ejecutes scripts de terminal ad-hoc (`node -e ...`, `node scripts/...` sueltos) ni comandos bash destructivos (`mv`, `rm` sobre tareas del backlog). Usa siempre los scripts declarados en `package.json` (`npm test`, `npm run backlog:check`, `npm run build:bin`) o las herramientas MCP provistas.

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

> [!CAUTION]
> **Soberanía Estricta de Releases y Versiones — Cero Releases Falsos o Deducidos**
>
> Pertenecer a un Sprint NO implica tener una versión asignada.
> - **Prohibido asociar nombres de Sprint a Release o Milestone**: El agente NUNCA debe escribir `milestone: "Sprint X"` ni inventar versiones artificiales (`vSprint 5`).
> - **Valor por Defecto**: Si una tarea no fue formalmente agregada a una versión en `backlog/releases.json` o asignada explícitamente por el usuario, sus campos de release (`release`, `targetRelease`, `releases`, `milestone`) DEBEN permanecer estrictamente vacíos / `undefined`, mostrándose como `—` en la interfaz.
> - La asignación de versión es soberanía y decisión exclusiva del usuario.

> [!CAUTION]
> **Regla Anti-Suppression — Cero Silenciamiento de Linters o Tipos para Tapar Síntomas**
>
> El agente NUNCA debe apagar o silenciar linters (`"ignore"`, `@ts-ignore`, `eslint-disable`, etc.) para hacer desaparecer advertencias del editor.
> - **Causa Raíz Obligatoria**: Toda advertencia de sintaxis o tipo debe entenderse en su origen.
> - **Configuración de Dialecto**: Si el proyecto utiliza una herramienta (como Tailwind CSS), se configura el dialecto real del entorno (`files.associations` con `tailwindcss`) en lugar de mutilar las alertas de CSS.



> [!WARNING]
> **Protocolo de Inspección Previa — Prohibido Formular Preguntas Especulativas**
>
> Cuando el usuario reporte una falla visual, confusión de campos o comportamiento anómalo:
> 1. **Cero deducciones al aire**: Prohibido formular cuestionarios teóricos o preguntar *"¿qué preferís hacer?"* antes de haber leído el código y el DOM vivo.
> 2. **Inspección quirúrgica obligatoria**: El agente DEBE abrir inmediatamente el componente TSX responsable (`view_file`) y contrastar con el DOM en el navegador (`browser_subagent`).
> 3. Las preguntas se reservan únicamente para decisiones de producto genuinamente ambiguas tras haber identificado y explicado con precisión técnica la causa raíz en el código.

> [!CAUTION]
> **Regla de Eficiencia de Verificación (Anti-Browser-Subagent Ineficiente / Zero-Waste Testing)**
>
> El `browser_subagent` es un recurso pesado en tokens, latency y tiempo del usuario.
> - **Prohibido invocar `browser_subagent` para verificar lógica de estado, contratos de API, cálculos o persistencia de datos** que pueden ser auditados en milisegundos de forma headless.
> - **Pirámide de Verificación Obligatoria:**
>   1. `npx tsc --noEmit` (tipado estricto, 0 errores).
>   2. `npm test` (pruebas de parser e integración en ~300ms).
>   3. `npm run backlog:check` (auditoría de integridad y sincronización viva).
> - `browser_subagent` se reserva **exclusivamente para:**
>   - Validación de bugs visuales complejos de CSS/layout que no puedan deducirse estáticamente.
>   - Pedido explícito y textual del usuario para una prueba visual o captura de pantalla.

> [!NOTE]
> **Gotcha: Estado `ideas` (Idea / Discovery) es Ciudadano de Primera Clase**
>
> En `backlogMdParser.ts`, `CanonicalStatus` y `normalizeStatus` deben preservar `ideas`. NUNCA normalizar o degradar `ideas` a `draft`, ya que rompe la columna `col-ideas` del tablero Kanban y corrompe los filtros de estado del usuario.

> [!NOTE]
> **Gotcha: Simetría y Ortogonalidad de `sprint` vs `sprints`**
>
> - Al desasignar sprint en `ItemModal`, enviar `sprint: ""` y `targetSprint: ""` explícitamente (no `undefined`) para evitar que `JSON.stringify` omita el campo y no se limpie en el backend.
> - `saveBacklogMdItem` debe sincronizar simétricamente `taskData.sprint`, `taskData.targetSprint` y `taskData.sprints`, escribiendo `sprint:` en el frontmatter.
> - `readProjectBacklog` debe resolver `sprintVal` buscando en cascada: `task.sprint || task.targetSprint || rawFm.sprint || (sprints.length ? sprints[last] : undefined)`.

> [!CAUTION]
> **Gotcha: Cero `truncate` en Cajas de Detalle de Diálogos o Mensajes Explicativos**
>
> En `ConfirmModal` u otros contenedores de texto explicativo o de advertencia, NUNCA usar `truncate` o `whitespace-nowrap`. La clase `truncate` corta las oraciones largas con elipsis (`…`), ocultando al usuario el impacto real de su confirmación. Emplear siempre `break-words text-[11px] leading-relaxed` y diseñar textos concisos.

> [!TIP]
> **Gotcha: Estabilidad de Layout y Scrollbar Gutter (Zero-CLS)**
>
> El elemento raíz `html` debe declarar siempre `overflow-y: scroll; scrollbar-gutter: stable;` en `index.css` para evitar que la barra de desplazamiento aparezca y desaparezca entre vistas con distinta altura, previniendo desplazamientos horizontales bruscos del encabezado o contenido.

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

### Auditoría de Alcance y Documentación Pre-Release (Regla del 100% en Producción)
Antes de promover cualquier versión a `released` en `backlog/releases.json`:
- **Alcance 100% en Producción:** Ninguna versión en producción puede tener tareas incompletas asociadas (`draft`, `doing`, `review`). El agente DEBE verificar que el 100% de las tareas con `milestone` o `targetRelease` asignado a esa versión estén en estado `done`. Si existen tareas no terminadas, DEBEN ser formalmente reasignadas a la siguiente versión planificada en preparación (ej: `0.6.0`) antes de sellar el release.
- **Auditoría Obligatoria de Documentación (Gate de Release):**
  1. `README.md` DEBE actualizarse con la nueva versión en la sección *Features Overview*, reflejando las novedades destacadas de la entrega, el catálogo vigente de herramientas MCP, el conteo real de tareas de dogfooding y la navegación vigente.
  2. `docs/ARCHITECTURE.md` DEBE actualizarse si el release introdujo nuevos componentes, vistas o alteró la capa de persistencia.
  3. Las skills en `.agents/skills/` DEBEN revisarse para reflejar nuevas herramientas MCP o parámetros añadidos.
  4. La suite de integridad `npm run backlog:check` DEBE ejecutarse y finalizar con código 0, validando automáticamente la coherencia entre `package.json`, `README.md` y `releases.json`.

---

## 8. Cierre de Sprint y Retrospectiva — Soberanía Exclusiva del Usuario

> [!CAUTION]
> **Prohibido el Cierre de Sprint o Retrospectiva por Deducción**
>
> Completar todos los items asignados a un sprint (`ready`) **NUNCA autoriza al agente a cerrar el sprint ni a ejecutar la retrospectiva final**.
> - El sprint permanece formalmente abierto (`status: "active"`).
> - El agente solo reporta que los items están listos en `ready` y queda a la espera de la validación del usuario (quien puede solicitar ajustes, rechazar criterios o incorporar más tareas al sprint).
> - La retrospectiva y el cierre del sprint se ejecutan **única y exclusivamente ante una orden textual y explícita del usuario** (ej: *"cerremos el sprint"*, *"hacé la retro del sprint 5"*).

### Formato Canónico de la Retro (Solo cuando el usuario ordene el cierre)

| Dimensión | Pregunta |
|-----------|----------|
| 🔴 **Problemas** | ¿Qué falló, se rompió o tomó más tiempo del esperado? ¿Por qué? |
| 🟡 **Eficiencia** | ¿Qué podría haberse hecho en menos pasos o con menos tokens? |
| 🟢 **Fortalezas** | ¿Qué funcionó bien y debe repetirse? |
| 📌 **Acciones** | ¿Qué regla, tarea o cambio concreto evitaría los problemas identificados? |

### Salidas Obligatorias de la Retro

Después de que el usuario ordene formalmente la retrospectiva, el agente DEBE:

1. **Actualizar este `AGENTS.md`** con cualquier gotcha o regla nueva descubierta.
2. **Actualizar los skills relevantes** en `.agents/skills/` con las lecciones técnicas.
3. **Crear tareas en el backlog** para mejoras de proceso o producto identificadas.
4. **Confirmar al usuario** que el sprint está cerrado y la retro ejecutada.
