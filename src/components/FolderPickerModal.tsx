import { useState, useEffect, type FC } from 'react';
import { 
  Folder, 
  FolderOpen, 
  CornerLeftUp, 
  GitBranch, 
  BookOpen, 
  Check, 
  X, 
  RefreshCw, 
  ArrowRight,
  FolderSearch
} from 'lucide-react';
import { browseDirectory, type FsBrowseResult } from '../api';
import type { StorageType } from '../types';

interface FolderPickerModalProps {
  isOpen: boolean;
  initialPath?: string;
  onSelect: (selectedPath: string, autoDetected?: { storageType: StorageType; nameSuggestion?: string }) => void;
  onClose: () => void;
}

export const FolderPickerModal: FC<FolderPickerModalProps> = ({
  isOpen,
  initialPath,
  onSelect,
  onClose
}) => {
  const [data, setData] = useState<FsBrowseResult | null>(null);
  const [inputPath, setInputPath] = useState(initialPath || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDir = async (targetDir?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await browseDirectory(targetDir);
      setData(result);
      setInputPath(result.currentPath);
    } catch (err: any) {
      setError(err.message || 'No se pudo leer la carpeta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadDir(initialPath);
    }
  }, [isOpen, initialPath]);

  if (!isOpen) return null;

  const handleSelectCurrent = () => {
    const selected = data?.currentPath || inputPath.trim();
    if (!selected) return;
    const pathParts = selected.split(/[/\\]/).filter(Boolean);
    const folderName = pathParts[pathParts.length - 1] || 'Proyecto';
    
    // Auto capitalize/format folder name
    const formattedName = folderName
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    onSelect(selected, {
      storageType: data?.hasBacklog ? 'markdown' : 'json',
      nameSuggestion: formattedName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <FolderSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Explorador de Carpetas Local
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Navega en tu disco para seleccionar el directorio de tu proyecto o repositorio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Path Bar + Navigation */}
        <div className="p-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2">
          <button
            onClick={() => data?.parentPath && loadDir(data.parentPath)}
            disabled={!data?.parentPath || loading}
            title="Subir un nivel"
            className="p-2 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.08] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <CornerLeftUp className="w-4 h-4" />
          </button>

          <div className="relative flex-1">
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadDir(inputPath);
                }
              }}
              placeholder="/ruta/a/tu/proyecto o C:\..."
              className="w-full pl-3 pr-8 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={() => loadDir(inputPath)}
              disabled={loading}
              title="Ir a la ruta"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick jump shortcuts */}
        <div className="px-3 py-1.5 bg-slate-100/70 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.06] flex items-center gap-2 text-[11px] overflow-x-auto">
          <span className="text-slate-400 font-medium whitespace-nowrap">Accesos rápidos:</span>
          {data?.parentPath && (
            <button
              type="button"
              onClick={() => loadDir(data.parentPath!)}
              className="px-2 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-colors"
            >
              Carpeta superior (..)
            </button>
          )}
          <button
            type="button"
            onClick={() => loadDir('.')}
            className="px-2 py-0.5 rounded bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 whitespace-nowrap transition-colors"
          >
            DevBoard actual
          </button>
        </div>

        {/* Warning notification */}
        {data?.warning && (
          <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs flex items-start gap-2">
            <span className="font-semibold text-amber-800 dark:text-amber-200 shrink-0">Aviso:</span>
            <span className="flex-1">{data.warning}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="px-5 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => loadDir()} 
              className="underline font-medium hover:text-rose-700"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {/* Directory Listing */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-[260px] max-h-[360px]">
          {loading && !data && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <span>Cargando carpetas...</span>
            </div>
          )}

          {data && data.folders.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-xs gap-1">
              <FolderOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-1" />
              <p className="font-medium text-slate-600 dark:text-slate-300">No hay subcarpetas aquí</p>
              <p className="text-[11px]">Puedes seleccionar esta carpeta con el botón de abajo</p>
            </div>
          )}

          {data && data.folders.map((folder) => (
            <div
              key={folder.path}
              onClick={() => loadDir(folder.path)}
              className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.05] cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Folder className="w-4 h-4 text-amber-500/90 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                  {folder.name}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {folder.isGit && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                    <GitBranch className="w-2.5 h-2.5" />
                    Git
                  </span>
                )}
                {folder.hasBacklog && (
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-semibold">
                    <BookOpen className="w-2.5 h-2.5" />
                    Backlog.md
                  </span>
                )}
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Current Folder Diagnostics Box */}
        {data && (
          <div className="px-5 py-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Carpeta Seleccionada
              </div>
              <div className="font-mono text-slate-700 dark:text-slate-300 truncate text-[11px]">
                {data.currentPath}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {data.isGit && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-medium">
                  Repo Git
                </span>
              )}
              {data.hasBacklog && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-medium">
                  Backlog.md
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3.5 bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSelectCurrent}
            disabled={!data && !inputPath.trim()}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Seleccionar Esta Carpeta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
