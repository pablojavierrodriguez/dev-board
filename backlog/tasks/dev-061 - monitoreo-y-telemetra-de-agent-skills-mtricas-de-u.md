---
id: DEV-061
title: "Monitoreo y Telemetría de Agent Skills: Métricas de Uso, Frecuencia, Última Invocación y Auditoría"
status: draft
created_date: '2026-09-18'
updated_date: '2026-09-24 17:14'
labels:
  - "telemetry"
  - "skills"
  - "agents"
  - "ai"
dependencies: []
priority: low
type: feature
order: 220
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Módulo de observabilidad, estadísticas y diagnóstico para el ecosistema de Agent Skills (`.agents/skills/`):
1. **Telemetría de Skills:** Monitorear de forma local y no invasiva la interacción de agentes de IA con las skills del proyecto:
   - Cuándo fue la última invocación o lectura de cada `SKILL.md`.
   - Contador acumulado de accesos / usos por proyecto.
   - Duración o pasos asociados si aplica.
2. **Métricas y Diagnóstico de Salud:** Proveer un panel visual dentro de Ajustes o Diagnóstico que permita:
   - Detectar qué skills son las más utilizadas y críticas para el flujo de trabajo.
   - Identificar skills inactivas, desactualizadas o nunca utilizadas para sugerir su depuración, actualización o archivado.
3. **Persistencia Segura:** Registro de telemetría en `.devboard/skills-telemetry.json` (aislado y con actualización silenciosa sin interferir con Git ni ensuciar diffs de código).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Registro no invasivo de accesos a skills (fecha/hora de última invocación y conteo) en .devboard/skills-telemetry.json
- [ ] #2 Panel visual de métricas de Agent Skills en SettingsView o vista de Diagnóstico
- [ ] #3 Tabla con listado de skills, última invocación y frecuencia de uso
- [ ] #4 Sugerencias automáticas de depuración para skills obsoletas o nunca consultadas
- [ ] #5 Integración opcional con comando CLI npm run skills --stats
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Diseñar el esquema de telemetría en `.devboard/skills-telemetry.json`.
2. Instrumentar la lectura de skills en el servidor MCP o watcher de archivos.
3. Crear componente `SkillsTelemetryPanel` en `src/components/`.
4. Añadir pestaña o sección de Skills en `SettingsView.tsx`.
<!-- SECTION:PLAN:END -->
