---
id: DEV-060
title: "Internacionalización Total (i18n): Cobertura 100% en Inglés y Español sin Textos Hardcodeados y Selector en Settings"
status: draft
created_date: '2026-09-18'
updated_date: '2026-09-24 19:05'
labels:
  - "i18n"
  - "localization"
  - "settings"
dependencies: []
priority: high
type: feature
order: 210
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Infraestructura completa de internacionalización (i18n) para soportar navegación fluida en Español e Inglés con cobertura total de la interfaz:
1. **Cero Textos Hardcodeados:** Extracción sistemática de todos los textos presentes en componentes, cabeceras, botones, badges, modales, tooltips, toasts de feedback, empty states y páginas de ajustes hacia archivos de localización estructurados (`locales/es.json` y `locales/en.json`).
2. **Selector de Idioma en Settings:** Incorporar en `SettingsView` (pestaña General) un selector interactivo para alternar entre Español e Inglés, con persistencia instantánea en la configuración del proyecto (`config.locale`).
3. **Detección Automática:** Detección inicial inteligente basada en las preferencias de idioma del navegador (`navigator.language`), con fallback seguro a Español o Inglés.
4. **Tipado Estricto de Claves:** Provisión de un hook o helper reactivo `useTranslation()` con autocompletado y validación TypeScript de claves de traducción para prevenir claves inexistentes en tiempo de compilación.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [ ] #1 Diccionarios de traducción completos para Español (es) e Inglés (en) cubriendo el 100% de los textos en pantalla
- [ ] #2 Hook o contexto useTranslation() fuertemente tipado con cambio de idioma reactivo sin recarga de página
- [ ] #3 Selector interactivo de idioma en SettingsView con persistencia en .devboard/config.json
- [ ] #4 Detección automática inicial del idioma del navegador
- [ ] #5 Auditoría estricta de código para validar ausencia de strings de texto visibles hardcodeadas
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Diseñar el sistema de i18n ligero y modular (o biblioteca estándar `i18next` / hook propio reactivo).
2. Crear catálogos `src/locales/es.json` y `src/locales/en.json`.
3. Reemplazar sistemáticamente los textos fijos en componentes por llamadas a `t('clave')`.
4. Añadir selector de idioma en `SettingsView.tsx` y sincronizar con `DevBoardConfig`.
<!-- SECTION:PLAN:END -->
