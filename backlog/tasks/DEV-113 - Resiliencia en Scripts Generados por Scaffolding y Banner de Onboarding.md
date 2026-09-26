---
id: DEV-113
title: "Resiliencia en Scripts Generados por Scaffolding y Banner de Onboarding"
status: done
created_date: '2026-09-26'
updated_date: '2026-09-26 00:55'
labels:
  - cli
  - onboarding
  - ux
dependencies: []
priority: high
type: bug
milestone: "0.6.1"
releases:
  - "0.6.1"
release: "0.6.1"
targetRelease: "0.6.1"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Cuando un usuario inicializa un repositorio con `npx github:pablojavierrodriguez/dev-board --init`, el asistente genera scripts `"board": "devboard"` y `"mcp": "devboard-mcp"` en el `package.json` consumidor y finaliza sugiriendo `(o npx devboard)`.

Dado que el paquete se distribuye directamente vía GitHub y aún no está publicado en el registro público de npm (npmjs.com) bajo el nombre `devboard`:
1. `npx devboard` aborta con `npm error could not determine executable to run`.
2. Si el usuario no ejecutó previamente la instalación global `npm install -g github:pablojavierrodriguez/dev-board`, ejecutar `npm run board` en el repo consumidor falla con `sh: devboard: command not found`.
3. Al invocar `devboard` o `npx github:...`, Node.js falla con `Cannot find package 'vite'` porque `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer` y `typescript` estaban clasificados como `devDependencies` en `package.json`, y npm los omite al instalar paquetes vía npx o de forma global para consumidores.

Solución:
1. En `scripts/initScaffold.js`, generar scripts resilientes en el `package.json` consumidor que intenten invocar el binario global/local y, si no existe en PATH, hagan fallback transparente a npx sobre el repo de GitHub:
   `"board": "devboard 2>/dev/null || npx -y github:pablojavierrodriguez/dev-board"`
   `"mcp": "devboard-mcp 2>/dev/null || npx -y -p github:pablojavierrodriguez/dev-board devboard-mcp"`
2. Promover `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer` y `typescript` a `dependencies` en `package.json` de dev-board para que se instalen siempre en el cache de npx o globalmente.
3. Actualizar el banner final de éxito en `scripts/initScaffold.js` para indicar con precisión los comandos funcionales.
4. Actualizar la Agent Skill embebida (`getSkillTemplate`) en `scripts/initScaffold.js` y `.agents/skills/devboard/SKILL.md` para reflejar la configuración MCP canónica con fallback y con binario global.
5. Resolver el problema de pantalla en blanco al ejecutar en repositorios externos: registrar PostCSS y Tailwind CSS con resolución absoluta explícita en `vite.config.ts` y `postcss.config.js` para evitar fallos de pre-transformación de estilos (`Cannot read properties of undefined (reading 'get')`).
6. Añadir `RootErrorBoundary` e inline fallback en `src/main.tsx` e `index.html` para erradicar pantallas en blanco ante excepciones de renderizado.
7. Unificar y homogeneizar todo el flujo de onboarding (asistente CLI, banner, skills y `README.md`) al español coherente, eliminando fragmentos e inconsistencias en inglés.
8. Corregir importación en `src/main.tsx`: sustituir la importación de default inválida `import ReactDOM from 'react-dom/client'` por la importación canónica con nombre `import { createRoot } from 'react-dom/client'` y configurar `optimizeDeps.include` y `resolve.dedupe` en `vite.config.ts`.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 `initScaffold.js` genera scripts "board" y "mcp" en el `package.json` consumidor con fallback automático a `npx -y github:pablojavierrodriguez/dev-board` si `devboard` no está instalado globalmente.
- [x] #2 El banner final de `devboard --init` muestra los comandos exactos de ejecución sin asumir publicación en npmjs.org e instruye la instalación global opcional (`npm install -g ...`).
- [x] #3 La plantilla de Agent Skill (`getSkillTemplate`) en `initScaffold.js` y `.agents/skills/devboard/SKILL.md` documenta la configuración MCP compatible con ejecución directa y vía GitHub.
- [x] #4 Validar mediante suite de integración (`npm test`, `npm run backlog:check`) que el asistente genera la nueva configuración resiliente y los tests pasan al 100%.
- [x] #5 Promover paquetes de servidor Vite (`vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`, `typescript`) a `dependencies` en `package.json` para que npx e instalación global no fallen por dependencias faltantes.
- [x] #6 Configurar PostCSS y Tailwind con rutas absolutas explícitas en `vite.config.ts` y `postcss.config.js`, erradicando el fallo de pre-transformación de estilos y pantalla en blanco al iniciar el servidor desde repositorios externos.
- [x] #7 Unificar el asistente de onboarding, banners y plantillas de skills en español coherente y profesional, y desacoplar la documentación oficial con `README.md` (inglés para la comunidad internacional) y `README.es.md` (español nativo) con selector bilingüe.
- [x] #8 Implementar `RootErrorBoundary` en `src/main.tsx` y fallback inline en `index.html` garantizando tolerancia ante fallos y cero pantallas en blanco.
- [x] #9 Corregir importación canónica de `createRoot` desde `react-dom/client` (`import { createRoot } from 'react-dom/client'`) y configurar `optimizeDeps.include` y `resolve.dedupe` en `vite.config.ts`, erradicando el fallo de sintaxis por falta de export default en ESM.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Mover DEV-113 a 'doing'.
2. Actualizar `scripts/initScaffold.js` con los scripts resilientes y banner clarificado.
3. Actualizar `getSkillTemplate()` y `.agents/skills/devboard/SKILL.md`.
4. Actualizar las expectativas del test de integración en `scripts/verify-integration.js`.
5. Validar con `npm test` y `npm run backlog:check`.
6. Tildar ACs y mover DEV-113 a 'ready'.
<!-- SECTION:PLAN:END -->
