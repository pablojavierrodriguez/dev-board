# Navegación Eficiente y Mapeo Semántico del Código (CodeGraph & Arquitectura)

La base de código de DevBoard cuenta con archivos extensos y de alta densidad funcional (`vite.config.ts`, `src/App.tsx`, `src/components/SettingsView.tsx`, etc.). Para evitar el consumo excesivo de tokens, sobrecarga de contexto y regresiones colaterales, **todo agente de IA debe seguir estas pautas de navegación y análisis**:

---

## 1. Regla de Oro: Prohibida la Lectura Masiva a Ciegas

> [!CAUTION]
> **Anti-Patrón de Búsqueda:**
> NUNCA leas archivos de más de 500 líneas en bloques completos de 800 líneas con `view_file` para "descubrir" dónde está una funcionalidad o qué hace un helper.

Antes de inspeccionar o modificar código:
1. **Consulta [docs/ARCHITECTURE.md](file:///Users/adrisol/Pablo/code/dev-board/docs/ARCHITECTURE.md)** para identificar en qué capa reside la funcionalidad (Vistas React, Modales, API cliente, Middleware Vite o Persistencia en Markdown).
2. **Utiliza CodeGraph MCP:** Invoca las herramientas semánticas en el servidor `codegraph`:
   - `analyze_references`: Listar todos los consumidores/llamadas a un símbolo (`symbolName`).
   - `find_definitions`: Ubicar el archivo y línea donde se declara el símbolo.
   - `find_type_definitions`: Localizar la interfaz o type definition asociada.
3. **Protocolo de Fallback Inteligente:** Si `codegraph` responde `"Symbol not found in workspace"` (debido a que el Language Server de TypeScript no está activo en memoria al no haber pestañas `.ts` abiertas o por falta de indexación inicial):
   - **NO reintentes en bucle** con variaciones de casing.
   - Ubica el directorio o archivo candidato en la *Tabla de Impacto Rápido* de [docs/ARCHITECTURE.md](file:///Users/adrisol/Pablo/code/dev-board/docs/ARCHITECTURE.md).
   - Ejecuta un `grep_search` focalizado restringiendo `SearchPath` al módulo específico (ej: `/src/components`, `/scripts` o `/src/api.ts`).
   - Realiza lecturas quirúrgicas acotadas con `view_file` especificando `StartLine` y `EndLine` (máximo 60-100 líneas).

---

## 2. Análisis de Impacto Antes de Modificar Código

Antes de alterar la firma de una función, una interfaz en [src/types.ts](file:///Users/adrisol/Pablo/code/dev-board/src/types.ts) o un endpoint en [vite.config.ts](file:///Users/adrisol/Pablo/code/dev-board/vite.config.ts):

1. **Rastrear Consumidores:** Usa `analyze_references` (o `grep_search` focalizado si el LSP está inactivo) para listar todos los archivos y componentes que llaman a dicha función o consumen dicha interfaz.
2. **Revisar Contratos:** Si se altera el formato de `backlog/tasks/*.md` o el frontmatter YAML, verifica [scripts/backlogMdParser.ts](file:///Users/adrisol/Pablo/code/dev-board/scripts/backlogMdParser.ts) y los scripts de sincronización antes de tocar la UI.
3. **Verificación de Tipos Inmediata:** Correr `npx tsc --noEmit` tras el cambio para garantizar cero roturas en llamadas indirectas.

---

## 3. Navegación Humana vs. Agente

- **Para el desarrollador humano:** Utilizar la extensión **Codegraph Studio** para abrir el árbol de llamadas por carpetas/módulos en canvas interactivo dentro del editor.
- **Para agentes de IA:** Utilizar **CodeGraph MCP** y el catálogo de dominios en [docs/ARCHITECTURE.md](file:///Users/adrisol/Pablo/code/dev-board/docs/ARCHITECTURE.md).
