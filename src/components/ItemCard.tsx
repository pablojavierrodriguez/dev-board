import React, { useState, useRef, useEffect, memo } from 'react';
import { 
  Bug, 
  Sparkles, 
  Wrench, 
  Palette, 
  MoreVertical, 
  Check, 
  ArchiveX, 
  Ban, 
  Trash2, 
  ChevronRight,
  Edit3,
  Bot,
  Layers,
  Zap,
  Flame,
  Search,
  CheckCircle2,
  HelpCircle,
  Clock,
  Target,
  FileCode,
  Shield,
  Activity,
  Award,
  Box,
  Cpu,
  Feather,
  GitBranch,
  Terminal,
  Tag,
  Star,
  Bookmark
} from 'lucide-react';
import type { BacklogItem, ItemStatus, Priority, CustomItemTypeConfig } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface ItemCardProps {
  item: BacklogItem;
  isDragging?: boolean;
  onClick: () => void;
  onUpdateStatus: (id: string, newStatus: ItemStatus) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, item: BacklogItem) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  // DEV-047: Progress rollup for epics/initiatives
  epicProgress?: { done: number; total: number };
  customItemTypes?: CustomItemTypeConfig[];
}

export const LUCIDE_ICONS_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sparkles,
  Bug,
  Wrench,
  Palette,
  Layers,
  Zap,
  Flame,
  Search,
  CheckCircle2,
  HelpCircle,
  Clock,
  Target,
  FileCode,
  Shield,
  Activity,
  Award,
  Box,
  Cpu,
  Feather,
  GitBranch,
  Terminal,
  Tag,
  Star,
  Bookmark
};

export const getIconByName = (name?: string): React.FC<{ className?: string }> => {
  if (!name) return Sparkles;
  return LUCIDE_ICONS_MAP[name] || Sparkles;
};

const BASE_TYPE_CONFIG: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string; badge: string }> = {
  bug: {
    label: 'Bug',
    icon: Bug,
    color: 'text-rose-500 dark:text-rose-400',
    badge: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300'
  },
  feature: {
    label: 'Feature',
    icon: Sparkles,
    color: 'text-violet-500 dark:text-violet-400',
    badge: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-300'
  },
  tech_debt: {
    label: 'Tech Debt',
    icon: Wrench,
    color: 'text-amber-500 dark:text-amber-400',
    badge: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-300'
  },
  ux: {
    label: 'UX/UI',
    icon: Palette,
    color: 'text-emerald-500 dark:text-emerald-400',
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-300'
  },
  epic: {
    label: 'Epic',
    icon: Layers,
    color: 'text-indigo-500 dark:text-indigo-400',
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
  },
  initiative: {
    label: 'Initiative',
    icon: Zap,
    color: 'text-purple-500 dark:text-purple-400',
    badge: 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300'
  }
};

export const getItemTypeInfo = (
  type: string, 
  customTypes?: CustomItemTypeConfig[]
): { label: string; icon: React.FC<{ className?: string }>; color: string; badge: string } => {
  if (customTypes && customTypes.length > 0) {
    const found = customTypes.find(c => c.key === type);
    if (found) {
      return {
        label: found.label || found.key,
        icon: getIconByName(found.iconName),
        color: found.color || 'text-indigo-500 dark:text-indigo-400',
        badge: found.badge || 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300'
      };
    }
  }
  if (type in BASE_TYPE_CONFIG) {
    return BASE_TYPE_CONFIG[type];
  }
  return {
    label: type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' '),
    icon: Sparkles,
    color: 'text-indigo-500 dark:text-indigo-400',
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300'
  };
};

export const typeConfig: Record<string, { label: string; icon: React.FC<{ className?: string }>; color: string; badge: string }> = new Proxy(
  BASE_TYPE_CONFIG,
  {
    get(target, prop: string) {
      if (prop in target) return target[prop];
      return {
        label: String(prop).charAt(0).toUpperCase() + String(prop).slice(1).replace(/_/g, ' '),
        icon: Sparkles,
        color: 'text-indigo-500 dark:text-indigo-400',
        badge: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300'
      };
    }
  }
);

export const priorityConfig: Record<Priority, { label: string; dot: string; text: string }> = {
  p0: { label: 'P0 Urgent', dot: 'bg-rose-500 animate-pulse', text: 'text-rose-600 dark:text-rose-400 font-semibold' },
  p1: { label: 'P1 High', dot: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400 font-medium' },
  p2: { label: 'P2 Medium', dot: 'bg-blue-500', text: 'text-blue-600 dark:text-blue-400' },
  p3: { label: 'P3 Low', dot: 'bg-slate-400', text: 'text-slate-500 dark:text-slate-400' }
};

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  doing: 'Doing',
  review: 'Review',
  ready: 'Ready',
  done: 'Done',
  dismissed: 'Dismissed',
  cancelled: 'Cancelled',
  // legacy
  ideas: 'Draft',
  backlog: 'Draft',
  in_progress: 'Doing',
  testing_qa: 'Review',
  finish: 'Ready'
};

const ItemCardComponent: React.FC<ItemCardProps> = ({
  item,
  isDragging = false,
  onClick,
  onUpdateStatus,
  onDelete,
  onDragStart,
  onDragEnd,
  onShowToast,
  epicProgress,
  customItemTypes
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dragJustEndedRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setStatusMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const typeInfo = getItemTypeInfo(item.type, customItemTypes);
  const priorityInfo = priorityConfig[item.priority] || priorityConfig.p2;
  const TypeIcon = typeInfo.icon;

  const handleDragStartInternal = (e: React.DragEvent) => {
    dragJustEndedRef.current = false;
    onDragStart(e, item);
  };

  const handleDragEndInternal = (e: React.DragEvent) => {
    dragJustEndedRef.current = true;
    onDragEnd(e);
    // Suppress synthetic click fired by browser right after mouseup on drag
    window.setTimeout(() => {
      dragJustEndedRef.current = false;
    }, 200);
  };

  const handleClickInternal = (e: React.MouseEvent) => {
    if (dragJustEndedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  const handleCopyAiPrompt = () => {
    let prompt = `# Tarea: [${item.code}] ${item.title}\n\n`;
    prompt += `**Proyecto:** ${item.projectId}\n`;
    prompt += `**Tipo:** ${item.type} | **Prioridad:** ${item.priority.toUpperCase()}\n`;
    if (item.module) prompt += `**Módulo / Área:** ${item.module}\n`;
    if (item.impactedFile) prompt += `**Archivo Impactado:** ${item.impactedFile}\n`;
    if (item.targetSprint) prompt += `**Sprint:** ${item.targetSprint}\n`;
    prompt += `\n## Descripción del Problema / Requerimiento\n${item.description || item.title}\n\n`;
    if (item.risk) prompt += `## Riesgo / Impacto\n${item.risk}\n\n`;
    if (item.fix) prompt += `## Criterio de Aceptación / Fix Propuesto\n${item.fix}\n\n`;
    prompt += `## Instrucción para el Agente\nAnaliza el código del repositorio, genera el plan de trabajo o implementa la solución paso a paso cumpliendo los criterios de aceptación descritos.`;

    navigator.clipboard.writeText(prompt);
    setMenuOpen(false);
    if (onShowToast) {
      onShowToast(`¡Prompt de ${item.code} copiado al portapapeles! 🤖`, 'success');
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStartInternal}
      onDragEnd={handleDragEndInternal}
      onClick={handleClickInternal}
      className={`group relative glass-card p-3 rounded-xl cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging ? 'is-dragging' : ''
      }`}
    >
      {/* Top row: Code + Type Badge + Priority + Menu */}
      <div className="flex items-center justify-between gap-1.5 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Item Code */}
          <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 tracking-tight">
            {item.code}
          </span>

          {/* Type Badge */}
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${typeInfo.badge}`}>
            <TypeIcon className="w-3 h-3" />
            <span>{typeInfo.label}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Priority Pill */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.05] text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`} />
            <span className={priorityInfo.text}>{priorityInfo.label}</span>
          </div>

          {/* Context Menu Button */}
          <div className="relative" ref={menuRef} onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setMenuOpen(!menuOpen);
                setStatusMenuOpen(false);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-40 text-xs animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onClick();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white text-left"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Editar detalle</span>
                </button>

                {/* Copy AI Prompt Button */}
                <button
                  onClick={handleCopyAiPrompt}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 text-left font-medium"
                >
                  <Bot className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>Copiar Prompt IA 🤖</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setStatusMenuOpen(!statusMenuOpen)}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>Cambiar estado</span>
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>

                  {statusMenuOpen && (
                    <div className="absolute right-full top-0 mr-1 w-40 rounded-xl bg-white dark:bg-[#0e1626] border border-slate-200 dark:border-white/10 shadow-2xl p-1 z-50 text-xs">
                      {(['draft', 'doing', 'review', 'ready', 'done'] as ItemStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            onUpdateStatus(item.id, s);
                            setMenuOpen(false);
                            setStatusMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-[11px] ${
                            item.status === s
                              ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                          }`}
                        >
                          <span>{statusLabels[s]}</span>
                          {item.status === s && <Check className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-100 dark:bg-white/[0.08] my-1" />

                <button
                  onClick={() => {
                    onUpdateStatus(item.id, 'dismissed');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-amber-600 dark:text-amber-300/90 hover:bg-amber-50 dark:hover:bg-amber-500/10 text-left"
                >
                  <ArchiveX className="w-3.5 h-3.5" />
                  <span>Descartar</span>
                </button>

                <button
                  onClick={() => {
                    onUpdateStatus(item.id, 'cancelled');
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] text-left"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>

                {item.status === 'done' ? (
                  <div
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-300 dark:text-slate-600 cursor-not-allowed text-left"
                    title="Los ítems 'Done' son registros históricos protegidos y no pueden eliminarse"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                    <span className="ml-auto text-[9px] bg-slate-100 dark:bg-white/[0.06] px-1 py-0.5 rounded font-medium text-slate-400 dark:text-slate-500">Protegido</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400/90 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left"
                    title="Enviar a la Papelera (recuperable)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Papelera</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item Title */}
      <h4 className={`text-xs font-medium leading-snug line-clamp-2 mb-2 transition-colors ${
        item.type === 'epic'
          ? 'text-indigo-900 dark:text-indigo-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300'
          : item.type === 'initiative'
          ? 'text-purple-900 dark:text-purple-100 group-hover:text-purple-600 dark:group-hover:text-purple-300'
          : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-200'
      }`}>
        {item.title}
      </h4>

      {/* DEV-047: Epic/Initiative Progress Rollup */}
      {(item.type === 'epic' || item.type === 'initiative') && epicProgress && epicProgress.total > 0 && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className={`font-medium ${item.type === 'epic' ? 'text-indigo-600 dark:text-indigo-400' : 'text-purple-600 dark:text-purple-400'}`}>
              Progreso
            </span>
            <span className="text-slate-500 dark:text-slate-400 font-mono">
              {epicProgress.done}/{epicProgress.total} · {Math.round((epicProgress.done / epicProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.06] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.type === 'epic' ? 'bg-indigo-500' : 'bg-purple-500'
              }`}
              style={{ width: `${Math.round((epicProgress.done / epicProgress.total) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Meta Pills (Module, Sprint, Release, ACs) */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-white/[0.04] text-[10px] text-slate-500 dark:text-slate-400">
        {item.acceptanceCriteriaList && item.acceptanceCriteriaList.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 font-mono text-[9px] flex items-center gap-1 font-medium">
            ✓ {item.acceptanceCriteriaList.filter(ac => ac.checked).length}/{item.acceptanceCriteriaList.length} AC
          </span>
        )}

        {item.module && (
          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.05] text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
            {item.module}
          </span>
        )}

        {(item.sprint || item.targetSprint) && (
          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300/90 border border-indigo-200 dark:border-indigo-500/20 truncate max-w-[120px]">
            {item.sprint || item.targetSprint}
          </span>
        )}

        {(item.release || item.targetRelease) && (
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-300/90 border border-emerald-200 dark:border-emerald-500/20 font-mono">
            {(item.release || item.targetRelease)?.startsWith('v') ? (item.release || item.targetRelease) : `v${item.release || item.targetRelease}`}
          </span>
        )}

        {item.parentId && (
          <span className="px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 font-mono text-[9px] flex items-center gap-1" title={`Tarea padre: ${item.parentId}`}>
            ↳ {item.parentId}
          </span>
        )}

        {item.blockedBy && item.blockedBy.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-medium text-[9px] flex items-center gap-1" title={`Bloqueada por: ${item.blockedBy.join(', ')}`}>
            ⛔ Bloqueada por {item.blockedBy.join(', ')}
          </span>
        )}

        {item.blocks && item.blocks.length > 0 && (
          <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 font-medium text-[9px] flex items-center gap-1" title={`Bloquea a: ${item.blocks.join(', ')}`}>
            ⚠️ Bloquea {item.blocks.join(', ')}
          </span>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Tarea"
        message={`¿Estás seguro de que deseas eliminar permanentemente la tarea ${item.code}?`}
        detail={item.title}
        confirmText="Eliminar Tarea"
        variant="danger"
        onConfirm={() => onDelete(item.id)}
        onClose={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export const ItemCard = memo(ItemCardComponent);
