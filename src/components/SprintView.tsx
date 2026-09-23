import { useState, useEffect, useMemo, useRef, useLayoutEffect, type FC } from 'react';
import {
  ArrowUpDown,
  Layers,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  GripVertical,
  Plus,
  Target,
  Calendar,
  Play,
  CheckCircle2,
  Eye,
  EyeOff,
  Columns3
} from 'lucide-react';
import type { BacklogItem, ItemStatus, Priority, Sprint } from '../types';
import { typeConfig, priorityConfig } from './ItemCard';
import { ConfirmModal } from './ConfirmModal';
import { SprintModal } from './SprintModal';
import { CompleteSprintModal } from './CompleteSprintModal';

const normalizePriorityNum = (p?: string): number => {
  if (!p) return 2;
  const lower = String(p).toLowerCase().trim();
  if (lower === 'p0' || lower === 'urgent') return 0;
  if (lower === 'p1' || lower === 'high') return 1;
  if (lower === 'p2' || lower === 'medium') return 2;
  if (lower === 'p3' || lower === 'low') return 3;
  return 2;
};

const normalizeStatusNum = (s?: string): number => {
  if (!s) return 99;
  const sOrder: Record<string, number> = {
    ideas: 0,
    backlog: 1,
    draft: 2,
    doing: 3,
    in_progress: 3,
    review: 4,
    testing_qa: 5,
    ready: 6,
    finish: 7,
    done: 8,
    dismissed: 9,
    cancelled: 10
  };
  return sOrder[s.toLowerCase().trim()] ?? 99;
};

interface SprintViewProps {
  items: BacklogItem[];
  sprints?: Sprint[];
  onClickItem: (item: BacklogItem) => void;
  onUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  onUpdatePriority: (id: string, newPriority: Priority) => void;
  onUpdateSprint?: (id: string, newSprint: string) => void;
  onReorderItem?: (draggedId: string, targetSprint: string, targetIndex: number) => void;
  onCreateSprint?: (sprintData: Partial<Sprint>) => Promise<void>;
  onUpdateSprintMeta?: (id: string, sprintData: Partial<Sprint>) => Promise<void>;
  onDeleteSprint?: (id: string) => Promise<void>;
  onStartSprint?: (sprint: Sprint) => Promise<void>;
  onCompleteSprint?: (sprint: Sprint, destinationSprintName: string) => Promise<void>;
  onDeleteItem: (id: string) => void;
  availableSprints?: string[];
  rankingEnabled?: boolean;
}

type GroupBy = 'sprint' | 'priority' | 'module' | 'none' | 'epic';

const statusLabels: Record<ItemStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  doing: { label: 'Doing', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  review: { label: 'Review', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  ready: { label: 'Ready', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' },
  done: { label: 'Done', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  dismissed: { label: 'Descartado', color: 'bg-slate-200 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700' },
  cancelled: { label: 'Cancelado', color: 'bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/30' },
  // legacy
  ideas: { label: 'Draft', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  backlog: { label: 'Draft', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  in_progress: { label: 'Doing', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  testing_qa: { label: 'Review', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  finish: { label: 'Ready', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' }
};

export const SprintView: FC<SprintViewProps> = ({
  items,
  sprints = [],
  onClickItem,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateSprint,
  onReorderItem,
  onCreateSprint,
  onUpdateSprintMeta,
  onDeleteSprint,
  onStartSprint,
  onCompleteSprint,
  onDeleteItem,
  availableSprints = [],
  rankingEnabled = true
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('sprint');
  const [sortBy, setSortBy] = useState<'order' | 'priority' | 'code' | 'status'>('order');
  const [sortAsc, setSortAsc] = useState(true);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());
  const [itemToDelete, setItemToDelete] = useState<BacklogItem | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dropTargetRow, setDropTargetRow] = useState<{ itemId: string; position: 'before' | 'after' } | null>(null);
  const [activeDropGroup, setActiveDropGroup] = useState<string | null>(null);

  // Sprints Modals & Lifecycle State (DEV-055)
  const [sprintModalOpen, setSprintModalOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);
  const [sprintToDelete, setSprintToDelete] = useState<Sprint | null>(null);

  // DEV-051: Column visibility popover
  const ALL_OPTIONAL_COLS = ['tipo', 'modulo', 'release', 'sprint'] as const;
  type OptionalCol = typeof ALL_OPTIONAL_COLS[number];
  const [visibleCols, setVisibleCols] = useState<Set<OptionalCol>>(() => {
    try {
      const saved = localStorage.getItem('devboard_backlog_visible_cols');
      if (saved) return new Set(JSON.parse(saved) as OptionalCol[]);
    } catch {}
    return new Set<OptionalCol>(['tipo', 'modulo', 'release']);
  });
  const [colsPopoverOpen, setColsPopoverOpen] = useState(false);
  const colsPopoverRef = useRef<HTMLDivElement>(null);

  const toggleCol = (col: OptionalCol) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col); else next.add(col);
      try { localStorage.setItem('devboard_backlog_visible_cols', JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (colsPopoverRef.current && !colsPopoverRef.current.contains(e.target as Node)) {
        setColsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const [showCompletedSprints, setShowCompletedSprints] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('devboard_sprintview_show_completed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('devboard_sprintview_show_completed', JSON.stringify(showCompletedSprints));
    } catch {}
  }, [showCompletedSprints]);

  // Suggested Sprint Name (Sprint N+1)
  const suggestedSprintName = useMemo(() => {
    const allNames = Array.from(new Set([
      ...(availableSprints || []),
      ...(sprints.map((s) => s.name) || []),
      ...items.map((i) => i.sprint || i.targetSprint || '')
    ]));
    let maxNum = 0;
    for (const name of allNames) {
      const match = name.match(/sprint\s*(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    return `Sprint ${maxNum + 1}`;
  }, [availableSprints, sprints, items]);

  const completedSprintsCount = useMemo(() => {
    return sprints.filter((s) => s.status === 'completed').length;
  }, [sprints]);

  // Grouping logic with natural sorting and deterministic tie-breakers (DEV-063)
  const groupedData = useMemo(() => {
    // Sort items inside groups with deterministic tie-breaker
    const sorted = [...items].sort((a, b) => {
      let diff = 0;
      if (sortBy === 'order') {
        diff = (a.order ?? 9999) - (b.order ?? 9999);
      } else if (sortBy === 'priority') {
        diff = normalizePriorityNum(a.priority) - normalizePriorityNum(b.priority);
      } else if (sortBy === 'status') {
        diff = normalizeStatusNum(a.status) - normalizeStatusNum(b.status);
      } else if (sortBy === 'code') {
        diff = a.code.localeCompare(b.code, undefined, { numeric: true });
      }

      // Tie-breaker secundario determinista estricto
      if (diff === 0) {
        return a.code.localeCompare(b.code, undefined, { numeric: true });
      }

      return sortAsc ? diff : -diff;
    });

    if (groupBy === 'none') {
      return [{ key: 'Todos los ítems', items: sorted }];
    }

    const groups = new Map<string, BacklogItem[]>();

    for (const it of sorted) {
      let key = 'Sin Asignar';
      if (groupBy === 'sprint') {
        key = it.sprint || it.targetSprint || 'Backlog';
      } else if (groupBy === 'priority') {
        key = it.priority.toUpperCase();
      } else if (groupBy === 'module') {
        key = it.module || 'General / Core';
      } else if (groupBy === 'epic') {
        // Group by parent epic: look for items of type 'epic' that this item is associated with
        // Use module as a proxy for epic grouping (or a dedicated epic field if present)
        key = (it as any).epic || it.module || 'Sin Épica';
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(it);
    }

    // DEV-036 & DEV-055: Include known empty sprints (only from official sprints list, NOT from task fields)
    if (groupBy === 'sprint') {
      for (const sp of sprints) {
        if (sp.name && !groups.has(sp.name)) {
          groups.set(sp.name, []);
        }
      }
    }

    let result = Array.from(groups.entries()).map(([key, list]) => ({ key, items: list }));

    // DEV-033 & DEV-055: Ordenamiento cronológico de Sprints y filtros de ciclo de vida
    if (groupBy === 'sprint') {
      // Filtrar sprints que no deben aparecer
      result = result.filter((g) => {
        const isNoSprint = g.key === 'Backlog' || g.key.includes('Sin Sprint') || g.key === 'Sin Asignar';
        if (isNoSprint) return true;

        const spObj = sprints.find((s) => s.name === g.key || s.id === g.key);

        // Excluir sprints completados si showCompletedSprints es false
        if (!showCompletedSprints && spObj?.status === 'completed') return false;

        // Excluir sprints planned vacíos (sin tareas) — son ruido visual
        if (spObj?.status === 'planned' && g.items.length === 0) return false;

        return true;
      });

      result.sort((a, b) => {
        const isNoSprintA = a.key === 'Backlog' || a.key.includes('Sin Sprint') || a.key === 'Sin Asignar';
        const isNoSprintB = b.key === 'Backlog' || b.key.includes('Sin Sprint') || b.key === 'Sin Asignar';
        if (isNoSprintA) return 1;
        if (isNoSprintB) return -1;

        const spA = sprints.find((s) => s.name === a.key || s.id === a.key);
        const spB = sprints.find((s) => s.name === b.key || s.id === b.key);

        const dateA = spA?.startDate || spA?.createdAt;
        const dateB = spB?.startDate || spB?.createdAt;
        if (dateA && dateB && dateA !== dateB) {
          return dateA.localeCompare(dateB);
        }

        return a.key.localeCompare(b.key, undefined, { numeric: true });
      });
    } else if (groupBy === 'priority') {
      const pOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      result.sort((a, b) => (pOrder[a.key] ?? 99) - (pOrder[b.key] ?? 99));
    } else if (groupBy === 'module') {
      result.sort((a, b) => a.key.localeCompare(b.key));
    }

    return result;
  }, [items, groupBy, sortBy, sortAsc, sprints, showCompletedSprints]);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSnapshotRef = useRef<{
    clickedEl?: HTMLElement;
    clickedTop?: number;
    windowTop: number;
    containerTop: number;
  } | null>(null);

  const toggleSort = (field: 'order' | 'priority' | 'code' | 'status', e?: React.MouseEvent) => {
    // Capturar posición del elemento clickeado y scroll del viewport (DEV-063)
    const el = e?.currentTarget as HTMLElement | undefined;
    scrollSnapshotRef.current = {
      clickedEl: el,
      clickedTop: el ? el.getBoundingClientRect().top : undefined,
      windowTop: window.scrollY || document.documentElement.scrollTop || 0,
      containerTop: containerRef.current ? containerRef.current.scrollTop : 0
    };

    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

  // Anclaje visual inmediato sin saltos de scroll ni layout shifts (DEV-063)
  useLayoutEffect(() => {
    if (scrollSnapshotRef.current) {
      const { clickedEl, clickedTop, windowTop, containerTop } = scrollSnapshotRef.current;
      scrollSnapshotRef.current = null;

      // 1. Si el usuario clickeó un header en una tabla específica, mantenerlo exactamente en el mismo punto de la pantalla
      if (clickedEl && typeof clickedTop === 'number' && document.body.contains(clickedEl)) {
        const newTop = clickedEl.getBoundingClientRect().top;
        const delta = newTop - clickedTop;
        if (Math.abs(delta) > 0.5) {
          window.scrollBy({ top: delta, behavior: 'instant' as ScrollBehavior });
        }
      } else {
        // 2. Si no hay referencia de elemento, restaurar la posición previa
        if (containerRef.current && containerRef.current.scrollTop !== containerTop) {
          containerRef.current.scrollTop = containerTop;
        }
        if ((window.scrollY || document.documentElement.scrollTop || 0) !== windowTop) {
          window.scrollTo({ top: windowTop, behavior: 'instant' as ScrollBehavior });
        }
      }
    }
  }, [sortBy, sortAsc]);

  const toggleCollapse = (key: string) => {
    setCollapsedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const expandAll = () => {
    setCollapsedKeys(new Set());
  };

  const collapseAll = () => {
    setCollapsedKeys(new Set(groupedData.map((g) => g.key)));
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex-1 p-4 sm:p-6 max-w-[1680px] mx-auto"
      style={{ overflowAnchor: 'none' }}
    >
      {/* Controls: Group By + Collapse/Expand + Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-slate-500 dark:text-slate-400 font-medium">Agrupar por:</span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-lg">
            {(
              [
                { id: 'sprint', label: '🎯 Sprint' },
                { id: 'priority', label: '⚡ Prioridad' },
                { id: 'module', label: '📁 Módulo' },
                { id: 'epic', label: '🗂 Épica' },
                { id: 'none', label: 'Listado Plano' },
              ] as const
            ).map((g) => (
              <button
                key={g.id}
                onClick={() => setGroupBy(g.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${groupBy === g.id
                  ? 'bg-white dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-200 border border-slate-200 dark:border-indigo-500/30 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {groupBy !== 'none' && (
            <div className="flex items-center gap-1 ml-1 border-l border-slate-200 dark:border-white/10 pl-2">
              <button
                onClick={expandAll}
                title="Expandir todos los bloques"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Expandir todos</span>
              </button>
              <button
                onClick={collapseAll}
                title="Colapsar todos los bloques"
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
              >
                <Minimize2 className="w-3 h-3" />
                <span>Colapsar todos</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {groupBy === 'sprint' && completedSprintsCount > 0 && (
            <button
              type="button"
              onClick={() => setShowCompletedSprints(!showCompletedSprints)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                showCompletedSprints
                  ? 'bg-slate-100 dark:bg-white/[0.08] text-slate-800 dark:text-slate-200 border-slate-300 dark:border-white/20'
                  : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200 dark:border-white/10'
              }`}
              title={showCompletedSprints ? 'Ocultar sprints completados' : 'Mostrar sprints completados'}
            >
              {showCompletedSprints ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showCompletedSprints ? 'Ocultar completados' : `Ver completados (${completedSprintsCount})`}</span>
            </button>
          )}

          {onCreateSprint && (
            <button
              type="button"
              onClick={() => {
                setEditingSprint(null);
                setSprintModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow transition-all"
              title="Crear un nuevo Sprint o ciclo de trabajo"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Sprint</span>
            </button>
          )}
          {/* DEV-051: Column Visibility Popover */}
          <div className="relative" ref={colsPopoverRef}>
            <button
              type="button"
              onClick={() => setColsPopoverOpen(v => !v)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                colsPopoverOpen
                  ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30'
                  : 'bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
              }`}
              title="Configurar columnas visibles"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Columnas</span>
              {visibleCols.size < ALL_OPTIONAL_COLS.length && (
                <span className="ml-0.5 px-1 py-px rounded bg-indigo-500 text-white text-[9px] font-bold leading-none">
                  {ALL_OPTIONAL_COLS.length - visibleCols.size} oculta{ALL_OPTIONAL_COLS.length - visibleCols.size !== 1 ? 's' : ''}
                </span>
              )}
            </button>

            {colsPopoverOpen && (
              <div className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white dark:bg-[#131c2f] border border-slate-200 dark:border-white/10 rounded-xl shadow-xl p-2 space-y-0.5">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 pb-1">Columnas opcionales</p>
                {([
                  { id: 'tipo', label: 'Tipo' },
                  { id: 'modulo', label: 'Módulo' },
                  { id: 'release', label: 'Release / Versión' },
                  { id: 'sprint', label: 'Sprint' },
                ] as { id: OptionalCol; label: string }[]).map(col => (
                  <label key={col.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                    <input
                      type="checkbox"
                      checked={visibleCols.has(col.id)}
                      onChange={() => toggleCol(col.id)}
                      className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-600 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-700 dark:text-slate-300">{col.label}</span>
                  </label>
                ))}
                <div className="border-t border-slate-100 dark:border-white/[0.05] pt-1 mt-1">
                  <button
                    onClick={() => {
                      const allCols = new Set<OptionalCol>(ALL_OPTIONAL_COLS);
                      setVisibleCols(allCols);
                      try { localStorage.setItem('devboard_backlog_visible_cols', JSON.stringify(Array.from(allCols))); } catch {}
                    }}
                    className="w-full text-left px-2 py-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-md transition-colors"
                  >
                    Mostrar todas
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {items.length} ítems en vista
          </div>
        </div>

      </div>

      {/* Tables by Group */}
      <div className="space-y-4">
        {groupedData.map((group) => {
          const doneCount = group.items.filter((i) => i.status === 'done' || i.status === 'ready' || i.status === 'finish').length;
          const progressPercent = group.items.length > 0 ? Math.round((doneCount / group.items.length) * 100) : 0;
          const isCollapsed = collapsedKeys.has(group.key);
          const isDropTarget = activeDropGroup === group.key;
          const sprintObj = groupBy === 'sprint' ? sprints.find((s) => s.name === group.key || s.id === group.key) : undefined;
          const isBacklogGroup = group.key === 'Backlog' || group.key.includes('Sin Sprint') || group.key === 'Sin Asignar';

          return (
            <div
              key={group.key}
              onDragOver={(e) => {
                if (groupBy === 'sprint' && onUpdateSprint) {
                  e.preventDefault();
                  setActiveDropGroup(group.key);
                }
              }}
              onDragLeave={() => {
                if (activeDropGroup === group.key) setActiveDropGroup(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedItemId && groupBy === 'sprint') {
                  const targetSprintVal = isBacklogGroup ? '' : group.key;
                  if (onReorderItem) {
                    onReorderItem(draggedItemId, targetSprintVal, group.items.length);
                    setSortBy('order');
                  } else if (onUpdateSprint) {
                    onUpdateSprint(draggedItemId, targetSprintVal);
                  }
                }
                setActiveDropGroup(null);
                setDraggedItemId(null);
                setDropTargetRow(null);
              }}
              className={`glass-panel rounded-2xl overflow-hidden border transition-all ${isDropTarget
                ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/[0.03]'
                : 'border-slate-200 dark:border-white/[0.07]'
                }`}
            >
              {/* Group Header (Clickable to Toggle Collapse) */}
              <div
                onClick={() => toggleCollapse(group.key)}
                className="px-4 py-3 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors gap-3"
              >
                <div className="flex flex-wrap items-center gap-2.5 min-w-0">
                  <button className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400 shrink-0" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{group.key}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-200 dark:bg-white/[0.05] text-slate-700 dark:text-slate-400 shrink-0">
                    {group.items.length} ítems
                  </span>

                  {/* Status Badge */}
                  {sprintObj && (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border shrink-0 ${
                        sprintObj.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                          : sprintObj.status === 'completed'
                          ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20'
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                      }`}
                    >
                      {sprintObj.status === 'active' && '🟢 Activo'}
                      {sprintObj.status === 'completed' && '⚪ Completado'}
                      {sprintObj.status === 'planned' && '🟡 Planificado'}
                    </span>
                  )}

                  {/* Dates */}
                  {sprintObj?.startDate && sprintObj?.endDate && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {sprintObj.startDate} → {sprintObj.endDate}
                    </span>
                  )}

                  {/* Goal */}
                  {sprintObj?.goal && (
                    <span
                      className="hidden md:inline-block text-xs text-slate-500 dark:text-slate-400 italic font-normal truncate max-w-xs xl:max-w-md"
                      title={sprintObj.goal}
                    >
                      "{sprintObj.goal}"
                    </span>
                  )}

                  {isCollapsed && (
                    <span className="text-[11px] text-slate-400 font-mono italic">
                      (colapsado)
                    </span>
                  )}
                  {isDropTarget && (
                    <span className="text-[11px] font-semibold text-indigo-500 animate-pulse">
                      Suelta aquí para asignar a {group.key}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Sprint Actions */}
                  {sprintObj && (
                    <div className="flex items-center gap-1.5">
                      {sprintObj.status === 'planned' && onStartSprint && (
                        <button
                          type="button"
                          onClick={() => onStartSprint(sprintObj)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-xs"
                          title="Iniciar este sprint (lo marcará como Activo)"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span className="hidden sm:inline">Iniciar Sprint</span>
                        </button>
                      )}

                      {sprintObj.status === 'active' && onCompleteSprint && (
                        <button
                          type="button"
                          onClick={() => setCompletingSprint(sprintObj)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs"
                          title="Cerrar sprint y resolver balance de tareas"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Completar Sprint</span>
                        </button>
                      )}

                      {onUpdateSprintMeta && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSprint(sprintObj);
                            setSprintModalOpen(true);
                          }}
                          title="Editar objetivo y fechas del sprint"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-white/[0.08] transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteSprint && (
                        <button
                          type="button"
                          onClick={() => setSprintToDelete(sprintObj)}
                          title="Eliminar este sprint (las tareas volverán al Backlog)"
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{doneCount}</span>
                    <span>/</span>
                    <span>{group.items.length}</span>
                    <span className="text-slate-400">({progressPercent}%)</span>
                  </div>
                  <div className="w-20 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Table Body or Empty Drop Zone (Visible only when expanded) */}
              {!isCollapsed && (
                group.items.length === 0 ? (
                  <div className="p-8 text-center border-dashed border-2 border-slate-200 dark:border-white/10 m-4 rounded-xl flex flex-col items-center justify-center gap-2 bg-slate-50/50 dark:bg-white/[0.01]">
                    <Target className="w-8 h-8 text-indigo-400/60 animate-pulse" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Este sprint o grupo aún no tiene tareas asignadas
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Arrastra tareas aquí para asignarlas a <span className="font-semibold text-indigo-500">{group.key}</span>
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs" style={{ overflowAnchor: 'none' }}>
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          <th className="py-2.5 px-3 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors w-14" onClick={(e) => toggleSort('order', e)} title="Ordenar por Ranking / Orden">
                            <div className="flex items-center gap-1">
                              <span className={sortBy === 'order' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>#</span>
                              <ArrowUpDown className={`w-3 h-3 ${sortBy === 'order' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400/60'}`} />
                            </div>
                          </th>
                          <th className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={(e) => toggleSort('priority', e)}>
                            <div className="flex items-center gap-1">
                              <span className={sortBy === 'priority' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>Prio</span>
                              <ArrowUpDown className={`w-3 h-3 ${sortBy === 'priority' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400/60'}`} />
                            </div>
                          </th>
                          <th className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={(e) => toggleSort('code', e)}>
                            <div className="flex items-center gap-1">
                              <span className={sortBy === 'code' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>Código</span>
                              <ArrowUpDown className={`w-3 h-3 ${sortBy === 'code' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400/60'}`} />
                            </div>
                          </th>
                          <th className="py-2.5 px-4">Título</th>
                          {visibleCols.has('tipo') && <th className="py-2.5 px-4">Tipo</th>}
                          <th className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={(e) => toggleSort('status', e)}>
                            <div className="flex items-center gap-1">
                              <span className={sortBy === 'status' ? 'font-bold text-indigo-600 dark:text-indigo-400' : ''}>Estado</span>
                              <ArrowUpDown className={`w-3 h-3 ${sortBy === 'status' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400/60'}`} />
                            </div>
                          </th>
                          {visibleCols.has('modulo') && <th className="py-2.5 px-4">Módulo</th>}
                          {visibleCols.has('release') && <th className="py-2.5 px-4">Release / Versión</th>}
                          {groupBy !== 'sprint' && visibleCols.has('sprint') && <th className="py-2.5 px-4">Sprint</th>}
                          <th className="py-2.5 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                        {group.items.map((item, rowIdx) => {
                          const typeInfo = typeConfig[item.type] || typeConfig.feature;
                          const TypeIcon = typeInfo.icon;
                          const pInfo = priorityConfig[item.priority] || priorityConfig.p2;
                          const sInfo = statusLabels[item.status] || statusLabels.backlog;
                          const releaseVal = item.release || item.targetRelease;
                          const isBeingDragged = draggedItemId === item.id;
                          const isDropTargetRow = dropTargetRow?.itemId === item.id;

                          return (
                            <tr
                              key={item.id}
                              draggable={rankingEnabled && Boolean(onReorderItem || onUpdateSprint)}
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                e.dataTransfer.setData('text/plain', item.id);
                                setDraggedItemId(item.id);
                              }}
                              onDragEnd={() => {
                                setDraggedItemId(null);
                                setDropTargetRow(null);
                                setActiveDropGroup(null);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (draggedItemId && draggedItemId !== item.id) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const isUpper = e.clientY < rect.top + rect.height / 2;
                                  setDropTargetRow({ itemId: item.id, position: isUpper ? 'before' : 'after' });
                                }
                              }}
                              onDragLeave={(e) => {
                                if (dropTargetRow?.itemId === item.id) {
                                  const related = e.relatedTarget as Node | null;
                                  if (!e.currentTarget.contains(related)) {
                                    setDropTargetRow(null);
                                  }
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (draggedItemId && draggedItemId !== item.id) {
                                  const isUpper = dropTargetRow?.position === 'before';
                                  const targetSprintVal = group.key === 'Backlog' || group.key.includes('Sin Sprint') || group.key === 'Sin Asignar' ? '' : group.key;
                                  const insertIdx = isUpper ? rowIdx : rowIdx + 1;
                                  if (onReorderItem) {
                                    onReorderItem(draggedItemId, targetSprintVal, insertIdx);
                                    setSortBy('order');
                                  } else if (onUpdateSprint) {
                                    onUpdateSprint(draggedItemId, targetSprintVal);
                                  }
                                }
                                setDraggedItemId(null);
                                setDropTargetRow(null);
                                setActiveDropGroup(null);
                              }}
                              className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer relative ${isBeingDragged ? 'opacity-30 bg-indigo-500/10' : ''
                                } ${isDropTargetRow && dropTargetRow?.position === 'before'
                                  ? 'border-t-2 border-indigo-500 bg-indigo-500/[0.05]'
                                  : ''
                                } ${isDropTargetRow && dropTargetRow?.position === 'after'
                                  ? 'border-b-2 border-indigo-500 bg-indigo-500/[0.05]'
                                  : ''
                                }`}
                              onClick={() => onClickItem(item)}
                            >
                              {/* Grip & Ranking Column */}
                              <td className="py-2.5 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center gap-1 text-slate-400">
                                  {rankingEnabled && (
                                    <span
                                      className="cursor-grab active:cursor-grabbing hover:text-indigo-500 p-0.5 rounded transition-colors"
                                      title="Arrastrar verticalmente para reordenar o mover de sprint"
                                    >
                                      <GripVertical className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                  <span className="text-[10px] font-mono text-slate-400 font-medium">
                                    {item.order !== undefined ? item.order : (rowIdx + 1) * 10}
                                  </span>
                                </div>
                              </td>

                              {/* Priority Column */}
                              <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={item.priority}
                                  onChange={(e) => {
                                    const newPriority = e.target.value as Priority;
                                    if (newPriority !== item.priority) {
                                      onUpdatePriority(item.id, newPriority);
                                    }
                                  }}
                                  className={`bg-transparent border-0 text-[11px] font-mono cursor-pointer focus:outline-none ${pInfo.text}`}
                                >
                                  <option value="p0" className="bg-white dark:bg-[#0e1626] text-rose-500">P0 🔴</option>
                                  <option value="p1" className="bg-white dark:bg-[#0e1626] text-amber-500">P1 🟠</option>
                                  <option value="p2" className="bg-white dark:bg-[#0e1626] text-yellow-500">P2 🟡</option>
                                  <option value="p3" className="bg-white dark:bg-[#0e1626] text-slate-500">P3 ⚪</option>
                                </select>
                              </td>

                              {/* Code */}
                              <td className="py-2.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-800 dark:text-slate-300">
                                {item.code}
                              </td>

                              {/* Title */}
                              <td className="py-2.5 px-4 min-w-[280px]">
                                <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-1">
                                  {item.title}
                                </div>
                                {item.impactedFile && (
                                  <div className="text-[10px] text-slate-500 font-mono truncate max-w-sm">
                                    {item.impactedFile}
                                  </div>
                                )}
                              </td>

                              {/* Type */}
                              {visibleCols.has('tipo') && (
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeInfo.badge}`}>
                                    <TypeIcon className="w-3 h-3" />
                                    <span>{typeInfo.label}</span>
                                  </span>
                                </td>
                              )}

                              {/* Status */}
                              <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <select
                                  value={item.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value as ItemStatus;
                                    if (newStatus !== item.status) {
                                      onUpdateStatus(item.id, newStatus);
                                    }
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer focus:outline-none ${sInfo.color}`}
                                >
                                  <option value="draft" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Draft</option>
                                  <option value="doing" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Doing</option>
                                  <option value="review" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Review</option>
                                  <option value="ready" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Ready</option>
                                  <option value="done" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Done</option>
                                  <option value="dismissed" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Descartado</option>
                                  <option value="cancelled" className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">Cancelado</option>
                                </select>
                              </td>

                              {/* Module */}
                              {visibleCols.has('modulo') && (
                                <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-[11px]">
                                  {item.module || '—'}
                                </td>
                              )}

                              {/* Release / Versión (DEV-033: Formateo limpio sin doble v) */}
                              {visibleCols.has('release') && (
                                <td className="py-2.5 px-4 whitespace-nowrap">
                                  {releaseVal ? (
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-mono text-[10px]">
                                      {releaseVal.startsWith('v') ? releaseVal : `v${releaseVal}`}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 dark:text-slate-600">—</span>
                                  )}
                                </td>
                              )}

                              {/* Sprint (visible when not grouped by sprint AND sprint col enabled) */}
                              {groupBy !== 'sprint' && visibleCols.has('sprint') && (
                                <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                  {onUpdateSprint && availableSprints.length > 0 ? (
                                    <select
                                      value={item.sprint || item.targetSprint || ''}
                                      onChange={(e) => {
                                        const newSprint = e.target.value;
                                        const curSprint = item.sprint || item.targetSprint || '';
                                        if (newSprint !== curSprint) {
                                          onUpdateSprint(item.id, newSprint);
                                        }
                                      }}
                                      className="px-2 py-0.5 rounded text-[10px] font-mono border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 focus:outline-none cursor-pointer"
                                    >
                                      <option value="" className="bg-white dark:bg-[#0e1626] text-slate-500">Backlog</option>
                                      {availableSprints.map((sp) => (
                                        <option key={sp} value={sp} className="bg-white dark:bg-[#0e1626] text-slate-800 dark:text-slate-200">
                                          {sp}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    item.sprint || item.targetSprint ? (
                                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-mono text-[10px]">
                                        {item.sprint || item.targetSprint}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400 dark:text-slate-600">—</span>
                                    )
                                  )}
                                </td>
                              )}

                              {/* Actions */}
                              <td className="py-2.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => onClickItem(item)}
                                    title="Editar"
                                    className="p-1 rounded text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08]"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setItemToDelete(item)}
                                    title="Eliminar"
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que deseas eliminar permanentemente la tarea ${itemToDelete?.code}?`}
        detail={itemToDelete?.title}
        confirmText="Eliminar Tarea"
        variant="danger"
        onConfirm={() => {
          if (itemToDelete) onDeleteItem(itemToDelete.id);
        }}
        onClose={() => setItemToDelete(null)}
      />

      {/* Sprint Modal (Create & Edit) (DEV-055) */}
      <SprintModal
        isOpen={sprintModalOpen}
        onClose={() => {
          setSprintModalOpen(false);
          setEditingSprint(null);
        }}
        sprint={editingSprint}
        suggestedName={suggestedSprintName}
        onSave={async (data) => {
          if (editingSprint && onUpdateSprintMeta) {
            await onUpdateSprintMeta(editingSprint.id, data);
          } else if (onCreateSprint) {
            await onCreateSprint(data);
          }
          setSprintModalOpen(false);
          setEditingSprint(null);
        }}
      />

      {/* Complete Sprint Modal (DEV-055) */}
      {completingSprint && (
        <CompleteSprintModal
          isOpen={!!completingSprint}
          onClose={() => setCompletingSprint(null)}
          sprint={completingSprint}
          sprintItems={items.filter(
            (i) => i.sprint === completingSprint.name || i.targetSprint === completingSprint.name
          )}
          availablePlannedSprints={sprints.filter(
            (s) => s.status === 'planned' && s.id !== completingSprint.id
          )}
          onConfirm={async (destinationSprintName) => {
            if (onCompleteSprint) {
              await onCompleteSprint(completingSprint, destinationSprintName);
            }
            setCompletingSprint(null);
          }}
        />
      )}

      {/* Delete Sprint Confirmation Modal (DEV-055) */}
      {sprintToDelete && (
        <ConfirmModal
          isOpen={!!sprintToDelete}
          title={`Eliminar ${sprintToDelete.name}`}
          message={`¿Estás seguro de que deseas eliminar permanentemente el ${sprintToDelete.name}?`}
          detail="Las tareas asignadas no serán eliminadas; volverán automáticamente al Backlog para no perder trabajo."
          confirmText="Eliminar Sprint"
          variant="danger"
          onConfirm={async () => {
            if (onDeleteSprint && sprintToDelete) {
              await onDeleteSprint(sprintToDelete.id);
              setSprintToDelete(null);
            }
          }}
          onClose={() => setSprintToDelete(null)}
        />
      )}
    </div>
  );
};
