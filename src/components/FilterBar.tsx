import { useState, useRef, useEffect, type FC } from 'react';
import { Search, X, Filter } from 'lucide-react';
import type { FilterState, ItemType, Priority } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (newFilters: FilterState) => void;
  availableModules: string[];
  stats: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
  };
}

export const FilterBar: FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  availableModules,
  stats
}) => {
  const [localSearch, setLocalSearch] = useState(filters.search);
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

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.type !== 'all' ||
    filters.priority !== 'all' ||
    filters.module !== 'all';

  const resetFilters = () => {
    setLocalSearch('');
    onChangeFilters({
      search: '',
      type: 'all',
      priority: 'all',
      module: 'all',
      sprint: 'all'
    });
  };

  return (
    <div className="w-full border-b border-slate-200 dark:border-white/[0.06] bg-white/70 dark:bg-[#0c111c]/60 backdrop-blur-sm py-2.5 px-4 sm:px-6 transition-colors">
      <div className="max-w-[1680px] mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Search + Type & Priority pills */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Buscar título, código o detalle..."
              className="w-full pl-8 pr-14 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-colors"
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

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-lg text-xs">
            {(
              [
                { id: 'all', label: 'Todos' },
                { id: 'bug', label: '🐛 Bug' },
                { id: 'feature', label: '🚀 Feature' },
                { id: 'tech_debt', label: '🛠️ Tech' },
                { id: 'ux', label: '🎨 UX' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeFilters({ ...filters, type: t.id as ItemType | 'all' })}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filters.type === t.id
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Priority Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-lg text-xs">
            {(
              [
                { id: 'all', label: 'P-All', dot: '' },
                { id: 'p0', label: 'P0', dot: 'bg-rose-500' },
                { id: 'p1', label: 'P1', dot: 'bg-amber-500' },
                { id: 'p2', label: 'P2', dot: 'bg-yellow-400' },
                { id: 'p3', label: 'P3', dot: 'bg-slate-400' },
              ] as const
            ).map((p) => (
              <button
                key={p.id}
                onClick={() => onChangeFilters({ ...filters, priority: p.id as Priority | 'all' })}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  filters.priority === p.id
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {p.dot && <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />}
                <span>{p.label}</span>
              </button>
            ))}
          </div>

          {/* Module Selector */}
          {availableModules.length > 0 && (
            <select
              value={filters.module}
              onChange={(e) => onChangeFilters({ ...filters, module: e.target.value })}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="all" className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200">Área: Todas</option>
              {availableModules.map((m) => (
                <option key={m} value={m} className="bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-200">
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              <Filter className="w-3 h-3" />
              <span>Limpiar filtros</span>
            </button>
          )}
        </div>

        {/* Right: Stats Summary */}
        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
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
  );
};
