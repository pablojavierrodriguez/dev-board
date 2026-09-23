import React, { useState, useEffect, type FC } from 'react';
import { X, FolderPlus, FileCode, Database, Check, FolderSearch, AlertCircle } from 'lucide-react';
import type { Project, StorageType } from '../types';
import { detectPathStorage } from '../api';
import { FolderPickerModal } from './FolderPickerModal';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
}

export const ProjectModal: FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [codePrefix, setCodePrefix] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [description, setDescription] = useState('');
  const [storageType, setStorageType] = useState<StorageType>('markdown');
  const [detectedEngine, setDetectedEngine] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFolderPicker, setShowFolderPicker] = useState(false);

  // Auto-detection when repoPath changes
  useEffect(() => {
    if (!repoPath.trim()) {
      setDetectedEngine(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const detection = await detectPathStorage(repoPath.trim());
        if (detection.storageType === 'markdown') {
          setDetectedEngine('markdown');
          setStorageType('markdown');
        } else {
          setDetectedEngine('json');
        }
      } catch {
        const clean = repoPath.toLowerCase();
        if (clean.includes('backlog')) {
          setDetectedEngine('markdown');
          setStorageType('markdown');
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [repoPath]);

  // Reset errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !codePrefix.trim()) {
      setError('El nombre del proyecto y el prefijo de código son obligatorios.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        codePrefix: codePrefix.trim().toUpperCase().replace(/[^A-Z0-9]/g, ''),
        repoPath: repoPath.trim() || undefined,
        description: description.trim() || undefined,
        storageType
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
        <div 
          className="w-full max-w-lg glass-panel bg-[#0d1322]/95 rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-none flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile bottom-sheet handle */}
          <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2 sm:hidden shrink-0" />

          <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FolderPlus className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-semibold text-slate-100">Nuevo Proyecto</h3>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar modal"
              title="Cerrar (Esc)"
              className="h-9 w-9 flex items-center justify-center rounded text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 font-medium mb-1">Nombre del Proyecto *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Core API / Web Platform"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Prefijo de Código (Tickets) *</label>
              <input
                type="text"
                value={codePrefix}
                onChange={(e) => setCodePrefix(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="Ej: API, CORE, BACK"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Ruta Local del Repositorio</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={repoPath}
                  onChange={(e) => setRepoPath(e.target.value)}
                  placeholder="/Users/.../mi-proyecto o C:\..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowFolderPicker(true)}
                  title="Explorar el sistema de archivos"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5 font-medium transition-colors shrink-0"
                >
                  <FolderSearch className="w-3.5 h-3.5" />
                  <span>Explorar</span>
                </button>
              </div>

              {detectedEngine === 'markdown' && (
                <p className="mt-1.5 text-[11px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3 shrink-0" />
                  <span>Estructura Markdown (.md) detectada en la carpeta. Se preseleccionó motor Markdown.</span>
                </p>
              )}
            </div>

            {/* Motor de Almacenamiento */}
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Motor de Persistencia (Storage Engine)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div 
                  onClick={() => setStorageType('markdown')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    storageType === 'markdown'
                      ? 'bg-indigo-600/15 border-indigo-500/50 ring-1 ring-indigo-500/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <FileCode className={`w-4 h-4 ${storageType === 'markdown' ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="font-semibold text-slate-200">Markdown (.md)</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Tareas en <code className="text-indigo-300 font-mono">backlog/tasks/*.md</code>. Cero merge conflicts en Git y apto para agentes de IA.
                  </p>
                </div>

                <div 
                  onClick={() => setStorageType('json')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    storageType === 'json'
                      ? 'bg-amber-600/15 border-amber-500/50 ring-1 ring-amber-500/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Database className={`w-4 h-4 ${storageType === 'json' ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="font-semibold text-slate-200">JSON Clásico</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Un solo archivo <code className="text-amber-300 font-mono">.devboard/backlog.json</code>.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Objetivo o alcance del proyecto..."
                rows={2}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08] pb-6 sm:pb-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 transition-colors active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || !codePrefix.trim()}
                className="min-h-[44px] sm:min-h-[36px] px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Visual File Explorer Modal */}
      <FolderPickerModal
        isOpen={showFolderPicker}
        initialPath={repoPath || undefined}
        onSelect={(selectedPath, autoDetected) => {
          setRepoPath(selectedPath);
          if (autoDetected?.storageType) {
            setStorageType(autoDetected.storageType);
            setDetectedEngine(autoDetected.storageType);
          }
          if (!name.trim() && autoDetected?.nameSuggestion) {
            setName(autoDetected.nameSuggestion);
            const words = autoDetected.nameSuggestion.split(' ');
            const prefix = words.length > 1
              ? words.map(w => w[0]).join('').slice(0, 4)
              : autoDetected.nameSuggestion.slice(0, 4);
            if (!codePrefix.trim()) {
              setCodePrefix(prefix.toUpperCase());
            }
          }
        }}
        onClose={() => setShowFolderPicker(false)}
      />
    </>
  );
};
