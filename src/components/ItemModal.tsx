import { useState, useEffect, type FC } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Sparkles 
} from 'lucide-react';
import type { BacklogItem, ItemStatus, ItemType, Priority, Project } from '../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BacklogItem | null; // null means create new item
  defaultStatus?: ItemStatus;
  projects: Project[];
  availableModules: string[];
  onSave: (itemData: Partial<BacklogItem>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ItemModal: FC<ItemModalProps> = ({
  isOpen,
  onClose,
  item,
  defaultStatus = 'backlog',
  projects,
  availableModules,
  onSave,
  onDelete
}) => {
  const isEditing = !!item;

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [projectId, setProjectId] = useState('dom');
  const [type, setType] = useState<ItemType>('feature');
  const [priority, setPriority] = useState<Priority>('p2');
  const [status, setStatus] = useState<ItemStatus>(defaultStatus);
  const [module, setModule] = useState('');
  const [impactedFile, setImpactedFile] = useState('');
  const [targetSprint, setTargetSprint] = useState('');
  const [targetRelease, setTargetRelease] = useState('');
  const [description, setDescription] = useState('');
  const [risk, setRisk] = useState('');
  const [fix, setFix] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form when item changes or modal opens
  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setCode(item.code || '');
      setProjectId(item.projectId || 'dom');
      setType(item.type || 'feature');
      setPriority(item.priority || 'p2');
      setStatus(item.status || 'backlog');
      setModule(item.module || '');
      setImpactedFile(item.impactedFile || '');
      setTargetSprint(item.targetSprint || '');
      setTargetRelease(item.targetRelease || '');
      setDescription(item.description || '');
      setRisk(item.risk || '');
      setFix(item.fix || '');
    } else {
      // New item defaults
      setTitle('');
      setCode('');
      setProjectId(projects[0]?.id || 'dom');
      setType('feature');
      setPriority('p2');
      setStatus(defaultStatus);
      setModule('');
      setImpactedFile('');
      setTargetSprint('');
      setTargetRelease('');
      setDescription('');
      setRisk('');
      setFix('');
    }
  }, [item, defaultStatus, isOpen, projects]);

  // Keyboard shortcut listener: Esc closes, Cmd+Enter saves
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, code, projectId, type, priority, status, module, impactedFile, targetSprint, targetRelease, description, risk, fix]);

  const handleFormSubmit = async () => {
    if (!title.trim()) {
      alert('Por favor especifica un título para el ítem');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        id: item?.id,
        title: title.trim(),
        code: code.trim() || undefined,
        projectId,
        type,
        priority,
        status,
        module: module.trim() || undefined,
        impactedFile: impactedFile.trim() || undefined,
        targetSprint: targetSprint.trim() || undefined,
        targetRelease: targetRelease.trim() || undefined,
        description: description.trim(),
        risk: risk.trim() || undefined,
        fix: fix.trim() || undefined
      });
      onClose();
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-3xl glass-panel bg-[#0d1322]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                {isEditing ? `Editar Ítem ${item.code}` : 'Crear Nuevo Ítem'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing ? 'Modifica los atributos, estado o detalles técnicos' : 'Completa la información para sumar un nuevo requerimiento o bug'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Título del Ítem <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Salto de márgenes al alternar transacciones..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* Row 1: Code, Project, Type, Priority */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Código</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Auto-generado"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Proyecto</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0e1626]">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ItemType)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="bug" className="bg-[#0e1626]">🐛 Bug</option>
                <option value="feature" className="bg-[#0e1626]">🚀 Evolutivo / Feature</option>
                <option value="tech_debt" className="bg-[#0e1626]">🛠️ Deuda Técnica</option>
                <option value="ux" className="bg-[#0e1626]">🎨 UX / Polish</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="p0" className="bg-[#0e1626] text-rose-400">P0 (Crítico / Blocker) 🔴</option>
                <option value="p1" className="bg-[#0e1626] text-amber-400">P1 (Alto) 🟠</option>
                <option value="p2" className="bg-[#0e1626] text-yellow-400">P2 (Medio) 🟡</option>
                <option value="p3" className="bg-[#0e1626] text-slate-400">P3 (Bajo) ⚪</option>
              </select>
            </div>
          </div>

          {/* Row 2: Status, Module, Impacted File */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Estado</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ItemStatus)}
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              >
                <option value="ideas" className="bg-[#0e1626]">Ideas</option>
                <option value="backlog" className="bg-[#0e1626]">Backlog</option>
                <option value="in_progress" className="bg-[#0e1626]">In Progress</option>
                <option value="testing_qa" className="bg-[#0e1626]">Testing/QA</option>
                <option value="finish" className="bg-[#0e1626]">Finish (Ready for Deploy)</option>
                <option value="done" className="bg-[#0e1626]">Done (Deployed)</option>
                <option value="dismissed" className="bg-[#0e1626]">Descartado (Oculto)</option>
                <option value="cancelled" className="bg-[#0e1626]">Cancelado (Oculto)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Módulo / Área</label>
              <input
                type="text"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                placeholder="Ej: UI / Layout"
                list="modules-list"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
              <datalist id="modules-list">
                {availableModules.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Archivo Impactado</label>
              <input
                type="text"
                value={impactedFile}
                onChange={(e) => setImpactedFile(e.target.value)}
                placeholder="src/components/TransactionList.tsx"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Row 3: Target Sprint & Target Release */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Sprint</label>
              <input
                type="text"
                value={targetSprint}
                onChange={(e) => setTargetSprint(e.target.value)}
                placeholder="Ej: Integridad Financiera"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Release</label>
              <input
                type="text"
                value={targetRelease}
                onChange={(e) => setTargetRelease(e.target.value)}
                placeholder="Ej: 0.6.0"
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">Descripción / Problema</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalle exhaustivo del problema o requerimiento..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

          {/* Risk & Fix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Riesgo / Impacto</label>
              <textarea
                value={risk}
                onChange={(e) => setRisk(e.target.value)}
                rows={2}
                placeholder="Riesgo de correctitud, regresión o seguridad..."
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Fix / Criterio de Aceptación</label>
              <textarea
                value={fix}
                onChange={(e) => setFix(e.target.value)}
                rows={2}
                placeholder="Solución técnica implementada o esperada..."
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={async () => {
                  if (confirm(`¿Eliminar definitivamente ${item.code}?`)) {
                    await onDelete(item.id);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400/90 hover:bg-rose-500/10 text-xs font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 transition-colors"
            >
              Cancelar (Esc)
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar (⌘↵)'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
