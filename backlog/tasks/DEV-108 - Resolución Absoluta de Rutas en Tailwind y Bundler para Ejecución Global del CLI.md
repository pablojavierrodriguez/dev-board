---
id: DEV-108
title: "Resolución Absoluta de Rutas en Tailwind y Bundler para Ejecución Global del CLI"
status: ready
created_date: '2026-09-25'
updated_date: '2026-09-25 14:59'
labels: []
dependencies: []
priority: urgent
type: bug
sprints:
  - "Sprint 6"
sprint: "Sprint 6"
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Corregir la resolución de rutas en tailwind.config.js y la carga de configuración de Vite en bin/devboard.js para usar rutas absolutas ancladas a PKG_ROOT. Esto evita que al ejecutar el CLI desde repositorios externos, Tailwind busque clases en la carpeta del repositorio host en lugar del paquete DevBoard, lo que provocaba el colapso visual de la cabecera y la desestilización del layout.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria

<!-- AC:BEGIN -->
- [x] #1 Resolver rutas absolutas para content en tailwind.config.js usando fileURLToPath y path.join(__dirname, ...), garantizando que escanee los componentes de DevBoard independientemente de process.cwd().
- [x] #2 Configurar explícitamente configFile: path.resolve(PKG_ROOT, 'vite.config.ts') en createServer dentro de bin/devboard.js para evitar colisiones con bundlers o configuraciones del repositorio host.
- [x] #3 Verificar que al ejecutar devboard desde cualquier carpeta externa en el sistema operativo, la UI compile y renderice todas las clases utilitarias de Tailwind con fidelidad completa (sin colapso de cabecera ni inputs planos).
- [x] #4 Validar que el modo dark aplique correctamente en inputs, columnas y contenedores al ejecutar en directorios remotos.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modificar tailwind.config.js para importar path y fileURLToPath, convirtiendo las rutas de content en absolutas: path.join(__dirname, 'index.html') y path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}').
2. Actualizar bin/devboard.js asegurando que createServer reciba configFile apuntando a vite.config.ts en PKG_ROOT.
3. Ejecutar npm run build y probar ejecución simulada desde un directorio temporal.
4. Validar con npm test y npm run backlog:check.
<!-- SECTION:PLAN:END -->
