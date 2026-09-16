import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { BacklogItem, ItemStatus, ViewMode, ColumnConfig } from '../types';
import { ItemCard } from './ItemCard';

interface KanbanBoardProps {
  items: BacklogItem[];
  viewMode: ViewMode;
  onUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  onDeleteItem: (id: string) => void;
  onClickItem: (item: BacklogItem) => void;
  onQuickAddItem: (status: ItemStatus) => void;
}

const SIMPLIFIED_COLUMNS: ColumnConfig[] = [
  {
    id: 'col-ideas',
    title: 'Ideas',
    subtitle: 'Triage & Descubrimiento',
    color: 'border-slate-300 dark:border-slate-700/60',
    dotColor: 'bg-sky-500',
    statuses: ['ideas'],
    dropTargetStatus: 'ideas'
  },
  {
    id: 'col-backlog',
    title: 'Backlog',
    subtitle: 'Priorizado y listo',
    color: 'border-slate-300 dark:border-slate-700/60',
    dotColor: 'bg-indigo-500',
    statuses: ['backlog'],
    dropTargetStatus: 'backlog'
  },
  {
    id: 'col-inprogress',
    title: 'In Progress',
    subtitle: 'Doing & Testing QA',
    color: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    statuses: ['in_progress', 'testing_qa'],
    dropTargetStatus: 'in_progress'
  },
  {
    id: 'col-done',
    title: 'Done',
    subtitle: 'Finish & Liberado',
    color: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    statuses: ['finish', 'done'],
    dropTargetStatus: 'done'
  }
];

const EXPANDED_COLUMNS: ColumnConfig[] = [
  {
    id: 'col-ideas',
    title: 'Ideas',
    subtitle: 'Triage & Specs',
    color: 'border-slate-300 dark:border-slate-700/60',
    dotColor: 'bg-sky-500',
    statuses: ['ideas'],
    dropTargetStatus: 'ideas'
  },
  {
    id: 'col-backlog',
    title: 'Backlog',
    subtitle: 'Listo para sprint',
    color: 'border-slate-300 dark:border-slate-700/60',
    dotColor: 'bg-indigo-500',
    statuses: ['backlog'],
    dropTargetStatus: 'backlog'
  },
  {
    id: 'col-inprogress',
    title: 'In Progress',
    subtitle: 'Desarrollo activo',
    color: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    statuses: ['in_progress'],
    dropTargetStatus: 'in_progress'
  },
  {
    id: 'col-testing',
    title: 'Testing/QA',
    subtitle: 'Verificación en curso',
    color: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    statuses: ['testing_qa'],
    dropTargetStatus: 'testing_qa'
  },
  {
    id: 'col-finish',
    title: 'Finish',
    subtitle: 'Ready for deploy',
    color: 'border-teal-500/30',
    dotColor: 'bg-teal-500',
    statuses: ['finish'],
    dropTargetStatus: 'finish'
  },
  {
    id: 'col-done',
    title: 'Done',
    subtitle: 'Liberado / Deployed',
    color: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    statuses: ['done'],
    dropTargetStatus: 'done'
  }
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  items,
  viewMode,
  onUpdateStatus,
  onDeleteItem,
  onClickItem,
  onQuickAddItem
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);

  const columns = viewMode === 'simplificada' ? SIMPLIFIED_COLUMNS : EXPANDED_COLUMNS;

  const handleDragStart = (e: React.DragEvent, item: BacklogItem) => {
    setDraggedItemId(item.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setActiveDropColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== columnId) {
      setActiveDropColumn(columnId);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, columnId: string) => {
    if (activeDropColumn === columnId) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ItemStatus) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      onUpdateStatus(itemId, targetStatus);
    }
    setDraggedItemId(null);
    setActiveDropColumn(null);
  };

  return (
    <div className="w-full flex-1 overflow-x-auto p-4 sm:p-6">
      <div 
        className="grid gap-4 min-w-[960px] pb-6"
        style={{
          gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))`
        }}
      >
        {columns.map((col) => {
          const colItems = items.filter((item) => col.statuses.includes(item.status));
          const isDropActive = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.dropTargetStatus)}
              className={`flex flex-col rounded-2xl p-3 kanban-col transition-all duration-150 min-h-[500px] ${
                isDropActive
                  ? 'border-indigo-500/60 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                  : ''
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <div>
                    <h3 className="font-semibold text-xs tracking-tight text-slate-800 dark:text-slate-200">
                      {col.title}
                    </h3>
                    {col.subtitle && (
                      <p className="text-[10px] text-slate-500 hidden xl:block">
                        {col.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-white/[0.04]">
                    {colItems.length}
                  </span>
                </div>

                <button
                  onClick={() => onQuickAddItem(col.dropTargetStatus)}
                  title={`Nuevo ítem en ${col.title}`}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/[0.08] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-0.5">
                {colItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onClick={() => onClickItem(item)}
                    onUpdateStatus={onUpdateStatus}
                    onDelete={onDeleteItem}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  />
                ))}

                {colItems.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-300 dark:border-white/[0.06] text-slate-400 dark:text-slate-600 text-xs">
                    <p>Sin ítems en {col.title}</p>
                    <button
                      onClick={() => onQuickAddItem(col.dropTargetStatus)}
                      className="mt-2 text-[11px] text-indigo-500 dark:text-indigo-400 hover:underline font-medium"
                    >
                      + Agregar ítem
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
