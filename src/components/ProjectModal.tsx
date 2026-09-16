import React, { useState } from 'react';
import { X, FolderPlus } from 'lucide-react';
import type { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Partial<Project>) => Promise<void>;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [codePrefix, setCodePrefix] = useState('');
  const [repoPath, setRepoPath] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !codePrefix.trim()) {
      alert('Nombre y Prefijo de código son obligatorios');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        codePrefix: codePrefix.trim().toUpperCase(),
        repoPath: repoPath.trim() || undefined,
        description: description.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      alert(`Error al crear proyecto: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md glass-panel bg-[#0d1322]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FolderPlus className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-semibold text-slate-100">Nuevo Proyecto</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Nombre del Proyecto *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Core API / Web Platform"
              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Prefijo de Código (Tickets) *</label>
            <input
              type="text"
              value={codePrefix}
              onChange={(e) => setCodePrefix(e.target.value.toUpperCase())}
              placeholder="Ej: API, CORE, DOM"
              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Ruta Local del Repositorio (Opcional)</label>
            <input
              type="text"
              value={repoPath}
              onChange={(e) => setRepoPath(e.target.value)}
              placeholder="/Users/.../mi-proyecto"
              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Breve propósito de este proyecto..."
              className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !codePrefix.trim()}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
