import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Palette, 
  Sliders,
  Target,
  Rocket,
  Download,
  Upload,
  RotateCcw, 
  FileCode, 
  ArrowUp, 
  ArrowDown, 
  Moon, 
  Sun, 
  Monitor,
  ArrowLeft,
  Save,
  CheckCircle2,
  Database,
  ShieldCheck,
  Code,
  Plus,
  X,
  Layers,
  Tag,
  Trash2,
  Edit2,
  Check
} from 'lucide-react';
import type { DevBoardConfig, ColumnConfig, Project, ItemStatus, ProjectMethodology, CustomItemTypeConfig } from '../types';
import { EXPANDED_COLUMNS, SIMPLIFIED_BASE_COLUMNS } from './KanbanBoard';
import { getIconByName } from './ItemCard';

export const ALL_ITEM_STATUSES: { id: ItemStatus; label: string; desc: string }[] = [
  { id: 'draft', label: 'Draft', desc: 'Backlog inicial' },
  { id: 'doing', label: 'Doing', desc: 'En desarrollo activo' },
  { id: 'review', label: 'Review', desc: 'En revisión o testing' },
  { id: 'ready', label: 'Ready', desc: 'Listo para producción' },
  { id: 'done', label: 'Done', desc: 'Desplegado / Finalizado' },
  { id: 'ideas', label: 'Ideas', desc: 'Discovery & backlog crudo' },
  { id: 'backlog', label: 'Backlog (compat)', desc: 'Sin iniciar (legacy)' },
  { id: 'in_progress', label: 'In Progress (compat)', desc: 'En curso (legacy)' },
  { id: 'testing_qa', label: 'Testing QA (compat)', desc: 'En pruebas (legacy)' },
  { id: 'finish', label: 'Finish (compat)', desc: 'Terminado (legacy)' },
  { id: 'dismissed', label: 'Descartado', desc: 'No se realizará' },
  { id: 'cancelled', label: 'Cancelado', desc: 'Cancelado' }
];

export const ITEM_TYPE_COLOR_PRESETS = [
  { 
    id: 'violet', 
    name: 'Violeta (Púrpura)', 
    color: 'text-violet-500 dark:text-violet-400', 
    badge: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-300', 
    dotColor: 'bg-violet-500' 
  },
  { 
    id: 'rose', 
    name: 'Rojo (Carmesí)', 
    color: 'text-rose-500 dark:text-rose-400', 
    badge: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300', 
    dotColor: 'bg-rose-500' 
  },
  { 
    id: 'amber', 
    name: 'Ámbar (Naranja Cálido)', 
    color: 'text-amber-500 dark:text-amber-400', 
    badge: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-300', 
    dotColor: 'bg-amber-500' 
  },
  { 
    id: 'emerald', 
    name: 'Esmeralda (Verde)', 
    color: 'text-emerald-500 dark:text-emerald-400', 
    badge: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-300', 
    dotColor: 'bg-emerald-500' 
  },
  { 
    id: 'indigo', 
    name: 'Índigo (Azul Marino)', 
    color: 'text-indigo-500 dark:text-indigo-400', 
    badge: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300', 
    dotColor: 'bg-indigo-500' 
  },
  { 
    id: 'cyan', 
    name: 'Cian (Celeste Eléctrico)', 
    color: 'text-cyan-500 dark:text-cyan-400', 
    badge: 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20 text-cyan-600 dark:text-cyan-300', 
    dotColor: 'bg-cyan-500' 
  },
  { 
    id: 'pink', 
    name: 'Rosa (Fucsia)', 
    color: 'text-pink-500 dark:text-pink-400', 
    badge: 'bg-pink-50 dark:bg-pink-500/10 border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-300', 
    dotColor: 'bg-pink-500' 
  },
  { 
    id: 'teal', 
    name: 'Teal (Turquesa)', 
    color: 'text-teal-500 dark:text-teal-400', 
    badge: 'bg-teal-50 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20 text-teal-600 dark:text-teal-300', 
    dotColor: 'bg-teal-500' 
  },
  { 
    id: 'orange', 
    name: 'Naranja (Fuego)', 
    color: 'text-orange-500 dark:text-orange-400', 
    badge: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20 text-orange-600 dark:text-orange-300', 
    dotColor: 'bg-orange-500' 
  },
];

export const AVAILABLE_CUSTOM_ICONS = [
  'Sparkles', 'Flame', 'Zap', 'Search', 'Clock', 'Target', 
  'FileCode', 'Shield', 'Activity', 'Award', 'Box', 'Cpu', 
  'Feather', 'GitBranch', 'Terminal', 'Tag', 'Star', 'Bookmark', 'Layers'
];

export type SettingsTabId = 'views' | 'kanban' | 'taxonomy' | 'visual' | 'tools' | 'advanced';

interface SettingsViewProps {
  config: DevBoardConfig;
  onSaveConfig: (newConfig: DevBoardConfig) => Promise<void>;
  currentProject?: Project;
  onBack: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'info') => void;
  onOpenImportWizard?: () => void;
  onExportMonolithic?: (projectId: string) => void;
  onExportJson?: (projectId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onSaveConfig,
  currentProject,
  onBack,
  onShowToast,
  onOpenImportWizard,
  onExportMonolithic,
  onExportJson
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>('views');

  // Form local state
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(config.theme || 'system');
  const [density, setDensity] = useState<'comfortable' | 'compact'>(config.density || 'comfortable');
  const [methodology, setMethodology] = useState<ProjectMethodology>(config.methodology || 'scrumban');
  const [defaultView, setDefaultView] = useState<'kanban' | 'sprint' | 'release' | 'settings'>(config.defaultView || 'kanban');
  const [enabledTabs, setEnabledTabs] = useState({
    kanban: config.enabledTabs?.kanban !== false,
    sprint: config.enabledTabs?.sprint !== false,
    release: config.enabledTabs?.release !== false
  });
  const [autoSave, setAutoSave] = useState<boolean>(config.autoSave ?? true);
  const [rankingEnabled, setRankingEnabled] = useState<boolean>(config.rankingEnabled !== false);
  const [showIdeasByDefault, setShowIdeasByDefault] = useState<boolean>(config.kanban?.showIdeasByDefault ?? false);
  const [showDoneHistoryByDefault, setShowDoneHistoryByDefault] = useState<boolean>(config.kanban?.showDoneHistoryByDefault ?? false);
  const [kanbanEditMode, setKanbanEditMode] = useState<'ampliada' | 'simplificada'>('ampliada');
  const [customColumns, setCustomColumns] = useState<ColumnConfig[]>(() => {
    if (config.kanban?.columns && config.kanban.columns.length > 0) {
      return JSON.parse(JSON.stringify(config.kanban.columns));
    }
    return JSON.parse(JSON.stringify(EXPANDED_COLUMNS));
  });
  const [customSimplifiedColumns, setCustomSimplifiedColumns] = useState<ColumnConfig[]>(() => {
    if (config.kanban?.simplifiedColumns && config.kanban.simplifiedColumns.length > 0) {
      return JSON.parse(JSON.stringify(config.kanban.simplifiedColumns));
    }
    return JSON.parse(JSON.stringify(SIMPLIFIED_BASE_COLUMNS));
  });
  const [wipLimits, setWipLimits] = useState<Record<string, number>>(config.kanban?.wipLimits || {});

  // Custom Item Types state (DEV-059)
  const [customItemTypes, setCustomItemTypes] = useState<CustomItemTypeConfig[]>(() => {
    if (config.customItemTypes && config.customItemTypes.length > 0) {
      return JSON.parse(JSON.stringify(config.customItemTypes));
    }
    return [];
  });

  // State for adding/editing a custom card type
  const [editingTypeKey, setEditingTypeKey] = useState<string | null>(null);
  const [typeFormKey, setTypeFormKey] = useState('');
  const [typeFormLabel, setTypeFormLabel] = useState('');
  const [typeFormColorPreset, setTypeFormColorPreset] = useState('indigo');
  const [typeFormIcon, setTypeFormIcon] = useState('Sparkles');
  const [typeFormDescription, setTypeFormDescription] = useState('');

  // Raw JSON state
  const [rawJson, setRawJson] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedRecently, setHasSavedRecently] = useState(false);

  // Sync state when config prop changes
  useEffect(() => {
    const initialMethodology = config.methodology || 'scrumban';
    setTheme(config.theme || 'system');
    setDensity(config.density || 'comfortable');
    setMethodology(initialMethodology);
    setDefaultView(config.defaultView || (initialMethodology === 'scrum' ? 'sprint' : 'kanban'));
    setEnabledTabs({
      kanban: config.enabledTabs?.kanban !== undefined ? config.enabledTabs.kanban : initialMethodology !== 'scrum',
      sprint: config.enabledTabs?.sprint !== undefined ? config.enabledTabs.sprint : initialMethodology !== 'kanban',
      release: config.enabledTabs?.release !== false
    });
    setAutoSave(config.autoSave ?? true);
    setRankingEnabled(config.rankingEnabled !== false);
    setShowIdeasByDefault(config.kanban?.showIdeasByDefault ?? false);
    setShowDoneHistoryByDefault(config.kanban?.showDoneHistoryByDefault ?? false);
    if (config.kanban?.columns && config.kanban.columns.length > 0) {
      setCustomColumns(JSON.parse(JSON.stringify(config.kanban.columns)));
    } else {
      setCustomColumns(JSON.parse(JSON.stringify(EXPANDED_COLUMNS)));
    }
    if (config.kanban?.simplifiedColumns && config.kanban.simplifiedColumns.length > 0) {
      setCustomSimplifiedColumns(JSON.parse(JSON.stringify(config.kanban.simplifiedColumns)));
    } else {
      setCustomSimplifiedColumns(JSON.parse(JSON.stringify(SIMPLIFIED_BASE_COLUMNS)));
    }
    setWipLimits(config.kanban?.wipLimits || {});
    if (config.customItemTypes && config.customItemTypes.length > 0) {
      setCustomItemTypes(JSON.parse(JSON.stringify(config.customItemTypes)));
    } else {
      setCustomItemTypes([]);
    }
    setRawJson(JSON.stringify(config, null, 2));
    setJsonError(null);
  }, [config]);

  const handleSelectMethodology = (m: ProjectMethodology) => {
    setMethodology(m);
    if (m === 'kanban') {
      setEnabledTabs({ kanban: true, sprint: false, release: true });
      setDefaultView('kanban');
      onShowToast?.('Metodología Kanban Continuo: Flujo continuo en Tablero. Sprints deshabilitados por defecto.', 'info');
    } else if (m === 'scrum') {
      setEnabledTabs({ kanban: false, sprint: true, release: true });
      setDefaultView('sprint');
      onShowToast?.('Metodología Scrum Puro: La vista principal es Sprint & Priorización. Sin tablero continuo por defecto.', 'info');
    } else {
      setEnabledTabs({ kanban: true, sprint: true, release: true });
      setDefaultView('kanban');
      onShowToast?.('Metodología Scrumban (Híbrido): Sprints en Priorización + Tablero Kanban exclusivo del Sprint Goal.', 'info');
    }
  };

  // Compute built config from state
  const builtConfig: DevBoardConfig = useMemo(() => {
    return {
      ...config,
      theme,
      density,
      methodology,
      defaultView,
      enabledTabs: {
        kanban: enabledTabs.kanban,
        sprint: enabledTabs.sprint,
        release: enabledTabs.release
      },
      autoSave,
      rankingEnabled,
      customItemTypes,
      kanban: {
        ...config.kanban,
        columns: customColumns,
        simplifiedColumns: customSimplifiedColumns,
        showIdeasByDefault,
        showDoneHistoryByDefault,
        wipLimits
      }
    };
  }, [config, theme, density, methodology, defaultView, enabledTabs, autoSave, rankingEnabled, customItemTypes, customColumns, customSimplifiedColumns, showIdeasByDefault, showDoneHistoryByDefault, wipLimits]);

  // Helper to normalize config object for reliable dirty-checking (DEV-081)
  const normalizeForComparison = (c: Partial<DevBoardConfig>) => {
    const kanban = c.kanban || {};
    return {
      theme: c.theme || 'system',
      density: c.density || 'comfortable',
      methodology: c.methodology || 'scrumban',
      defaultView: c.defaultView || (c.methodology === 'scrum' ? 'sprint' : 'kanban'),
      enabledTabs: {
        kanban: c.enabledTabs?.kanban !== undefined ? c.enabledTabs.kanban : c.methodology !== 'scrum',
        sprint: c.enabledTabs?.sprint !== undefined ? c.enabledTabs.sprint : c.methodology !== 'kanban',
        release: c.enabledTabs?.release !== false
      },
      autoSave: c.autoSave ?? true,
      rankingEnabled: c.rankingEnabled !== false,
      customItemTypes: (c.customItemTypes && c.customItemTypes.length > 0) ? c.customItemTypes : undefined,
      kanban: {
        showIdeasByDefault: kanban.showIdeasByDefault ?? false,
        showDoneHistoryByDefault: kanban.showDoneHistoryByDefault ?? false,
        columns: kanban.columns || [],
        simplifiedColumns: kanban.simplifiedColumns || [],
        wipLimits: kanban.wipLimits || {}
      }
    };
  };

  // Check if modified (dirty state) (DEV-081)
  const isDirty = useMemo(() => {
    try {
      const normBuilt = normalizeForComparison(builtConfig);
      const normConfig = normalizeForComparison(config);
      return JSON.stringify(normBuilt) !== JSON.stringify(normConfig);
    } catch {
      return false;
    }
  }, [builtConfig, config]);

  // DEV-074: Reset local settings state to original config from disk
  const handleResetChanges = () => {
    const initialMethodology = config.methodology || 'scrumban';
    setTheme(config.theme || 'system');
    setDensity(config.density || 'comfortable');
    setMethodology(initialMethodology);
    setDefaultView(config.defaultView || (initialMethodology === 'scrum' ? 'sprint' : 'kanban'));
    setEnabledTabs({
      kanban: config.enabledTabs?.kanban !== undefined ? config.enabledTabs.kanban : initialMethodology !== 'scrum',
      sprint: config.enabledTabs?.sprint !== undefined ? config.enabledTabs.sprint : initialMethodology !== 'kanban',
      release: config.enabledTabs?.release !== false
    });
    setAutoSave(config.autoSave ?? true);
    setRankingEnabled(config.rankingEnabled !== false);
    setShowIdeasByDefault(config.kanban?.showIdeasByDefault ?? false);
    setShowDoneHistoryByDefault(config.kanban?.showDoneHistoryByDefault ?? false);
    if (config.kanban?.columns && config.kanban.columns.length > 0) {
      setCustomColumns(JSON.parse(JSON.stringify(config.kanban.columns)));
    } else {
      setCustomColumns(JSON.parse(JSON.stringify(EXPANDED_COLUMNS)));
    }
    if (config.kanban?.simplifiedColumns && config.kanban.simplifiedColumns.length > 0) {
      setCustomSimplifiedColumns(JSON.parse(JSON.stringify(config.kanban.simplifiedColumns)));
    } else {
      setCustomSimplifiedColumns(JSON.parse(JSON.stringify(SIMPLIFIED_BASE_COLUMNS)));
    }
    setWipLimits(config.kanban?.wipLimits || {});
    if (config.customItemTypes && config.customItemTypes.length > 0) {
      setCustomItemTypes(JSON.parse(JSON.stringify(config.customItemTypes)));
    } else {
      setCustomItemTypes([]);
    }
    setRawJson(JSON.stringify(config, null, 2));
    setJsonError(null);
    setEditingTypeKey(null);
    setTypeFormKey('');
    setTypeFormLabel('');
    setTypeFormColorPreset('indigo');
    setTypeFormIcon('Sparkles');
    setTypeFormDescription('');
    onShowToast?.('Cambios descartados. Se restableció la configuración guardada.', 'info');
  };

  // DEV-059: Taxonomy & Custom Card Types CRUD handlers
  const handleAddOrUpdateType = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = typeFormKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    if (!cleanKey) {
      onShowToast?.('Por favor ingresa una clave identificadora válida para el tipo', 'error');
      return;
    }
    if (!typeFormLabel.trim()) {
      onShowToast?.('Por favor ingresa un nombre legible para el tipo', 'error');
      return;
    }
    const systemKeys = ['bug', 'feature', 'tech_debt', 'ux', 'epic', 'initiative'];
    if (systemKeys.includes(cleanKey)) {
      onShowToast?.(`La clave '${cleanKey}' está reservada por el sistema. Usa otro identificador.`, 'error');
      return;
    }
    if (editingTypeKey !== cleanKey && customItemTypes.some(t => t.key === cleanKey)) {
      onShowToast?.(`Ya existe un tipo de tarjeta con la clave '${cleanKey}'.`, 'error');
      return;
    }

    const preset = ITEM_TYPE_COLOR_PRESETS.find(p => p.id === typeFormColorPreset) || ITEM_TYPE_COLOR_PRESETS[0];

    const typeConfigItem: CustomItemTypeConfig = {
      key: cleanKey,
      label: typeFormLabel.trim(),
      color: preset.color,
      badge: preset.badge,
      dotColor: preset.dotColor,
      iconName: typeFormIcon,
      description: typeFormDescription.trim() || undefined
    };

    if (editingTypeKey) {
      setCustomItemTypes(prev => prev.map(t => t.key === editingTypeKey ? typeConfigItem : t));
      onShowToast?.(`Tipo de tarjeta '${typeConfigItem.label}' actualizado con éxito`, 'success');
      setEditingTypeKey(null);
    } else {
      setCustomItemTypes(prev => [...prev, typeConfigItem]);
      onShowToast?.(`Tipo de tarjeta '${typeConfigItem.label}' creado con éxito`, 'success');
    }

    setTypeFormKey('');
    setTypeFormLabel('');
    setTypeFormColorPreset('indigo');
    setTypeFormIcon('Sparkles');
    setTypeFormDescription('');
  };

  const handleStartEditType = (typeItem: CustomItemTypeConfig) => {
    setEditingTypeKey(typeItem.key);
    setTypeFormKey(typeItem.key);
    setTypeFormLabel(typeItem.label);
    const matchedPreset = ITEM_TYPE_COLOR_PRESETS.find(p => p.color === typeItem.color) || ITEM_TYPE_COLOR_PRESETS[0];
    setTypeFormColorPreset(matchedPreset.id);
    setTypeFormIcon(typeItem.iconName || 'Sparkles');
    setTypeFormDescription(typeItem.description || '');
  };

  const handleCancelEditType = () => {
    setEditingTypeKey(null);
    setTypeFormKey('');
    setTypeFormLabel('');
    setTypeFormColorPreset('indigo');
    setTypeFormIcon('Sparkles');
    setTypeFormDescription('');
  };

  const handleDeleteType = (key: string) => {
    setCustomItemTypes(prev => prev.filter(t => t.key !== key));
    if (editingTypeKey === key) {
      handleCancelEditType();
    }
    onShowToast?.('Tipo de tarjeta eliminado', 'info');
  };

  // When switching to Advanced tab, refresh JSON
  const handleTabChange = (tab: SettingsTabId) => {
    if (tab === 'advanced') {
      setRawJson(JSON.stringify(builtConfig, null, 2));
      setJsonError(null);
    }
    setActiveTab(tab);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setJsonError(null);

    try {
      let nextConfig: DevBoardConfig;

      if (activeTab === 'advanced') {
        try {
          nextConfig = JSON.parse(rawJson);
        } catch (e: any) {
          setJsonError(`Error de sintaxis JSON: ${e.message}`);
          setIsSaving(false);
          onShowToast?.('Corrige el error de sintaxis en el JSON antes de guardar', 'error');
          return;
        }
      } else {
        nextConfig = builtConfig;
      }

      await onSaveConfig(nextConfig);
      setHasSavedRecently(true);
      setTimeout(() => setHasSavedRecently(false), 2500);
      onShowToast?.('Configuración del proyecto guardada con éxito', 'success');
    } catch (err: any) {
      onShowToast?.(`Error al guardar configuración: ${err.message || err}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut ⌘S / Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [builtConfig, activeTab, rawJson]);

  // Kanban column helpers (supporting both Ampliada & Simplificada)
  const activeColumnsList = kanbanEditMode === 'ampliada' ? customColumns : customSimplifiedColumns;
  const setActiveColumnsList = (cols: ColumnConfig[]) => {
    if (kanbanEditMode === 'ampliada') {
      setCustomColumns(cols);
    } else {
      setCustomSimplifiedColumns(cols);
    }
  };

  const handleMoveColumn = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= activeColumnsList.length) return;
    const updated = [...activeColumnsList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setActiveColumnsList(updated);
  };

  const handleUpdateColumnField = (index: number, field: keyof ColumnConfig, value: any) => {
    const updated = [...activeColumnsList];
    updated[index] = { ...updated[index], [field]: value };
    setActiveColumnsList(updated);
  };

  const handleRemoveStatusFromColumn = (colId: string, statusToRemove: ItemStatus) => {
    const list = activeColumnsList.map((col) => {
      if (col.id === colId) {
        const nextStatuses = col.statuses.filter((s) => s !== statusToRemove);
        const nextDropTarget = col.dropTargetStatus === statusToRemove
          ? (nextStatuses[0] || 'draft')
          : col.dropTargetStatus;
        return {
          ...col,
          statuses: nextStatuses,
          dropTargetStatus: nextDropTarget
        };
      }
      return col;
    });
    setActiveColumnsList(list);
  };

  const handleAddStatusToColumn = (colId: string, statusToAdd: ItemStatus) => {
    const list = activeColumnsList.map((col) => {
      if (col.id === colId) {
        if (!col.statuses.includes(statusToAdd)) {
          return {
            ...col,
            statuses: [...col.statuses, statusToAdd],
            dropTargetStatus: col.dropTargetStatus || statusToAdd
          };
        }
      } else if (col.statuses.includes(statusToAdd)) {
        const remaining = col.statuses.filter((s) => s !== statusToAdd);
        return {
          ...col,
          statuses: remaining,
          dropTargetStatus: col.dropTargetStatus === statusToAdd ? (remaining[0] || 'draft') : col.dropTargetStatus
        };
      }
      return col;
    });
    setActiveColumnsList(list);
  };

  // DEV-053: Drag & Drop between column chips
  const [draggingStatus, setDraggingStatus] = useState<{ status: ItemStatus; fromColId: string } | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  const handleMoveStatusToColumn = (toColId: string) => {
    if (!draggingStatus || draggingStatus.fromColId === toColId) return;
    handleAddStatusToColumn(toColId, draggingStatus.status);
    setDraggingStatus(null);
    setDragOverColId(null);
  };

  const handleResetColumns = () => {
    if (kanbanEditMode === 'ampliada') {
      setCustomColumns(JSON.parse(JSON.stringify(EXPANDED_COLUMNS)));
      onShowToast?.('Columnas del modo ampliado restablecidas al diseño por defecto', 'info');
    } else {
      setCustomSimplifiedColumns(JSON.parse(JSON.stringify(SIMPLIFIED_BASE_COLUMNS)));
      onShowToast?.('Columnas del modo simple restablecidas al diseño por defecto', 'info');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0b1120] text-slate-800 dark:text-slate-100 overflow-y-auto">
      {/* Top Banner Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200 dark:border-white/[0.08] bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur-md px-4 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all shadow-xs active:scale-[0.98]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Tablero</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-white/10" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Configuración del Espacio de Trabajo
              </h1>
              {currentProject && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                  {currentProject.name}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personaliza el flujo de trabajo, visualización, columnas kanban y herramientas de datos.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Cambios pendientes
            </span>
          )}

          {/* DEV-074: Botón Deshacer Cambios */}
          {isDirty && (
            <button
              type="button"
              onClick={handleResetChanges}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 transition-all active:scale-[0.98] shadow-xs"
              title="Descartar cambios no guardados y restablecer configuración original"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Deshacer Cambios</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.98] ${
              hasSavedRecently
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20'
            } disabled:opacity-50`}
          >
            {hasSavedRecently ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Guardado!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Cambios</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-indigo-700 rounded border border-indigo-500/30">
                  ⌘S
                </kbd>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Master-Detail Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <nav className="w-full md:w-64 shrink-0 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Secciones
          </div>

          <button
            type="button"
            onClick={() => handleTabChange('views')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              activeTab === 'views'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Layout className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === 'views' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold">Flujo & Vistas</div>
              <div className="text-[11px] text-slate-500">Vista inicial y pestañas del header</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('kanban')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              activeTab === 'kanban'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Sliders className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === 'kanban' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold">Tablero Kanban</div>
              <div className="text-[11px] text-slate-500">Columnas, orden y límites WIP</div>
            </div>
          </button>

          {/* DEV-059: Tab Tipos de Tarjeta y Taxonomía */}
          <button
            type="button"
            onClick={() => handleTabChange('taxonomy')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              activeTab === 'taxonomy'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Tag className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === 'taxonomy' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold">Tipos de Tarjeta</div>
              <div className="text-[11px] text-slate-500">Taxonomía y flujos personalizados</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('visual')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              activeTab === 'visual'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Palette className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === 'visual' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold">Apariencia</div>
              <div className="text-[11px] text-slate-500">Temas, densidad y guardado</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('tools')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              activeTab === 'tools'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Database className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === 'tools' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold">Datos & Herramientas</div>
              <div className="text-[11px] text-slate-500">Importación legacy y backups</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('advanced')}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
              activeTab === 'advanced'
                ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 shadow-xs font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white border border-transparent'
            }`}
          >
            <Code className={`w-4 h-4 mt-0.5 shrink-0 ${activeTab === 'advanced' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-xs font-semibold">Avanzado (JSON)</div>
              <div className="text-[11px] text-slate-500">Editor crudo de configuración</div>
            </div>
          </button>

          {/* Quick System Info Card */}
          <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/[0.08] px-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>DevBoard Cockpit</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Almacenamiento nativo en <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-slate-200 dark:bg-white/10">.devboard/config.json</code> con sincronización atómica.
            </p>
          </div>
        </nav>

        {/* Content Details Area */}
        <main className="flex-1 min-w-0 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-xs">
          {/* TAB 1: FLUJO & VISTAS */}
          {activeTab === 'views' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Flujo de Trabajo y Vistas
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Controla la vista principal por defecto y las pestañas que se muestran en el encabezado de navegación.
                </p>
              </div>

              {/* Methodology Selector (DEV-038) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Metodología de Trabajo del Proyecto
                    </label>
                    <p className="text-xs text-slate-500">
                      Define si el proyecto se opera en flujo continuo (Kanban Puro), por iteraciones (Scrum) o híbrido. Al seleccionar Kanban Puro, se ocultan automáticamente las opciones de Sprints para liberar y despejar la interfaz.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {methodology === 'kanban' ? '📋 Kanban Continuo' : methodology === 'scrum' ? '🎯 Scrum por Sprints' : '⚡ Híbrido (Scrumban)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectMethodology('kanban')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      methodology === 'kanban'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Layers className="w-4 h-4 text-indigo-500" />
                      <span>Kanban Continuo</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Flujo de valor continuo sin sprints. El Tablero abarca todo el backlog y se ocultan automáticamente las pestañas y campos de iteración.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 font-semibold">
                        Tablero: Todo el Backlog
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-200 dark:bg-white/10 text-slate-500">
                        Sprints: Oculto
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethodology('scrum')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      methodology === 'scrum'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Target className="w-4 h-4 text-amber-500" />
                      <span>Scrum Puro</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Gestión por iteraciones (Sprints) y backlog priorizado. No hay vista de tablero continuo; el centro de trabajo es Sprint & Priorización.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/15 text-amber-600 dark:text-amber-300 font-semibold">
                        Sprints: Vista Principal
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-200 dark:bg-white/10 text-slate-500">
                        Tablero: Oculto
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectMethodology('scrumban')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      methodology === 'scrumban'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Sliders className="w-4 h-4 text-emerald-500" />
                      <span>Híbrido (Scrumban)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Fusión de Scrum y Kanban. Planificación en Sprint & Priorización y Tablero Kanban exclusivo para el Sprint Goal en curso.
                    </p>
                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 font-semibold">
                        Tablero: Sprint Goal
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                        Sprints: Backlog Grooming
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Default View Selector */}
              <div className="space-y-3 pt-6 border-t border-slate-200 dark:border-white/[0.08]">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Vista Predeterminada al Iniciar
                </label>
                <p className="text-xs text-slate-500">
                  Selecciona la pantalla que se abrirá automáticamente al iniciar la aplicación o cambiar de proyecto activo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setDefaultView('kanban')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      defaultView === 'kanban'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Layout className="w-4 h-4 text-indigo-500" />
                      <span>Tablero Kanban</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Flujo ágil visual enfocado en tareas en curso, revisión y despliegues del día a día.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDefaultView('sprint')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      defaultView === 'sprint'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Target className="w-4 h-4 text-amber-500" />
                      <span>Sprint & Backlog</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Triage masivo, estimación, planificación por iteraciones y asignación ágil de sprints.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDefaultView('release')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      defaultView === 'release'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Rocket className="w-4 h-4 text-emerald-500" />
                      <span>Releases</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Gestión de versiones liberadas a producción, changelogs y notas de entrega del proyecto.
                    </p>
                  </button>
                </div>
              </div>

              {/* Header Visible Tabs */}
              <div className="pt-6 border-t border-slate-200 dark:border-white/[0.08] space-y-3">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Pestañas Habilitadas en la Barra Superior
                </label>
                <p className="text-xs text-slate-500">
                  Personaliza las pestañas visibles en el encabezado. Puedes activar o desactivar cualquiera libremente según las necesidades de tu equipo.
                </p>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <Layout className="w-4 h-4 text-indigo-500" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Tablero Kanban</div>
                        <div className="text-[11px] text-slate-500">
                          {methodology === 'scrumban'
                            ? 'Sprint Board: enfocado exclusivamente en las tareas del Sprint Goal activo'
                            : methodology === 'scrum'
                            ? 'Tablero Kanban (desactivado por defecto en Scrum puro; actívalo si deseas un tablero visual)'
                            : 'Tablero continuo sobre todo el backlog (Draft, Doing, Review, Ready, Done)'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabledTabs.kanban}
                      onChange={(e) => {
                        if (!e.target.checked && !enabledTabs.sprint && !enabledTabs.release) return;
                        setEnabledTabs({ ...enabledTabs, kanban: e.target.checked });
                      }}
                      className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <Target className="w-4 h-4 text-amber-500" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Sprint & Priorización</div>
                        <div className="text-[11px] text-slate-500">
                          {methodology === 'kanban'
                            ? 'Planificación por iteraciones (desactivado por defecto en Kanban continuo)'
                            : 'Hub de iteraciones: estimación, priorización, backlog grooming y sprint goals'}
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabledTabs.sprint}
                      onChange={(e) => {
                        if (!e.target.checked && !enabledTabs.kanban && !enabledTabs.release) return;
                        setEnabledTabs({ ...enabledTabs, sprint: e.target.checked });
                      }}
                      className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] cursor-pointer hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-center gap-3">
                      <Rocket className="w-4 h-4 text-emerald-500" />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">Releases</div>
                        <div className="text-[11px] text-slate-500">Historial de versiones publicadas y notas de entrega</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={enabledTabs.release}
                      onChange={(e) => {
                        if (!e.target.checked && !enabledTabs.kanban && !enabledTabs.sprint) return;
                        setEnabledTabs({ ...enabledTabs, release: e.target.checked });
                      }}
                      className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TABLERO KANBAN */}
          {activeTab === 'kanban' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Estructura de Columnas y Mapeo de Estados
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Reordena, renombra, define límites WIP y asigna libremente qué estados del ciclo de vida caen en cada columna.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetColumns}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restablecer {kanbanEditMode === 'ampliada' ? 'Modo Ampliado' : 'Modo Simple'}</span>
                </button>
              </div>

              {/* Mode Switcher to configure Ampliada vs Simplificada */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Modo de Tablero a Configurar:
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => setKanbanEditMode('ampliada')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        kanbanEditMode === 'ampliada'
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>🔍 Modo Ampliado (5 columnas)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setKanbanEditMode('simplificada')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        kanbanEditMode === 'simplificada'
                          ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>⚡ Modo Simple (3 columnas)</span>
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  {activeColumnsList.length} columnas configuradas
                </div>
              </div>

              {/* Ideas Column Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Mostrar Columna "Ideas / Discovery" por defecto
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Por defecto se oculta para mantener el tablero enfocado en tareas activas.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showIdeasByDefault}
                    onChange={(e) => setShowIdeasByDefault(e.target.checked)}
                    className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Done History Toggle (DEV-058) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Mostrar Histórico de "Done" por defecto
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Por defecto se ocultan las tareas cerradas de sprints e iteraciones pasadas para maximizar el rendimiento y reducir ruido visual.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={showDoneHistoryByDefault}
                    onChange={(e) => setShowDoneHistoryByDefault(e.target.checked)}
                    className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>

              {/* Column list editor with Interactive Statuses */}
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
                  Columnas del {kanbanEditMode === 'ampliada' ? 'Modo Ampliado' : 'Modo Simple'} ({activeColumnsList.length})
                </div>

                {activeColumnsList.map((col, index) => {
                  const currentWip = wipLimits[col.id] || col.wipLimit || 0;

                  return (
                    <div
                      key={col.id}
                      className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border shadow-xs space-y-4 transition-all duration-150 ${
                        dragOverColId === col.id && draggingStatus?.fromColId !== col.id
                          ? 'border-indigo-400 dark:border-indigo-500 ring-2 ring-indigo-300/50 dark:ring-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/[0.04]'
                          : 'border-slate-200 dark:border-white/[0.08]'
                      }`}
                      onDragOver={(e) => { if (draggingStatus) { e.preventDefault(); setDragOverColId(col.id); } }}
                      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverColId(null); }}
                      onDrop={(e) => { e.preventDefault(); handleMoveStatusToColumn(col.id); }}
                    >
                      {/* Header: Dot + Title Input + Subtitle + Reorder Buttons */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`w-3.5 h-3.5 rounded-full ${col.dotColor} shrink-0`} />
                          <div className="flex-1 max-w-sm">
                            <input
                              type="text"
                              value={col.title}
                              onChange={(e) => handleUpdateColumnField(index, 'title', e.target.value)}
                              className="text-sm font-bold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-white/20 focus:border-indigo-500 focus:outline-none px-1 text-slate-900 dark:text-white w-full"
                              title="Editar título de la columna"
                            />
                            {col.subtitle && (
                              <p className="text-[10px] text-slate-400 px-1 font-mono">
                                {col.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Order Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveColumn(index, 'up')}
                            disabled={index === 0}
                            title="Mover hacia la izquierda"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] disabled:opacity-20 transition-colors"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveColumn(index, 'down')}
                            disabled={index === activeColumnsList.length - 1}
                            title="Mover hacia la derecha"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.08] disabled:opacity-20 transition-colors"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* WIP Limit & Drop Target Settings */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Límite WIP (Capacidad):</span>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={currentWip || ''}
                            placeholder="Ilimitado"
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              const next = { ...wipLimits };
                              if (isNaN(val) || val <= 0) {
                                delete next[col.id];
                              } else {
                                next[col.id] = val;
                              }
                              setWipLimits(next);
                            }}
                            className="w-24 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="flex items-center gap-2 sm:justify-end">
                          <span className="text-xs text-slate-500 dark:text-slate-400">Estado al soltar tarjeta:</span>
                          <select
                            value={col.dropTargetStatus || col.statuses[0] || 'draft'}
                            onChange={(e) => handleUpdateColumnField(index, 'dropTargetStatus', e.target.value as ItemStatus)}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            {col.statuses.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Interactive Status Remapping */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Estados asignados a esta columna ({col.statuses.length}):
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Cualquier tarjeta con estos estados se agrupará aquí
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {draggingStatus && draggingStatus.fromColId !== col.id && (
                            <span className="text-[10px] text-indigo-500 dark:text-indigo-400 italic animate-pulse">
                              Suelta aquí para mover
                            </span>
                          )}
                          {col.statuses.map((st) => (
                            <span
                              key={st}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = 'move';
                                setDraggingStatus({ status: st as ItemStatus, fromColId: col.id });
                              }}
                              onDragEnd={() => { setDraggingStatus(null); setDragOverColId(null); }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border shadow-2xs group/st cursor-grab active:cursor-grabbing select-none transition-opacity ${
                                draggingStatus?.status === st && draggingStatus?.fromColId === col.id
                                  ? 'opacity-40 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20'
                                  : 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20'
                              }`}
                            >
                              <span className="text-indigo-300 dark:text-indigo-600 mr-0.5">⠿</span>
                              <span>{st}</span>
                              {col.statuses.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStatusFromColumn(col.id, st)}
                                  title={`Quitar ${st} de esta columna`}
                                  className="p-0.5 rounded text-indigo-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/20 transition-colors ml-0.5"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </span>
                          ))}

                          {/* Add status selector */}
                          <div className="relative inline-flex items-center">
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAddStatusToColumn(col.id, e.target.value as ItemStatus);
                                }
                              }}
                              className="appearance-none text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 border border-dashed border-indigo-300 dark:border-indigo-500/30 rounded-lg pl-2.5 pr-6 py-1 cursor-pointer focus:outline-none transition-colors"
                            >
                              <option value="" disabled>+ Asignar Estado...</option>
                              {ALL_ITEM_STATUSES.filter((s) => !col.statuses.includes(s.id)).map((s) => (
                                <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                                  {s.label} ({s.id}) — {s.desc}
                                </option>
                              ))}
                            </select>
                            <Plus className="w-3 h-3 text-indigo-500 pointer-events-none absolute right-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TIPOS DE TARJETA & TAXONOMÍA (DEV-059) */}
          {activeTab === 'taxonomy' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-500" />
                  <span>Tipos de Tarjeta y Taxonomía del Proyecto</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Soberanía administrativa: personaliza la taxonomía de cards según las necesidades de tu equipo. Crea nuevos tipos (ej. Spike, Infraestructura, Research), configura paletas cromáticas e iconos semánticos.
                </p>
              </div>

              {/* Sección 1: Tipos del Sistema (Nativos) */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Tipos Estándar del Sistema
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Taxonomía base predeterminada por DevBoard. Siempre disponibles en tus filtros y flujos.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/[0.08]">
                    6 tipos base
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { key: 'feature', label: 'Feature', desc: 'Nueva funcionalidad o entrega de valor', icon: '🚀', badge: 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20 text-violet-600 dark:text-violet-300' },
                    { key: 'bug', label: 'Bug', desc: 'Defecto, error o comportamiento anómalo', icon: '🐛', badge: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-300' },
                    { key: 'tech_debt', label: 'Tech Debt', desc: 'Refactor, optimización o mantenimiento', icon: '🛠️', badge: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-300' },
                    { key: 'ux', label: 'UX/UI', desc: 'Diseño visual, prototipado y accesibilidad', icon: '🎨', badge: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-300' },
                    { key: 'epic', label: 'Epic', desc: 'Gran iniciativa que agrupa historias y tareas', icon: '📚', badge: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300' },
                    { key: 'initiative', label: 'Initiative', desc: 'Objetivo estratégico o hito de alto nivel', icon: '⚡', badge: 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300' },
                  ].map((sys) => (
                    <div key={sys.key} className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.05] bg-slate-50/50 dark:bg-white/[0.01] flex items-start gap-3">
                      <div className="text-xl shrink-0 mt-0.5">{sys.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${sys.badge}`}>
                            {sys.label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">({sys.key})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {sys.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 2: Tipos Personalizados */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Tipos Personalizados de tu Proyecto ({customItemTypes.length})
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Tipos definidos a medida. Se integran automáticamente en selectores de creación, filtros y badges Kanban.
                    </p>
                  </div>
                </div>

                {customItemTypes.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-center space-y-1">
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      No hay tipos personalizados configurados aún.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Usa el formulario a continuación para crear tu primer tipo personalizado (ej. <code className="text-indigo-500">spike</code>, <code className="text-indigo-500">infra</code>, <code className="text-indigo-500">research</code>).
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customItemTypes.map((itemType) => {
                      const IconComp = getIconByName(itemType.iconName);
                      const isEditingThis = editingTypeKey === itemType.key;
                      return (
                        <div
                          key={itemType.key}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isEditingThis
                              ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-white/[0.06] bg-slate-50/50 dark:bg-white/[0.01] hover:border-slate-300 dark:hover:border-white/15'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                                <IconComp className={`w-4 h-4 ${itemType.color}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${itemType.badge}`}>
                                    <IconComp className="w-3 h-3" />
                                    <span>{itemType.label}</span>
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    clave: <span className="text-slate-600 dark:text-slate-300 font-semibold">{itemType.key}</span>
                                  </span>
                                </div>
                                {itemType.description && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {itemType.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditType(itemType)}
                                title="Editar tipo"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteType(itemType.key)}
                                title="Eliminar tipo"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sección 3: Formulario Crear / Editar Tipo */}
              <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    {editingTypeKey ? <Edit2 className="w-4 h-4 text-indigo-500" /> : <Plus className="w-4 h-4 text-indigo-500" />}
                    <span>{editingTypeKey ? `Editar Tipo '${typeFormLabel || editingTypeKey}'` : 'Crear Nuevo Tipo de Tarjeta'}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define la clave identificadora, nombre legible, paleta cromática semántica e icono visual.
                  </p>
                </div>

                <form onSubmit={handleAddOrUpdateType} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Clave Identificadora */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Clave Identificadora (slug) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={typeFormKey}
                        disabled={!!editingTypeKey}
                        onChange={(e) => setTypeFormKey(e.target.value)}
                        placeholder="ej. spike, infra, research"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-mono"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Identificador único en minúsculas (usado en metadatos y Markdown).
                      </p>
                    </div>

                    {/* Nombre Legible */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nombre Visible (Label) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={typeFormLabel}
                        onChange={(e) => setTypeFormLabel(e.target.value)}
                        placeholder="ej. Spike Técnico, Infraestructura"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Nombre mostrado en modales, badges y filtros.
                      </p>
                    </div>
                  </div>

                  {/* Icono & Paleta de Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Selector de Icono */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Icono Semántico (Lucide)
                      </label>
                      <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 max-h-32 overflow-y-auto">
                        {AVAILABLE_CUSTOM_ICONS.map((iconName) => {
                          const IconComp = getIconByName(iconName);
                          const isSelected = typeFormIcon === iconName;
                          return (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setTypeFormIcon(iconName)}
                              title={iconName}
                              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                                isSelected
                                  ? 'bg-indigo-600 text-white shadow-xs scale-105'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                              }`}
                            >
                              <IconComp className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Paleta de Color Preset */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Paleta Cromática Semántica
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {ITEM_TYPE_COLOR_PRESETS.map((preset) => {
                          const isSelected = typeFormColorPreset === preset.id;
                          return (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setTypeFormColorPreset(preset.id)}
                              className={`px-2 py-1.5 rounded-lg border text-left text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500/10 font-bold ring-1 ring-indigo-500 text-indigo-900 dark:text-white shadow-2xs'
                                  : 'border-slate-200 dark:border-white/[0.08] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${preset.dotColor}`} />
                              <span className="truncate">{preset.name.split(' ')[0]}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Descripción Opcional */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Descripción o Propósito (Opcional)
                    </label>
                    <input
                      type="text"
                      value={typeFormDescription}
                      onChange={(e) => setTypeFormDescription(e.target.value)}
                      placeholder="Breve propósito de este tipo para guiar al equipo de desarrollo y a los agentes de IA..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Vista Previa en Vivo */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Vista previa del badge:
                    </span>
                    {(() => {
                      const selPreset = ITEM_TYPE_COLOR_PRESETS.find(p => p.id === typeFormColorPreset) || ITEM_TYPE_COLOR_PRESETS[0];
                      const PreviewIcon = getIconByName(typeFormIcon);
                      return (
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold border ${selPreset.badge}`}>
                            <PreviewIcon className="w-3.5 h-3.5" />
                            <span>{typeFormLabel.trim() || 'Tipo de Muestra'}</span>
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            [{typeFormKey.trim() || 'slug'}]
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    {editingTypeKey && (
                      <button
                        type="button"
                        onClick={handleCancelEditType}
                        className="px-4 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all"
                      >
                        Cancelar Edición
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-[0.98]"
                    >
                      {editingTypeKey ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      <span>{editingTypeKey ? 'Actualizar Tipo' : 'Agregar Tipo al Proyecto'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: APARIENCIA */}
          {activeTab === 'visual' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Apariencia y Ergonomía
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ajusta la paleta visual, densidad tipográfica y comportamientos automáticos de guardado.
                </p>
              </div>

              {/* Theme Selector Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Tema Visual
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      theme === 'light'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Claro (Light)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Diseñado para entornos bien iluminados y contrastes suaves.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      theme === 'dark'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Moon className="w-4 h-4 text-indigo-400" />
                      <span>Oscuro (Dark)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Estética moderna estilo Linear para reducir la fatiga visual en sesiones largas.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      theme === 'system'
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-500/30 shadow-xs'
                        : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold text-xs text-slate-900 dark:text-white mb-1.5">
                      <Monitor className="w-4 h-4 text-slate-400" />
                      <span>Sistema Operativo</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Se adapta automáticamente a la preferencia global de tu dispositivo.
                    </p>
                  </button>
                </div>
              </div>

              {/* Density and AutoSave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-white/[0.08]">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Densidad del Tablero
                  </label>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Espaciado y tamaño de las tarjetas en las columnas.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDensity('comfortable')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        density === 'comfortable'
                          ? 'bg-white dark:bg-indigo-600/30 border-indigo-500/40 text-indigo-600 dark:text-indigo-200 shadow-xs font-semibold'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Cómoda (Estándar)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDensity('compact')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        density === 'compact'
                          ? 'bg-white dark:bg-indigo-600/30 border-indigo-500/40 text-indigo-600 dark:text-indigo-200 shadow-xs font-semibold'
                          : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                      }`}
                    >
                      Compacta (Power-User)
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08]">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Autoguardado al Editar
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Persistir cambios en tiempo real al editar detalles de tareas.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Ranking Manual Toggle (DEV-050) */}
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-white/[0.02] cursor-pointer hover:border-indigo-500/30 transition-colors">
                    <div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Ranking Manual y Drag & Drop en Backlog
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Permite arrastrar filas en Sprint & Priorización para reordenar tareas libremente y fijar prioridades relativas.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={rankingEnabled}
                      onChange={(e) => setRankingEnabled(e.target.checked)}
                      className="rounded border-slate-300 dark:border-white/20 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATOS & HERRAMIENTAS */}
          {activeTab === 'tools' && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                  Datos, Migraciones & Backups
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Herramientas para importar backlogs existentes y generar copias de seguridad de tus tareas.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Import Wizard */}
                <div className="p-5 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Asistente de Importación de Backlog Legacy
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                        Importa listas de tareas en texto o Markdown plano (checklists <code className="font-mono text-[10px]">- [ ]</code>, headings de sprint y prioridades) y conviértelas en tarjetas estructuradas de DevBoard.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenImportWizard}
                    className="self-start sm:self-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-[0.98] shrink-0"
                  >
                    Abrir Asistente
                  </button>
                </div>

                {/* Export Monolithic Markdown */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Exportar Backlog Consolidado (BACKLOG.md)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                        Descarga un único archivo Markdown consolidado con el estado actual de todas las tareas activas y archivadas para compartir o versionar en repositorios externos.
                      </p>
                    </div>
                  </div>
                  {currentProject && (
                    <button
                      type="button"
                      onClick={() => onExportMonolithic?.(currentProject.id)}
                      className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0"
                    >
                      <Download className="w-4 h-4 text-emerald-500" />
                      <span>Descargar Markdown</span>
                    </button>
                  )}
                </div>

                {/* Export JSON Backup */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        Copia de Seguridad JSON (Backup Completo)
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
                        Descarga la estructura cruda de ítems, metadatos, planes y dependencias en un archivo JSON nativo para migración o restauración en frío.
                      </p>
                    </div>
                  </div>
                  {currentProject && (
                    <button
                      type="button"
                      onClick={() => onExportJson?.(currentProject.id)}
                      className="self-start sm:self-center flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all shrink-0"
                    >
                      <Download className="w-4 h-4 text-amber-500" />
                      <span>Descargar JSON</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AVANZADO (JSON) */}
          {activeTab === 'advanced' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Editor de Configuración (.devboard/config.json)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Inspecciona y edita directamente los parámetros serializados del proyecto.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    try {
                      const parsed = JSON.parse(rawJson);
                      setRawJson(JSON.stringify(parsed, null, 2));
                      setJsonError(null);
                      onShowToast?.('JSON formateado correctamente', 'info');
                    } catch (e: any) {
                      setJsonError(`Error de sintaxis: ${e.message}`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Formatear JSON
                </button>
              </div>

              {jsonError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-mono">
                  {jsonError}
                </div>
              )}

              <div className="relative">
                <textarea
                  value={rawJson}
                  onChange={(e) => {
                    setRawJson(e.target.value);
                    if (jsonError) setJsonError(null);
                  }}
                  rows={20}
                  className="w-full p-4 rounded-xl font-mono text-xs bg-slate-900 text-emerald-400 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y leading-relaxed shadow-inner"
                  spellCheck={false}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
