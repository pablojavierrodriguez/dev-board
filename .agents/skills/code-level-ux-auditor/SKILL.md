---
name: code-level-ux-auditor
description: Audita estáticamente el código fuente (React, TypeScript, CSS) en busca de anti-patrones de UX, colisiones de gestos y scroll, touch targets deficientes, micro-janks de renderizado e inconsistencias de layout sin requerir ejecución en vivo.
---

# Code-Level UX & Ergonomics Auditor (DevBoard)

## Misión y Filosofía
La calidad de experiencia de usuario (UX) no es una capa superficial de pintura: **se programa en el código**. La inmensa mayoría de defectos que frustran a los desarrolladores en un gestor ágil o Kanban (saltos bruscos de scroll horizontal, drag trabado, clicks fantasma, inputs que se desbordan o botones de icono inaccesibles) poseen **firmas estáticas inequívocas en el código fuente**.

Esta skill proporciona las reglas de inspección, heurísticas y herramientas de análisis estático para detectar, mitigar y prevenir estos defectos leyendo directamente los archivos `.tsx` y `.ts`.

---

## 🎯 Las 10 Firmas Estáticas de Anti-Patrones de UX en DevBoard

### 1. [UX-001] Colisión de Scroll Horizontal y Gestos en Tableros/Pestañas
- **Firma en código:** Contenedores con `overflow-x-auto` o flex horizontal sin `min-w-0`, o selectores de pestañas con scroll dinámico sin control de ancho.
- **Impacto en Runtime:** El navegador calcula mal el ancho disponible, provocando que la barra de scroll aparezca y desaparezca o que la página entera sufra desplazamientos laterales indeseados (como en el bug histórico `DEV-010`).
- **Regla de corrección:**
  - Todo contenedor hijo en layouts flex horizontales debe portar `min-w-0` (`flex-1 min-w-0`).
  - Emplear `overflow-x-hidden` en el wrapper de vista y restringir el scroll horizontal exclusivamente al carril Kanban interior.

### 2. [UX-002] Touch Target Diminuto (< 44×44px) en Botones de Acción
- **Firma en código:** `<button>` con `h-6`, `h-7`, `h-8`, `w-6`, `w-7` o `w-8` sin padding compensatorio ni hit-slop.
- **Impacto en Runtime:** Frustración severa al intentar hacer click o tap en botones de cierre, añadir criterio, editar o cambiar estado en pantallas táctiles o laptops con trackpad sensible.
- **Regla de corrección:** Garantizar siempre un área efectiva mínima de 44×44px mediante `p-2`, `min-h-[44px] min-w-[44px]` o hit-slop transparente:
  ```tsx
  <button className="h-8 w-8 relative flex items-center justify-center after:absolute after:-inset-2 after:content-['']">
  ```

### 3. [UX-003] Botones con Icono sin Accesibilidad (`aria-label` o `title`)
- **Firma en código:** `<button>` que envuelve únicamente un `<LucideIcon>` (ej. `Trash2`, `Plus`, `X`, `ChevronDown`, `Maximize2`) sin `aria-label` ni `title`.
- **Impacto en Runtime:** Los lectores de pantalla anuncian "botón" sin contexto; los usuarios de teclado y mouse pierden el tooltip nativo que explica la acción.
- **Regla de corrección:** Todo botón iconográfico DEBE incluir `aria-label="Cerrar modal"` y preferentemente `title="Cerrar (Esc)"`.

### 4. [UX-004] Elemento Clickeable sin Feedback Táctil/Visual (`active:scale`)
- **Firma en código:** `cursor-pointer` y `onClick` en tarjetas, chips o filas sin `active:scale-[0.98]` ni transiciones de fondo.
- **Impacto en Runtime:** La aplicación se siente estática, lenta o "dura". El usuario duda si su click fue registrado, generando dobles clicks accidentales.
- **Regla de corrección:** Agregar siempre `transition-all active:scale-[0.98]` y estados claros de `:hover` y `:focus-visible`.

### 5. [UX-005] Contaminación de Atajos Físicos en Vistas Móviles/Pequeñas
- **Firma en código:** Renderizar `<kbd>`, símbolos `⌘`, `Ctrl+` o leyendas de atajos de teclado sin clases condicionales `hidden sm:inline-flex`.
- **Impacto en Runtime:** En viewports pequeños (<640px) satura el espacio horizontal y confunde a usuarios táctiles.
- **Regla de corrección:** Envolver atajos físicos en `hidden sm:inline-flex` o validar el viewport.

### 6. [UX-006] Desborde Horizontal por Falta de `truncate` / `min-w-0`
- **Firma en código:** `flex items-center justify-between` en cabeceras de tarjetas (`ItemCard`), filas de backlog o modales con títulos largos que no usan `truncate min-w-0`.
- **Impacto en Runtime:** Títulos largos de tareas empujan botones, badges o tags fuera del ancho de la columna Kanban, descuadrando el tablero.
- **Regla de corrección:**
  ```tsx
  <div className="flex items-center justify-between gap-2 min-w-0">
    <h4 className="font-semibold text-sm truncate min-w-0">{task.title}</h4>
    <Badge className="shrink-0">...</Badge>
  </div>
  ```

### 7. [UX-007] Modales sin Escape Trap ni Cierre Intuitivo
- **Firma en código:** Modales o diálogos (`ItemModal`, `ProjectModal`) que capturan teclado sin escuchar `e.key === "Escape"` o que no gestionan el foco al abrirse.
- **Impacto en Runtime:** El desarrollador presiona Escape por reflejo y queda atrapado en el modal, o el scroll del body de fondo se sigue moviendo.
- **Regla de corrección:** Escuchar tecla Escape globalmente, bloquear scroll del body (`overflow-hidden`) mientras el modal esté abierto y restaurarlo al desmontar.

### 8. [UX-008] Clases Arbitrarias fuera de la Escala Tipográfica de Tailwind
- **Firma en código:** `text-[11px]`, `text-[13px]`, `p-[7px]` en componentes nuevos sin justificación semántica.
- **Impacto en Runtime:** Inconsistencia visual, degradación del sistema de diseño y fragmentación tipográfica.
- **Regla de corrección:** Utilizar la escala canónica: `text-xs` (12px), `text-sm` (14px), `text-base` (16px), `text-lg` (18px), reservando tamaños micro solo para detalles secundarios explícitos.

### 9. [UX-009] Truncate Indebido en Texto Explicativo Multilínea
- **Firma en código:** Clases `truncate` o `overflow-hidden text-ellipsis whitespace-nowrap` en cajas de texto de descripción, modales de confirmación o mensajes de advertencia.
- **Impacto en Runtime:** El texto explicativo se corta con puntos suspensivos (`…`), ocultando información crítica para la decisión del usuario (ej: consecuencias de liberar a producción).
- **Regla de corrección:** En contenedores de detalle, advertencias o mensajes explicativos, utilizar `break-words text-[11px] leading-relaxed` y NUNCA `truncate`.

### 10. [UX-010] Layout Shift Horizontal por Barra de Scroll entre Vistas
- **Firma en código:** Ausencia de `scrollbar-gutter: stable` o de `overflow-y: scroll` en la raíz `html` / `body`.
- **Impacto en Runtime:** Al navegar entre una vista con mucho scroll vertical (Kanban) y una vista corta (Papelera), el encabezado y el contenido central saltan lateralmente ~15px por la desaparición de la barra de desplazamiento.
- **Regla de corrección:** Declarar `html { overflow-y: scroll; scrollbar-gutter: stable; }` en `index.css`.

---

## 🛠️ Herramientas de Auditoría Automatizada

Para ejecutar la verificación estática automatizada en DevBoard:

```bash
npm run audit:ux
```
O directamente:
```bash
node scripts/audit-ux-code.cjs
```

Este script inspecciona todo `src/` y genera un diagnóstico instantáneo clasificando los hallazgos en:
- ❌ **ERROR:** Defectos críticos que rompen navegación o desbordan la pantalla.
- ⚠️ **WARNING:** Anti-patrones que degradan la ergonomía o accesibilidad.
- ℹ️ **INFO:** Sugerencias de higiene visual y micro-interacción.

---

## 📋 Checklist de Aceptación Pre-Commit

Antes de cerrar una tarea de UI en DevBoard, verificar:
1. [ ] ¿Los botones de icono tienen `aria-label` descriptivo?
2. [ ] ¿Los elementos interactivos cuentan con `active:scale-[0.98]`?
3. [ ] ¿Los contenedores flex horizontales incluyen `min-w-0` y `truncate` donde corresponde?
4. [ ] ¿Los modales cierran limpiamente con la tecla Escape?
5. [ ] ¿El script `npm run audit:ux` corre sin advertencias críticas?
