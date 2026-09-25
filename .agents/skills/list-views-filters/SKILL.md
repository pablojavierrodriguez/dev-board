---
name: list-views-filters
description: Estándares de arquitectura y experiencia de usuario para barras de filtrado, búsquedas, paneles de filtros avanzados en Popover, selectores de vistas (Kanban vs Backlog) y gestión de estados vacíos en DevBoard.
---

# List Views, Board Filters & Unified Navigation Architecture (DevBoard)

## Misión y Filosofía
En un gestor ágil de alta frecuencia como **DevBoard**, la velocidad con la que el usuario filtra, localiza y visualiza tareas determina directamente la productividad de todo el equipo. Esta skill define los patrones unificados de arquitectura y experiencia de usuario para barras de herramientas (`FilterBar`), popovers de filtros, vistas de lista/tabla y manejo de estados vacíos.

---

## 🧭 Estándares de Filtrado y Búsqueda

### 1. Barra de Filtros Unificada (`FilterBar`)
Todas las vistas del cockpit que muestren tareas deben mantener consistencia en su barra de herramientas:
- **Input de Búsqueda Integrado:** Búsqueda en vivo por texto en título, código (`DEV-001`), descripción o etiquetas.
- **Contador de Filtros Activos:** Si hay filtros aplicados (distintos a "Todos"), el botón o popover de filtros debe mostrar un badge circular con el conteo (`activeFiltersCount > 0`).
- **Botón de Reset Rápido:** Si hay cualquier filtro o búsqueda activa, mostrar un botón accesible de *"Limpiar filtros"* con icono `X` que restablezca el tablero en un solo click.

```tsx
// Cálculo estándar de filtros activos
const activeFiltersCount = (
  (priorityFilter !== "all" ? 1 : 0) +
  (milestoneFilter !== "all" ? 1 : 0) +
  (typeFilter !== "all" ? 1 : 0) +
  (tagFilter !== "all" ? 1 : 0) +
  (search.trim().length > 0 ? 1 : 0)
);
```

### 2. Contenedores Flex y Prevención de Desborde (`min-w-0`)
- **Regla Estricta:** En cualquier layout horizontal que combine barra lateral/tabs con un carril principal (como las vistas de Kanban, Papelera o Sprint), el contenedor de contenido debe declarar `flex-1 min-w-0`.
- **Por qué:** Sin `min-w-0`, los navegadores calculan el ancho intrínseco de las tablas o columnas interiores y fuerzan desbordes laterales o barras de scroll indeseadas en la ventana global.

### 3. Vistas Duales: Tablero Kanban vs Lista / Backlog
- **Tablero Kanban:** Optimizado para flujo de trabajo activo (`doing`, `review`, `ready`). Columnas con conteos de tareas y límites WIP claros.
- **Vista de Lista / Tabla (Backlog & Papelera):** Para auditoría y triage masivo. Cada fila debe utilizar `truncate min-w-0` en el título para garantizar una cuadrícula uniforme sin saltos de línea forzados.

### 4. Diferenciación Rigurosa de Estados Vacíos (`EmptyState`)
Nunca mostrar una vista en blanco genérica. Siempre distinguir entre dos escenarios:
1. **Proyecto o Tablero sin Tareas Creadas:**
   - Mensaje de bienvenida orientado a la acción: *"Aún no tienes tareas en este proyecto."*
   - Botón primario de creación: `[ + Nueva Tarea ]`.
2. **Filtro o Búsqueda sin Coincidencias:**
   - Mensaje explicativo: *"No se encontraron tareas que coincidan con los filtros aplicados."*
   - Botón secundario para limpiar: `[ Limpiar Filtros ]`.

---

## 📋 Checklist de Toolbar & Filtros
1. [ ] ¿La búsqueda funciona sin bloquear el hilo principal ni reiniciar el scroll?
2. [ ] ¿El badge de filtros activos refleja la suma real de filtros aplicados?
3. [ ] ¿Existe botón visible para restablecer todos los filtros en un click?
4. [ ] ¿El contenedor principal tiene `min-w-0` para prevenir desbordes laterales?
