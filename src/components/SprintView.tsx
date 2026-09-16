import { useState, useMemo, type FC } from 'react';
import { 
  ArrowUpDown, 
  Layers, 
  Edit3, 
  Trash2,
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2
} from 'lucide-react';
import type { BacklogItem, ItemStatus, Priority } from '../types';
import { typeConfig, priorityConfig } from './ItemCard';
import { ConfirmModal } from './ConfirmModal';

interface SprintViewProps {
  items: BacklogItem[];
  onClickItem: (item: BacklogItem) => void;
  onUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  onUpdatePriority: (id: string, newPriority: Priority) => void;
  onDeleteItem: (id: string) => void;
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
  onDeleteItem
}) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('sprint');
  const [sortBy, setSortBy] = useState<'priority' | 'code' | 'status'>('priority');
  const [sortAsc, setSortAsc] = useState(true);
  const [collapsedKeys, setCollapsedKeys] = useState<Set<string>>(new Set());
  const [itemToDelete, setItemToDelete] = useState<BacklogItem | null>(null);

  // Grouping logic
  const groupedData = useMemo(() => {
    // Sort items first
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
        key = it.targetSprint || 'Sin Sprint Definido';
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

    return Array.from(groups.entries()).map(([key, list]) => ({ key, items: list }));
  }, [items, groupBy, sortBy, sortAsc]);

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

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
          {items.length} ítems en vista
        </div>
      </div>

      {/* Tables by Group */}
      <div className="space-y-4">
        {groupedData.map((group) => {
          const doneCount = group.items.filter((i) => i.status === 'done').length;
          const progressPercent = group.items.length > 0 ? Math.round((doneCount / group.items.length) * 100) : 0;
          const isCollapsed = collapsedKeys.has(group.key);

          return (
            <div key={group.key} className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-white/[0.07] transition-all">
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
                  {isCollapsed && (
                    <span className="text-[11px] text-slate-400 font-mono italic">
                      (colapsado — click para ver)
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

              {/* Table Body (Visible only when expanded) */}
              {!isCollapsed && (
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
                        <th className="py-2.5 px-4">Release</th>
                        <th className="py-2.5 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                      {group.items.map((item) => {
                        const typeInfo = typeConfig[item.type] || typeConfig.feature;
                        const TypeIcon = typeInfo.icon;
                        const pInfo = priorityConfig[item.priority] || priorityConfig.p2;
                        const sInfo = statusLabels[item.status] || statusLabels.backlog;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer"
                            onClick={() => onClickItem(item)}
                          >
                            {/* Priority Column */}
                            <td className="py-2.5 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                              <select
                                value={item.priority}
                                onChange={(e) => onUpdatePriority(item.id, e.target.value as Priority)}
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
                                onChange={(e) => onUpdateStatus(item.id, e.target.value as ItemStatus)}
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

                            {/* Release */}
                            <td className="py-2.5 px-4 whitespace-nowrap">
                              {item.targetRelease ? (
                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20 font-mono text-[10px]">
                                  v{item.targetRelease}
                                </span>
                              ) : (
                                <span className="text-slate-400 dark:text-slate-600">—</span>
                              )}
                            </td>

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
              )}
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
    </div>
  );
};
