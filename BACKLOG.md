# Backlog: dev-board
> Consolidado generado el 2026-09-23 por DevBoard ⚡

## Resumen de Estados

### 📋 Backlog / Draft (15)

#### [DEV--066] falta en settings un boton para deshacer cambios
- **Prioridad**: `medium` | **Tipo**: `feature`

al lado de guardar cambios debiera estar el boton que permita borrar la config selecciona/editada, para restaabler las settings al estado anterior a la edición

**Criterios de Aceptación:**
- [ ] #1 Criterio de aceptación inicial definido.

---

#### [DEV-039] Sincronización no invasiva de árbol Git con estados de backlog y releases
- **Prioridad**: `low` | **Tipo**: `feature`

Inspección de solo lectura del árbol Git local (commits, ramas, tags) para correlacionar tareas y releases sin alterar el repositorio ni requerir permisos especiales. Modo sugerencia asistida.

**Criterios de Aceptación:**
- [ ] #1 Lector pasivo de Git usando child_process.execFile con sanitización estricta y timeout
- [ ] #2 Mapeo de tags de release semánticos a entidades Release de DevBoard
- [ ] #3 Detección de commits asociados a tareas mediante regex sobre mensajes de commit
- [ ] #4 Indicador de estado Git no invasivo en la UI (asistente de sugerencias, sin mutación forzada)
- [ ] #5 Garantía estricta de cero comandos de escritura de Git en cumplimiento con .agents/rules/git-approval.md

---

#### [DEV-040] Arquitectura Autocontenida (Embedded-First) y Configuración Local en .devboard/
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: Sprint 4

Desacoplar la configuración de DevBoard del registro central global (data/projects-registry.json), permitiendo que toda la configuración de columnas, metodología, vistas y preferencias viva autocontenida en .devboard/config.json dentro del repositorio del proyecto.

**Criterios de Aceptación:**
- [ ] #1 Almacenar configuraciones de vista, columnas y metodología en .devboard/config.json dentro del repositorio del proyecto
- [ ] #2 Priorizar lectura y escritura de configuración local sobre el registro central data/projects-registry.json
- [ ] #3 Garantizar que al clonar el repositorio en otra máquina o entorno, DevBoard cargue la configuración de .devboard/config.json sin pasos manuales
- [ ] #4 Mantener compatibilidad hacia atrás con proyectos existentes y proyectos con múltiples carpetas

---

#### [DEV-041] Simplificación de UX/UI en Modo Proyecto Único (Eliminación de Ruido Multi-Proyecto)
- **Prioridad**: `high` | **Tipo**: `ux`
- **Sprint / Milestone**: Sprint 4

Simplificar radicalmente la navegación y la cabecera cuando DevBoard se ejecuta en un repositorio único, eliminando el ruido de selectores de proyectos globales, modales de importación y cambio de repositorios, ofreciendo una experiencia enfocada y limpia similar a Storybook o Prisma Studio.

**Criterios de Aceptación:**
- [ ] #1 Detectar modo monoproyecto (Single-Project Mode) cuando devboard se ejecuta apuntando a un único repositorio local
- [ ] #2 Ocultar selector desplegable de proyectos en la cabecera cuando se ejecuta en modo monoproyecto
- [ ] #3 Ocultar botones y modales de 'Añadir Proyecto' e 'Importar Proyecto' en la navegación principal en modo monoproyecto
- [ ] #4 Mostrar en la cabecera el nombre del repositorio activo con un indicador sutil de estado local
- [ ] #5 Reservar la interfaz multi-proyecto completa para cuando se invoque explícitamente con flag --hub o --multi

---

#### [DEV-042] Empaquetado y DX como devDependency (Cero Fricción con npm i -D y npx)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: Sprint 4

Optimizar la experiencia de desarrollador (DX) y empaquetado para que DevBoard pueda ser consumido limpiamente como devDependency en cualquier proyecto Node/TypeScript, levantando el cockpit local y el servidor MCP con cero fricción.

**Criterios de Aceptación:**
- [ ] #1 Habilitar instalación local mediante npm i -D devboard (o package runner) con script de inicio 'devboard'
- [ ] #2 Soporte para comando rápido de inicialización 'npx devboard --init' que prepare .devboard/ y carpetas base si no existen
- [ ] #3 Configuración automática o asistida de scripts en package.json del proyecto anfitrión (ej: "board": "devboard")
- [ ] #4 Verificar funcionamiento como devDependency aislada sin interferir con dependencias de React/Vite del proyecto anfitrión

---

#### [DEV-043] Evolutivo de Marca e Identidad: Cockpit Ágil Multidisciplinario (Naming Simple y Disponibilidad)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Evolucionar la identidad y el nombre del proyecto y de la aplicación hacia una plataforma integral de gestión ágil para equipos multidisciplinarios (producto, diseño, arquitectura, Scrum Masters y desarrolladores) y agentes de IA:
1. Trascender la denominación "dev-board" hacia un nombre simple, distintivo, con personalidad y agradable al oído, lejos de clichés corporativos o compuestos que terminen en "Board" o "App".
2. Validar disponibilidad en npm/npx y repositorios públicos (GitHub) para asegurar un namespace limpio y ejecutable sin fricción.
3. Planificar una estrategia de migración no destructiva con soporte de binarios duales/alias en `package.json` para garantizar que `npx devboard` siga funcionando mientras se adopta el nuevo comando.
4. Actualizar identidad visual mínima (isotipo, favicon, splash y playbooks de colaboración).

**Criterios de Aceptación:**
- [ ] #1 Realizar relevamiento y matriz de disponibilidad pública en npm/npx y GitHub de nombres candidatos con personalidad
- [ ] #2 Definir el nombre definitivo del producto y aplicación alineado con la visión de cockpit ágil para todo el equipo
- [ ] #3 Configurar soporte de alias/binarios duales en package.json (retrocompatibilidad con npx devboard y adopción del nuevo comando)
- [ ] #4 Actualizar referencias de marca en documentación técnica (README.md, AGENTS.md, docs/)

---

#### [DEV-048] Grafo de Relaciones entre Cards: Jerarquías Verticales (Padre/Hijo Estricto 1-a-N) y Enlaces Horizontales (Bloquea/Depende/Relacionado)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Modelado completo de relaciones entre tarjetas tanto a nivel vertical como horizontal:
1. **Jerarquías Verticales (Padre / Hijo Estricto):** Un ítem solo puede tener un único padre (`parentId` / `parent`), pero un padre puede tener múltiples tareas hijas. Permite asociar cualquier tarea a una Épica o Historia contenedora.
2. **Relaciones Horizontales entre Vecinos / Hermanos:** Soporte para enlaces cruzados entre tarjetas del backlog:
   - `blocks` / `blocked_by`: Card A bloquea a Card B (y recíprocamente Card B está bloqueada por Card A).
   - `related_to`: Tareas relacionadas conceptualmente sin dependencia dura.
   - `depends_on`: Dependencia funcional.
3. **Indicadores de Bloqueo Visual:** Si una tarea tiene dependencias no resueltas (tareas bloqueantes en `doing`, `draft` o `review`), mostrar un badge visual de advertencia roja ("Bloqueada por DEV-XXX") en la tarjeta Kanban y en el detalle.
4. **Persistencia Frontmatter:** Almacenamiento directo en frontmatter Markdown (`parent: 'DEV-010'`, `blocks: ['DEV-020']`, `dependencies: ['DEV-015']`).

**Criterios de Aceptación:**
- [ ] #1 Un ítem solo puede tener asignado un único padre (parentId), con selector modal interactivo
- [ ] #2 Soporte de relaciones horizontales bidireccionales automáticas (blocks <-> blocked_by, related_to)
- [ ] #3 Badge indicador en tarjetas Kanban que señala dependencias bloqueadas y advertencias de precedencia
- [ ] #4 En ItemModal, sección interactiva 'Relaciones y Dependencias' para vincular y desvincular ítems
- [ ] #5 Persistencia transparente en frontmatter Markdown sin pérdida de datos en hot-reload

---

#### [DEV-056] Releases Multi-Versión y Modelo Unificado de Sprints Jira-Style
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Evolución del modelo de datos para Sprints y Releases en las tarjetas, adoptando un diseño unificado y sin redundancias:
1. **Modelo Unificado de Sprints (Jira-Style):** 
   - Se unifica en un único campo array: `sprints?: string[]`.
   - **Regla de Negocio:** Una tarjeta solo puede tener **1 sprint activo** asignado en curso a la vez.
   - **Historial de Cierres:** Cuando finaliza una iteración asociada a la tarjeta, el sprint permanece guardado en el array `sprints` como registro histórico de sprints finalizados (comportamiento idéntico al estándar de Jira). Se evita la creación de campos paralelos o duplicados como `sprintHistory`.
2. **Releases Multi-Versión:**
   - Una tarjeta puede estar asociada a múltiples versiones a lo largo de su ciclo de vida o en despliegues concurrentes (ej: release de hotfix en `0.2.1` y de release general en `0.3.0`).
   - Se amplía el campo a `releases?: string[]` manteniendo compatibilidad con `release?: string`.
3. **Persistencia Frontmatter:** Almacenamiento limpio en Markdown (`sprints: ['Sprint 1', 'Sprint 2']`, `releases: ['0.2.1', '0.3.0']`).

**Criterios de Aceptación:**
- [ ] #1 BacklogItem unifica los sprints en un único campo array 'sprints?: string[]' sin campos paralelos de historial
- [ ] #2 Regla de negocio que valida máximo 1 sprint en estado activo asociado a la tarjeta a la vez
- [ ] #3 Al completar un sprint, las tarjetas asociadas conservan el sprint finalizado en su lista 'sprints'
- [ ] #4 Soporte para asociar múltiples versiones/releases por tarjeta (releases?: string[])
- [ ] #5 Sincronización y persistencia transparente en frontmatter Markdown sin pérdida de datos

---

#### [DEV-057] Centro de Gestión de Releases: Inspección de Release Notes, Conjunto de Cards y Sincronización con Git
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Evolución integral del módulo de Releases hacia un centro de control y auditoría de entregas:
1. **Inspección de Releases:** Permitir visualizar en la aplicación la lista completa de releases gestionados con DevBoard, incluyendo:
   - Resumen y notas de release generadas (Markdown renderizado con títulos, mejoras y fixes).
   - Tabla interactiva con el conjunto exacto de tarjetas asociadas a esa versión (con código, título, autor y estado).
2. **Sincronización Pasiva con Git (Dependencia DEV-039):**
   - Correlacionar los releases declarados en DevBoard con los tags y commits reales del repositorio Git local mediante la inspección no invasiva de DEV-039.
   - Detectar discrepancias (ej: un release con tareas marcadas como listas pero sin tag Git generado, o commits en la rama que hacen referencia a tareas aún abiertas).
3. **Exportación de Changelog:** Botones de copia rápida en Markdown y exportación para GitHub Releases o actualización de `CHANGELOG.md`.

**Criterios de Aceptación:**
- [ ] #1 Vista de detalle por release con notas de cambio completas en Markdown renderizado
- [ ] #2 Listado filtrable de todas las tarjetas asociadas a cada versión gestionada
- [ ] #3 Correlación y badge de coherencia con tags locales de Git proveniente de la integración DEV-039
- [ ] #4 Asistente para detectar discrepancias entre código tageado y tareas asociadas
- [ ] #5 Botón de copiado en un click del changelog formateado para GitHub Releases

---

#### [DEV-059] Administración y Personalización de Tipos de Cards y Flujos de Trabajo por el Usuario (Admin Soberano)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.5.0

Otorgar soberanía total y personalización al usuario/admin para definir y gestionar la taxonomía de tipos de tarjeta y flujos de trabajo de su proyecto:
1. **Soberanía Administrativa:** Aunque DevBoard incluye tipos predeterminados (`feature`, `bug`, `tech_debt`, `ux`, etc.), el usuario es el dueño de su proyecto y flujo. Debe poder crear nuevos tipos personalizados (ej. `spike`, `research`, `design`, `meeting`, `infra`), editar los existentes (nombre, color semántico, icono) o eliminar los que no utilice.
2. **Editor de Tipos en Settings:** Incorporar en `SettingsView` una sección dedicada "Tipos de Tarjeta y Taxonomía" donde se listen los tipos actuales con acciones de edición inline, cambio de paleta cromática, asignación de icono de Lucide y botón "+ Nuevo Tipo".
3. **Integración Universal:** Los nuevos tipos creados deben poblarse automáticamente en los modales de creación y edición (`ItemModal.tsx`), filtros de búsqueda (`FilterBar.tsx`) y badges de las tarjetas (`ItemCard.tsx`).
4. **Persistencia Local:** Almacenamiento directo en `.devboard/config.json` bajo `config.customItemTypes`.

**Criterios de Aceptación:**
- [ ] #1 Sección 'Tipos de Tarjeta' en SettingsView con gestión CRUD completa (crear, editar, eliminar)
- [ ] #2 Formulario de configuración de tipo: identificador clave, nombre legible, color semántico e icono
- [ ] #3 Los tipos personalizados se reflejan automáticamente en los selectores de ItemModal y FilterBar
- [ ] #4 Los badges de ItemCard renderizan adecuadamente el color e icono del tipo personalizado
- [ ] #5 Persistencia automática y aislada en .devboard/config.json sin romper esquemas preexistentes

---

#### [DEV-060] Internacionalización Total (i18n): Cobertura 100% en Inglés y Español sin Textos Hardcodeados y Selector en Settings
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.5.0

Infraestructura completa de internacionalización (i18n) para soportar navegación fluida en Español e Inglés con cobertura total de la interfaz:
1. **Cero Textos Hardcodeados:** Extracción sistemática de todos los textos presentes en componentes, cabeceras, botones, badges, modales, tooltips, toasts de feedback, empty states y páginas de ajustes hacia archivos de localización estructurados (`locales/es.json` y `locales/en.json`).
2. **Selector de Idioma en Settings:** Incorporar en `SettingsView` (pestaña General) un selector interactivo para alternar entre Español e Inglés, con persistencia instantánea en la configuración del proyecto (`config.locale`).
3. **Detección Automática:** Detección inicial inteligente basada en las preferencias de idioma del navegador (`navigator.language`), con fallback seguro a Español o Inglés.
4. **Tipado Estricto de Claves:** Provisión de un hook o helper reactivo `useTranslation()` con autocompletado y validación TypeScript de claves de traducción para prevenir claves inexistentes en tiempo de compilación.

**Criterios de Aceptación:**
- [ ] #1 Diccionarios de traducción completos para Español (es) e Inglés (en) cubriendo el 100% de los textos en pantalla
- [ ] #2 Hook o contexto useTranslation() fuertemente tipado con cambio de idioma reactivo sin recarga de página
- [ ] #3 Selector interactivo de idioma en SettingsView con persistencia en .devboard/config.json
- [ ] #4 Detección automática inicial del idioma del navegador
- [ ] #5 Auditoría estricta de código para validar ausencia de strings de texto visibles hardcodeadas

---

#### [DEV-061] Monitoreo y Telemetría de Agent Skills: Métricas de Uso, Frecuencia, Última Invocación y Auditoría
- **Prioridad**: `low` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.5.0

Módulo de observabilidad, estadísticas y diagnóstico para el ecosistema de Agent Skills (`.agents/skills/`):
1. **Telemetría de Skills:** Monitorear de forma local y no invasiva la interacción de agentes de IA con las skills del proyecto:
   - Cuándo fue la última invocación o lectura de cada `SKILL.md`.
   - Contador acumulado de accesos / usos por proyecto.
   - Duración o pasos asociados si aplica.
2. **Métricas y Diagnóstico de Salud:** Proveer un panel visual dentro de Ajustes o Diagnóstico que permita:
   - Detectar qué skills son las más utilizadas y críticas para el flujo de trabajo.
   - Identificar skills inactivas, desactualizadas o nunca utilizadas para sugerir su depuración, actualización o archivado.
3. **Persistencia Segura:** Registro de telemetría en `.devboard/skills-telemetry.json` (aislado y con actualización silenciosa sin interferir con Git ni ensuciar diffs de código).

**Criterios de Aceptación:**
- [ ] #1 Registro no invasivo de accesos a skills (fecha/hora de última invocación y conteo) en .devboard/skills-telemetry.json
- [ ] #2 Panel visual de métricas de Agent Skills en SettingsView o vista de Diagnóstico
- [ ] #3 Tabla con listado de skills, última invocación y frecuencia de uso
- [ ] #4 Sugerencias automáticas de depuración para skills obsoletas o nunca consultadas
- [ ] #5 Integración opcional con comando CLI npm run skills --stats

---

#### [DEV-068] Fix: devboard_list_tasks — Filtro por Sprint Retorna Todos los Tasks
- **Prioridad**: `medium` | **Tipo**: `bug`
- **Sprint / Milestone**: Sprint 4

El filtro `{ "sprint": "Sprint 3" }` en `devboard_list_tasks` no filtra por sprint: retorna todos los tasks del proyecto. Esto genera confusión en auditorías de sprint y obliga al agente a filtrar manualmente el JSON.

**Root cause posible:** El campo `sprint` en el frontmatter Markdown puede estar bajo nombres alternativos (`targetSprint`, `milestone`) que el parser no mapea al filtro `sprint` de la API.

**Fix esperado:** El filtro `sprint` en `devboard_list_tasks` debe matchear los campos `sprint`, `targetSprint`, y el frontmatter `sprint:` del archivo Markdown.

**Criterios de Aceptación:**
- [ ] #1 devboard_list_tasks con { sprint: 'Sprint 3' } retorna solo tasks cuyo frontmatter contiene sprint: Sprint 3
- [ ] #2 El filtro también matchea el campo targetSprint cuando coincide con el valor buscado
- [ ] #3 Test con proyecto dev-board: filtrar por Sprint 3 retorna exactamente DEV-047, DEV-049, DEV-051, DEV-052, DEV-053, DEV-055, DEV-067 y nada más
- [ ] #4 Documentar el filtro corregido en el schema MCP
- [ ] #5 La corrección es backwards-compatible con el CLI devboard list

---

#### [DEV-069] Fix: devboard_update_task — Ignorar status dentro del objeto updates silenciosamente
- **Prioridad**: `high` | **Tipo**: `bug`
- **Sprint / Milestone**: Sprint 4

Cuando se pasa `{ "taskId": "DEV-001", "updates": { "status": "ready" } }`, el servidor MCP ignora el campo `status` dentro de `updates` sin retornar error. El task mantiene su estado anterior.

Esto genera un bug silencioso muy difícil de detectar: el agente cree que actualizó el status, pero el archivo Markdown no cambia.

**Fix esperado:** El servidor MCP debe aceptar `status` tanto como campo top-level como dentro de `updates`, O retornar un error claro indicando que `status` no es válido dentro de `updates` para evitar la confusión.

**Criterios de Aceptación:**
- [ ] #1 devboard_update_task acepta status dentro de updates Y lo aplica correctamente
- [ ] #2 O bien: devboard_update_task retorna un warning/error cuando se detecta status dentro de updates (para que el agente pueda corregirlo)
- [ ] #3 Documentar claramente en el schema MCP el campo correcto para cambiar status
- [ ] #4 Añadir test unitario que valide ambas formas de pasar el status

---

#### [DEV-070] Feature: Retro Automática al Cerrar Sprint — Template y Checklist Integrado
- **Prioridad**: `medium` | **Tipo**: `feature`

Implementar soporte nativo para Sprint Retrospectivas en DevBoard.

**Motivación:** Las retros manuales al final de cada sprint son valiosas pero se omiten cuando el sprint se cierra rápidamente. Se necesita un mecanismo que las haga obligatorias y estructuradas.

**Funcionalidad esperada:**
1. Al marcar el último item de un sprint como `ready` o al ejecutar 'Completar Sprint', DevBoard muestra un prompt de retro.
2. El template de retro incluye las 4 dimensiones: Problemas, Eficiencia, Fortalezas, Acciones.
3. Las acciones concretas de la retro se convierten automáticamente en nuevas tareas del backlog.
4. La retro queda guardada como archivo en `backlog/retros/sprint-N-retro.md`.
5. El MCP expone `devboard_create_retro` y `devboard_list_retros`.

**Criterios de Aceptación:**
- [ ] #1 Al completar un sprint, CompleteSprintModal incluye paso de retro opcional pero promovido
- [ ] #2 Template de retro con secciones: ¿Qué salió bien?, ¿Qué mejorar?, ¿Qué cambiar?, Acciones concretas
- [ ] #3 Las acciones se pueden convertir en tasks con un click (Create Task from Action)
- [ ] #4 La retro se persiste en backlog/retros/ como archivo Markdown estándar
- [ ] #5 devboard_list_retros MCP tool lista las retros guardadas con resumen
- [ ] #6 La retro aparece en el timeline de la Release Notes si el sprint tiene release asociado

---

### ✅ Done / Deployed (55)

#### [DEV-001] Interoperabilidad nativa con Backlog.md y motor Markdown
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.2.0

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

#### [DEV-006] Sistema de Configuración y Settings Persistentes (.devboard/config.json y UI)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Crear un sistema integral de configuración persistente para que el usuario pueda personalizar su experiencia en DevBoard.
Permite definir qué opciones visuales y funcionales están activas (densidad visual, tema por defecto, visibilidad de columna Ideas, WIP limits, columnas personalizadas).
La configuración debe guardarse en el repositorio local en un archivo JSON predeterminado (`.devboard/config.json`) con valores por defecto bien estructurados.
El usuario debe tener la flexibilidad de modificar las opciones tanto editando directamente el archivo JSON como desde una interfaz gráfica de Settings accesible desde la UI.

**Criterios de Aceptación:**
- [x] #1 Diseñar el esquema y valores predeterminados para el archivo local `.devboard/config.json`
- [x] #2 Implementar endpoints `GET /api/settings` y `POST /api/settings` en la API local de Vite
- [x] #3 Crear componente modal `SettingsModal.tsx` accesible desde un botón de engranaje en el Header
- [x] #4 Implementar hot-reload o sincronización cuando el usuario modifica `.devboard/config.json` directamente en el editor
- [x] #5 Permitir alternar preferencias visuales (modo compacto, tema predeterminado, animaciones) y funcionales desde la UI

---

#### [DEV-007] Optimización de UX Responsive y Mobile para Pantallas Pequeñas
- **Prioridad**: `high` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Optimizar de forma integral la experiencia de usuario (UX/UI) de DevBoard en dispositivos móviles y pantallas pequeñas (< 768px).
Actualmente la interfaz sufre de desbordamientos horizontales, la cabecera se satura de botones, las múltiples columnas del Kanban se comprimen haciéndose ilegibles y los modales se salen de los límites de la pantalla.
Se requiere un diseño adaptativo mobile-first: navegación colapsable en Header, selector de columna por tabs o scroll-snap para el tablero Kanban, y modales que se transformen en bottom-sheets o vistas de pantalla completa en mobile.

**Criterios de Aceptación:**
- [x] #1 Adaptar Header para mobile: menú colapsable (hamburguesa/drawer) o barra inferior para selector de proyectos y acciones
- [x] #2 Implementar vista mobile para el Kanban: selector de columna tipo tabs/pills o swipe horizontal con snap para ver una columna a la vez
- [x] #3 Adaptar modales (`ItemModal`, `ProjectModal`, `ConfirmModal`, `SettingsModal`) a modo bottom-sheet o pantalla completa en pantallas < 640px
- [x] #4 Garantizar áreas táctiles mínimas de 44x44px para botones e interactivos en mobile
- [x] #5 Eliminar cualquier scroll horizontal indeseado a nivel de ventana (`overflow-x-hidden` seguro en layout principal)

---

#### [DEV-008] Simplificación de Vista Kanban: Columna Ideas Opcional y Oculta por Defecto
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Simplificar la vista simplificada del Kanban distinguiendo claramente entre el backlog crudo de "Ideas" (sin discovery, sin refinamiento ni priorización) y el verdadero "Backlog" de trabajo listo (filtrado, priorizado y en refinamiento).
En la vista simplificada, la columna de "Ideas" debe permanecer oculta por defecto para evitar ruido cognitivo. La vista simplificada por defecto mostrará el flujo esencial de 3 columnas: `Backlog` -> `In Progress / Doing` (agrupando review) -> `Done`.
Si el usuario desea incorporar o visualizar las Ideas, podrá hacerlo explícitamente a través de un botón/toggle dedicado (ej. "+ Mostrar Ideas" o switch en toolbar).
El selector de vistas existente de la barra superior debe mantenerse intacto con sus 2 modos ("Simple" y "Ampliada") sin añadir más opciones al selector principal.

**Criterios de Aceptación:**
- [x] #1 Ocultar por defecto la columna de Ideas al entrar en la vista Simplificada
- [x] #2 Mantener intacto el selector de 2 opciones (Simple / Ampliada) en la barra superior
- [x] #3 Renderizar por defecto las columnas base: Backlog, In Progress (Doing + Review) y Done en vista Simple
- [x] #4 Añadir un botón o toggle explícito accesible (ej. en la cabecera del Kanban o toolbar) para mostrar/ocultar la columna Ideas a demanda
- [x] #5 Persistir la preferencia de visibilidad de Ideas (en local storage o en `.devboard/config.json`)

---

#### [DEV-009] Personalización de Columnas Kanban: Reordenar, Renombrar, Mapeo de Estados y WIP Limits
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Permitir a los usuarios personalizar dinámicamente la configuración del tablero Kanban:
1. Renombrar el título de las columnas.
2. Reordenar las columnas según la preferencia del equipo.
3. Configurar qué estados canónicos (`draft`, `doing`, `review`, `ready`, `done`) pertenecen a cada columna visual.
4. Validar y alertar al usuario si algún estado queda desasignado o huérfano (para evitar que tareas existentes desaparezcan visualmente del tablero).
5. Configurar límites de trabajo en progreso (WIP Limits) por columna (ejemplo: máximo 10 cards en 'Doing'), mostrando indicadores de capacidad y alertas visuales al superar el umbral.

**Criterios de Aceptación:**
- [x] #1 Configuración dinámica de columnas con título editable y orden personalizable
- [x] #2 Asignación flexible de estados a columnas visuales
- [x] #3 Validación de estados huérfanos: mostrar banner de advertencia si algún estado activo no está asignado a ninguna columna
- [x] #4 Soporte para WIP Limits numéricos por columna (ej. `doing: 10`, `review: 5`)
- [x] #5 Indicadores visuales en la cabecera de la columna cuando se alcanza o sobrepasa el WIP limit (ej. badge amarillo/rojo `11/10 WIP`)
- [x] #6 Guardado de la configuración en `.devboard/config.json` o settings del proyecto

---

#### [DEV-010] Fix de Desplazamiento Horizontal Inestable en Selector de Navegación de Pestañas
- **Prioridad**: `high` | **Tipo**: `bug`
- **Sprint / Milestone**: 0.3.0

Resolver el defecto visual en la barra superior (`Header.tsx`) donde el bloque central de navegación por pestañas (Tablero, Sprint & Priorización, Releases, Archivo) se desplaza horizontalmente (layout shift) de forma errática:
1. Al cambiar de proyecto: la longitud variable del nombre del proyecto y los badges ('Backlog.md' vs 'JSON' vs 'Demo') cambian el ancho del contenedor izquierdo. Como la barra utiliza `flex justify-between`, el cambio de ancho en la izquierda empuja o tira del contenedor central de pestañas.
2. Al cambiar de pestaña: cuando la pestaña activa es 'Tablero', se muestra el selector de modo de vista (Simple / Ampliada) en el contenedor derecho; al cambiar a 'Sprint', 'Releases' o 'Archivo', dicho selector desaparece, reduciendo el ancho del bloque derecho en ~120px y provocando que el selector central de pestañas pegue un salto horizontal notable.
La navegación debe permanecer centrada o fija sin saltos visuales molestos al interactuar con proyectos o pestañas.

**Criterios de Aceptación:**
- [x] #1 Estabilizar el layout del Header mediante un sistema de 3 columnas fijas (ej. CSS Grid `grid-cols-[1fr_auto_1fr]` o flexboxes balanceados)
- [x] #2 Garantizar que el selector central de navegación (`<nav>`) no se mueva horizontalmente al cambiar de proyecto (independientemente de la longitud de su nombre o badge)
- [x] #3 Garantizar que el selector central de navegación (`<nav>`) permanezca completamente estático al cambiar entre pestañas (Tablero, Sprint, Releases, Archivo)
- [x] #4 Preservar la visibilidad y estética de los botones de acciones y selectores en desktop y mobile

---

#### [DEV-011] Redistribución Visual y Secciones Colapsables en Editor de Card (ItemModal)
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

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
- [x] #1 Implementar secciones colapsables (acordeón o tabs) con estado recordado para AC, Plan Técnico y Metadatos
- [x] #2 Incorporar inputs editables para campos omitidos actualmente (`risk` y `fix`)
- [x] #3 Mostrar indicador resumen en el encabezado de la sección de AC (ej. "3 de 5 criterios completados")
- [x] #4 Mejorar el aprovechamiento horizontal en pantallas medianas y grandes con un layout en 2 columnas o panel lateral
- [x] #5 Mantener atajos de teclado (`⌘+Enter` para guardar, `Esc` para cancelar)

---

#### [DEV-012] Generalización de Re-sync Docs para Modalidad Dual (JSON y Backlog.md)
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Generalizar la funcionalidad de sincronización y reimportación de documentación ("Re-sync /docs") para que no dependa exclusivamente del repositorio legado `dom` (`m3/docs`) ni del formato JSON único.
Actualmente:
- El endpoint `POST /api/import` en `vite.config.ts` busca hardcodeado el proyecto con ID `dom` y ejecuta `runMigration(m3/docs, ...backlog.json)`.
- En proyectos con almacenamiento `backlog-md` (como el propio DevBoard) o en cualquier proyecto nuevo, presionar el botón "Re-sync /docs" falla o afecta al proyecto equivocado.
Se debe contextualizar la sincronización:
1. Permitir que cada proyecto configure opcionalmente su ruta de documentación o fuente de importación.
2. Soportar la sincronización tanto hacia archivos `backlog/tasks/*.md` individuales (`backlog-md`) como hacia `.devboard/backlog.json` (`json`).
3. Ocultar o deshabilitar elegantemente el botón en el Header si el proyecto activo no tiene configurada una carpeta de documentación externa para sincronizar.

**Criterios de Aceptación:**
- [x] #1 Parametrizar el endpoint `POST /api/import` para recibir `projectId` del proyecto activo
- [x] #2 Implementar lógica de importación hacia archivos Markdown individuales para proyectos con `storageType: 'backlog-md'`
- [x] #3 Ocultar o desactivar el botón "Re-sync /docs" en `Header.tsx` si el proyecto seleccionado no tiene docs vinculados
- [x] #4 Proporcionar retroalimentación visual al usuario (toast o banner) indicando qué proyecto se sincronizó y cuántas tareas se actualizaron

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

#### [DEV-025] Integración Formal del Agentic Team Playbook, Guardrails de IA y Guía de Distribución
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: v1.2.0

Formalizar la metodología del Agentic Team Playbook dentro de DevBoard, definiendo roles, guardrails de ejecución para LLMs, matrices de verificación y documentando de punta a punta la arquitectura de distribución open-source (npm link, npx devboard-mcp, npx dev-board y publicación en npmjs.com).

**Criterios de Aceptación:**
- [x] #1 Crear docs/AGENTIC_PLAYBOOK.md formalizando roles, fases del ciclo de vida ágil con IA y guardrails anti-alucinación
- [x] #2 Crear docs/DISTRIBUTION.md explicando npm link, npx devboard-mcp, configuración en IDEs y publicación a npmjs.com
- [x] #3 Actualizar README.md y AGENTS.md integrando la metodología Playbook y la guía rápida de inicio
- [x] #4 Verificar integridad del sistema y validar con npm run backlog:check

---

#### [DEV-026] Unificación de Nombres Binarios CLI (devboard / devboard-mcp) y Limpieza de isDemo en Registry
- **Prioridad**: `high` | **Tipo**: `chore`
- **Sprint / Milestone**: v1.2.0

Unificar la convención de nomenclatura de binarios en package.json eliminando la asimetría entre dev-board y devboard-mcp (estableciendo devboard y devboard-mcp como comandos canónicos y soportando alias retrocompatibles). Eliminar la propiedad ruidosa isDemo: false del archivo data/projects-registry.json tratándola como false por defecto si está ausente.

**Criterios de Aceptación:**
- [x] #1 Configurar bin en package.json con devboard y devboard-mcp como principales, y alias compatibles
- [x] #2 Limpiar data/projects-registry.json eliminando isDemo: false innecesario
- [x] #3 Actualizar vite.config.ts para que saveRegistry y la creación de proyectos no serialicen isDemo cuando sea falsy
- [x] #4 Actualizar referencias en README.md a devboard y devboard-mcp
- [x] #5 Validar con npm run backlog:check y npm run build

---

#### [DEV-027] Integración de Agent Skills, Reglas y Playbook Operativo (m3 y c3admin)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Transferir y adaptar las mejores skills, reglas y herramientas de automatización de m3 y c3admin hacia dev-board para erradicar ineficiencias de desarrollo, inconsistencias de UX y falta de rigor en QA.

**Criterios de Aceptación:**
- [x] #1 Crear regla estricta de aprobación de Git en .agents/rules/git-approval.md
- [x] #2 Adaptar e incorporar skills operativas en .agents/skills/ (code-level-ux-auditor, rigorous-qa-auditor, worldclass-product-designer, principal-engineer, market-researcher, list-views-filters)
- [x] #3 Crear playbook operativo multi-agente en .agents/TEAM_PLAYBOOK.md con matriz de decision y directrices de subagentes
- [x] #4 Incorporar script scripts/audit-ux-code.cjs y añadir comando npm run audit:ux a package.json
- [x] #5 Validar integridad ejecutando npm run audit:ux, npm run build y npm run backlog:check

---

#### [DEV-030] Persistencia del Último Proyecto Activo y Fallback Seguro
- **Prioridad**: `medium` | **Tipo**: `bug`
- **Sprint / Milestone**: 0.3.0

Al iniciar o recargar la aplicación en el navegador, DevBoard seleccionaba por defecto el proyecto inicial del registro o el repositorio legado 'dom', ignorando en qué proyecto estuvo trabajando el usuario por última vez.
Dado que el proyecto es el filtro de contexto por excelencia en DevBoard, la interfaz debe recordar el último proyecto activo seleccionado para que el usuario mantenga su contexto de trabajo entre recargas y sesiones.
Se debe almacenar la preferencia en `localStorage` y sincronizarla con `projects-registry.json` mediante la API. Si el proyecto guardado fue desvinculado o su ruta ya no existe, el sistema debe aplicar un fallback seguro al primer proyecto válido disponible sin provocar estados inconsistentes ni fallos de renderizado.

**Criterios de Aceptación:**
- [x] #1 Guardar el último `projectId` seleccionado en `localStorage` ('devboard_active_project_id') ante cada cambio en el selector de proyectos
- [x] #2 Restaurar automáticamente el último proyecto activo al cargar o recargar la aplicación en `App.tsx`
- [x] #3 Validar existencia del proyecto: aplicar fallback seguro al primer proyecto disponible si el ID guardado fue eliminado o no existe
- [x] #4 Sincronizar el campo `activeProjectId` en `data/projects-registry.json` a través del endpoint de selección de proyectos
- [x] #5 Garantizar que los componentes de navegación (Header, Kanban, Sprint, Releases) rendericen directamente con el proyecto restaurado sin parpadeos

---

#### [DEV-031] Vistas de Flujo de Trabajo: Alternar entre Kanban Global y Sprint/Release Board Acotado
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

DevBoard debe responder de forma flexible a los dos paradigmas de trabajo ágil más extendidos:
1. **Kanban Puro (Flujo Continuo):** Visualiza todo el backlog del proyecto activo a lo largo de las columnas, permitiendo gestionar el flujo constante de trabajo continuo sin cortes artificiales.
2. **Scrum / Kanban Acotado:** Cuando el equipo trabaja enfocado en un objetivo acotado (Sprint) o en un paquete de entrega (Release), el tablero Kanban debe restringirse exclusivamente a las tareas comprometidas para ese objetivo.

Actualmente, el componente Kanban renderiza indiscriminadamente todas las tareas del proyecto y la pestaña "Sprint & Priorización" se limita a una lista vertical plana.
Esta tarea introduce la capacidad de alternar el alcance del tablero Kanban entre la visión global del proyecto y un tablero acotado al Sprint o Release seleccionado, incorporando indicadores de progreso hacia el objetivo del ciclo.

**Criterios de Aceptación:**
- [x] #1 Incorporar selector de alcance de flujo en el Kanban: opción "Todo el Backlog" (Kanban continuo) y "Sprint / Release Objetivo" (Scrum)
- [x] #2 Permitir seleccionar qué Sprint o Milestone activo visualizar en el modo acotado mediante un selector desplegable
- [x] #3 Filtrar las tarjetas del tablero para mostrar exclusivamente las tareas que coincidan con el `milestone` o `targetSprint` seleccionado
- [x] #4 Mostrar un banner de resumen del ciclo con título del Sprint/Release, contador de tareas completadas y barra de progreso porcentual
- [x] #5 Permitir añadir tareas al sprint activo directamente desde el selector o arrastre sin perder el contexto del proyecto
- [x] #6 Persistir el modo de alcance y el último sprint seleccionado en `localStorage`

---

#### [DEV-032] Planificación de Releases con Target Dinámico y Personalizable
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

En la gestión ágil de producto, los releases no deben funcionar únicamente como un historial estático o un empaquetador automático de tareas que ya alcanzaron el estado `ready`. Los equipos necesitan planificar sus entregas con anticipación, proyectando objetivos y monitoreando el avance hacia ellos.
Esta tarea introduce la figura de **Planned Releases** con target editable:
1. Capacidad de crear y configurar un Release en estado de planificación (ej: versión target `0.3.0`, fecha objetivo y resumen de alcance).
2. Vinculación de tareas planificadas a dicho release a través del campo `milestone`.
3. Dashboard visual de seguimiento en `ReleasesView.tsx` mostrando el porcentaje de cumplimiento del target, tareas en progreso y riesgos detectados.
4. Flexibilidad para actualizar y reprogramar el target a medida que el ciclo de desarrollo evoluciona (modificar fecha estimada, ajustar alcance o transferir tareas).
5. Transición fluida a publicación y empaquetado formal cuando se alcance el 100% de los criterios del release.

**Criterios de Aceptación:**
- [x] #1 Extender el modelo de datos `Release` para incluir estado (`planned` vs `released`), fecha target (`targetDate`) y alcance proyectado
- [x] #2 Incorporar formulario / modal para crear y editar Releases Planificados con versión target, fecha límite y descripción
- [x] #3 Mostrar en `ReleasesView.tsx` una sección destacada de 'Releases en Planificación' con medidor de avance hacia el target (% de tareas completadas)
- [x] #4 Permitir actualizar dinámicamente la fecha y atributos del target desde la interfaz gráfica
- [x] #5 Permitir asociar o desvincular tareas del release target directamente desde la vista de releases o desde `ItemModal`
- [x] #6 Persistir los releases en `backlog/releases.json` manteniendo retrocompatibilidad con las herramientas MCP y scripts de auditoría

---

#### [DEV-033] Refactorización Conceptual y UX: Desacople Sprint/Release, Rediseño ItemModal y Ergonomía de Vistas
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Refactorización profunda de conceptos de dominio, navegación y experiencia de usuario:
- Separación tajante entre Sprint (ciclo de trabajo iterativo) y Release (etiqueta o hito de despliegue a producción).
- Rediseño de ItemModal a layout de dos columnas estilo Linear (contenido principal a la izquierda, metadatos y contexto a la derecha).
- Limpieza radical del selector de proyectos (retirar exportaciones e importaciones) y centralizarlas en Configuración.
- Disminuir el protagonismo del Archivo a un botón sutil en el Header.
- Configuración de vistas activas y vista por defecto persistente.
- Ordenamiento y ergonomía de visualización en la vista de Sprints & Backlog.

**Criterios de Aceptación:**
- [x] #1 Desacoplar semánticamente Sprint vs Release/Versión en datos y UI, eliminando prefijo 'target'
- [x] #2 Rediseñar ItemModal a layout ergonómico de 2 columnas estilo Linear con panel 'Detalles y Contexto' a la derecha
- [x] #3 Limpiar menú de proyectos y reubicar Importación/Exportación en Settings -> Datos y Herramientas
- [x] #4 Reubicar Archivo como acción secundaria sutil con icono en el Header en lugar de pestaña principal
- [x] #5 Añadir selector de vista por defecto y habilitación de vistas en Settings (.devboard/config.json)
- [x] #6 Ordenar semántica y cronológicamente los grupos en SprintView con reasignación ágil

---

#### [DEV-034] Reubicación del Selector de Columnas (Simple/Ampliada) al Contenedor del Tablero Kanban
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Reubicar el conmutador de modo de columnas ("Simple" vs "Ampliada") desde el Header principal hacia la barra de herramientas interna del contenedor del Tablero Kanban:
- En el Header, este control contamina la navegación global y no tiene sentido fuera del contexto del Tablero Kanban.
- En el contenedor de KanbanBoard, se sitúa de forma contextualmente coherente en la barra superior junto al botón de "+ Mostrar Ideas", logrando una jerarquía visual limpia y ergonómica.

**Criterios de Aceptación:**
- [x] #1 Retirar el conmutador de modo de vista (Simple / Ampliada) de Header.tsx tanto en versión de escritorio como en el menú móvil
- [x] #2 Incorporar el selector de columnas (Simple / Ampliada) en la barra de herramientas superior de KanbanBoard.tsx junto al botón de Mostrar Ideas
- [x] #3 Asegurar respuesta responsiva y diseño visual consistente (tokens de color, bordes, estados activos)
- [x] #4 Validar compilación con `npm run build` y sincronización con `npm run backlog:check`

---

#### [DEV-035] Transformación de Configuración a Vista de Página Completa (SettingsView)
- **Prioridad**: `urgent` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Reemplazar el modal comprimido de configuración (`SettingsModal.tsx`) por una vista de página completa (`SettingsView.tsx`):
- El crecimiento de opciones (vistas por defecto, pestañas del header, límites WIP de columnas, importación/exportación, apariencia, editor de configuración JSON) desbordaba el tamaño de un modal emergente.
- La nueva vista de página completa adopta un patrón maestro-detalle estándar de herramientas de clase mundial (Linear / GitHub Settings): sidebar lateral de categorías, panel amplio de configuración, botón de retorno ágil al tablero y barra de guardado con atajo ⌘S.

**Criterios de Aceptación:**
- [x] #1 Crear componente SettingsView.tsx con layout maestro-detalle (sidebar lateral de categorías + panel amplio de contenido)
- [x] #2 Migrar e integrar todas las secciones: Flujo & Vistas, Tablero Kanban, Apariencia, Datos & Herramientas, y Avanzado (JSON)
- [x] #3 Integrar navegación a Settings en App.tsx como pestaña/vista completa ('settings') con botón de retorno al Tablero
- [x] #4 Actualizar el botón de Settings en Header.tsx para alternar la vista completa y reflejar estado activo
- [x] #5 Validar compilación con `npm run build` y sincronización con `npm run backlog:check`

---

#### [DEV-036] Ergonomía Integral: Creación de Sprints, Navegación Home en Logo, Edición Inline de Columnas y Estabilidad de Botón Ideas
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Refinamientos críticos de usabilidad y feedback de producto:
1. Vista Sprint & Priorización: Agregar botón '+ Nuevo Sprint' con sugerencia automática de nombre y soporte de grupo vacío receptor para arrastrar tarjetas.
2. Navegación Header: Hacer que el logo de DevBoard conduzca al Home / Tablero principal al hacer clic.
3. Tablero Kanban: Habilitar la edición de títulos de columnas directamente desde la cabecera del tablero (edición inline con persistencia automática).
4. Toolbar del Tablero: Estabilizar el botón de Ideas para que permanezca accesible y coherente sin desaparecer ni provocar saltos de layout entre modos.

**Criterios de Aceptación:**
- [x] #1 El logo de DevBoard en el Header conduce a la vista principal (Tablero o defaultView) con cursor pointer y hover feedback
- [x] #2 Incorporar botón '+ Nuevo Sprint' en SprintView que permita definir una nueva iteración y muestre drop zone receptora aunque no tenga tarjetas iniciales
- [x] #3 Habilitar edición inline de títulos de columna en KanbanBoard directamente desde cada cabecera con persistencia automática
- [x] #4 Mantener estable y visible el control de Ideas en la toolbar de KanbanBoard sin saltos entre modos Simple y Ampliada
- [x] #5 Validar con `npm run build` y sincronizar con `npm run backlog:check`

---

#### [DEV-037] Reasignación Dinámica y Visual de Estados a Columnas Kanban (Modo Simple y Ampliado)
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Permitir a los usuarios y equipos reasignar qué estados del ciclo de vida de una tarea pertenecen a cada columna del tablero Kanban:
1. Vista Simple por Defecto: Mapear `ready` y `finish` a la columna `Done` en `SIMPLIFIED_BASE_COLUMNS` (dejando In Progress con `doing`, `in_progress`, `review`, `testing_qa`).
2. Configuración Visual en Settings: En la sección 'Tablero Kanban' de Ajustes, permitir agregar y remover estados en cada columna interactivamente (chips con botón 'x' y selector '+ Estado') y elegir el dropTargetStatus.
3. Soporte Dual Simple/Ampliada: Permitir personalizar las columnas tanto de la vista Simple (`simplifiedColumns`) como de la vista Ampliada (`columns`).

**Criterios de Aceptación:**
- [x] #1 En la vista simple por defecto, el estado 'ready' (y 'finish') mapea a la columna 'Done' (col-done)
- [x] #2 En SettingsView pestaña 'Tablero Kanban', permitir reasignar estados a cada columna mediante badges interactivos (remover y agregar estados disponibles)
- [x] #3 Soportar edición de dropTargetStatus por columna para definir el estado destino al arrastrar tarjetas
- [x] #4 Soportar personalización y persistencia de columnas tanto para modo Simple como Ampliado en .devboard/config.json
- [x] #5 Validar con `npm run build` y sincronizar con `npm run backlog:check`

---

#### [DEV-038] Soporte de Metodología de Proyecto (Kanban vs Scrum) en Settings para Liberar la Interfaz
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Diferenciación conceptual y visual estricta entre metodologías de proyecto (Kanban Continuo, Scrum Puro y Scrumban Híbrido), con ajuste de vistas por defecto y libertad de personalización manual para el usuario:
1. **Scrum Puro**:
   - Por definición, el tablero de flujo continuo es Kanban. En Scrum Puro NO hay vista de tablero por defecto (`enabledTabs.kanban = false`, `defaultView = 'sprint'`).
   - El centro de operaciones es la vista de Sprints & Priorización / Backlog.
   - El logo de DevBoard y navegación redirigen a 'Sprint & Priorización'.
2. **Scrumban (Híbrido)**:
   - Fusión de Scrum y Kanban: El Tablero es **únicamente del Sprint Goal / Sprint Activo** en curso (no de todo el backlog).
   - Identificación visual clara: `Sprint Board (Scrumban)` con selector de Sprint Goal, progreso de la iteración y empty state si el sprint no tiene tareas.
   - La priorización y grooming general se realiza en 'Sprint & Priorización'.
3. **Kanban Continuo**:
   - Tablero continuo de todo el backlog sin iteraciones.
   - Oculta pestaña de Sprints y campos de Sprint en cards.
4. **Personalización Manual**:
   - El usuario puede cambiar la metodología y luego conmutar manualmente cualquier pestaña (`enabledTabs`) según su preferencia.

**Criterios de Aceptación:**
- [x] #1 En Scrum Puro, deshabilitar la vista Tablero por defecto y establecer 'Sprint & Priorización' como vista principal
- [x] #2 En Scrumban, el Tablero debe ser exclusivamente del Sprint Goal / Sprint Activo, sin conmutador de 'Todo el Backlog'
- [x] #3 En Kanban Continuo, el Tablero muestra todo el backlog sin referencias a sprints y oculta la pestaña de Sprints
- [x] #4 En SettingsView, permitir seleccionar la metodología aplicando presets inteligentes pero permitiendo al usuario activar/desactivar pestañas manualmente
- [x] #5 En Header, navegación móvil y redirección inicial, sincronizar la visibilidad de pestañas y destino del logo según la configuración
- [x] #6 Validar tipado y build con `npm run build` y auditar visualmente con subagente de navegador

---

#### [DEV-044] Fix: Persistencia de Prioridad P0 en Backlog Markdown y Dirty Checking en Edición de Campos
- **Prioridad**: `high` | **Tipo**: `bug`
- **Sprint / Milestone**: 0.3.0

Corrección de dos problemas críticos de sincronización y persistencia en la vista de Backlog:
1. **Fix de Prioridad P0 (Causa Raíz):** En `scripts/backlogMdParser.ts`, la función `formatPriorityForMd(p)` mapeaba `p === 'p0'` a `'high'`. Al re-parsear el Markdown, `'high'` era normalizado de vuelta a `'p1'`. Por esta razón, cuando el usuario seleccionaba P0 en el dropdown de prioridad, se mostraba el mensaje de éxito pero el valor se revertía inmediatamente a P1 en disco y en la interfaz. Corregir el mapeo a `'urgent'` o `'critical'` tanto en `formatPriorityForMd` como en el parser.
2. **Dirty Checking en Edición de Campos:** Al editar valores en celdas, nombres de columna o dropdowns con autoguardado, verificar si el nuevo valor difiere del preexistente (`newValue !== oldValue`). Si el valor es idéntico, abortar la llamada a la API y no emitir eventos redundantes.

**Criterios de Aceptación:**
- [x] #1 En scripts/backlogMdParser.ts, formatPriorityForMd('p0') serializa a 'urgent' o 'critical' y parseBacklogMd normaliza a 'p0'
- [x] #2 Al cambiar la prioridad a P0 desde el selector en la vista de Backlog, el valor persiste en disco sin revertirse a P1 tras refrescar
- [x] #3 Implementar dirty checking estricto en edición rápida de celdas y nombres de columnas (abortar si el valor no cambia)
- [x] #4 Añadir tests unitarios en scripts/test-parser.js verificando ida y vuelta de todas las prioridades (p0, p1, p2, p3)

---

#### [DEV-045] Estabilidad Visual del Botón de Ideas (Cero CLS) y Estado Destino por Defecto a 'Ready' en Vista Simplificada
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Mejora de estabilidad visual y coherencia del ciclo de vida en el tablero Kanban:
1. **Prevención de Layout Shift (CLS) en Botón de Ideas:** En `KanbanBoard.tsx`, el botón de alternar visibilidad de ideas cambiaba de texto dinámicamente (`Ideas Visibles` vs `+ Mostrar Ideas`), lo que alteraba su ancho intrínseco y desplazaba horizontalmente los botones adyacentes de selector de vista (`simplificada` / `ampliada`). El botón debe mantener un ancho o etiqueta fija (ej. icono con texto "Ideas" y dot/badge de estado) para que la barra de controles permanezca perfectamente estática al interactuar.
2. **Estado al Soltar por Defecto en Vista Simplificada:** En `SIMPLIFIED_BASE_COLUMNS`, el `dropTargetStatus` de la columna `Done` debe ser `ready` en lugar de `done`. El paso formal a `done` depende de la liberación o release del software, no únicamente de finalizar la etapa de desarrollo/QA.

**Criterios de Aceptación:**
- [x] #1 Mantener ancho fijo o etiqueta invariable en el botón de toggle de ideas para garantizar cero Cumulative Layout Shift (CLS)
- [x] #2 Los botones adyacentes de vista simplificada/ampliada no experimentan ningún desplazamiento al conmutar la visibilidad de ideas
- [x] #3 En SIMPLIFIED_BASE_COLUMNS, configurar dropTargetStatus: 'ready' en la columna Done (col-done)
- [x] #4 Al arrastrar una tarjeta a la columna Done en vista simplificada, su estado se actualiza a 'ready' por defecto

---

#### [DEV-046] Renombrar Agrupador 'Sin Sprint' a 'Backlog' y Guardado Condicional al Mover Tarjetas entre Agrupadores
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.0

Ajustes conceptuales y de eficiencia en la vista de Sprints y Priorización:
1. **Renombrar a 'Backlog':** El contenedor de tareas no asignadas a ninguna iteración debe llamarse **"Backlog"** (en lugar de "Sin Sprint" o "Sin Asignar"), alineándose con los estándares metodológicos ágiles y Scrum.
2. **Guardado Condicional Estricto (Dirty Check en D&D):** Al arrastrar y soltar una tarjeta dentro de un sprint o dentro del contenedor Backlog, comprobar previamente si el valor de asignación de la tarjeta cambió (`item.sprint !== targetSprintVal`). Si la tarjeta se suelta dentro de su mismo contenedor actual, no disparar mutaciones a la API ni alterar los archivos Markdown en disco.
3. **Posicionamiento:** El contenedor "Backlog" debe situarse siempre como el último bloque en la vista agrupada de Sprints.

**Criterios de Aceptación:**
- [x] #1 En SprintView.tsx, renombrar el grupo de tarjetas no asignadas a 'Backlog' con icono representativo
- [x] #2 Al soltar una tarjeta en un contenedor, comprobar si el sprint destino es idéntico al actual y abortar la mutación si no hay cambios
- [x] #3 Asegurar que el contenedor Backlog se ubica de forma consistente como el último agrupador en la vista
- [x] #4 En los selectores rápidos de la tabla de SprintView, la opción vacía muestra 'Backlog' en lugar de 'Sin Sprint'

---

#### [DEV-047] Soporte Jerárquico de Alcance Mayor: Épicas e Iniciativas con Agrupación y Progreso Consolidado
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Incorporación de entidades de gestión de alto nivel (Épicas e Iniciativas) para estructurar y agrupar tarjetas con un alcance o visión estratégica mayor:
1. **Tipos de Alto Nivel:** Extender `ItemType` para soportar `'epic'` e `'initiative'`, otorgándoles representación visual distinguida (badges con colores e iconos propios).
2. **Cálculo de Progreso Consolidado (Rollup Metrics):** Cada Épica o Iniciativa calcula dinámicamente el progreso de completitud (% completado, conteo de items cerrados vs abiertos) según el estado de las tareas hijas que la componen.
3. **Vistas Agrupadas y Filtros:** Permitir agrupar la vista de Backlog por Épica o filtrar el tablero Kanban por una Épica seleccionada.
4. **Almacenamiento Compatible:** Las Épicas e Iniciativas se almacenan como archivos `.md` estándar en `backlog/tasks/` manteniendo compatibilidad Backlog.md (`type: epic`, `type: initiative`).

**Criterios de Aceptación:**
- [x] #1 Extender ItemType y esquemas con 'epic' e 'initiative' con estilo visual propio (icono, bordes y badges)
- [x] #2 Las cards de tipo épica/iniciativa muestran barra de progreso porcentual consolidada según sus tareas hijas
- [x] #3 Permitir agrupar la vista Backlog por Épica en el selector 'Agrupar por'
- [x] #4 En FilterBar, añadir selector para filtrar todo el tablero por Épica/Iniciativa
- [x] #5 Sincronización bidireccional limpia con frontmatter Markdown (type: epic, type: initiative)

---

#### [DEV-049] Ciclo de Vida Seguro: Papelera (Soft Delete), Doble Confirmación de Purga y Protección contra Borrado en 'Done'
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Mecanismos de protección anti-destructiva y gestión segura del ciclo de vida de tarjetas:
1. **Protección contra Borrado en 'Done':** Las tareas en estado `done` constituyen el registro histórico y la justificación técnica de cambios en el código. Se bloquea terminantemente su eliminación física o accidental directa desde la interfaz (botón de borrar deshabilitado con tooltip explicativo).
2. **Flujo de Papelera (Soft Delete):** Al eliminar una tarea activa (no-done), el sistema no borra el archivo físico de disco de inmediato; realiza un Soft Delete asignándole `status: 'dismissed'`, `isDeleted: true` y `deletedAt: ISOString`, moviéndola a la sección o pestaña "Papelera".
3. **Restauración y Purga Definitiva con Doble Confirmación:** Dentro de la Papelera:
   - Los ítems pueden ser restaurados a su estado previo en 1 click ("Restaurar ítem").
   - La eliminación física y purgado de disco requiere un modal de doble confirmación con advertencia de seguridad explícita ("Escribe CONFIRMAR para eliminar irreversiblemente").

**Criterios de Aceptación:**
- [x] #1 Deshabilitar el botón de eliminación en tarjetas con estado 'done' con tooltip de protección histórica
- [x] #2 La acción de eliminar tarjetas activas ejecuta un Soft Delete enviándolas a la Papelera con metadato deletedAt
- [x] #3 Vista o filtro de Papelera accesible para consultar y restaurar tarjetas descartadas
- [x] #4 La purga física definitiva de una tarjeta desde la papelera exige un modal de doble confirmación de seguridad
- [x] #5 Integración con scripts/backlogMdParser.ts para preservar o archivar el archivo de forma resiliente

---

#### [DEV-050] Reordenamiento Drag & Drop en Backlog / Sprint y Priorización con Setting de Ranking Manual Condicional
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Soporte integral para reordenamiento manual de ítems en la vista de Backlog y Sprint & Priorización:
1. **Drag & Drop en Backlog:** Permitir arrastrar y soltar verticalmente filas de la tabla de Backlog para priorizarlas interactivamente, al igual que se hace entre columnas del tablero Kanban.
2. **Ranking Manual Condicional (Setting de Proyecto):** Incorporar en Settings el interruptor `rankingEnabled` (Habilitar Ranking Manual):
   - **Cuando está ACTIVADO:** El usuario puede reubicar libremente las filas mediante drag & drop, persistiendo el orden manual (`order` / `ranking`).
   - **Cuando está DESACTIVADO:** Se bloquea el reordenamiento manual; la tabla respeta estrictamente el orden predefinido (ej. por prioridad descendente o por fecha) y oculta los controles de arrastre para evitar alteraciones accidentales.
3. **Persistencia en Frontmatter:** El valor numérico de ranking se conserva en frontmatter Markdown (`order: 10`, `order: 20`, espaciado para reordenamiento sin colisiones).

**Criterios de Aceptación:**
- [x] #1 Soporte de Drag & Drop vertical fluido para reordenar filas en la tabla de Backlog y contenedores de sprint
- [x] #2 Setting 'rankingEnabled' en SettingsView para activar o desactivar el ranking manual
- [x] #3 Cuando el ranking está desactivado, el arrastre manual queda bloqueado y se respeta el orden estricto de columnas
- [x] #4 Al reordenar filas con ranking activo, se actualiza el campo 'order' y se persiste en los archivos Markdown
- [x] #5 Rendimiento optimizado a 60 FPS durante la interacción de arrastre en listas largas

---

#### [DEV-051] Configuración y Parametrización de Columnas Visibles en la Vista de Backlog
- **Prioridad**: `low` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.4.0

Permitir a los usuarios personalizar qué columnas de información se muestran en la tabla de la vista de Backlog:
1. **Selector de Columnas:** Añadir un menú desplegable/popover "Columnas" en la barra superior de la vista de Backlog con checkboxes para activar u ocultar campos.
2. **Campos Parametrizables:** Posibilidad de alternar:
   - Columnas base: Prioridad, Código, Título, Estado, Tipo.
   - Columnas opcionales: Módulo, Archivo Impactado, Épica/Padre, Dependencias, Release/Versión, Sprints, Fecha de Creación.
3. **Persistencia Local:** Guardar las preferencias de columnas visibles en la configuración local del proyecto (`.devboard/config.json`) para que se mantengan entre sesiones y recargas.
4. **Ergonomía:** Asegurar layout elástico sin scrolls horizontales rotos al alternar columnas.

**Criterios de Aceptación:**
- [x] #1 Popover interactivo 'Columnas' en la barra de herramientas de la vista Backlog
- [x] #2 Capacidad de conmutar visibilidad de columnas opcionales (módulo, parent, release, dependencias, etc.)
- [x] #3 Las columnas obligatorias (código, título) permanecen ancladas para preservar usabilidad mínima
- [x] #4 Persistencia de las columnas activas en .devboard/config.json
- [x] #5 La tabla adapta su distribución de anchos de celda de forma fluida sin romper el layout

---

#### [DEV-052] Zonas de Soltado Multi-Estado (Drop Targets Específicos) en Columnas Kanban Agrupadas
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.4.0

Resolución del problema de asignación de estados cuando una columna Kanban agrupa más de un estado:
1. **Limitación Actual:** Actualmente, si una columna agrupa varios estados (por ejemplo, la columna In Progress agrupa `doing`, `in_progress`, `review`, `testing_qa`), al soltar una tarjeta se le asigna de forma fija el `dropTargetStatus` por defecto de la columna, lo cual es solo un fallback insuficiente y no cubre todos los casos de uso reales.
2. **Subzonas de Soltado Dinámicas:** Cuando el usuario arrastra una tarjeta sobre una columna que tiene múltiples estados asignados (`statuses.length > 1`), la interfaz debe desplegar bloques o zonas de soltado (drop zones) claramente diferenciadas para cada uno de los estados mapeados (ej: bloque para `doing`, bloque para `review`, etc.).
3. **Selección Directa y Fallback:**
   - Si el usuario suelta la tarjeta dentro de una subzona específica, la tarjeta asume inmediatamente ese estado exacto.
   - Si el usuario suelta en el cuerpo general de la columna fuera de las subzonas, se utiliza el `dropTargetStatus` como fallback seguro.

**Criterios de Aceptación:**
- [x] #1 Detectar columnas Kanban con más de un estado mapeado (statuses.length > 1)
- [x] #2 Al sobrevolar la columna con una tarjeta arrastrada, desplegar subzonas de drop claramente delimitadas con el nombre de cada estado
- [x] #3 Soltar sobre una subzona específica transiciona la tarjeta a ese estado exacto
- [x] #4 Soltar en la zona neutra de la columna aplica dropTargetStatus como fallback
- [x] #5 Animación fluida de apertura de subzonas sin provocar jank ni saltos bruscos en el scroll

---

#### [DEV-053] Configuración Visual de Tablero por Drag & Drop en Settings (Arrastre de Estados entre Columnas)
- **Prioridad**: `low` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.4.0

Evolución de la experiencia de usuario en la configuración del tablero en `SettingsView`:
1. **Experiencia Actual:** La asignación de estados a columnas se realiza mediante badges estáticos y selectores desplegables '+ Estado'.
2. **Experiencia por Drag & Drop:** Permitir que los badges de estado sean arrastrables (`draggable`) entre las tarjetas de columnas. El usuario puede tomar un estado (ej. `review`) de una columna y arrastrarlo visualmente hacia otra (ej. de "In Progress" a una columna "Testing"), reasignándolo instantáneamente de manera intuitiva.
3. **Soporte Dual:** Funcionamiento tanto en la pestaña de configuración del Modo Simple (3 columnas) como del Modo Ampliado (5 columnas).
4. **Validaciones:** Prevenir estados huérfanos y asegurar que cada columna conserve un `dropTargetStatus` coherente con sus estados contenidos.

**Criterios de Aceptación:**
- [x] #1 En SettingsView (pestaña Tablero Kanban), los chips de estados son arrastrables entre columnas
- [x] #2 Indicador visual claro del contenedor destino durante el arrastre (hover highlight)
- [x] #3 Al soltar un estado en otra columna, se actualiza la configuración en memoria y se persiste en .devboard/config.json
- [x] #4 Soporte para reconfigurar tanto columnas en modo Simple como en modo Ampliado
- [x] #5 Validación para garantizar que todos los estados esenciales pertenezcan a al menos una columna

---

#### [DEV-054] Rediseño Ergonómico y Expansión del Modal de Crear y Editar Card (Layout de 2 Columnas)
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.2

Rediseño integral de ergonomía y distribución visual en el modal de creación y edición de tarjetas (`ItemModal.tsx`):
1. **Problema de Espacio:** El modal actual es angosto y verticalmente apretado para la alta densidad de información que maneja (criterios de aceptación dinámicos, descripción técnica, plan de implementación, contexto, dependencias y metadatos).
2. **Arquitectura de 2 Columnas (Estilo Linear / GitHub Projects):**
   - **Columna Principal (Izquierda ~65-70%):** Área amplia y despejada dedicada al contenido sustantivo: Título grande, Descripción con soporte enriquecido, Criterios de Aceptación con espacio cómodo de escritura por ítem, y Plan Técnico de Implementación.
   - **Sidebar Lateral de Atributos (Derecha ~30-35%):** Panel lateral estilizado con selectores rápidos y limpios para metadatos: Tipo de Card, Prioridad, Estado, Épica/Padre, Sprints, Release, Enlaces/Dependencias, Etiquetas, Módulo y Archivo Impactado.
3. **Dimensiones:** Ampliar el ancho del modal a `max-w-6xl` en pantallas de escritorio con scrolls independientes para evitar saltos.
4. **Mobile First:** Mantenimiento de la experiencia como bottom-sheet táctil fluido en pantallas pequeñas.

**Criterios de Aceptación:**
- [x] #1 Modal expandido a max-w-6xl en escritorio con distribución moderna de 2 columnas
- [x] #2 Panel principal izquierdo espacioso para título, descripción, criterios de aceptación y plan técnico
- [x] #3 Sidebar lateral derecha compacta y alineada para atributos clave (tipo, prioridad, estado, padre, sprint, release)
- [x] #4 Entradas de criterios de aceptación con altura cómoda y auto-creación fluida
- [x] #5 Adaptación responsive elegante a bottom-sheet en pantallas móviles

---

#### [DEV-055] Ciclo de Vida Integral de Sprints: Objetivo, Fechas con Presets, Estados y Autofiltrado
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.4.0

Formalización del ciclo de vida y metadatos de los Sprints como entidad ágil de primera clase:
1. **Metadatos Enriquecidos:** Cada Sprint debe contar con:
   - Nombre o identificador (ej: "Sprint 1", "Sprint 2").
   - Descripción / Objetivo del Sprint (Sprint Goal, notas de alcance y acuerdos de la iteración).
   - Fechas de Inicio y Fin con presets rápidos de cálculo automático:
     - 1 semana
     - 2 semanas (estándar común)
     - 3 semanas
     - 4 semanas
     - Personalizado (fechas manuales).
2. **Ciclo de Vida (Estados):** Un sprint transiciona por los estados `planned` (planificado), `active` (en curso) y `completed` (finalizado).
   - Botón "Iniciar Sprint" (con restricción estricta de máximo 1 sprint activo por proyecto).
   - Botón "Completar Sprint" con resumen de cierre.
3. **Autofiltrado en Sprint Board (Scrumban):** Al conmutar a la vista de Tablero de Sprint, el tablero autofiltra su contenido exclusivamente a las tarjetas dentro del alcance del sprint activo.
4. **Orden Cronológico:** Los agrupadores de sprint deben mostrarse predeterminadamente ordenados del más viejo al más nuevo, finalizando siempre en el contenedor "Backlog".

**Criterios de Aceptación:**
- [x] #1 Entidad Sprint estructurada con id, nombre, objetivo/descripción, fechas inicio/fin y estado (planned, active, completed)
- [x] #2 Presets de duración en formulario de sprint (1, 2, 3, 4 semanas y custom) que calculan automáticamente la fecha de fin
- [x] #3 Acciones de 'Iniciar Sprint' (máximo 1 activo a la vez) y 'Completar Sprint'
- [x] #4 En modo Scrumban, el Tablero de Sprint se autofiltra automáticamente al Sprint Activo
- [x] #5 En la vista de Sprints y Priorización, los sprints se ordenan cronológicamente del más viejo al más nuevo, con 'Backlog' al final

---

#### [DEV-058] Política de Visualización Limpia en Tablero: Ocultamiento por Defecto de Cards en 'Done' y Toggle de Histórico
- **Prioridad**: `medium` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.2

Optimización de la visualización de tareas finalizadas en el tablero Kanban (especialmente en la vista simplificada y en el tablero de sprint goal):
1. **Problema de Acumulación:** En tableros ágiles, acumular decenas de tarjetas históricas cerradas en la columna `Done` no aporta valor operativo al día a día del equipo y satura la pantalla, provocando desorden y lentitud de renderizado.
2. **Ocultamiento por Defecto:**
   - En la vista simplificada y tableros acotados a sprint, ocultar por defecto las tarjetas en `done` que pertenezcan a iteraciones pasadas o finalizadas hace más de un intervalo configurable.
   - Mostrar un indicador limpio y sutil al tope de la columna Done con el conteo de tarjetas históricas archivadas (ej: "+18 tareas completadas anteriormente").
3. **Toggle Bajo Demanda (Estilo Ideas):** Incorporar un botón o selector interactivo (similar al de Ideas) para mostrar u ocultar el histórico de Done cuando el usuario explícitamente desee auditarlo.

**Criterios de Aceptación:**
- [x] #1 En vista simplificada, no acumular tareas finalizadas históricas en la columna Done por defecto
- [x] #2 Indicador visual sutil al tope de la columna con el conteo de tareas completadas ocultas
- [x] #3 Botón interactivo o toggle para revelar el histórico completo de Done bajo demanda
- [x] #4 Persistencia de la preferencia de visualización en Settings (.devboard/config.json)
- [x] #5 Reducción comprobable del número de nodos DOM y mejora en fluidez de render

---

#### [DEV-062] Separación de Versiones en Unreleased (Dev) y Released (Producción) en Release Hub y Modelo de Datos
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.0

Corrección conceptual integral del ciclo de vida de versiones: una versión en desarrollo (staging/dev) es 'unreleased' independientemente de si tiene tareas listas o commits. Solo pasa a 'released' (histórico inmutable) al ser explícitamente promovida/desplegada a producción.

**Criterios de Aceptación:**
- [x] #1 Soporte explícito para status 'unreleased' en Release y migración de v0.3.0 de released a unreleased en releases.json
- [x] #2 vite.config.ts no asigna releasedAt ni fuerza status done salvo que la versión sea explícitamente 'released'
- [x] #3 ReleaseAssembler.tsx divide claramente 'Unreleased / En Preparación' de 'Releases Históricos (Producción)'
- [x] #4 Botón 'Guardar Borrador Unreleased' para actualizar changelog continuo en dev sin sellar histórico
- [x] #5 Modal/Acción deliberada 'Liberar a Producción' que solicita confirmación antes de marcar como 'released' y registrar releasedAt
- [x] #6 MCP server (devboard_list_releases) expone el campo status ('unreleased' | 'released' | 'planned') de cada versión

---

#### [DEV-063] Fix: Estabilidad de Scroll, Tie-Breakers Deterministas y Normalización al Ordenar en Vista Sprint
- **Prioridad**: `high` | **Tipo**: `bug`
- **Sprint / Milestone**: 0.3.0

Corrección del comportamiento de salto vertical, parpadeo y desplazamiento involuntario de la pantalla al ordenar por columnas (especialmente Prioridad) en `SprintView.tsx`:
1. **Comparador Débil y Valores No Normalizados:** Al ordenar por prioridad, si las prioridades coinciden o contienen valores textuales no estándar (`urgent`, `high`, `undefined`), el comparador produce `0` o `NaN`, corrompiendo la estabilidad del ordenamiento y alterando aleatoriamente las alturas de los bloques. Se debe normalizar la prioridad y utilizar un tie-breaker secundario determinista (desempate por `code`).
2. **Preservación de Scroll del Viewport:** Al hacer click en un header de ordenamiento en una tabla ubicada más abajo en la página (ej. Backlog), el reordenamiento de los grupos superiores altera la altura total y el navegador resetea o desplaza bruscamente `window.scrollY`. Se debe anclar o restaurar de forma fluida e instantánea la posición relativa del viewport al cambiar de orden.

**Criterios de Aceptación:**
- [x] #1 Normalizar prioridades y aplicar tie-breaker determinista por código en el ordenamiento por prioridad
- [x] #2 Aplicar tie-breaker determinista por código en el ordenamiento por estado
- [x] #3 Preservar de forma instantánea y fluida la posición de scroll (`window.scrollY`) antes y después del ordenamiento
- [x] #4 Prevenir saltos de layout o scroll anchoring errático en las tablas de SprintView
- [x] #5 Verificación interactiva en navegador confirmando cero saltos de scroll al ordenar

---

#### [DEV-064] Hardening de MCP Server: Sanitización de Prefijo, Cálculo Robusto de IDs Secuenciales y Herramienta devboard_sync_backlog
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.1

Hardening integral del servidor MCP (`scripts/mcp-server.ts` y binario standalone `bin/devboard-mcp.js`):
1. **Sanitización de Prefijos de Proyecto:** Eliminar caracteres no alfanuméricos en `codePrefix` (ej. `dev-board` extraía `"DEV-"`, produciendo dobles guiones `DEV--060`). Limpiar con `.replace(/[^A-Z0-9]/g, '')`.
2. **Cálculo Robusto de IDs Secuenciales:** Reemplazar `tasks.length + 1` por una búsqueda de `max(num) + 1` parseando los códigos existentes mediante regex para evitar colisiones numéricas cuando hay tareas eliminadas o no correlativas.
3. **Herramienta `devboard_sync_backlog`:** Nueva tool JSON-RPC que reconcilia tareas y genera `BACKLOG.md` sin requerir que agentes de IA ejecuten comandos de shell sueltos (`npm run backlog:sync`).

**Criterios de Aceptación:**
- [x] #1 Sanitización de prefijo en mcp-server.ts impidiendo dobles guiones en IDs generados
- [x] #2 Cálculo de nuevo ID basado en max(existentes) + 1 con fallback seguro
- [x] #3 Implementación de tool devboard_sync_backlog en el servidor MCP
- [x] #4 Reconstrucción del binario standalone bin/devboard-mcp.js y validación con scripts/verify-mcp-binary.js

---

#### [DEV-065] Actualización de Skills de Agentes: Guía Estricta Anti-Scripts de Terminal y Ciclo de Vida Unreleased vs Released
- **Prioridad**: `medium` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.1

Actualización y enriquecimiento de las Skills del repositorio (`.agents/skills/devboard`, `.agents/skills/rigorous-qa-auditor`, `AGENTS.md`):
1. **Regla Anti-Scripts Sueltos:** Establecer como principio fundamental que los agentes de IA NO deben ejecutar scripts ad-hoc de Node (`node -e ...`) ni comandos bash destructivos (`mv`, `rm` sobre el backlog) cuando operan en DevBoard. Si una operación falta, debe usarse o proponerse una herramienta MCP.
2. **Ciclo de Vida de Releases:** Documentar la distinción canónica entre `unreleased` (paquete activo en desarrollo, mutable, changelog vivo) y `released` (histórico inmutable en producción con `releasedAt`).
3. **Auditoría de Identificadores:** Instrucciones para que el auditor de QA verifique la integridad de prefijos (`DEV-XXX`), evitando duplicidades o formatos corruptos.

**Criterios de Aceptación:**
- [x] #1 Actualizar .agents/skills/devboard/SKILL.md con las reglas anti-scripts y el flujo unreleased vs released
- [x] #2 Actualizar .agents/skills/rigorous-qa-auditor/SKILL.md con guardrails de integridad de IDs
- [x] #3 Reflejar las directivas clave en AGENTS.md

---

#### [DEV-066] Simplificación Conceptual de Releases: Lista Unificada (En Preparación vs Implementado) y Detalle Progresivo
- **Prioridad**: `high` | **Tipo**: `feature`
- **Sprint / Milestone**: 0.3.1

Refactorización y simplificación radical del modelo y la interfaz de Releases:
1. **Unificación Conceptual:** 'Planning', 'Target' y 'Unreleased' son conceptualmente lo mismo: una versión **En Preparación**. Eliminar la división artificial en bloques separados redundantes.
2. **Modelo Binario Puro:**
   - **En Preparación (Unreleased / Dev):** Trabajo activo, editable, mutable.
   - **Implementado / Entregado (Released / Prod):** Desplegado a producción, histórico e inmutable.
3. **Ergonomía de Lista y Detalle Progresivo:** Presentar las versiones en una lista limpia y concisa (vista compacta / feed simple). Desplegar metadatos extensos, notas de cambio y edición únicamente cuando el usuario selecciona o expande una versión específica.

**Criterios de Aceptación:**
- [x] #1 Unificar los estados del modelo de Release a exclusivamente 'unreleased' y 'released'
- [x] #2 Rediseñar ReleaseAssembler.tsx hacia una vista tipo lista compacta y clara sin divisiones redundantes
- [x] #3 Implementar panel de detalle progresivo (drawer o split-view) para inspección y edición bajo demanda

---

#### [DEV-067] Arquitectura Unificada de Filtros: Filtro General de Estados (Inclusión/Exclusión), Quick Filters y Popover Multiselect
- **Prioridad**: `urgent` | **Tipo**: `ux`
- **Sprint / Milestone**: 0.3.3

Evolución integral del sistema de filtrado de DevBoard hacia un modelo limpio, escalable y unificado:
1. **Filtro General de Estados (Inclusión / Exclusión):** Unificación de la visibilidad de estados activos (draft, doing, review, ready), tareas completadas (done) y tareas de descarte/cancelación (dismissed, cancelled).
   - Política predeterminada: tareas activas y completadas de la iteración actual incluidas; completadas de iteraciones pasadas y descartadas/canceladas excluidas por defecto.
   - Flexibilidad total: activación bajo demanda para auditar descartadas o consultar completadas históricas sin cambiar de pestaña.
2. **Estrategia Dual de Interfaz:**
   - **Quick Filters en Encabezado:** Acceso inmediato con un clic a búsquedas (⌘K), selector de Sprint Goal, toggles de estado (✓ Completadas anteriores, ✕ Descartadas) y pills rápidas.
   - **Popover de Filtros Avanzados (Filtros ▾ (N)):** Panel desplegable extensible con soporte multiselect para Tipos, Prioridades, Estados, Sprints, Releases y Módulos.
   - **Chips Activos Descartables y Reset:** Visualización de chips con ✕ y botón universal de 'Limpiar filtros'.

**Criterios de Aceptación:**
- [x] #1 Extender FilterState en types.ts para soportar multiselect (types, priorities) y filtro general de estados (includePreviousDone, includeDismissedCancelled)
- [x] #2 Implementar AdvancedFiltersPopover.tsx con interfaz multiselect por categorías y contador de filtros activos
- [x] #3 Actualizar FilterBar.tsx para incorporar el botón desplegable de Filtros y Quick Filters en el encabezado con chips activos
- [x] #4 Actualizar lógica central en App.tsx para procesar la inclusión/exclusión de estados y multiselect
- [x] #5 Refactorizar KanbanBoard.tsx eliminando botones ad-hoc y vinculando la columna Done y las completadas anteriores al filtro unificado
- [x] #6 Verificación con npm run build y sincronización limpia del backlog

---

#### [DEV-071] Fix: Aislamiento estricto de Sprints por Proyecto y Prevención de Fugas Cross-Project
- **Prioridad**: `high` | **Tipo**: `bug`

En instalaciones multi-proyecto, los sprints registrados en otros proyectos (ej. dom/m3) se filtraban hacia el proyecto activo (dev-board), generando agrupadores de sprints vacíos con badge 'Activo' ('Integridad Financiera', 'Performance y Escala', etc.) que no existen en el sprints.json local y no pueden ser eliminados.

**Criterios de Aceptación:**
- [x] #1 Garantizar que readProjectBacklog en backend asigne siempre projectId a cada sprint cargado desde sprints.json
- [x] #2 En App.tsx, derivar projectSprints filtrando boardData.sprints estrictamente por selectedProjectId
- [x] #3 Pasar projectSprints y availableSprints contextuales a SprintView, KanbanBoard y selectores de modal
- [x] #4 En handleDeleteSprint y mutaciones de sprints, enviar el projectId específico del sprint para permitir su eliminación adecuada
- [x] #5 Eliminar la fuga de sprints de proyectos foráneos en la vista Sprint & Priorización

---
