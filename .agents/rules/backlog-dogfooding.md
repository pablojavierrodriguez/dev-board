# Dogfooding & Sincronización Obligatoria del Backlog (DevBoard)

Este repositorio es la fuente de **DevBoard**, el cockpit de gestión ágil. Como regla de oro de ingeniería, **practicamos dogfooding estricto**: usamos DevBoard para desarrollar DevBoard y ningún código se commitea sin sincronización viva del backlog.

---

## 1. Ciclo de Vida del Agente (Obligatorio)

Antes de iniciar cualquier implementación o cambio de código:

1. **Localizar o Crear la Tarea:**
   - Debe existir un archivo `backlog/tasks/<ID> - <Título>.md` representativo.
   - Si el requerimiento es nuevo, créalo con la herramienta MCP `devboard_create_task` o crea el archivo Markdown.

2. **Pasar a `doing`:**
   - Antes de escribir una sola línea de código, la tarea debe actualizarse a `status: doing`.
   - `devboard_update_task` con `{ taskId: "DEV-XXX", status: "doing" }`.

3. **Tildar Criterios de Aceptación (AC) en Vivo:**
   - A medida que se resuelven los criterios, cambia `- [ ]` a `- [x]` (o usa `toggleAcIndex`).

4. **Promocionar a `done` o `ready` antes del Commit:**
   - Si la tarea está completa y verificada, pásala a `done` (o `ready` si espera empaquetado de release).
   - **NUNCA dejes una tarea con 100% de ACs cumplidos en `draft` o `doing`.**

5. **Staging Obligatorio en el Mismo Commit:**
   - Los archivos `.md` de la tarea modificada y el consolidado `BACKLOG.md` **DEBEN incluirse en el mismo commit de Git que el código fuente**.
   - Ejemplo:
     ```bash
     git add src/components/NuevoComponente.tsx backlog/tasks/dev-025.md BACKLOG.md
     git commit -m "feat(DEV-025): ..."
     ```

---

## 2. Salvaguarda Automatizada de Git

El repositorio cuenta con un hook `pre-commit` en `.githooks/pre-commit` y el script de auditoría `scripts/verify-backlog-sync.js`:
- Si intentas hacer commit y hay tareas con todos los criterios de aceptación completados pero con estado `draft` o `doing`, el commit será bloqueado.
- Puedes auto-corregir discrepancias ejecutando:
  ```bash
  npm run backlog:sync
  ```
- Para validar el estado del backlog en cualquier momento:
  ```bash
  npm run backlog:check
  ```
