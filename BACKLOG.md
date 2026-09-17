# Backlog: DevBoard (Cockpit & Engine)
> Consolidado generado el 2026-09-17 por DevBoard ⚡

## Resumen de Estados

### 📋 Backlog / Draft (7)

#### [DEV-006] Sistema de Configuración y Settings Persistentes (.devboard/config.json y UI)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Crear un sistema integral de configuración persistente para que el usuario pueda personalizar su experiencia en DevBoard.
Permite definir qué opciones visuales y funcionales están activas (densidad visual, tema por defecto, visibilidad de columna Ideas, WIP limits, columnas personalizadas).
La configuración debe guardarse en el repositorio local en un archivo JSON predeterminado (`.devboard/config.json`) con valores por defecto bien estructurados.
El usuario debe tener la flexibilidad de modificar las opciones tanto editando directamente el archivo JSON como desde una interfaz gráfica de Settings accesible desde la UI.

**Criterios de Aceptación:**
- [ ] #1 Diseñar el esquema y valores predeterminados para el archivo local `.devboard/config.json`
- [ ] #2 Implementar endpoints `GET /api/settings` y `POST /api/settings` en la API local de Vite
- [ ] #3 Crear componente modal `SettingsModal.tsx` accesible desde un botón de engranaje en el Header
- [ ] #4 Implementar hot-reload o sincronización cuando el usuario modifica `.devboard/config.json` directamente en el editor
- [ ] #5 Permitir alternar preferencias visuales (modo compacto, tema predeterminado, animaciones) y funcionales desde la UI

---

#### [DEV-007] Optimización de UX Responsive y Mobile para Pantallas Pequeñas
- **Prioridad**: `high` | **Tipo**: `ux`
- **Sprint / Milestone**: v1.2.0

Optimizar de forma integral la experiencia de usuario (UX/UI) de DevBoard en dispositivos móviles y pantallas pequeñas (< 768px).
Actualmente la interfaz sufre de desbordamientos horizontales, la cabecera se satura de botones, las múltiples columnas del Kanban se comprimen haciéndose ilegibles y los modales se salen de los límites de la pantalla.
Se requiere un diseño adaptativo mobile-first: navegación colapsable en Header, selector de columna por tabs o scroll-snap para el tablero Kanban, y modales que se transformen en bottom-sheets o vistas de pantalla completa en mobile.

**Criterios de Aceptación:**
- [ ] #1 Adaptar Header para mobile: menú colapsable (hamburguesa/drawer) o barra inferior para selector de proyectos y acciones
- [ ] #2 Implementar vista mobile para el Kanban: selector de columna tipo tabs/pills o swipe horizontal con snap para ver una columna a la vez
- [ ] #3 Adaptar modales (`ItemModal`, `ProjectModal`, `ConfirmModal`, `SettingsModal`) a modo bottom-sheet o pantalla completa en pantallas < 640px
- [ ] #4 Garantizar áreas táctiles mínimas de 44x44px para botones e interactivos en mobile
- [ ] #5 Eliminar cualquier scroll horizontal indeseado a nivel de ventana (`overflow-x-hidden` seguro en layout principal)

---

#### [DEV-008] Simplificación de Vista Kanban: Columna Ideas Opcional y Oculta por Defecto
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Simplificar la vista simplificada del Kanban distinguiendo claramente entre el backlog crudo de "Ideas" (sin discovery, sin refinamiento ni priorización) y el verdadero "Backlog" de trabajo listo (filtrado, priorizado y en refinamiento).
En la vista simplificada, la columna de "Ideas" debe permanecer oculta por defecto para evitar ruido cognitivo. La vista simplificada por defecto mostrará el flujo esencial de 3 columnas: `Backlog` -> `In Progress / Doing` (agrupando review) -> `Done`.
Si el usuario desea incorporar o visualizar las Ideas, podrá hacerlo explícitamente a través de un botón/toggle dedicado (ej. "+ Mostrar Ideas" o switch en toolbar).
El selector de vistas existente de la barra superior debe mantenerse intacto con sus 2 modos ("Simple" y "Ampliada") sin añadir más opciones al selector principal.

**Criterios de Aceptación:**
- [ ] #1 Ocultar por defecto la columna de Ideas al entrar en la vista Simplificada
- [ ] #2 Mantener intacto el selector de 2 opciones (Simple / Ampliada) en la barra superior
- [ ] #3 Renderizar por defecto las columnas base: Backlog, In Progress (Doing + Review) y Done en vista Simple
- [ ] #4 Añadir un botón o toggle explícito accesible (ej. en la cabecera del Kanban o toolbar) para mostrar/ocultar la columna Ideas a demanda
- [ ] #5 Persistir la preferencia de visibilidad de Ideas (en local storage o en `.devboard/config.json`)

---

#### [DEV-009] Personalización de Columnas Kanban: Reordenar, Renombrar, Mapeo de Estados y WIP Limits
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Permitir a los usuarios personalizar dinámicamente la configuración del tablero Kanban:
1. Renombrar el título de las columnas.
2. Reordenar las columnas según la preferencia del equipo.
3. Configurar qué estados canónicos (`draft`, `doing`, `review`, `ready`, `done`) pertenecen a cada columna visual.
4. Validar y alertar al usuario si algún estado queda desasignado o huérfano (para evitar que tareas existentes desaparezcan visualmente del tablero).
5. Configurar límites de trabajo en progreso (WIP Limits) por columna (ejemplo: máximo 10 cards en 'Doing'), mostrando indicadores de capacidad y alertas visuales al superar el umbral.

**Criterios de Aceptación:**
- [ ] #1 Configuración dinámica de columnas con título editable y orden personalizable
- [ ] #2 Asignación flexible de estados a columnas visuales
- [ ] #3 Validación de estados huérfanos: mostrar banner de advertencia si algún estado activo no está asignado a ninguna columna
- [ ] #4 Soporte para WIP Limits numéricos por columna (ej. `doing: 10`, `review: 5`)
- [ ] #5 Indicadores visuales en la cabecera de la columna cuando se alcanza o sobrepasa el WIP limit (ej. badge amarillo/rojo `11/10 WIP`)
- [ ] #6 Guardado de la configuración en `.devboard/config.json` o settings del proyecto

---

#### [DEV-010] Fix de Desplazamiento Horizontal Inestable en Selector de Navegación de Pestañas
- **Prioridad**: `high` | **Tipo**: `bug`
- **Sprint / Milestone**: v1.2.0

Resolver el defecto visual en la barra superior (`Header.tsx`) donde el bloque central de navegación por pestañas (Tablero, Sprint & Priorización, Releases, Archivo) se desplaza horizontalmente (layout shift) de forma errática:
1. Al cambiar de proyecto: la longitud variable del nombre del proyecto y los badges ('Backlog.md' vs 'JSON' vs 'Demo') cambian el ancho del contenedor izquierdo. Como la barra utiliza `flex justify-between`, el cambio de ancho en la izquierda empuja o tira del contenedor central de pestañas.
2. Al cambiar de pestaña: cuando la pestaña activa es 'Tablero', se muestra el selector de modo de vista (Simple / Ampliada) en el contenedor derecho; al cambiar a 'Sprint', 'Releases' o 'Archivo', dicho selector desaparece, reduciendo el ancho del bloque derecho en ~120px y provocando que el selector central de pestañas pegue un salto horizontal notable.
La navegación debe permanecer centrada o fija sin saltos visuales molestos al interactuar con proyectos o pestañas.

**Criterios de Aceptación:**
- [ ] #1 Estabilizar el layout del Header mediante un sistema de 3 columnas fijas (ej. CSS Grid `grid-cols-[1fr_auto_1fr]` o flexboxes balanceados)
- [ ] #2 Garantizar que el selector central de navegación (`<nav>`) no se mueva horizontalmente al cambiar de proyecto (independientemente de la longitud de su nombre o badge)
- [ ] #3 Garantizar que el selector central de navegación (`<nav>`) permanezca completamente estático al cambiar entre pestañas (Tablero, Sprint, Releases, Archivo)
- [ ] #4 Preservar la visibilidad y estética de los botones de acciones y selectores en desktop y mobile

---

#### [DEV-011] Redistribución Visual y Secciones Colapsables en Editor de Card (ItemModal)
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: v1.2.0

Mejorar la distribución visual, ergonomía y aprovechamiento del espacio en el modal de edición/creación de tarjetas (`ItemModal.tsx`).
Actualmente, el modal apila todos los campos verticalmente en un único scroll largo:
- Varios campos del modelo de datos (`risk` y `fix`) ni siquiera se muestran en pantalla por falta de espacio.
- Cuando una tarea tiene múltiples Criterios de Aceptación (AC) o un Plan de Implementación técnico detallado, la altura del modal desborda la pantalla obligando al usuario a realizar scrolls excesivos.
- Se debe reestructurar el formulario con una jerarquía visual limpia:
  1. Cabecera compacta con Título, Código, Tipo, Prioridad, Estado y Proyecto en grilla balanceada.
  2. Secciones colapsables tipo acordeón (o pestañas internas) para:
     - **Criterios de Aceptación (AC)**: con contador en cabecera (ej. `3/5 cumplidos`) y colapsar/expandir.
     - **Plan de Implementación & Plan Guard**: colapsable para desarrollo técnico y agentes de IA.
     - **Metadatos Técnicos**: archivo impactado, sprint/release objetivo, riesgos (`risk`) y solución propuesta (`fix`).

**Criterios de Aceptación:**
- [ ] #1 Implementar secciones colapsables (acordeón o tabs) con estado recordado para AC, Plan Técnico y Metadatos
- [ ] #2 Incorporar inputs editables para campos omitidos actualmente (`risk` y `fix`)
- [ ] #3 Mostrar indicador resumen en el encabezado de la sección de AC (ej. "3 de 5 criterios completados")
- [ ] #4 Mejorar el aprovechamiento horizontal en pantallas medianas y grandes con un layout en 2 columnas o panel lateral
- [ ] #5 Mantener atajos de teclado (`⌘+Enter` para guardar, `Esc` para cancelar)

---

#### [DEV-012] Generalización de Re-sync Docs para Modalidad Dual (JSON y Backlog.md)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Generalizar la funcionalidad de sincronización y reimportación de documentación ("Re-sync /docs") para que no dependa exclusivamente del repositorio legado `dom` (`m3/docs`) ni del formato JSON único.
Actualmente:
- El endpoint `POST /api/import` en `vite.config.ts` busca hardcodeado el proyecto con ID `dom` y ejecuta `runMigration(m3/docs, ...backlog.json)`.
- En proyectos con almacenamiento `backlog-md` (como el propio DevBoard) o en cualquier proyecto nuevo, presionar el botón "Re-sync /docs" falla o afecta al proyecto equivocado.
Se debe contextualizar la sincronización:
1. Permitir que cada proyecto configure opcionalmente su ruta de documentación o fuente de importación.
2. Soportar la sincronización tanto hacia archivos `backlog/tasks/*.md` individuales (`backlog-md`) como hacia `.devboard/backlog.json` (`json`).
3. Ocultar o deshabilitar elegantemente el botón en el Header si el proyecto activo no tiene configurada una carpeta de documentación externa para sincronizar.

**Criterios de Aceptación:**
- [ ] #1 Parametrizar el endpoint `POST /api/import` para recibir `projectId` del proyecto activo
- [ ] #2 Implementar lógica de importación hacia archivos Markdown individuales para proyectos con `storageType: 'backlog-md'`
- [ ] #3 Ocultar o desactivar el botón "Re-sync /docs" en `Header.tsx` si el proyecto seleccionado no tiene docs vinculados
- [ ] #4 Proporcionar retroalimentación visual al usuario (toast o banner) indicando qué proyecto se sincronizó y cuántas tareas se actualizaron

---

### ✅ Done / Deployed (17)

#### [DEV-001] Interoperabilidad nativa con Backlog.md y motor Markdown
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.1.0

Implementar soporte nativo para el estándar Backlog.md (MrLesk/Backlog.md) en DevBoard.
Permite almacenar cada ítem del backlog como un archivo Markdown individual en `backlog/tasks/*.md`
con YAML frontmatter y delimitadores estandarizados, resolviendo conflictos de Git concurrentes.

**Criterios de Aceptación:**
- [x] #1 Parser y serializador en TypeScript sin dependencias externas
- [x] #2 Normalización bidireccional de estados a vocabulario limpio (draft, doing, review, ready, done)
- [x] #3 Soporte dual de persistencia (JSON y Backlog.md) en la API de Vite
- [x] #4 Herramienta de migración 1-click y exportación consolidada a BACKLOG.md

---

#### [DEV-002] Modales de confirmación amables y eliminación de proyectos
- **Prioridad**: `high` | **Tipo**: `ux`
- **Sprint / Milestone**: v1.1.0

Reemplazar todas las alertas y confirmaciones nativas del navegador (`alert()` y `confirm()`)
por un modal in-app (`ConfirmModal`) con estética premium Linear/Raycast dark-mode.
Solucionar el fallo en el tacho de basura al eliminar o desvincular proyectos (incluso el demo).

**Criterios de Aceptación:**
- [x] #1 Crear componente `ConfirmModal.tsx` con variantes danger/warning/info y atajos de teclado
- [x] #2 Reemplazar confirms en Header, ItemCard, ItemModal, SprintView y ArchiveView
- [x] #3 Reemplazar alerts por banners de error inline y toasts
- [x] #4 Permitir eliminar/desvincular proyectos y restaurar proyecto Demo

---

#### [DEV-003] Explorador visual de carpetas y compatibilidad multiplataforma
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.1.0

Permitir a los desarrolladores explorar el sistema de archivos local de su máquina visualmente
sin tener que escribir manualmente la ruta del repositorio. Asegurar compatibilidad multiplataforma
con Windows (`\`), macOS (`/`) y Linux (`/`).

**Criterios de Aceptación:**
- [x] #1 Implementar endpoint `GET /api/fs/browse` con normalización multiplataforma
- [x] #2 Crear componente `FolderPickerModal.tsx` con navegación jerárquica y badges Git/Backlog.md
- [x] #3 Integrar botón "Explorar" en `ProjectModal.tsx` con autocompletado y detección de motor
- [x] #4 Detectar si la carpeta seleccionada ya es un repositorio Git o tiene tareas Backlog.md

---

#### [DEV-004] Servidor MCP y Skills para Agentes de IA
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.1.0

Construir un servidor MCP (Model Context Protocol) sobre stdio y una Skill documental para que
agentes de IA y LLMs (Claude Code, Cursor, Antigravity, Gemini) puedan inspeccionar, crear,
actualizar y completar tareas del backlog de forma autónoma y sin fricciones.

**Criterios de Aceptación:**
- [x] #1 Crear script `scripts/mcp-server.ts` con protocolo JSON-RPC 2.0 stdio
- [x] #2 Implementar tools MCP: list_projects, list_tasks, get_task, create_task, update_task, export_backlog
- [x] #3 Añadir comando npm `npm run mcp` en package.json
- [x] #4 Crear `.agents/skills/devboard/SKILL.md` con documentación y guía de flujo para agentes

---

#### [DEV-005] Release v1.1.0 y changelog automatizado
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.1.0

Empaquetar todas las mejoras del ciclo actual (Backlog.md, modales UX amables, explorador de carpetas,
dogfooding y servidor MCP) en el Release v1.1.0 utilizando el Release Assembler de DevBoard.

**Criterios de Aceptación:**
- [x] #1 Probar empaquetado del release con las tareas DEV completadas
- [x] #2 Generar changelog formateado con resumen de cambios para el usuario
- [x] #3 Validar paso de tareas de ready a done al archivar el release

---

#### [DEV-013] Estandarización de storageType a 'markdown' para desacoplar de Backlog.md
- **Prioridad**: `medium` | **Tipo**: `tech_debt`
- **Sprint / Milestone**: v1.2.0

Renombrar y estandarizar el identificador `storageType` del motor de persistencia a exclusivamente `'markdown' | 'json'`.
Al ser el almacenamiento gestionado integralmente por DevBoard sin dependencias externas, no existe necesidad de mantener múltiples valores o alias (`md`, `backlog-md`).
Esto evita cualquier confusión conceptual con proyectos externos (como la herramienta Backlog.md) y simplifica el código en frontend, backend y servidor MCP.

**Criterios de Aceptación:**
- [x] #1 Definir estrictamente `StorageType = "json" | "markdown"` en `src/types.ts`
- [x] #2 Actualizar `data/projects-registry.json` con `"storageType": "markdown"`
- [x] #3 Simplificar funciones en `vite.config.ts` (`isBacklogMdProject`, `detectProjectStorage`) a `'json' | 'markdown'`
- [x] #4 Actualizar componentes UI (`Header.tsx`, `ProjectModal.tsx`, `FolderPickerModal.tsx`) con etiquetas "Markdown" y "MD"
- [x] #5 Actualizar `scripts/mcp-server.ts` y suite de tests

---

#### [DEV-014] Sincronización en vivo en la UI ante cambios en disco (Live File Watcher / SSE)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.3.0

Permite que la interfaz web abierta en el navegador actualice el tablero en tiempo real cuando un agente de IA o un comando git modifique archivos Markdown en disco, evitando que el usuario trabaje sobre datos obsoletos o genere colisiones.

**Criterios de Aceptación:**
- [x] #1 Configurar watcher activo en backend (Vite middleware / server) monitoreando archivos en backlog/tasks/*.md y .devboard/
- [x] #2 Establecer canal de eventos reactivo (SSE en /api/events o WebSocket HMR) para notificar cambios de disco a la UI
- [x] #3 El frontend React escucha los eventos y actualiza silenciosamente los datos sin perder filtros ni posición de scroll
- [x] #4 Mostrar notificación o badge visual no intrusivo ('Sincronizado con disco') confirmando la actualización externa

---

#### [DEV-015] Distribución Zero-Install vía CLI (npx dev-board)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.3.0

Publicar y empaquetar DevBoard como herramienta de línea de comandos para que cualquier desarrollador pueda ejecutar 'npx dev-board' dentro de cualquier repositorio y visualizar/gestionar su backlog al instante sin dependencias previas.

**Criterios de Aceptación:**
- [x] #1 Configurar punto de entrada CLI ejecutable (bin/devboard.js) con shebang y declaración en package.json
- [x] #2 Detectar automáticamente el proyecto objetivo en process.cwd() (soporte de backlog/tasks/*.md y .devboard/backlog.json)
- [x] #3 Iniciar servidor HTTP estático y de API en un puerto disponible sin requerir clonación del repositorio dev-board
- [x] #4 Abrir automáticamente el navegador web predeterminado al estar listo el servidor

---

#### [DEV-016] Empaquetado y distribución simplificada del servidor MCP (npx devboard-mcp)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.3.0

Empaquetar el servidor MCP para eliminar la necesidad de configurar rutas locales absolutas y flags experimentales en los archivos mcp_config.json de los IDEs, permitiendo integración de agentes con un único comando agnóstico.

**Criterios de Aceptación:**
- [x] #1 Empaquetar scripts/mcp-server.ts a un ejecutable autónomo en JavaScript (dist/mcp-server.cjs o bin/mcp.js) sin requerir flags experimentales de node
- [x] #2 Habilitar ejecución directa vía npx devboard-mcp sobre stdio para integración transparente en IDEs (Antigravity, Cursor, Claude Code)
- [x] #3 Detectar automáticamente el repositorio actual o aceptar argumento --repo / -p con la ruta del proyecto
- [x] #4 Actualizar documentación y Skill de devboard para reflejar la configuración simplificada de una sola línea

---

#### [DEV-017] Optimistic Locking y prevención de sobreescrituras silenciosas (ETag / Mtime)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.3.0

Implementar un mecanismo de control de concurrencia optimista para evitar que ediciones concurrentes entre usuarios de la UI y agentes de IA en disco se pisen silenciosamente sin advertencia.

**Criterios de Aceptación:**
- [x] #1 Incluir timestamp de modificación (mtime) o hash en la respuesta de /api/data para cada tarea del backlog
- [x] #2 Comprobar en PUT /api/items/:id si el archivo en disco cambió después de la fecha en que la UI leyó los datos
- [x] #3 Retornar código HTTP 409 Conflict si se detecta modificación concurrente externa
- [x] #4 Mostrar diálogo amigable de resolución de conflicto en la UI permitiendo al usuario ver cambios o recargar datos frescos sin perder su edición local

---

#### [DEV-018] Asistente de importación nativo para repositorios legacy (Import Wizard)
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: v1.3.0

Proveer un asistente visual e interactivo en la interfaz para importar proyectos legacy que actualmente gestionan su backlog en un único archivo plano (BACKLOG.md o TODO.md), convirtiéndolos al estándar atómico distribuido.

**Criterios de Aceptación:**
- [x] #1 Crear parser heurístico capaz de procesar archivos Markdown planos tipo TODO.md o BACKLOG.md estructurados con listas de tareas (- [ ] Título) y encabezados
- [x] #2 Diseñar modal 'Importar Backlog Legacy' en la UI con soporte para carga de archivo y previsualización de ítems detectados antes de confirmar
- [x] #3 Generar archivos atómicos en backlog/tasks/<CODE> - <Title>.md respetando la convención de almacenamiento Markdown distribuido
- [x] #4 Integrar las tareas importadas al tablero y al registro del proyecto en tiempo real sin reiniciar el servidor

---

#### [DEV-019] Resiliencia y reconciliación ante tareas Markdown huérfanas o renombradas
- **Prioridad**: `medium` | **Tipo**: `bug`
- **Sprint / Milestone**: v1.2.0

Hacer que el servidor MCP y la API de DevBoard sean tolerantes a fallos si un desarrollador renombra manualmente un archivo de tarea en su editor (ej. VS Code), reconciliando la tarea a través del ID declarado en su frontmatter YAML.

**Criterios de Aceptación:**
- [x] #1 Escanear el frontmatter YAML ('id:' o 'code:') para localizar tareas en disco cuando el nombre de archivo no coincide con el prefijo esperado
- [x] #2 Actualizar el servidor MCP (devboard_get_task, devboard_update_task) para encontrar tareas independientemente del nombre del archivo en backlog/tasks/
- [x] #3 Actualizar la API backend (PUT /api/items/:id, DELETE /api/items/:id) para reconciliar por frontmatter si falla la coincidencia por nombre de archivo
- [x] #4 Normalizar y renombrar el archivo en disco automáticamente al estándar '<ID> - <Title>.md' al guardar la tarea para mantener el repositorio ordenado

---

#### [DEV-020] Optimización de MCP y CLI para exploración eficiente del Backlog por Agentes de IA
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Los agentes de IA suelen recurrir a scripts ad-hoc 'node -e' para filtrar y listar tareas abiertas en consola, arriesgando romper el storage Markdown/JSON y desperdiciando tokens. Esta tarea dota al MCP y al CLI de herramientas ergonómicas de consulta compacta y paginada.

**Criterios de Aceptación:**
- [x] #1 Añadir parámetros 'openOnly' (excluye done/dismissed), 'limit', 'search' y 'format: compact | detailed' en devboard_list_tasks
- [x] #2 Implementar comando CLI nativo (ej: 'npm run devboard:list' o 'npx devboard list --open') para agentes que operan en consola
- [x] #3 Garantizar respuesta token-efficient en formato compacto de 1 línea por ítem tanto para almacenamiento Markdown como JSON
- [x] #4 Actualizar SKILL.md documentando el uso de devboard_list_tasks con filtros compactos y desaconsejando scripts ad-hoc 'node -e'

---

#### [DEV-021] Mutaciones Masivas y Actualizaciones por Lote en MCP y CLI (devboard_bulk_update_tasks)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Permite a los agentes de IA realizar actualizaciones masivas de estado y metadatos sobre decenas de tareas en una única llamada, evitando decenas de llamadas individuales lentas o la necesidad de escribir scripts de consola ad-hoc.

**Criterios de Aceptación:**
- [x] #1 Implementar tool 'devboard_bulk_update_tasks' en MCP para actualizar múltiples tareas por 'taskIds: string[]' o por condición de filtro ('prefix', 'status')
- [x] #2 Permitir mutaciones simultáneas de estado ('status'), milestone, etiquetas ('labels') y notas técnicas
- [x] #3 Incorporar comando por lotes en CLI ('npm run tasks -- --update-status <estado> --ids <id1,id2>' o '--prefix <prefijo>')
- [x] #4 Garantizar consistencia y actualización atómica tanto en almacenamiento Markdown distribuido como en JSON

---

#### [DEV-022] Métricas, Estadísticas y Agrupación por Prefijo (devboard_get_stats y CLI --stats)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Provee herramientas nativas para que los agentes y desarrolladores obtengan métricas de salud del backlog y desgloses por tipología de tarea sin necesidad de parsear y agrupar manualmente mediante scripts de consola.

**Criterios de Aceptación:**
- [x] #1 Implementar tool 'devboard_get_stats' en MCP retornando total, abiertos, cerrados, porcentaje completado y distribución por estado y prioridad
- [x] #2 Calcular agrupación y recuento automático por prefijo de código (ej: DOM-P, DOM-BUG, DOM-FEAT, DOM-SPEC)
- [x] #3 Extender 'devboard_list_tasks' para soportar filtros por 'prefix' y lista explícita de 'taskIds'
- [x] #4 Implementar flag '--stats' en CLI ('npm run tasks -- --stats') mostrando un resumen gráfico y métricas en terminal

---

#### [DEV-023] Gestión e Inspección de Releases en MCP (devboard_list_releases)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.3.0

Permitir a los agentes de IA consultar releases y contrastar tareas terminadas contra versiones publicadas de forma nativa a través del protocolo MCP.

**Criterios de Aceptación:**
- [x] #1 Implementar tool 'devboard_list_releases' en MCP para consultar versiones publicadas, fechas y notas de versión estructuradas
- [x] #2 Permitir consultar tareas asociadas a una versión específica o release planificado
- [x] #3 Documentar devboard_list_releases en SKILL.md para permitir contraste directo con release notes

---

#### [DEV-024] Resiliencia ante errores de permisos (EPERM) en repositorios locales y banner en UI
- **Prioridad**: `high` | **Tipo**: `bug`
- **Sprint / Milestone**: v1.3.0

Manejo tolerante a fallos en la lectura de tareas Markdown de repositorios locales:
1. Envolver la lectura de carpetas backlog/tasks en try/catch para evitar que excepciones de permisos (EPERM/EACCES) o paths inaccesibles hagan colapsar el endpoint GET /api/data con status 500.
2. Propagar el estado de error (error?: string) en la metadata del proyecto (ProjectMeta y Project).
3. Notificar visualmente en el frontend (banner de advertencia con explicación y comando de solución) cuando un proyecto seleccionado no pueda leer sus archivos por restricciones de permisos o sandbox.
4. Soporte para liberar puertos retenidos e iniciar servidores limpios.

**Criterios de Aceptación:**
- [x] #1 Blindar readProjectBacklog en vite.config.ts para capturar excepciones de lectura de carpetas y no tumbar /api/data
- [x] #2 Declarar error?: string en tipos ProjectMeta (vite.config.ts, mcp-server.ts) y Project (src/types.ts)
- [x] #3 Renderizar banner de diagnóstico amigable en App.tsx ante errores de acceso a repositorios
- [x] #4 Documentar la resolución de conflictos de puertos y compatibilidad con entornos sandbox

---
