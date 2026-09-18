---
id: DEV-032
title: "Planificación de Releases con Target Dinámico y Personalizable"
status: Done
created_date: '2026-09-17'
updated_date: '2026-09-18 03:41'
labels:
  - releases
  - planning
  - milestone
  - ux
dependencies: []
priority: high
type: feature
milestone: "0.3.0"
sprint: "Sprint 1"
order: "32"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En la gestión ágil de producto, los releases no deben funcionar únicamente como un historial estático o un empaquetador automático de tareas que ya alcanzaron el estado `ready`. Los equipos necesitan planificar sus entregas con anticipación, proyectando objetivos y monitoreando el avance hacia ellos.
Esta tarea introduce la figura de **Planned Releases** con target editable:
1. Capacidad de crear y configurar un Release en estado de planificación (ej: versión target `0.3.0`, fecha objetivo y resumen de alcance).
2. Vinculación de tareas planificadas a dicho release a través del campo `milestone`.
3. Dashboard visual de seguimiento en `ReleasesView.tsx` mostrando el porcentaje de cumplimiento del target, tareas en progreso y riesgos detectados.
4. Flexibilidad para actualizar y reprogramar el target a medida que el ciclo de desarrollo evoluciona (modificar fecha estimada, ajustar alcance o transferir tareas).
5. Transición fluida a publicación y empaquetado formal cuando se alcance el 100% de los criterios del release.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Extender el modelo de datos `Release` para incluir estado (`planned` vs `released`), fecha target (`targetDate`) y alcance proyectado
- [x] #2 Incorporar formulario / modal para crear y editar Releases Planificados con versión target, fecha límite y descripción
- [x] #3 Mostrar en `ReleasesView.tsx` una sección destacada de 'Releases en Planificación' con medidor de avance hacia el target (% de tareas completadas)
- [x] #4 Permitir actualizar dinámicamente la fecha y atributos del target desde la interfaz gráfica
- [x] #5 Permitir asociar o desvincular tareas del release target directamente desde la vista de releases o desde `ItemModal`
- [x] #6 Persistir los releases en `backlog/releases.json` manteniendo retrocompatibilidad con las herramientas MCP y scripts de auditoría
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. En `src/types.ts`, actualizar tipo `Release` con campos `status: 'planned' | 'released'`, `targetDate?: string`, `scopeNotes?: string`.
2. Actualizar `ReleasesView.tsx` dividiendo la pantalla en dos pestañas o bloques: 'En Planificación' y 'Historial Publicado'.
3. Crear modal o panel de edición de Release Target (`ReleasePlanModal.tsx`).
4. Conectar endpoints de API en `vite.config.ts` para guardar y actualizar `releases.json`.
5. Integrar cálculo dinámico de tareas con `item.milestone === release.version`.
<!-- SECTION:PLAN:END -->
