import { useState, useEffect, type FC } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Sparkles,
  CheckSquare,
  Plus,
  Trash,
  AlertCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import type { BacklogItem, ItemStatus, ItemType, Priority, Project, AcceptanceCriterion } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BacklogItem | null; // null means create new item
  defaultStatus?: ItemStatus;
  projects: Project[];
  availableModules: string[];
  onSave: (itemData: Partial<BacklogItem> & { expectedMtime?: number; force?: boolean }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const ItemModal: FC<ItemModalProps> = ({
  isOpen,
  onClose,
  item,
  defaultStatus = 'draft',
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
  const [implementationPlan, setImplementationPlan] = useState('');
  const [acceptanceCriteriaList, setAcceptanceCriteriaList] = useState<AcceptanceCriterion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictItem, setConflictItem] = useState<BacklogItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const populateFromItem = (source: BacklogItem) => {
    setTitle(source.title || '');
    setCode(source.code || '');
    setProjectId(source.projectId || 'dom');
    setType(source.type || 'feature');
    setPriority(source.priority || 'p2');
    setStatus(source.status || 'backlog');
    setModule(source.module || '');
    setImpactedFile(source.impactedFile || '');
    setTargetSprint(source.targetSprint || '');
    setTargetRelease(source.targetRelease || '');
    setDescription(source.description || '');
    setRisk(source.risk || '');
    setFix(source.fix || '');
    setImplementationPlan(source.implementationPlan || '');
    setAcceptanceCriteriaList(source.acceptanceCriteriaList || []);
  };

  // Initialize form when item changes or modal opens
  useEffect(() => {
    setFormError(null);
    setConflictItem(null);
    setShowDeleteConfirm(false);
    if (item) {
      populateFromItem(item);
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
      setImplementationPlan('');
      setAcceptanceCriteriaList([]);
    }
  }, [item, defaultStatus, isOpen, projects]);

  // Keyboard shortcut listener: Esc closes, Cmd+Enter saves
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !showDeleteConfirm) {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleFormSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, title, code, projectId, type, priority, status, module, impactedFile, targetSprint, targetRelease, description, risk, fix, showDeleteConfirm]);

  const handleFormSubmit = async (force = false) => {
    if (!title.trim()) {
      setFormError('Por favor especifica un título para el ítem');
      return;
    }

    setFormError(null);
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
        fix: fix.trim() || undefined,
        implementationPlan: implementationPlan.trim() || undefined,
        acceptanceCriteriaList,
        expectedMtime: item?.mtime,
        force
      });
      setConflictItem(null);
      onClose();
    } catch (err: any) {
      if (err.status === 409 && err.currentItem) {
        setConflictItem(err.currentItem);
        setFormError('Conflicto detectado: la tarea fue modificada en disco por otro proceso o agente.');
      } else {
        setFormError(`Error al guardar: ${err.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCriterion = () => {
    const nextIdx = acceptanceCriteriaList.length + 1;
    setAcceptanceCriteriaList([
      ...acceptanceCriteriaList,
      { index: nextIdx, text: '', checked: false }
    ]);
  };

  const handleToggleCriterion = (index: number) => {
    setAcceptanceCriteriaList(
      acceptanceCriteriaList.map(c => c.index === index ? { ...c, checked: !c.checked } : c)
    );
  };

  const handleUpdateCriterionText = (index: number, text: string) => {
    setAcceptanceCriteriaList(
      acceptanceCriteriaList.map(c => c.index === index ? { ...c, text } : c)
    );
  };

  const handleRemoveCriterion = (index: number) => {
    setAcceptanceCriteriaList(
      acceptanceCriteriaList.filter(c => c.index !== index).map((c, i) => ({ ...c, index: i + 1 }))
    );
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
          {conflictItem && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-col gap-2.5 animate-in fade-in">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-300">Modificación concurrente en disco:</span> Esta tarea fue modificada externamente (por un agente o en el sistema de archivos) mientras la editabas. Puedes cargar los datos frescos de disco o sobreescribir con tus cambios actuales.
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    populateFromItem(conflictItem);
                    setConflictItem(null);
                    setFormError(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Cargar datos frescos de disco</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFormSubmit(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs transition-colors"
                >
                  Sobreescribir de todos modos
                </button>
              </div>
            </div>
          )}

          {formError && !conflictItem && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{formError}</span>
            </div>
          )}
          
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
                <option value="draft" className="bg-[#0e1626]">Draft (Backlog)</option>
                <option value="doing" className="bg-[#0e1626]">Doing (In Progress)</option>
                <option value="review" className="bg-[#0e1626]">Review (Testing/QA)</option>
                <option value="ready" className="bg-[#0e1626]">Ready (Deploy)</option>
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

          {/* Criterios de Aceptación (AC) Checklist */}
          <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Criterios de Aceptación (AC)</span>
              </div>
              <button
                type="button"
                onClick={handleAddCriterion}
                className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-medium transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar Criterio</span>
              </button>
            </div>

            {acceptanceCriteriaList.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic">No hay criterios definidos. Agrega uno para activar el Plan Guard.</p>
            ) : (
              <div className="space-y-1.5 pt-1">
                {acceptanceCriteriaList.map((ac) => (
                  <div key={ac.index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={ac.checked}
                      onChange={() => handleToggleCriterion(ac.index)}
                      className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-[10px] font-mono text-slate-500">#{ac.index}</span>
                    <input
                      type="text"
                      value={ac.text}
                      onChange={(e) => handleUpdateCriterionText(ac.index, e.target.value)}
                      placeholder="Ej: El formulario valida campos requeridos..."
                      className={`flex-1 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 ${
                        ac.checked ? 'line-through text-slate-500' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCriterion(ac.index)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Eliminar criterio"
                    >
                      <Trash className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Implementation Plan (Backlog.md & Plan Guard) */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1 flex items-center justify-between">
              <span>Plan de Implementación / Especificación Técnica</span>
              <span className="text-[10px] font-normal text-slate-500">Requerido para Plan Guard</span>
            </label>
            <textarea
              value={implementationPlan}
              onChange={(e) => setImplementationPlan(e.target.value)}
              rows={3}
              placeholder="1. Investigar archivos afectados...&#10;2. Diseñar solución...&#10;3. Validar con pruebas..."
              className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isEditing && onDelete && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
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
              onClick={() => handleFormSubmit(false)}
              disabled={isSaving || !title.trim()}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Guardando...' : 'Guardar (⌘↵)'}</span>
            </button>
          </div>
        </div>

      </div>

      {item && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Eliminar Ítem"
          message={`¿Deseas eliminar definitivamente el ítem ${item.code}? Esta acción no se puede deshacer.`}
          detail={item.title}
          confirmText="Eliminar Definitivamente"
          variant="danger"
          onConfirm={async () => {
            if (onDelete) {
              await onDelete(item.id);
              onClose();
            }
          }}
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
