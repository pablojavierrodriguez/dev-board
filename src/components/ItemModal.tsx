import { useState, useEffect, useRef, type FC } from 'react';
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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Sliders,
  Code,
  Layers,
  Link,
  ShieldAlert,
  History
} from 'lucide-react';
import type { BacklogItem, ItemStatus, ItemType, Priority, Project, AcceptanceCriterion, DevBoardConfig } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: BacklogItem | null; // null means create new item
  defaultStatus?: ItemStatus;
  defaultSprint?: string;
  projects: Project[];
  availableModules: string[];
  availableSprints?: string[];
  availableReleases?: string[];
  onSave: (itemData: Partial<BacklogItem> & { expectedMtime?: number; force?: boolean }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  activeProjectId?: string;
  config?: DevBoardConfig;
  allItems?: BacklogItem[];
}

export const ItemModal: FC<ItemModalProps> = ({
  isOpen,
  onClose,
  item,
  defaultStatus = 'draft',
  defaultSprint = '',
  projects,
  availableModules,
  availableSprints = [],
  availableReleases = [],
  onSave,
  onDelete,
  activeProjectId,
  config,
  allItems = []
}) => {
  const isEditing = !!item;

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [projectId, setProjectId] = useState(activeProjectId || 'dom');
  const [type, setType] = useState<ItemType>('feature');
  const [priority, setPriority] = useState<Priority>('p2');
  const [status, setStatus] = useState<ItemStatus>(defaultStatus);
  const [module, setModule] = useState('');
  const [impactedFile, setImpactedFile] = useState('');
  const [sprint, setSprint] = useState('');
  const [release, setRelease] = useState('');
  const [selectedReleases, setSelectedReleases] = useState<string[]>([]);
  const [parentId, setParentId] = useState('');
  const [blocks, setBlocks] = useState<string[]>([]);
  const [blockedBy, setBlockedBy] = useState<string[]>([]);
  const [relatedTo, setRelatedTo] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [risk, setRisk] = useState('');
  const [fix, setFix] = useState('');
  const [implementationPlan, setImplementationPlan] = useState('');
  const [acceptanceCriteriaList, setAcceptanceCriteriaList] = useState<AcceptanceCriterion[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictItem, setConflictItem] = useState<BacklogItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Accordion expansion states
  const [acExpanded, setAcExpanded] = useState(true);
  const [planExpanded, setPlanExpanded] = useState(false);
  const [riskFixExpanded, setRiskFixExpanded] = useState(false);
  const [relationsExpanded, setRelationsExpanded] = useState(false);

  const currentId = item?.id || '';
  const currentCode = item?.code || '';
  const otherItems = (allItems || []).filter(it => it.id !== currentId && it.code !== currentCode);
  const candidateParents = otherItems.filter(it => it.type === 'epic' || it.type === 'initiative' || it.type === 'feature');

  const populateFromItem = (source: BacklogItem) => {
    setTitle(source.title || '');
    setCode(source.code || '');
    setProjectId(source.projectId || activeProjectId || projects[0]?.id || 'dom');
    setType(source.type || 'feature');
    setPriority(source.priority || 'p2');
    setStatus(source.status || 'draft');
    setModule(source.module || '');
    setImpactedFile(source.impactedFile || '');
    const sVal = source.sprint || source.targetSprint || '';
    const rVal = source.release || source.targetRelease || '';
    setSprint(sVal);
    setRelease(rVal);
    const rels = source.releases && source.releases.length > 0 ? source.releases : (rVal ? [rVal] : []);
    setSelectedReleases(rels);
    setParentId(source.parentId || '');
    setBlocks(source.blocks || []);
    setBlockedBy(source.blockedBy || []);
    setRelatedTo(source.relatedTo || []);
    setDescription(source.description || '');
    setRisk(source.risk || '');
    setFix(source.fix || '');
    setImplementationPlan(source.implementationPlan || '');
    setAcceptanceCriteriaList(source.acceptanceCriteriaList || []);
    setAcExpanded(true);
    setPlanExpanded(Boolean(source.implementationPlan?.trim()));
    setRiskFixExpanded(Boolean(source.risk?.trim() || source.fix?.trim()));
    setRelationsExpanded(Boolean(source.parentId || (source.blocks && source.blocks.length > 0) || (source.blockedBy && source.blockedBy.length > 0) || (source.relatedTo && source.relatedTo.length > 0)));
  };

  const prevIsOpenRef = useRef(false);
  const prevItemIdRef = useRef<string | null>(null);

  // Initialize form ONLY when modal opens or target item changes, never on live background syncs
  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      prevItemIdRef.current = null;
      return;
    }

    const currentItemId = item ? item.id : null;
    const isJustOpening = !prevIsOpenRef.current;
    const isDifferentItem = isJustOpening || prevItemIdRef.current !== currentItemId;

    if (isDifferentItem) {
      prevIsOpenRef.current = true;
      prevItemIdRef.current = currentItemId;

      setFormError(null);
      setConflictItem(null);
      setShowDeleteConfirm(false);
      if (item) {
        populateFromItem(item);
      } else {
        // New item defaults
        setTitle('');
        setCode('');
        setProjectId(activeProjectId || projects[0]?.id || 'dom');
        setType('feature');
        setPriority('p2');
        setStatus(defaultStatus);
        setModule('');
        setImpactedFile('');
        setSprint(defaultSprint || '');
        setRelease('');
        setSelectedReleases([]);
        setParentId('');
        setBlocks([]);
        setBlockedBy([]);
        setRelatedTo([]);
        setDescription('');
        setRisk('');
        setFix('');
        setImplementationPlan('');
        setAcceptanceCriteriaList([]);
        setAcExpanded(true);
        setPlanExpanded(false);
        setRiskFixExpanded(false);
        setRelationsExpanded(false);
      }
    }
  }, [isOpen, item, defaultStatus, defaultSprint, activeProjectId]);

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
  }, [isOpen, title, code, projectId, type, priority, status, module, impactedFile, sprint, release, description, risk, fix, implementationPlan, acceptanceCriteriaList, showDeleteConfirm]);

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
        sprint: sprint.trim() || undefined,
        release: selectedReleases[0] || release.trim() || undefined,
        targetSprint: sprint.trim() || undefined,
        targetRelease: selectedReleases[0] || release.trim() || undefined,
        releases: selectedReleases.length > 0 ? selectedReleases : (release.trim() ? [release.trim()] : undefined),
        sprints: item?.sprints ? Array.from(new Set([...item.sprints, ...(sprint.trim() ? [sprint.trim()] : [])])) : (sprint.trim() ? [sprint.trim()] : undefined),
        parentId: parentId.trim() || undefined,
        blocks: blocks.length > 0 ? blocks : undefined,
        blockedBy: blockedBy.length > 0 ? blockedBy : undefined,
        relatedTo: relatedTo.length > 0 ? relatedTo : undefined,
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
    const nextIndex = acceptanceCriteriaList.length > 0 
      ? Math.max(...acceptanceCriteriaList.map(c => c.index)) + 1 
      : 1;
    setAcceptanceCriteriaList([
      ...acceptanceCriteriaList,
      { index: nextIndex, text: '', checked: false }
    ]);
  };

  const handleUpdateCriterionText = (index: number, text: string) => {
    setAcceptanceCriteriaList(
      acceptanceCriteriaList.map(c => c.index === index ? { ...c, text } : c)
    );
  };

  const handleToggleCriterion = (index: number) => {
    setAcceptanceCriteriaList(
      acceptanceCriteriaList.map(c => c.index === index ? { ...c, checked: !c.checked } : c)
    );
  };

  const handleRemoveCriterion = (index: number) => {
    setAcceptanceCriteriaList(
      acceptanceCriteriaList.filter(c => c.index !== index)
    );
  };

  if (!isOpen) return null;

  const acChecked = acceptanceCriteriaList.filter(c => c.checked).length;
  const acTotal = acceptanceCriteriaList.length;
  const contextCount = [module, impactedFile, sprint, release, risk, fix].filter(v => Boolean(v?.trim())).length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-6xl glass-panel bg-[#0d1322]/95 rounded-t-2xl sm:rounded-2xl border-t sm:border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile bottom-sheet handle */}
        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                {isEditing ? `Editar Ítem ${item.code}` : 'Crear Nuevo Ítem'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {isEditing ? 'Modifica los requerimientos, criterios de aceptación y contexto de ejecución' : 'Completa la información para sumar un nuevo requerimiento o bug al backlog'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            title="Cerrar (Esc)"
            className="h-10 w-10 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - 2-Column Linear-style Grid */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (67%): Main Content */}
            <div className="lg:col-span-8 space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Título del Ítem <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Interoperabilidad nativa con Backlog.md..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold transition-all"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Descripción & Requerimiento
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Describe exhaustivamente el problema, contexto o comportamiento esperado..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 leading-relaxed font-sans resize-y"
                />
              </div>

              {/* SECTION: Acceptance Criteria Accordion */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden transition-all">
                <div 
                  onClick={() => setAcExpanded(!acExpanded)}
                  className="px-3.5 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">Criterios de Aceptación (AC)</span>
                    
                    {acTotal === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-slate-400 font-mono">
                        0 criterios
                      </span>
                    ) : acChecked === acTotal ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                        ✓ {acChecked}/{acTotal} completados
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                        {acChecked}/{acTotal} completados
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCriterion();
                        if (!acExpanded) setAcExpanded(true);
                      }}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[10px] font-medium transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Agregar Criterio</span>
                    </button>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${acExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </div>
                </div>

                {acExpanded && (
                  <div className="p-3.5 border-t border-white/[0.06] space-y-2 bg-black/10">
                    {acceptanceCriteriaList.length === 0 ? (
                      <p className="text-[11px] text-slate-500 italic py-1">
                        No hay criterios definidos. Agrega al menos uno para asegurar la trazabilidad y activar el Plan Guard.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {acceptanceCriteriaList.map((ac) => (
                          <div key={ac.index} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={ac.checked}
                              onChange={() => handleToggleCriterion(ac.index)}
                              className="rounded border-white/20 bg-white/5 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            />
                            <span className="text-[10px] font-mono text-slate-500 shrink-0">#{ac.index}</span>
                            <input
                              type="text"
                              value={ac.text}
                              onChange={(e) => handleUpdateCriterionText(ac.index, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCriterion();
                                }
                              }}
                              placeholder="Ej: El layout se mantiene estable al alternar vistas..."
                              className={`flex-1 px-3.5 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.05] transition-all ${
                                ac.checked ? 'line-through text-slate-500' : ''
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveCriterion(ac.index)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              title="Eliminar criterio"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SECTION: Plan de Implementación & Plan Guard Accordion */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden transition-all">
                <div 
                  onClick={() => setPlanExpanded(!planExpanded)}
                  className="px-3.5 py-2.5 bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-between cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-200">Plan de Implementación & Plan Guard</span>
                    
                    {implementationPlan.trim() ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                        Plan redactado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-slate-400 font-mono">
                        Sin plan técnico
                      </span>
                    )}
                  </div>

                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${planExpanded ? 'rotate-0' : '-rotate-90'}`} />
                </div>

                {planExpanded && (
                  <div className="p-3.5 border-t border-white/[0.06] space-y-2 bg-black/10">
                    <p className="text-[10px] text-slate-400">
                      Especificación de pasos técnicos y directivas para desarrolladores o agentes de IA. Requerido para avanzar antes de codificar según el Playbook.
                    </p>
                    <textarea
                      value={implementationPlan}
                      onChange={(e) => setImplementationPlan(e.target.value)}
                      rows={5}
                      placeholder="1. Modificar tipos en types.ts...&#10;2. Actualizar layout en ItemModal.tsx...&#10;3. Comprobar build y tests..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-y"
                    />
                  </div>
                )}
              </div>

              {/* DEV-048: Relaciones y Dependencias (Jerarquías y Bloqueos) */}
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setRelationsExpanded(!relationsExpanded)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Link className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">
                      Relaciones y Dependencias (Padre, Bloqueos y Vínculos)
                    </span>
                    {(parentId || blocks.length > 0 || blockedBy.length > 0 || relatedTo.length > 0) && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 font-mono">
                        {[
                          parentId ? '1 padre' : null,
                          blocks.length > 0 ? `${blocks.length} bloquea` : null,
                          blockedBy.length > 0 ? `${blockedBy.length} bloqueado` : null,
                          relatedTo.length > 0 ? `${relatedTo.length} enlaces` : null
                        ].filter(Boolean).join(' · ')}
                      </span>
                    )}
                  </div>
                  {relationsExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {relationsExpanded && (
                  <div className="p-4 border-t border-white/[0.06] space-y-4 bg-black/10 text-xs">
                    {/* 1. Jerarquía Vertical (Padre Único) */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Ítem Padre (Épica o Historia Contenedora)</span>
                      </label>
                      <p className="text-[10px] text-slate-400 mb-1.5">
                        Un ítem solo puede tener un único padre asignado (relación jerárquica estricta 1-a-N).
                      </p>
                      <select
                        value={parentId}
                        onChange={(e) => setParentId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      >
                        <option value="" className="bg-[#0e1626]">(Sin padre - Tarea raíz independiente)</option>
                        {candidateParents.map((cand) => (
                          <option key={cand.id} value={cand.code || cand.id} className="bg-[#0e1626]">
                            [{cand.type.toUpperCase()}] {cand.code || cand.id}: {cand.title.slice(0, 50)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Bloqueado Por (Blocked By) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-rose-300 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                          <span>Bloqueado Por (Dependencias Duras)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Impide avanzar esta tarea</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
                          defaultValue=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !blockedBy.includes(val)) {
                              setBlockedBy([...blockedBy, val]);
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="" className="bg-[#0e1626]">+ Agregar tarea que bloquea a esta...</option>
                          {otherItems.filter(it => !blockedBy.includes(it.code || it.id)).map(it => (
                            <option key={it.id} value={it.code || it.id} className="bg-[#0e1626]">
                              {it.code || it.id} - {it.title.slice(0, 45)} ({it.status})
                            </option>
                          ))}
                        </select>
                      </div>
                      {blockedBy.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {blockedBy.map(bCode => (
                            <span key={bCode} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                              <span>⛔ {bCode}</span>
                              <button
                                type="button"
                                onClick={() => setBlockedBy(blockedBy.filter(c => c !== bCode))}
                                className="text-rose-400 hover:text-white ml-0.5"
                                title="Quitar bloqueo"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Bloquea A (Blocks) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Bloquea A (Otras tareas que dependen de esta)</span>
                        </label>
                        <span className="text-[10px] text-slate-400">Esta tarea es requisito previo</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                          defaultValue=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !blocks.includes(val)) {
                              setBlocks([...blocks, val]);
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="" className="bg-[#0e1626]">+ Agregar tarea que depende de esta...</option>
                          {otherItems.filter(it => !blocks.includes(it.code || it.id)).map(it => (
                            <option key={it.id} value={it.code || it.id} className="bg-[#0e1626]">
                              {it.code || it.id} - {it.title.slice(0, 45)} ({it.status})
                            </option>
                          ))}
                        </select>
                      </div>
                      {blocks.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {blocks.map(bCode => (
                            <span key={bCode} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px]">
                              <span>⚠️ {bCode}</span>
                              <button
                                type="button"
                                onClick={() => setBlocks(blocks.filter(c => c !== bCode))}
                                className="text-amber-400 hover:text-white ml-0.5"
                                title="Quitar relación"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4. Relacionado Con (Related To) */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <Link className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Relacionado Con (Vínculos Conceptuales)</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <select
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                          defaultValue=""
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val && !relatedTo.includes(val)) {
                              setRelatedTo([...relatedTo, val]);
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="" className="bg-[#0e1626]">+ Vincular tarea conceptualmente...</option>
                          {otherItems.filter(it => !relatedTo.includes(it.code || it.id)).map(it => (
                            <option key={it.id} value={it.code || it.id} className="bg-[#0e1626]">
                              {it.code || it.id} - {it.title.slice(0, 45)}
                            </option>
                          ))}
                        </select>
                      </div>
                      {relatedTo.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {relatedTo.map(rCode => (
                            <span key={rCode} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px]">
                              <span>🔗 {rCode}</span>
                              <button
                                type="button"
                                onClick={() => setRelatedTo(relatedTo.filter(c => c !== rCode))}
                                className="text-indigo-400 hover:text-white ml-0.5"
                                title="Quitar relación"
                              >
                                &times;
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (33%): Sidebar "Atributos del Ítem" */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-4 space-y-3.5 bg-slate-900/40">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-semibold text-slate-200">Atributos del Ítem</span>
                  </div>
                  {contextCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/[0.05] text-slate-300 font-mono">
                      {contextCount} atributos
                    </span>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Estado</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ItemStatus)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 font-medium"
                  >
                    <option value="ideas" className="bg-[#0e1626]">💡 Idea / Discovery</option>
                    <option value="draft" className="bg-[#0e1626]">Draft (Backlog)</option>
                    <option value="doing" className="bg-[#0e1626]">Doing (En Desarrollo)</option>
                    <option value="review" className="bg-[#0e1626]">Review (En Revisión / QA)</option>
                    <option value="ready" className="bg-[#0e1626]">Ready (Listo para Release)</option>
                    <option value="done" className="bg-[#0e1626]">Done (Completado)</option>
                    <option value="dismissed" className="bg-[#0e1626]">Descartado (Archivado)</option>
                    <option value="cancelled" className="bg-[#0e1626]">Cancelado</option>
                  </select>
                </div>

                {/* Priority & Type */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Prioridad</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as Priority)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    >
                      <option value="p0" className="bg-[#0e1626] text-rose-400">P0 (Crítico) 🔴</option>
                      <option value="p1" className="bg-[#0e1626] text-amber-400">P1 (Alto) 🟠</option>
                      <option value="p2" className="bg-[#0e1626] text-yellow-400">P2 (Medio) 🟡</option>
                      <option value="p3" className="bg-[#0e1626] text-slate-400">P3 (Bajo) ⚪</option>
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
                      <option value="feature" className="bg-[#0e1626]">🚀 Feature</option>
                      <option value="tech_debt" className="bg-[#0e1626]">🛠️ Deuda Técnica</option>
                      <option value="ux" className="bg-[#0e1626]">🎨 UX</option>
                      <option value="epic" className="bg-[#0e1626]">📚 Epic</option>
                      <option value="initiative" className="bg-[#0e1626]">⚡ Initiative</option>
                      {config?.customItemTypes && config.customItemTypes.length > 0 && (
                        <optgroup label="Tipos Personalizados">
                          {config.customItemTypes.map((ct) => (
                            <option key={ct.key} value={ct.key} className="bg-[#0e1626]">
                              🏷️ {ct.label}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                {/* Sprint & Multi-Release (DEV-056) */}
                <div className="space-y-2.5">
                  {config?.methodology !== 'kanban' && (
                    <div>
                      <label className="block text-[11px] font-medium text-indigo-400 mb-1">Sprint Activo</label>
                      <input
                        type="text"
                        value={sprint}
                        onChange={(e) => setSprint(e.target.value)}
                        placeholder="Ej: Sprint 4"
                        list="sprints-list"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                      />
                      <datalist id="sprints-list">
                        {availableSprints.map((s) => (
                          <option key={s} value={s} />
                        ))}
                      </datalist>

                      {/* Historial de Sprints Cerrados (DEV-056 AC #1 & #3) */}
                      {item?.sprints && item.sprints.filter(s => s !== sprint).length > 0 && (
                        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <History className="w-3 h-3 text-slate-500" />
                            Historial:
                          </span>
                          {item.sprints.filter(s => s !== sprint).map(histSp => (
                            <span key={histSp} className="px-1.5 py-0.2 rounded text-[9px] bg-white/[0.05] border border-white/[0.08] text-slate-300 font-mono">
                              {histSp}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Multi-version Releases (DEV-056) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-emerald-400">Releases / Versiones</label>
                      {selectedReleases.length > 1 && (
                        <span className="text-[10px] text-emerald-400/80 font-mono">Multi-versión</span>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={release}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRelease(val);
                          if (val && !selectedReleases.includes(val)) {
                            setSelectedReleases([...selectedReleases, val]);
                          }
                        }}
                        placeholder="Ej: 0.4.0 (escribe o selecciona abajo)"
                        list="releases-list"
                        className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      />
                      <datalist id="releases-list">
                        {availableReleases.map((r) => (
                          <option key={r} value={r} />
                        ))}
                      </datalist>

                      {availableReleases.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {availableReleases.map(rel => {
                            const isSelected = selectedReleases.includes(rel);
                            return (
                              <button
                                type="button"
                                key={rel}
                                onClick={() => {
                                  if (isSelected) {
                                    const next = selectedReleases.filter(r => r !== rel);
                                    setSelectedReleases(next);
                                    if (release === rel) setRelease(next[0] || '');
                                  } else {
                                    const next = [...selectedReleases, rel];
                                    setSelectedReleases(next);
                                    setRelease(rel);
                                  }
                                }}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                  isSelected
                                    ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-semibold'
                                    : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.07] border border-white/[0.06]'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}v{rel}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Module & Code */}
                <div className="grid grid-cols-2 gap-2.5">
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
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Código</label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Auto-generado"
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                </div>

                {/* Impacted File */}
                <div>
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">Archivo Impactado</label>
                  <input
                    type="text"
                    value={impactedFile}
                    onChange={(e) => setImpactedFile(e.target.value)}
                    placeholder="src/components/Header.tsx"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                {/* Project selector if multiple projects */}
                {projects.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Proyecto</label>
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#0e1626]">
                          {p.name} ({p.codePrefix})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Technical Risk & Fix Accordion */}
                <div className="pt-1 border-t border-white/[0.06]">
                  <div 
                    onClick={() => setRiskFixExpanded(!riskFixExpanded)}
                    className="flex items-center justify-between cursor-pointer py-1 text-slate-300 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5 text-[11px] font-medium">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>Riesgos y Solución Técnica</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${riskFixExpanded ? 'rotate-0' : '-rotate-90'}`} />
                  </div>

                  {riskFixExpanded && (
                    <div className="space-y-2.5 pt-2">
                      <div>
                        <label className="block text-[10px] font-medium text-amber-400 mb-1">
                          Riesgo Técnico / Impacto Potencial (risk)
                        </label>
                        <textarea
                          value={risk}
                          onChange={(e) => setRisk(e.target.value)}
                          rows={2}
                          placeholder="Efectos colaterales, compatibilidad o dependencias..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-emerald-400 mb-1">
                          Solución Propuesta / Mitigación (fix)
                        </label>
                        <textarea
                          value={fix}
                          onChange={(e) => setFix(e.target.value)}
                          rows={2}
                          placeholder="Enfoque técnico o salvaguardas implementadas..."
                          className="w-full px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
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
              className="min-h-[44px] sm:min-h-[36px] px-3.5 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-300 transition-colors active:scale-[0.98]"
            >
              Cancelar (Esc)
            </button>
            <button
              type="button"
              onClick={() => handleFormSubmit(false)}
              disabled={isSaving || !title.trim()}
              className="min-h-[44px] sm:min-h-[36px] flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium shadow-md shadow-indigo-600/30 transition-all active:scale-[0.98]"
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
