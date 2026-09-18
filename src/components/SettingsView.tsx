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
  Layers
} from 'lucide-react';
import type { DevBoardConfig, ColumnConfig, Project, ItemStatus, ProjectMethodology } from '../types';
import { EXPANDED_COLUMNS, SIMPLIFIED_BASE_COLUMNS } from './KanbanBoard';

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

export type SettingsTabId = 'views' | 'kanban' | 'visual' | 'tools' | 'advanced';

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
  const [showIdeasByDefault, setShowIdeasByDefault] = useState<boolean>(config.kanban?.showIdeasByDefault ?? false);
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
    setShowIdeasByDefault(config.kanban?.showIdeasByDefault ?? false);
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
      kanban: {
        ...config.kanban,
        columns: customColumns,
        simplifiedColumns: customSimplifiedColumns,
        showIdeasByDefault,
        wipLimits
      }
    };
  }, [config, theme, density, methodology, defaultView, enabledTabs, autoSave, customColumns, customSimplifiedColumns, showIdeasByDefault, wipLimits]);

  // Check if modified (dirty state)
  const isDirty = useMemo(() => {
    try {
      return JSON.stringify(builtConfig) !== JSON.stringify(config);
    } catch {
      return false;
    }
  }, [builtConfig, config]);

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
                      className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] shadow-xs space-y-4"
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
                          {col.statuses.map((st) => (
                            <span
                              key={st}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20 shadow-2xs group/st"
                            >
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
