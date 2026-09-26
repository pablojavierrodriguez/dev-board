---
id: DEV-114
title: "Internacionalización Integral (i18n): Selector de Idioma en CLI (--init), Diccionarios Cockpit UI y Templates Bilingües"
status: draft
created_date: '2026-09-26'
updated_date: '2026-09-26'
labels:
  - i18n
  - cli
  - ui
  - ux
dependencies: []
priority: high
type: feature
sprint: "Sprint 7"
targetSprint: "Sprint 7"
sprints:
  - "Sprint 7"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementar soporte formal y arquitectónico de internacionalización (i18n) en todo el ecosistema de DevBoard:

1. **Selector de Idioma en Onboarding CLI (`devboard --init`):**
   - Preguntar al usuario en el paso 1 si desea configurar su repositorio en Español (es) o Inglés (en).
   - Generar la configuración de idioma en `.devboard/config.json` o `package.json` (`"language": "es" | "en"`).
   - Desplegar las plantillas de gobernanza (`AGENTS.md`) y Agent Skills (`.agents/skills/devboard/SKILL.md`) en el idioma seleccionado por el usuario.

2. **Capa de Internacionalización en Cockpit UI (Frontend):**
   - Diseñar sistema liviano y sin dependencias pesadas de i18n (o usando un micro-store tipado en TypeScript con diccionarios `src/locales/en.json` y `src/locales/es.json`).
   - Selector visual de idioma (🌐 EN / ES) en la barra superior o configuración del cockpit.
   - Persistencia de la preferencia en `localStorage` con detección automática inicial del idioma del navegador (`navigator.language`).
   - Tipado estricto de claves de traducción para evitar cadenas hardcodeadas o claves faltantes en tiempo de compilación (`t('header.sprint')`, `t('modal.confirm')`, etc.).

3. **Templates Bilingües y Documentación:**
   - Mantener simetría estricta entre la documentación en inglés (`README.md`) y español (`README.es.md`).
   - Soportar generación de Backlog y Releases en el idioma configurado para el proyecto.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Asistente `devboard --init` solicita la selección de idioma (`[1] Español (es) / [2] English (en)`) y persiste la elección en la configuración local del proyecto.
- [ ] #2 `scripts/initScaffold.js` genera los templates de `AGENTS.md` y `.agents/skills/devboard/SKILL.md` en el idioma seleccionado (ES o EN).
- [ ] #3 Diseñar arquitectura de diccionarios tipados `src/locales/{en,es}.json` y hook `useTranslation()` / `t(key)`.
- [ ] #4 Implementar selector de idioma en la barra de navegación del Cockpit con persistencia en `localStorage` y detección de `navigator.language`.
- [ ] #5 Migrar las vistas principales (`KanbanBoard`, `SprintView`, `ItemModal`, `BacklogTable`, `ConfirmModal`) al sistema de traducción, erradicando textos hardcodeados.
- [ ] #6 Validar tipado TypeScript estricto de las claves de traducción (`npx tsc --noEmit` sin errores) y suite de tests unitarios/integración.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Diseñar el esquema de diccionarios y tipos de claves en `src/locales/`.
2. Crear hook `useI18n` y proveedor de contexto liviano en React.
3. Incorporar selector de idioma en el Header del Cockpit.
4. Extender `scripts/initScaffold.js` con el prompt de idioma y templates bilingües.
5. Ejecutar auditoría de textos hardcodeados y migración progresiva.
6. Validar con suite de tests y `npm run backlog:check`.
<!-- SECTION:PLAN:END -->
