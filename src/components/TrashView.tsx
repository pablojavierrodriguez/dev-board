import { useState, type FC } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  Flame,
} from 'lucide-react';
import type { BacklogItem } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TrashViewProps {
  trashedItems: BacklogItem[];
  onRestore: (id: string) => Promise<void>;
  onPurge: (id: string) => Promise<void>;
}

export const TrashView: FC<TrashViewProps> = ({ trashedItems, onRestore, onPurge }) => {
  const [purgeTarget, setPurgeTarget] = useState<BacklogItem | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  const handleRestore = async (item: BacklogItem) => {
    setRestoringId(item.id);
    try {
      await onRestore(item.id);
    } finally {
      setRestoringId(null);
    }
  };

  const formatDeletedAt = (iso?: string) => {
    if (!iso) return 'Fecha desconocida';
    try {
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  return (
    <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.06] shrink-0">
        <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
          <Trash2 className="w-4 h-4 text-rose-500 dark:text-rose-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Papelera</h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {trashedItems.length === 0
              ? 'Sin elementos descartados'
              : `${trashedItems.length} ${trashedItems.length === 1 ? 'elemento' : 'elementos'} — restaurables o eliminables definitivamente`}
          </p>
        </div>
      </div>

      {/* Warning banner */}
      {trashedItems.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>
            Los ítems en la papelera están marcados como <strong>descartados</strong> pero sus archivos aún existen en disco. Puedes restaurarlos en cualquier momento o purgarlos definitivamente (irreversible).
          </span>
        </div>
      )}

      {/* Items list */}
      <div className="flex-1 overflow-y-auto py-4">
        {trashedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-5 rounded-2xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] mb-4">
              <Trash2 className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">La papelera está vacía</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Los ítems descartados aparecerán aquí
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {trashedItems.map((item) => (
              <div
                key={item.id}
                className="group flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all"
              >
                {/* Code badge */}
                <div className="shrink-0 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20">
                    {item.code}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                      <Clock className="w-2.5 h-2.5" />
                      {formatDeletedAt(item.deletedAt)}
                    </span>
                    {item.previousStatus && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] text-slate-500 dark:text-slate-400 font-mono">
                        era: {item.previousStatus}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={restoringId === item.id}
                    onClick={() => handleRestore(item)}
                    title="Restaurar ítem a su estado anterior"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                  >
                    {restoringId === item.id ? (
                      <span className="w-3 h-3 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    ) : (
                      <RotateCcw className="w-3 h-3" />
                    )}
                    <span className="hidden sm:inline">Restaurar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurgeTarget(item)}
                    title="Eliminar definitivamente (irreversible)"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
                  >
                    <Flame className="w-3 h-3" />
                    <span className="hidden sm:inline">Purgar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Purge confirmation modal */}
      {purgeTarget && (
        <ConfirmModal
          isOpen={!!purgeTarget}
          title="Purgar Tarea Definitivamente"
          message={`Esta acción eliminará físicamente el archivo del disco de forma irreversible. La tarea ${purgeTarget.code} se moverá al archivo de respaldo del sistema y no podrá restaurarse desde la interfaz.`}
          detail={purgeTarget.title}
          confirmText="Purgar Definitivamente"
          variant="danger"
          onConfirm={async () => {
            if (purgeTarget) await onPurge(purgeTarget.id);
          }}
          onClose={() => setPurgeTarget(null)}
        />
      )}
    </div>
  );
};
