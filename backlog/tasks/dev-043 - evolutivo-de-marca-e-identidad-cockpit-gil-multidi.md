---
id: DEV-043
title: "Evolutivo de Marca e Identidad: Cockpit Ágil Multidisciplinario (Naming Simple y Disponibilidad)"
status: Draft
created_date: '2026-09-18'
updated_date: '2026-09-19 04:25'
labels:
  - branding
  - identity
  - dx
dependencies: []
priority: medium
type: feature
milestone: "0.5.0"
release: "0.5.0"
targetRelease: "0.5.0"
order: 200
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Evolucionar la identidad y el nombre del proyecto y de la aplicación hacia una plataforma integral de gestión ágil para equipos multidisciplinarios (producto, diseño, arquitectura, Scrum Masters y desarrolladores) y agentes de IA:
1. Trascender la denominación "dev-board" hacia un nombre simple, distintivo, con personalidad y agradable al oído, lejos de clichés corporativos o compuestos que terminen en "Board" o "App".
2. Validar disponibilidad en npm/npx y repositorios públicos (GitHub) para asegurar un namespace limpio y ejecutable sin fricción.
3. Planificar una estrategia de migración no destructiva con soporte de binarios duales/alias en `package.json` para garantizar que `npx devboard` siga funcionando mientras se adopta el nuevo comando.
4. Actualizar identidad visual mínima (isotipo, favicon, splash y playbooks de colaboración).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Realizar relevamiento y matriz de disponibilidad pública en npm/npx y GitHub de nombres candidatos con personalidad
- [ ] #2 Definir el nombre definitivo del producto y aplicación alineado con la visión de cockpit ágil para todo el equipo
- [ ] #3 Configurar soporte de alias/binarios duales en package.json (retrocompatibilidad con npx devboard y adopción del nuevo comando)
- [ ] #4 Actualizar referencias de marca en documentación técnica (README.md, AGENTS.md, docs/)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Iterar y filtrar candidatos de nombre que cumplan con los criterios de simplicidad fonética, personalidad y disponibilidad en npm/GitHub.
2. Registrar y reservar paquete o scope en el registro de npm.
3. Configurar binarios duales en `package.json` (`bin: { "nuevo-nombre": "./bin/...", "devboard": "./bin/..." }`).
4. Actualizar textos de UI y branding general.
<!-- SECTION:PLAN:END -->
