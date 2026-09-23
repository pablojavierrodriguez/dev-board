import React, { useRef, useEffect } from 'react';
import { X, RotateCcw, Check, SlidersHorizontal } from 'lucide-react';
import type { FilterState, ItemType, Priority, ItemStatus, CustomItemTypeConfig } from '../types';

interface AdvancedFiltersPopoverProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  availableModules: string[];
  availableSprints?: string[];
  availableReleases?: string[];
  isOpen: boolean;
  onClose: () => void;
  activeFiltersCount: number;
  onResetFilters: () => void;
  customItemTypes?: CustomItemTypeConfig[];
}

const BASE_TYPE_OPTIONS: { id: ItemType; label: string; icon: string }[] = [
  { id: 'feature', label: 'Feature', icon: '🚀' },
  { id: 'bug', label: 'Bug', icon: '🐛' },
  { id: 'tech_debt', label: 'Tech Debt', icon: '🛠️' },
  { id: 'ux', label: 'UX', icon: '🎨' },
  { id: 'epic', label: 'Epic', icon: '📚' },
  { id: 'initiative', label: 'Initiative', icon: '⚡' },
];

const PRIORITY_OPTIONS: { id: Priority; label: string; dot: string }[] = [
  { id: 'p0', label: 'P0 - Crítica', dot: 'bg-rose-500' },
  { id: 'p1', label: 'P1 - Alta', dot: 'bg-amber-500' },
  { id: 'p2', label: 'P2 - Media', dot: 'bg-yellow-400' },
  { id: 'p3', label: 'P3 - Baja', dot: 'bg-slate-400' },
];

const STATUS_GROUPS: { id: ItemStatus; label: string; dot: string; icon: string }[] = [
  { id: 'ideas', label: 'Ideas (Discovery)', dot: 'bg-pink-500', icon: '💡' },
  { id: 'draft', label: 'Draft (Borrador)', dot: 'bg-indigo-500', icon: '📋' },
  { id: 'doing', label: 'Doing / Progreso', dot: 'bg-amber-500', icon: '⚡' },
  { id: 'review', label: 'Review / QA', dot: 'bg-purple-500', icon: '🔍' },
  { id: 'ready', label: 'Ready / Release', dot: 'bg-teal-500', icon: '🚀' },
  { id: 'done', label: 'Done (Completado)', dot: 'bg-emerald-500', icon: '✅' },
  { id: 'dismissed', label: 'Descartadas / Canceladas', dot: 'bg-rose-500', icon: '🚫' },
];

export const AdvancedFiltersPopover: React.FC<AdvancedFiltersPopoverProps> = ({
  filters,
  onChangeFilters,
  availableModules,
  availableSprints = [],
  availableReleases = [],
  isOpen,
  onClose,
  activeFiltersCount,
  onResetFilters,
  customItemTypes = [],
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  const typeOptions = [
    ...BASE_TYPE_OPTIONS,
    ...customItemTypes.map((c) => ({
      id: c.key as ItemType,
      label: c.label,
      icon: '🏷️'
    }))
  ];

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Type toggle
  const toggleType = (t: ItemType) => {
    const currentTypes = filters.types && filters.types.length > 0
      ? [...filters.types]
      : filters.type !== 'all' ? [filters.type] : [];
    const index = currentTypes.indexOf(t);
    if (index >= 0) {
      currentTypes.splice(index, 1);
    } else {
      currentTypes.push(t);
    }
    onChangeFilters({
      ...filters,
      types: currentTypes,
      type: currentTypes.length === 1 ? currentTypes[0] : 'all',
    });
  };

  // Priority toggle
  const togglePriority = (p: Priority) => {
    const currentPriorities = filters.priorities && filters.priorities.length > 0
      ? [...filters.priorities]
      : filters.priority !== 'all' ? [filters.priority] : [];
    const index = currentPriorities.indexOf(p);
    if (index >= 0) {
      currentPriorities.splice(index, 1);
    } else {
      currentPriorities.push(p);
    }
    onChangeFilters({
      ...filters,
      priorities: currentPriorities,
      priority: currentPriorities.length === 1 ? currentPriorities[0] : 'all',
    });
  };

  // Status toggle
  const toggleStatus = (st: ItemStatus) => {
    const currentStatuses: ItemStatus[] = filters.statuses && filters.statuses.length > 0
      ? [...filters.statuses]
      : ['draft', 'doing', 'review', 'ready', 'done'] as ItemStatus[];
    const index = currentStatuses.indexOf(st);
    if (index >= 0) {
      currentStatuses.splice(index, 1);
    } else {
      currentStatuses.push(st);
    }

    const hasIdeas = currentStatuses.includes('ideas');
    const hasDismissed = currentStatuses.includes('dismissed') || currentStatuses.includes('cancelled');

    onChangeFilters({
      ...filters,
      statuses: currentStatuses,
      includeIdeas: hasIdeas,
      includeDismissedCancelled: hasDismissed,
    });
  };

  const selectedTypes = new Set(
    filters.types && filters.types.length > 0
      ? filters.types
      : filters.type !== 'all' ? [filters.type] : []
  );

  const selectedPriorities = new Set(
    filters.priorities && filters.priorities.length > 0
      ? filters.priorities
      : filters.priority !== 'all' ? [filters.priority] : []
  );

  const selectedStatuses = new Set<ItemStatus>(
    filters.statuses && filters.statuses.length > 0
      ? filters.statuses
      : (['draft', 'doing', 'review', 'ready', 'done'] as ItemStatus[])
  );
  if (filters.includeIdeas) selectedStatuses.add('ideas');
  if (filters.includeDismissedCancelled) {
    selectedStatuses.add('dismissed');
  }

  return (
    <div
      ref={popoverRef}
      className="absolute left-0 top-full mt-2 w-[calc(100vw-32px)] sm:w-[420px] max-h-[85vh] overflow-y-auto rounded-2xl filters-popover z-50 p-4 space-y-4 text-xs animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Filtros del Tablero
          </span>
          {activeFiltersCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              {activeFiltersCount} activo{activeFiltersCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Restablecer todos los filtros"
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section 1: Inclusión & Exclusión de Estados (Filtro General de Estados) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Filtro de Estados
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {selectedStatuses.size} seleccionados
          </span>
        </div>

        {/* Active statuses pills */}
        <div className="grid grid-cols-2 gap-1.5 pt-0.5">
          {STATUS_GROUPS.map((st, idx) => {
            const isSelected = selectedStatuses.has(st.id);
            const isLastOdd = idx === STATUS_GROUPS.length - 1 && STATUS_GROUPS.length % 2 !== 0;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => toggleStatus(st.id)}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                  isLastOdd ? 'col-span-2' : ''
                } ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'bg-white dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.08] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs">{st.icon}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                  <span className="truncate">{st.label}</span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Tipo de Ítem (Multiselect) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Tipo de Ítem
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {typeOptions.map((t) => {
            const isSelected = selectedTypes.has(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleType(t.id)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </span>
                {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 3: Prioridad (Multiselect) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Prioridad
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {PRIORITY_OPTIONS.map((p) => {
            const isSelected = selectedPriorities.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePriority(p.id)}
                className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                  <span>{p.label}</span>
                </span>
                {isSelected && <Check className="w-3 h-3 text-indigo-600 dark:text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 4: Sprint & Release */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
        {/* Sprint */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Sprint
          </label>
          <select
            value={filters.sprint || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, sprint: e.target.value })}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">Todos los Sprints</option>
            {availableSprints.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option value="backlog">Sin Sprint</option>
          </select>
        </div>

        {/* Release */}
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Release Target
          </label>
          <select
            value={filters.release || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, release: e.target.value })}
            className="w-full px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">Todas las Releases</option>
            {availableReleases.map((r) => (
              <option key={r} value={r}>
                v{r}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Section 5: Módulo / Área */}
      {availableModules.length > 0 && (
        <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-white/[0.06]">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Módulo / Área
          </label>
          <select
            value={filters.module || 'all'}
            onChange={(e) => onChangeFilters({ ...filters, module: e.target.value })}
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">Todas las áreas</option>
            {availableModules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
