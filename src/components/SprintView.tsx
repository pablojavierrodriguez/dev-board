import { useState, useEffect, useMemo, type FC } from 'react';
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
  X
} from 'lucide-react';
import type { BacklogItem, ItemStatus, Priority } from '../types';
import { typeConfig, priorityConfig } from './ItemCard';
import { ConfirmModal } from './ConfirmModal';

interface SprintViewProps {
  items: BacklogItem[];
  onClickItem: (item: BacklogItem) => void;
  onUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  onUpdatePriority: (id: string, newPriority: Priority) => void;
  onUpdateSprint?: (id: string, newSprint: string) => void;
  onCreateSprint?: (newSprintName: string) => void;
  onDeleteItem: (id: string) => void;
  availableSprints?: string[];
}

type GroupBy = 'sprint' | 'priority' | 'module' | 'none';

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
  onClickItem,
  onUpdateStatus,
  onUpdatePriority,
  onUpdateSprint,
  onCreateSprint,
  onDeleteItem,
  availableSprints = []
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('sprint');
  const [sortBy, setSortBy] = useState<'priority' | 'code' | 'status'>('priority');
  const [sortAsc, setSortAsc] = useState(true);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());
  const [itemToDelete, setItemToDelete] = useState<BacklogItem | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeDropGroup, setActiveDropGroup] = useState<string | null>(null);

  // New Sprint Modal State (DEV-036)
  const [customSprints, setCustomSprints] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('devboard_custom_sprints');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('devboard_custom_sprints', JSON.stringify(customSprints));
    } catch {}
  }, [customSprints]);
  const [newSprintModalOpen, setNewSprintModalOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');

  // Suggested Sprint Name (Sprint N+1)
  const suggestedSprintName = useMemo(() => {
    const allNames = Array.from(new Set([...availableSprints, ...customSprints, ...items.map(i => i.sprint || i.targetSprint || '')]));
    let maxNum = 0;
    for (const name of allNames) {
      const match = name.match(/sprint\s*(\d+)/i);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }
    return `Sprint ${maxNum + 1}`;
  }, [availableSprints, customSprints, items]);

  const handleConfirmCreateSprint = () => {
    const trimmed = newSprintName.trim();
    if (!trimmed) return;
    if (!customSprints.includes(trimmed)) {
      setCustomSprints(prev => [...prev, trimmed]);
    }
    // Asegurar que el nuevo sprint aparezca expandido
    setCollapsedKeys(prev => {
      const next = new Set(prev);
      next.delete(trimmed);
      return next;
    });
    onCreateSprint?.(trimmed);
    setGroupBy('sprint');
    setNewSprintModalOpen(false);
    setNewSprintName('');
  };

  // Grouping logic with natural sorting
  const groupedData = useMemo(() => {
    // Sort items inside groups
    const sorted = [...items].sort((a, b) => {
      if (sortBy === 'priority') {
        const pOrder: Record<Priority, number> = { p0: 0, p1: 1, p2: 2, p3: 3 };
        const diff = pOrder[a.priority] - pOrder[b.priority];
        return sortAsc ? diff : -diff;
      }
      if (sortBy === 'code') {
        const comp = a.code.localeCompare(b.code, undefined, { numeric: true });
        return sortAsc ? comp : -comp;
      }
      if (sortBy === 'status') {
        const sOrder: Record<ItemStatus, number> = {
          draft: 0, doing: 1, review: 2, ready: 3, done: 4, dismissed: 5, cancelled: 6,
          ideas: 0, backlog: 0, in_progress: 1, testing_qa: 2, finish: 3
        };
        const diff = sOrder[a.status] - sOrder[b.status];
        return sortAsc ? diff : -diff;
      }
      return 0;
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
      }

      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(it);
    }

    // DEV-036: Include known and custom empty sprints
    if (groupBy === 'sprint') {
      const allKnownSprints = Array.from(new Set([...availableSprints, ...customSprints]));
      for (const sp of allKnownSprints) {
        if (sp && !groups.has(sp)) {
          groups.set(sp, []);
        }
      }
    }

    const result = Array.from(groups.entries()).map(([key, list]) => ({ key, items: list }));

    // DEV-033: Ordenamiento natural de los bloques de Sprint
    if (groupBy === 'sprint') {
      result.sort((a, b) => {
        const isNoSprintA = a.key === 'Backlog' || a.key.includes('Sin Sprint') || a.key === 'Sin Asignar';
        const isNoSprintB = b.key === 'Backlog' || b.key.includes('Sin Sprint') || b.key === 'Sin Asignar';
        if (isNoSprintA) return 1;
        if (isNoSprintB) return -1;
        return a.key.localeCompare(b.key, undefined, { numeric: true });
      });
    } else if (groupBy === 'priority') {
      const pOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
      result.sort((a, b) => (pOrder[a.key] ?? 99) - (pOrder[b.key] ?? 99));
    } else if (groupBy === 'module') {
      result.sort((a, b) => a.key.localeCompare(b.key));
    }

    return result;
  }, [items, groupBy, sortBy, sortAsc, availableSprints, customSprints]);

  const toggleSort = (field: 'priority' | 'code' | 'status') => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(true);
    }
  };

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
    <div className="w-full flex-1 p-4 sm:p-6 max-w-[1680px] mx-auto overflow-y-auto">
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
                { id: 'none', label: 'Listado Plano' },
              ] as const
            ).map((g) => (
              <button
                key={g.id}
                onClick={() => setGroupBy(g.id)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  groupBy === g.id
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
          <button
            type="button"
            onClick={() => {
              setNewSprintName(suggestedSprintName);
              setNewSprintModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs hover:shadow transition-all"
            title="Crear un nuevo Sprint o ciclo de trabajo"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Sprint</span>
          </button>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            {items.length} ítems en vista
          </div>
        </div>
      </div>

      {/* Tables by Group */}
      <div className="space-y-4">
        {groupedData.map((group) => {
          const doneCount = group.items.filter((i) => i.status === 'done').length;
          const progressPercent = group.items.length > 0 ? Math.round((doneCount / group.items.length) * 100) : 0;
          const isCollapsed = collapsedKeys.has(group.key);
          const isDropTarget = activeDropGroup === group.key;

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
                if (draggedItemId && onUpdateSprint && groupBy === 'sprint') {
                  const targetSprintVal = group.key === 'Backlog' || group.key.includes('Sin Sprint') || group.key === 'Sin Asignar' ? '' : group.key;
                  const item = items.find((it) => it.id === draggedItemId);
                  const currentSprintVal = item ? (item.sprint || item.targetSprint || '') : '';
                  if (currentSprintVal !== targetSprintVal) {
                    onUpdateSprint(draggedItemId, targetSprintVal);
                  }
                }
                setActiveDropGroup(null);
                setDraggedItemId(null);
              }}
              className={`glass-panel rounded-2xl overflow-hidden border transition-all ${
                isDropTarget
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-500/[0.03]'
                  : 'border-slate-200 dark:border-white/[0.07]'
              }`}
            >
              {/* Group Header (Clickable to Toggle Collapse) */}
              <div 
                onClick={() => toggleCollapse(group.key)}
                className="px-4 py-3 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/80 dark:hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <button className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                    {isCollapsed ? (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                  <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">{group.key}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-slate-200 dark:bg-white/[0.05] text-slate-700 dark:text-slate-400">
                    {group.items.length} ítems
                  </span>
                  {group.items.length === 0 && customSprints.includes(group.key) && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomSprints((prev) => prev.filter((s) => s !== group.key));
                      }}
                      title={`Eliminar contenedor vacío de ${group.key}`}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors ml-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isCollapsed && (
                    <span className="text-[11px] text-slate-400 font-mono italic">
                      (colapsado — click para ver)
                    </span>
                  )}
                  {isDropTarget && (
                    <span className="text-[11px] font-semibold text-indigo-500 animate-pulse">
                      Suelta aquí para asignar a {group.key}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-mono">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{doneCount}</span>
                    <span>/</span>
                    <span>{group.items.length} completados</span>
                    <span className="text-slate-400">({progressPercent}%)</span>
                  </div>
                  <div className="w-24 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden hidden sm:block">
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
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/[0.04] bg-slate-50/50 dark:bg-white/[0.01] text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        <th className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('priority')}>
                          <div className="flex items-center gap-1">
                            <span>Prio</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('code')}>
                          <div className="flex items-center gap-1">
                            <span>Código</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-2.5 px-4">Título</th>
                        <th className="py-2.5 px-4">Tipo</th>
                        <th className="py-2.5 px-4 cursor-pointer hover:text-slate-900 dark:hover:text-white" onClick={() => toggleSort('status')}>
                          <div className="flex items-center gap-1">
                            <span>Estado</span>
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </th>
                        <th className="py-2.5 px-4">Módulo</th>
                        <th className="py-2.5 px-4">Release / Versión</th>
                        {groupBy !== 'sprint' && <th className="py-2.5 px-4">Sprint</th>}
                        <th className="py-2.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                      {group.items.map((item) => {
                        const typeInfo = typeConfig[item.type] || typeConfig.feature;
                        const TypeIcon = typeInfo.icon;
                        const pInfo = priorityConfig[item.priority] || priorityConfig.p2;
                        const sInfo = statusLabels[item.status] || statusLabels.backlog;
                        const releaseVal = item.release || item.targetRelease;
                        const isBeingDragged = draggedItemId === item.id;

                        return (
                          <tr
                            key={item.id}
                            draggable={groupBy === 'sprint'}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', item.id);
                              setDraggedItemId(item.id);
                            }}
                            onDragEnd={() => setDraggedItemId(null)}
                            className={`hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer ${
                              isBeingDragged ? 'opacity-40 bg-indigo-500/10' : ''
                            }`}
                            onClick={() => onClickItem(item)}
                          >
                            {/* Priority Column */}
                            <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                {groupBy === 'sprint' && (
                                  <span className="cursor-grab active:cursor-grabbing text-slate-400/60 hover:text-slate-400 p-0.5" title="Arrastrar a otro sprint">
                                    <GripVertical className="w-3 h-3" />
                                  </span>
                                )}
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
                              </div>
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
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeInfo.badge}`}>
                                <TypeIcon className="w-3 h-3" />
                                <span>{typeInfo.label}</span>
                              </span>
                            </td>

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
                            <td className="py-2.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-[11px]">
                              {item.module || '—'}
                            </td>

                            {/* Release / Versión (DEV-033: Formateo limpio sin doble v) */}
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              {releaseVal ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-mono text-[10px]">
                                  {releaseVal.startsWith('v') ? releaseVal : `v${releaseVal}`}
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600">—</span>
                              )}
                            </td>

                            {/* Sprint (visible when not grouped by sprint) */}
                            {groupBy !== 'sprint' && (
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

      {/* New Sprint Modal (DEV-036) */}
      {newSprintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Target className="w-4 h-4" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Crear Nuevo Sprint</h3>
              </div>
              <button 
                type="button"
                onClick={() => setNewSprintModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Nombre o identificador del Sprint
              </label>
              <input
                type="text"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleConfirmCreateSprint();
                  if (e.key === 'Escape') setNewSprintModalOpen(false);
                }}
                placeholder="Ej: Sprint 3 o v0.4.0 Sprint"
                autoFocus
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Al crearlo, aparecerá inmediatamente como un bloque receptor en la vista para arrastrar y priorizar tareas.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewSprintModalOpen(false)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!newSprintName.trim()}
                onClick={handleConfirmCreateSprint}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
              >
                Crear Sprint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
