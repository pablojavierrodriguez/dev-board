---
name: worldclass-product-designer
description: Diseña interfaces y micro-interacciones de calibre mundial para DevBoard. Especializado en estética moderna para herramientas de desarrollo (estilo Linear, Notion, GitHub Projects), micro-animaciones fluidas, tokens semánticos, diseño de información densa y ergonomía para power-users.
---

# World-Class Product Designer Skill — DevBoard

## Misión
Hacer que **DevBoard** se sienta tan pulida, reactiva, sobria y adictiva de usar como **Linear**, **Raycast** o **Cron**. Cero interfaces toscas o genéricas; cada botón, tarjeta Kanban, modal y transición debe transmitir artesanía de software, agilidad y deleite estético.

---

## 🎨 Directrices Fundamentales de Diseño

### 1. Estética Soberana para Desarrolladores (Linear-Grade)
- **Modo Oscuro de Alta Gama:** Fondos oscuros profundos y neutros (zinc/slate refinado), evitando negros puros `#000000` o grises deslavados.
- **Bordes y Superficies:** Líneas finas con opacidades sutiles (`border-border/60`, `border-white/10`), acompañadas de desenfoques de fondo (`backdrop-blur-md`).
- **Estados Semánticos Consistentes:**
  - `draft`: Gris neutro / slate (baja intensidad).
  - `doing`: Azul / índigo eléctrico (foco activo).
  - `review`: Ámbar cálido (espera de verificación).
  - `ready`: Esmeralda / cyan (listo para release).
  - `done`: Verde apagado o zinc sutil (completado sin distraer).

### 2. Jerarquía Visual y Densidad de Información
- **Escaneo Rápido de Tarjetas (`ItemCard`):** El título debe destacar con tipografía nítida (`font-semibold text-sm`), mientras que los metadatos (prioridad, milestone, conteo de AC `3/5`, tags) se organizan en una fila secundaria limpia sin competir visualmente.
- **Números Tabulares:** Todo indicador numérico o conteo de criterios debe usar `tabular-nums font-mono` para evitar desplazamientos de ancho al cambiar de valor.
- **Empty States Significativos:** Jamás mostrar un tablero vacío sin orientación. Diferenciar entre *"No hay tareas creadas todavía"* (con botón primario de acción) y *"No hay tareas que coincidan con los filtros aplicados"* (con botón de limpiar filtros).

### 3. Micro-interacciones y Feedback Táctil
- **Respuesta Inmediata al Click:** Todo elemento interactivo (cards, botones de acción, tabs, checkboxes) debe responder con `active:scale-[0.98]` y transiciones de fondo suaves (`transition-all duration-150`).
- **Secciones Colapsables Fluidas:** En editores densos como `ItemModal`, los bloques de metadatos o criterios colapsables deben desplegarse con rotación suave del caret (`transition-transform duration-200`) y estados legibles.
- **Focus Rings Impecables:** Garantizar anillos de foco accesibles pero discretos (`focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none`).

### 4. Experiencia de Teclado (Power Users)
- Atajos de teclado naturales (`Escape` para cerrar cualquier modal o deseleccionar, `Enter` para crear o confirmar, `/` o `Cmd+K` para buscar).
- Los atajos se acompañan de chips sutiles `<kbd className="text-[10px] font-mono bg-muted/50 px-1.5 py-0.5 rounded border border-border/60 hidden sm:inline-flex">`.

---

## 📋 Entregables de Diseño
Al proponer cambios visuales o maquetar componentes nuevos:
1. Definir los 5 estados de cada elemento: **normal, hover, active, focus-visible y disabled**.
2. Verificar que los textos largos apliquen `truncate min-w-0` sin romper la cuadrícula.
3. Asegurar contraste accesible según WCAG AA.
