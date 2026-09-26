---
id: DEV-112
title: "Resiliencia en Script Prepare de Package.json para npx e Instalación Directa"
status: done
created_date: '2026-09-25'
updated_date: '2026-09-26 00:29'
labels:
  - packaging
  - cli
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
Al intentar ejecutar o instalar DevBoard directamente desde GitHub según la guía de inicio rápido (Profile 1: `npx github:pablojavierrodriguez/dev-board --init` o `npm install -g github:pablojavierrodriguez/dev-board`), la ejecución aborta inmediatamente con Exit Code 128.

Causa raíz:
En package.json el script de ciclo de vida `"prepare": "git config core.hooksPath .githooks"` se ejecuta automáticamente cuando npm extrae el paquete desde un repositorio Git en una carpeta temporal de cache. Al no existir un árbol de trabajo .git válido en ese entorno temporal, git config arroja error fatal (exit code 128: fatal: not in a git directory) y npm aborta la instalación por completo.

Solución:
Hacer condicional y resiliente el script prepare para que valide la existencia de un worktree git antes de invocar git config o ignore de forma segura el fallo si no se encuentra en la raíz de un repo git:
`git rev-parse --is-inside-work-tree >/dev/null 2>&1 && git config core.hooksPath .githooks 2>/dev/null || true`
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 El script prepare en package.json valida la presencia de un worktree Git antes de ejecutar git config o implementa fallback seguro con `|| true` para no romper entornos temporales de npm.
- [x] #2 Probar que la ejecución de `npx github:pablojavierrodriguez/dev-board --help` o `--init` funciona sin arrojar Exit Code 128.
- [x] #3 Probar que la instalación global `npm install -g github:pablojavierrodriguez/dev-board` completa exitosamente sin abortos de ciclo de vida.
<!-- AC:END -->
