import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { BacklogItem, ItemStatus, ViewMode, ColumnConfig } from '../types';
import { ItemCard } from './ItemCard';

interface KanbanBoardProps {
  items: BacklogItem[];
  viewMode: ViewMode;
  onUpdateStatus: (id: string, newStatus: ItemStatus, targetColId?: string, targetIndex?: number) => void;
  onDeleteItem: (id: string) => void;
  onClickItem: (item: BacklogItem) => void;
  onQuickAddItem: (status: ItemStatus) => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const SIMPLIFIED_COLUMNS: ColumnConfig[] = [
  {
    id: 'col-draft',
    title: 'Draft',
    subtitle: 'Backlog & Ideas',
    color: 'border-slate-300 dark:border-slate-700/60',
    dotColor: 'bg-indigo-500',
    statuses: ['draft', 'ideas', 'backlog'],
    dropTargetStatus: 'draft'
  },
  {
    id: 'col-doing',
    title: 'Doing',
    subtitle: 'Desarrollo activo',
    color: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    statuses: ['doing', 'in_progress'],
    dropTargetStatus: 'doing'
  },
  {
    id: 'col-review-ready',
    title: 'Review & Ready',
    subtitle: 'QA & Listo para deploy',
    color: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    statuses: ['review', 'testing_qa', 'ready', 'finish'],
    dropTargetStatus: 'review'
  },
  {
    id: 'col-done',
    title: 'Done',
    subtitle: 'Deployed & Liberado',
    color: 'border-emerald-500/30',
    dotColor: 'bg-emerald-500',
    statuses: ['done'],
    dropTargetStatus: 'done'
  }
];

export const EXPANDED_COLUMNS: ColumnConfig[] = [
  {
    id: 'col-draft',
    title: 'Draft',
    subtitle: 'Backlog & Triaged',
    color: 'border-slate-300 dark:border-slate-700/60',
    dotColor: 'bg-indigo-500',
    statuses: ['draft', 'ideas', 'backlog'],
    dropTargetStatus: 'draft'
  },
  {
    id: 'col-doing',
    title: 'Doing',
    subtitle: 'Desarrollo activo',
    color: 'border-amber-500/30',
    dotColor: 'bg-amber-500',
    statuses: ['doing', 'in_progress'],
    dropTargetStatus: 'doing'
  },
  {
    id: 'col-review',
    title: 'Review',
    subtitle: 'Testing & Code Review',
    color: 'border-purple-500/30',
    dotColor: 'bg-purple-500',
    statuses: ['review', 'testing_qa'],
    dropTargetStatus: 'review'
  },
  {
    id: 'col-ready',
    title: 'Ready',
    subtitle: 'Ready for deploy',
    color: 'border-teal-500/30',
    dotColor: 'bg-teal-500',
    statuses: ['ready', 'finish'],
    dropTargetStatus: 'ready'
  },
  {
    id: 'col-done',
    title: 'Done',
    subtitle: 'Deployed & Cerrado',
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
  onQuickAddItem,
  onShowToast
}) => {
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [activeDropColumn, setActiveDropColumn] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{ colId: string; index: number } | null>(null);

  const columns = viewMode === 'simplificada' ? SIMPLIFIED_COLUMNS : EXPANDED_COLUMNS;

  const handleDragStart = (e: React.DragEvent, item: BacklogItem) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
    window.setTimeout(() => {
      setDraggedItemId(item.id);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setActiveDropColumn(null);
    setDropTarget(null);
  };

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setActiveDropColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== columnId) {
      setActiveDropColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    // Only clear if the cursor actually leaves the column element
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (activeDropColumn === columnId) {
        setActiveDropColumn(null);
        setDropTarget(null);
      }
    }
  };

  const handleCardDragOver = (e: React.DragEvent, colId: string, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== colId) {
      setActiveDropColumn(colId);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const targetIdx = e.clientY < midY ? index : index + 1;
    setDropTarget({ colId, index: targetIdx });
  };

  const handleDrop = (e: React.DragEvent, col: ColumnConfig, specificIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    const itemId = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (itemId) {
      const draggedItem = items.find((i) => i.id === itemId);
      let newStatus: ItemStatus;

      // Si el ítem ya pertenecía a esta columna, preservamos su sub-estado original
      // (ej. 'ideas' o 'backlog' en Draft; 'in_progress' en Doing; 'ready' en Review & Ready)
      if (draggedItem && col.statuses.includes(draggedItem.status)) {
        newStatus = draggedItem.status;
      } else {
        newStatus = col.dropTargetStatus;
      }

      const idx = specificIndex !== undefined ? specificIndex : (dropTarget?.colId === col.id ? dropTarget.index : undefined);
      onUpdateStatus(itemId, newStatus, col.id, idx);
    }
    setDraggedItemId(null);
    setActiveDropColumn(null);
    setDropTarget(null);
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
          const colItems = items
            .filter((item) => col.statuses.includes(item.status))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
          const isDropActive = activeDropColumn === col.id;

          return (
            <div
              key={col.id}
              onDragEnter={(e) => handleDragEnter(e, col.id)}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col)}
              className={`flex flex-col rounded-2xl p-3 kanban-col transition-all duration-200 min-h-[520px] ${
                isDropActive
                  ? 'drop-target-active'
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
              <div 
                className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-0.5"
                onDragOver={(e) => {
                  e.preventDefault();
                  if (activeDropColumn !== col.id) setActiveDropColumn(col.id);
                  if (e.target === e.currentTarget) {
                    setDropTarget({ colId: col.id, index: colItems.length });
                  }
                }}
              >
                {colItems.map((item, idx) => {
                  const isItemDragged = draggedItemId === item.id;
                  return (
                    <div 
                      key={item.id} 
                      className={`relative transition-all duration-150 ${isItemDragged ? 'h-0 overflow-hidden opacity-0 pointer-events-none' : ''}`}
                    >
                      {/* Top drop indicator */}
                      {isDropActive && dropTarget?.colId === col.id && dropTarget?.index === idx && !isItemDragged && (
                        <div className="drop-indicator" />
                      )}

                      <div
                        onDragOver={(e) => handleCardDragOver(e, col.id, idx)}
                        onDrop={(e) => handleDrop(e, col, dropTarget?.index ?? idx)}
                      >
                        <ItemCard
                          item={item}
                          isDragging={isItemDragged}
                          onClick={() => onClickItem(item)}
                          onUpdateStatus={(id, s) => onUpdateStatus(id, s)}
                          onDelete={onDeleteItem}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onShowToast={onShowToast}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Bottom drop indicator when dragging past last item */}
                {isDropActive && dropTarget?.colId === col.id && dropTarget?.index === colItems.length && (
                  <div className="drop-indicator" />
                )}

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
