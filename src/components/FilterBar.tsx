import { useState, useRef, useEffect, type FC } from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { FilterState, ItemType, Priority, CustomItemTypeConfig } from '../types';
import { AdvancedFiltersPopover } from './AdvancedFiltersPopover';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  availableModules: string[];
  availableSprints?: string[];
  availableReleases?: string[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
  customItemTypes?: CustomItemTypeConfig[];
}

export const FilterBar: FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  availableModules,
  availableSprints = [],
  availableReleases = [],
  stats,
  customItemTypes = [],
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync if parent clears or changes search externally
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounced search update to prevent keyboard typing lag
  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChangeFilters({ ...filters, search: localSearch });
      }
    }, 150);
    return () => clearTimeout(handler);
  }, [localSearch, filters, onChangeFilters]);

  // Keyboard shortcut Cmd+K or Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute active filters count
  const defaultStatuses = ['draft', 'doing', 'review', 'ready', 'done'];
  const hasCustomStatuses = filters.statuses && (
    filters.statuses.length !== defaultStatuses.length ||
    !defaultStatuses.every((st) => filters.statuses?.includes(st as any))
  );

  const activeFiltersCount =
    (filters.search ? 1 : 0) +
    (filters.types && filters.types.length > 0 ? filters.types.length : filters.type !== 'all' ? 1 : 0) +
    (filters.priorities && filters.priorities.length > 0 ? filters.priorities.length : filters.priority !== 'all' ? 1 : 0) +
    (hasCustomStatuses ? 1 : 0) +
    (filters.sprint && filters.sprint !== 'all' ? 1 : 0) +
    (filters.release && filters.release !== 'all' ? 1 : 0) +
    (filters.module && filters.module !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setLocalSearch('');
    onChangeFilters({
      search: '',
      type: 'all',
      types: [],
      priority: 'all',
      priorities: [],
      statuses: ['draft', 'doing', 'review', 'ready', 'done'],
      includeIdeas: false,
      includePreviousDone: false,
      includeDismissedCancelled: false,
      module: 'all',
      modules: [],
      sprint: 'all',
      sprints: [],
      release: 'all',
      releases: [],
    });
  };

  // Quick type click
  const handleQuickType = (t: ItemType | 'all') => {
    if (t === 'all') {
      onChangeFilters({ ...filters, type: 'all', types: [] });
    } else {
      const current = filters.types && filters.types.length > 0
        ? [...filters.types]
        : filters.type !== 'all' ? [filters.type] : [];
      const idx = current.indexOf(t);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(t);
      }
      onChangeFilters({
        ...filters,
        types: current,
        type: current.length === 1 ? current[0] : 'all',
      });
    }
  };

  // Quick priority click
  const handleQuickPriority = (p: Priority | 'all') => {
    if (p === 'all') {
      onChangeFilters({ ...filters, priority: 'all', priorities: [] });
    } else {
      const current = filters.priorities && filters.priorities.length > 0
        ? [...filters.priorities]
        : filters.priority !== 'all' ? [filters.priority] : [];
      const idx = current.indexOf(p);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(p);
      }
      onChangeFilters({
        ...filters,
        priorities: current,
        priority: current.length === 1 ? current[0] : 'all',
      });
    }
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

  return (
    <div className="w-full border-b border-slate-200 dark:border-white/[0.06] bg-white/70 dark:bg-[#0c111c]/60 backdrop-blur-sm py-2 px-4 sm:px-6 transition-colors relative z-30">
      <div className="max-w-[1680px] mx-auto flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Search + Popover Button + Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Buscar título, código..."
                className="w-full pl-8 pr-12 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
              />
              {localSearch ? (
                <button
                  onClick={() => {
                    setLocalSearch('');
                    onChangeFilters({ ...filters, search: '' });
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden sm:inline absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/[0.06] text-[10px] text-slate-500 dark:text-slate-400 font-mono border border-slate-300 dark:border-white/[0.06]">
                  ⌘K
                </kbd>
              )}
            </div>

            {/* Advanced Filters Button (with Popover dropdown) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all select-none ${
                  isPopoverOpen || activeFiltersCount > 0
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-300'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filtros</span>
                {activeFiltersCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <AdvancedFiltersPopover
                filters={filters}
                onChangeFilters={onChangeFilters}
                availableModules={availableModules}
                availableSprints={availableSprints}
                availableReleases={availableReleases}
                isOpen={isPopoverOpen}
                onClose={() => setIsPopoverOpen(false)}
                activeFiltersCount={activeFiltersCount}
                onResetFilters={resetFilters}
                customItemTypes={customItemTypes}
              />
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Quick Type Filter Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => handleQuickType('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedTypes.size === 0
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Todos
              </button>
              {[
                { id: 'bug' as ItemType, label: '🐛 Bug' },
                { id: 'feature' as ItemType, label: '🚀 Feature' },
                { id: 'tech_debt' as ItemType, label: '🛠️ Tech' },
                { id: 'ux' as ItemType, label: '🎨 UX' },
                ...customItemTypes.map((c) => ({
                  id: c.key as ItemType,
                  label: `🏷️ ${c.label}`
                }))
              ].map((t) => {
                const isSelected = selectedTypes.has(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleQuickType(t.id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Quick Priority Filter Pills */}
            <div className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => handleQuickPriority('all')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  selectedPriorities.size === 0
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                P-All
              </button>
              {(
                [
                  { id: 'p0', label: 'P0', dot: 'bg-rose-500' },
                  { id: 'p1', label: 'P1', dot: 'bg-amber-500' },
                  { id: 'p2', label: 'P2', dot: 'bg-yellow-400' },
                  { id: 'p3', label: 'P3', dot: 'bg-slate-400' },
                ] as const
              ).map((p) => {
                const isSelected = selectedPriorities.has(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickPriority(p.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reset Filters button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded-md hover:bg-rose-500/10 transition-colors"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Limpiar ({activeFiltersCount})</span>
              </button>
            )}
          </div>

          {/* Right: Stats Summary */}
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
            <span>{stats.pending} pendientes</span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span>{stats.inProgress} en curso</span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span className="text-emerald-600 dark:text-emerald-400">{stats.completed} completados</span>
            <span className="text-slate-300 dark:text-white/20">•</span>
            <span className="text-slate-800 dark:text-slate-300 font-semibold">{stats.total} total</span>
          </div>
        </div>
      </div>
    </div>
  );
};
