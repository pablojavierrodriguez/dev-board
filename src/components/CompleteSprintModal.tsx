import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, ArrowRight, Layers } from 'lucide-react';
import type { Sprint, BacklogItem } from '../types';

interface CompleteSprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  sprint: Sprint;
  sprintItems: BacklogItem[];
  availablePlannedSprints: Sprint[];
  onConfirm: (destinationSprintId: string | '') => Promise<void>;
}

export const CompleteSprintModal: React.FC<CompleteSprintModalProps> = ({
  isOpen,
  onClose,
  sprint,
  sprintItems,
  availablePlannedSprints,
  onConfirm,
}) => {
  const [destination, setDestination] = useState<string>(''); // '' means Backlog
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const completedItems = sprintItems.filter((i) => i.status === 'done' || i.status === 'ready' || i.status === 'finish');
  const incompleteItems = sprintItems.filter((i) => !(i.status === 'done' || i.status === 'ready' || i.status === 'finish'));

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(destination);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-white/[0.08] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Completar {sprint.name}
              </h2>
              <p className="text-xs text-slate-400">
                Cierre de iteración y balance de tareas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Completadas</span>
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-800 dark:text-emerald-200">
                {completedItems.length}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400/80">
                tareas cerradas con éxito
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold mb-1">
                <AlertCircle className="w-4 h-4" />
                <span>Pendientes</span>
              </div>
              <div className="text-2xl font-bold font-mono text-amber-800 dark:text-amber-200">
                {incompleteItems.length}
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400/80">
                tareas no finalizadas
              </div>
            </div>
          </div>

          {/* Incomplete Tasks Handling */}
          {incompleteItems.length > 0 ? (
            <div className="space-y-2 pt-1">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mover {incompleteItems.length} tareas pendientes a:
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Backlog General
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Devolver tareas al backlog para repriorizarlas
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="destination"
                    checked={destination === ''}
                    onChange={() => setDestination('')}
                    className="text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {availablePlannedSprints.map((pSprint) => (
                  <label 
                    key={pSprint.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {pSprint.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Mover directo al siguiente sprint planificado
                        </div>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="destination"
                      checked={destination === pSprint.name}
                      onChange={() => setDestination(pSprint.name)}
                      className="text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] text-center text-slate-500 dark:text-slate-400 text-xs">
              🎉 ¡Excelente trabajo! Todas las tareas de este sprint fueron completadas.
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? 'Completando...' : 'Completar Sprint'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
