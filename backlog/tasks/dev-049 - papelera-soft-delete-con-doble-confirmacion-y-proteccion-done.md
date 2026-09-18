---
id: DEV-049
title: "Ciclo de Vida Seguro: Papelera (Soft Delete), Doble Confirmación de Purga y Protección contra Borrado en 'Done'"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-18 00:04'
labels:
  - safety
  - trash
  - lifecycle
dependencies: []
priority: high
type: feature
milestone: "0.4.0"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mecanismos de protección anti-destructiva y gestión segura del ciclo de vida de tarjetas:
1. **Protección contra Borrado en 'Done':** Las tareas en estado `done` constituyen el registro histórico y la justificación técnica de cambios en el código. Se bloquea terminantemente su eliminación física o accidental directa desde la interfaz (botón de borrar deshabilitado con tooltip explicativo).
2. **Flujo de Papelera (Soft Delete):** Al eliminar una tarea activa (no-done), el sistema no borra el archivo físico de disco de inmediato; realiza un Soft Delete asignándole `status: 'dismissed'`, `isDeleted: true` y `deletedAt: ISOString`, moviéndola a la sección o pestaña "Papelera".
3. **Restauración y Purga Definitiva con Doble Confirmación:** Dentro de la Papelera:
   - Los ítems pueden ser restaurados a su estado previo en 1 click ("Restaurar ítem").
   - La eliminación física y purgado de disco requiere un modal de doble confirmación con advertencia de seguridad explícita ("Escribe CONFIRMAR para eliminar irreversiblemente").
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Deshabilitar el botón de eliminación en tarjetas con estado 'done' con tooltip de protección histórica
- [ ] #2 La acción de eliminar tarjetas activas ejecuta un Soft Delete enviándolas a la Papelera con metadato deletedAt
- [ ] #3 Vista o filtro de Papelera accesible para consultar y restaurar tarjetas descartadas
- [ ] #4 La purga física definitiva de una tarjeta desde la papelera exige un modal de doble confirmación de seguridad
- [ ] #5 Integración con scripts/backlogMdParser.ts para preservar o archivar el archivo de forma resiliente
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/components/ItemCard.tsx` e `ItemModal.tsx`, deshabilitar eliminación si `item.status === 'done'`.
2. Actualizar endpoint backend `DELETE /api/items/:id` para que realice soft delete por defecto a menos que se invoque con `?purge=true`.
3. Crear vista/modal de Papelera con botones de "Restaurar" y "Purgar".
4. Implementar modal de confirmación con desafío de texto para acciones destructivas irreversibles.
<!-- SECTION:PLAN:END -->
