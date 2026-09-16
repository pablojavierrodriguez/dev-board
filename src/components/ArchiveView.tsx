import { useState, type FC } from 'react';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  ArchiveX, 
  Ban, 
  Search
} from 'lucide-react';
import type { BacklogItem, ItemStatus } from '../types';
import { typeConfig, priorityConfig } from './ItemCard';
import { ConfirmModal } from './ConfirmModal';

interface ArchiveViewProps {
  items: BacklogItem[];
  onRestoreItem: (id: string, targetStatus: ItemStatus) => void;
  onDeleteItem: (id: string) => void;
  onClickItem: (item: BacklogItem) => void;
}

export const ArchiveView: FC<ArchiveViewProps> = ({
  items,
  onRestoreItem,
  onDeleteItem,
  onClickItem
}) => {
  const [filterType, setFilterType] = useState<'all' | 'dismissed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [itemToDelete, setItemToDelete] = useState<BacklogItem | null>(null);

  const archivedItems = items.filter((it) => {
    const isArchived = it.status === 'dismissed' || it.status === 'cancelled';
    if (!isArchived) return false;
    if (filterType !== 'all' && it.status !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        it.title.toLowerCase().includes(q) ||
        it.code.toLowerCase().includes(q) ||
        (it.module && it.module.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const dismissedCount = items.filter((i) => i.status === 'dismissed').length;
  const cancelledCount = items.filter((i) => i.status === 'cancelled').length;

  return (
    <div className="w-full flex-1 p-4 sm:p-6 max-w-[1680px] mx-auto overflow-y-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
              <Archive className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">
              Archivo & Descartados
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Ítems retirados del tablero activo sin eliminar su historial. Puedes restaurarlos en cualquier momento al Backlog o Ideas.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({dismissedCount + cancelledCount})
            </button>
            <button
              onClick={() => setFilterType('dismissed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'dismissed'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ArchiveX className="w-3.5 h-3.5" />
              <span>Descartados ({dismissedCount})</span>
            </button>
            <button
              onClick={() => setFilterType('cancelled')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-colors ${
                filterType === 'cancelled'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancelados ({cancelledCount})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-sm">
        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar en archivados..."
          className="w-full pl-8 pr-4 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      {/* Archived List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/[0.07]">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02] text-slate-400 font-mono text-[11px]">
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Título</th>
              <th className="py-3 px-4">Tipo</th>
              <th className="py-3 px-4">Prioridad</th>
              <th className="py-3 px-4">Módulo</th>
              <th className="py-3 px-4 text-right">Restaurar / Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {archivedItems.map((item) => {
              const typeInfo = typeConfig[item.type] || typeConfig.feature;
              const TypeIcon = typeInfo.icon;
              const pInfo = priorityConfig[item.priority] || priorityConfig.p2;

              return (
                <tr
                  key={item.id}
                  onClick={() => onClickItem(item)}
                  className="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  {/* Status badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {item.status === 'dismissed' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-medium">
                        <ArchiveX className="w-3 h-3" />
                        <span>Descartado</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[10px] font-medium">
                        <Ban className="w-3 h-3" />
                        <span>Cancelado</span>
                      </span>
                    )}
                  </td>

                  {/* Code */}
                  <td className="py-3 px-4 font-mono font-semibold text-slate-300 whitespace-nowrap">
                    {item.code}
                  </td>

                  {/* Title */}
                  <td className="py-3 px-4 min-w-[280px]">
                    <div className="font-medium text-slate-200 line-clamp-1 group-hover:text-indigo-200 transition-colors">
                      {item.title}
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeInfo.badge}`}>
                      <TypeIcon className="w-3 h-3" />
                      <span>{typeInfo.label}</span>
                    </span>
                  </td>

                  {/* Priority */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${pInfo.dot}`} />
                      <span className={`text-[11px] ${pInfo.text}`}>{pInfo.label}</span>
                    </div>
                  </td>

                  {/* Module */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                    {item.module || '—'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onRestoreItem(item.id, 'draft')}
                        title="Restaurar a Draft"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-medium transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restaurar</span>
                      </button>

                      <button
                        onClick={() => setItemToDelete(item)}
                        title="Eliminar permanentemente"
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

        {archivedItems.length === 0 && (
          <div className="py-12 text-center text-slate-500 text-xs">
            No hay ítems en el archivo con los filtros seleccionados.
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Eliminar Ítem Definitivamente"
        message={`¿Estás seguro de que deseas eliminar permanentemente el ítem archivado ${itemToDelete?.code}?`}
        detail={itemToDelete?.title}
        confirmText="Eliminar Definitivamente"
        variant="danger"
        onConfirm={() => {
          if (itemToDelete) onDeleteItem(itemToDelete.id);
        }}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
