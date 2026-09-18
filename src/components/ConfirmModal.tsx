import { useEffect, useState, type FC } from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  detail,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  onConfirm,
  onClose
}) => {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter' && !loading) {
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
          iconBg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20',
          confirmBtn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20 focus:ring-rose-500'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
          iconBg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
          confirmBtn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20 focus:ring-amber-500'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
          iconBg: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20',
          confirmBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 focus:ring-indigo-500'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-t-2xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile bottom-sheet handle */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-white/20 rounded-full mx-auto my-2 sm:hidden" />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl border shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  aria-label="Cerrar modal"
                  title="Cerrar (Esc)"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 h-9 w-9 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {message}
              </p>

              {detail && (
                <div className="mt-3 px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/[0.06] text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                  {detail}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-end gap-2.5 pb-6 sm:pb-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.06] transition-colors active:scale-[0.98]"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`min-h-[44px] sm:min-h-[36px] px-5 py-2 rounded-lg text-xs font-medium shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] ${styles.confirmBtn} ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
