---
name: rigorous-qa-auditor
description: Auditor de calidad implacable para DevBoard. Valida tipado estricto (tsc), build, sincronización de backlog, ergonomía visual en navegador, pruebas de interacción con browser subagents y verificación de criterios de aceptación antes de cualquier entrega.
---

# Rigorous QA Auditor & Sentinel Skill — DevBoard

## Misión
Garantizar que ninguna experiencia mediocre, bug visual, regresión de scroll o inconsistencia de backlog llegue al desarrollador. Actúa como el guardián implacable de la barra de calidad antes de cerrar cualquier tarea, proponer un commit o empaquetar un release.

---

## 🛡️ Batería de Pruebas Obligatoria Pre-Entrega

Antes de marcar cualquier tarea en `ready` o `done`, es **MANDATORIO** ejecutar la siguiente secuencia de validaciones:

### 1. Compilación, Tipado & Bundles
```bash
npm run build
```
- Valida que TypeScript no tenga errores (`tsc`).
- Valida que el bundle de Vite ensamble sin fallas de importación.
- Valida la compilación de los binarios autónomos CLI y MCP (`node scripts/build-binaries.js`).
- **Tolerancia Cero:** Si existe un solo error de tipado o warning de build, la tarea es rechazada de inmediato.

### 2. Sincronización e Integridad del Backlog (Dogfooding)
```bash
npm run backlog:check
```
- Audita que todas las tareas en `backlog/tasks/` tengan coherencia entre sus criterios de aceptación cumplidos y su estado actual.
- Si una tarea tiene el 100% de criterios cumplidos (`- [x]`), debe estar en `ready` o `done`.
- Si se detecta desincronización, ejecutar `npm run backlog:sync` y verificar el archivo consolidado `BACKLOG.md`.

### 3. Auditoría Estática de UX y Ergonomía
```bash
npm run audit:ux
```
- Revisa `src/` buscando colisiones de scroll, botones sin `aria-label`, falta de `min-w-0` y touch targets insuficientes.
- No deben quedar advertencias no justificadas.

### 4. Integridad de Identificadores y Nomenclatura (DEV-064 y DEV-065)
- **Formato Canónico:** Validar que los identificadores sigan estrictamente el formato `[A-Z0-9]+-\d{3,}` (ej: `DEV-065`, `FEAT-012`), impidiendo prefijos con dobles guiones (`DEV--060`) o caracteres especiales corruptos.
- **Trazabilidad Archivo vs Frontmatter:** Verificar que el ID en frontmatter (`id: DEV-XXX`) coincida exactamente con el prefijo numérico del archivo Markdown (`dev-xxx - <slug>.md`).
- **Cero Colisiones:** Comprobar que no existan IDs duplicados en el backlog activo ni en `releases.json`.

---

## 🌐 Batería de Validación en Vivo (Browser Subagent / Localhost 4100)

Para tareas que modifiquen la interfaz visual (`KanbanBoard`, `ItemModal`, `FilterBar`, `Header`, etc.), despachar un `browser_subagent` o validar en `http://localhost:4100/`:

1. **Kanban & Drag Interaction:**
   - Mover una tarea entre columnas (ej. de `doing` a `review`).
   - Comprobar que no haya saltos bruscos ni descalibración de scroll horizontal.
2. **ItemModal Inspection:**
   - Abrir una tarea con descripción y criterios extensos.
   - Probar edición de texto, agregar un nuevo criterio y tildar checkboxes en vivo.
   - Probar tecla `Escape` para cerrar.
3. **FilterBar & Búsqueda:**
   - Escribir en la barra de búsqueda y filtrar por prioridad o hito.
   - Comprobar que el botón de "Limpiar filtros" reaparece y restablece el tablero.
5. **Protocolo de Inspección Previa (Anti-Preguntas Especulativas):**
   - Ante reportes de discrepancias o fallas visuales, **prohibido teorizar o preguntar sin evidencia**.
   - Inspeccionar primero el componente TSX y el DOM vivo con `browser_subagent` para constatar el renderizado real.

---

## 📦 Gate de Auditoría de Alcance y Documentación Pre-Release (100% en Producción)

Antes de promover un release a `released` en `backlog/releases.json`:
1. Comprobar que **todas** las tareas asignadas (`milestone` o `targetRelease`) estén en estado `done` (o listas en `ready` para su promoción formal).
2. Si existen tareas incompletas en `draft`/`doing`, reasignarlas formalmente a la siguiente versión planificada en preparación (ej: `0.6.0`) antes de sellar el release.
3. El indicador de Alcance en el Centro de Releases debe marcar estrictamente **100%** (barra verde).
4. **Auditoría Obligatoria de Documentación:** Verificar que `README.md`, `docs/ARCHITECTURE.md` y las skills de `.agents/skills/` reflejen la nueva versión, documenten las herramientas nuevas y no arrastren referencias obsoletas (`npm run backlog:check`).

---

## 📋 Protocolo de Cierre de Tarea (Signoff)

Un agente **solo** puede dar por concluida una tarea si se cumplen las siguientes 5 condiciones:
1. ✅ **100% de Criterios Cumplidos:** Todos los checkboxes en `backlog/tasks/<ID>.md` están en `- [x]`.
2. ✅ **Build y Backlog Limpios:** `npm run build` y `npm run backlog:check` retornan código 0.
3. ✅ **Auditoría UX Aprobada:** `npm run audit:ux` ejecutado con éxito.
4. ✅ **Trazabilidad:** La tarea está promocionada al estado canónico `ready` mediante `devboard_update_task` (pasando a `done` exclusivamente al publicarse el release).
5. ✅ **Cero Commits No Solicitados:** Los cambios quedan preparados en el working tree sin ejecutar `git commit` hasta que el usuario lo ordene explícitamente.
