import { useState, useRef, useEffect, type FC } from 'react';
import { 
  Kanban, 
  Target, 
  Rocket, 
  Plus, 
  RefreshCw, 
  ChevronDown, 
  Layers, 
  FolderPlus,
  Check,
  Sun,
  Moon,
  Trash2,
  FileCode,
  RotateCcw,
  Database,
  Upload,
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import type { Project, DevBoardConfig, ActiveTab, UpdateInfo } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface HeaderProps {
  projects: Project[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onNewItem: () => void;
  onNewProject: () => void;
  onDeleteProject?: (id: string) => void;
  onRestoreDemo?: () => void;
  onResyncDocs: () => void;
  isResyncing: boolean;
  trashedCount?: number;
  archivedCount?: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onConvertToMd?: (projectId: string) => void;
  onConvertToJson?: (projectId: string) => void;
  onOpenImportWizard?: () => void;
  liveConnected?: boolean;
  config?: DevBoardConfig;
  singleProject?: boolean;
  updateAvailable?: UpdateInfo | null;
}

export const Header: FC<HeaderProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  activeTab,
  onSelectTab,
  onNewItem,
  onNewProject,
  onResyncDocs,
  isResyncing,
  trashedCount,
  archivedCount = 0,
  isDarkMode,
  onToggleTheme,
  onDeleteProject,
  onRestoreDemo,
  onConvertToMd,
  onConvertToJson,
  onOpenImportWizard,
  liveConnected = false,
  config,
  singleProject = false,
  updateAvailable
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToConvertMd, setProjectToConvertMd] = useState<Project | null>(null);
  const [projectToConvertJson, setProjectToConvertJson] = useState<Project | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProjectMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const currentProjectName = selectedProjectId === 'all' 
    ? 'Todos los Proyectos' 
    : (currentProject?.name || 'Seleccionar Proyecto');

  const formatRepoDisplay = (repoPath?: string, prefix?: string) => {
    if (!repoPath) return `Prefijo: ${prefix || ''}`;
    const parts = repoPath.split(/[/\\]/).filter(Boolean);
    return parts.slice(-2).join('/') || repoPath;
  };

  const hasDemoProject = projects.some(p => p.isDemo || p.id === 'demo');

  const isKanbanEnabled = config?.enabledTabs?.kanban !== undefined
    ? config.enabledTabs.kanban
    : config?.methodology !== 'scrum';

  const isSprintEnabled = config?.enabledTabs?.sprint !== undefined
    ? config.enabledTabs.sprint
    : config?.methodology !== 'kanban';

  const isReleaseEnabled = config?.enabledTabs?.release !== false;

  const defaultHomeTab: ActiveTab = config?.defaultView || (config?.methodology === 'scrum' ? 'sprint' : 'kanban');

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#090d15]/85 backdrop-blur-md transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          
          {/* Left: Brand + Project Selector */}
          <div className="flex items-center gap-4 justify-self-start min-w-0">
            <button
              type="button"
              onClick={() => onSelectTab(defaultHomeTab)}
              title={`Ir al inicio (${defaultHomeTab === 'sprint' ? 'Sprint & Priorización' : 'Tablero'})`}
              className="flex items-center gap-2.5 group cursor-pointer text-left focus:outline-none"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-800 dark:text-white hidden sm:inline group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                DevBoard
              </span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Project Indicator (Single-Project Mode) or Dropdown (Multi-Project) */}
            {singleProject ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-100 max-w-[170px] truncate">
                  {currentProject?.name || currentProjectName}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  Local
                </span>
                {currentProject && !currentProject.isDemo && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-semibold ${
                    currentProject.storageType === 'markdown'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentProject.storageType === 'markdown' ? 'Markdown' : 'JSON'}
                  </span>
                )}
              </div>
            ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProjectMenuOpen(!projectMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="max-w-[170px] truncate">{currentProjectName}</span>
                {currentProject && !currentProject.isDemo && (
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-semibold ${
                    currentProject.storageType === 'markdown'
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentProject.storageType === 'markdown' ? 'Markdown' : 'JSON'}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${projectMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {projectMenuOpen && (
                <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                    Proyectos Registrados
                  </div>
                  
                  <div className="p-1.5 space-y-0.5 max-h-72 overflow-y-auto">
                    {projects.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between group/item rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] pr-1 transition-colors"
                      >
                        <button
                          onClick={() => {
                            onSelectProject(p.id);
                            setProjectMenuOpen(false);
                          }}
                          className={`flex-1 flex items-center justify-between px-2.5 py-2 text-left transition-colors truncate ${
                            selectedProjectId === p.id
                              ? 'text-indigo-600 dark:text-indigo-300 font-medium'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium truncate">{p.name}</span>
                              {p.isDemo ? (
                                <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono">
                                  Demo
                                </span>
                              ) : (
                                <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-semibold ${
                                  p.storageType === 'markdown'
                                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                }`}>
                                  {p.storageType === 'markdown' ? 'MD' : 'JSON'}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate">
                              {formatRepoDisplay(p.repoPath, p.codePrefix)}
                            </div>
                          </div>
                          {selectedProjectId === p.id && <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />}
                        </button>

                        {onDeleteProject && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setProjectMenuOpen(false);
                              setProjectToDelete(p);
                            }}
                            title={p.isDemo ? "Eliminar proyecto Demo" : "Desvincular proyecto"}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10 ml-1 opacity-0 group-hover/item:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      onClick={() => {
                        onSelectProject('all');
                        setProjectMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors border-t border-slate-100 dark:border-white/[0.06] mt-1 ${
                        selectedProjectId === 'all'
                          ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="font-medium">Todos los Proyectos</span>
                      {selectedProjectId === 'all' && <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />}
                    </button>

                    <div className="h-px bg-slate-100 dark:bg-white/[0.08] my-1" />

                    <button
                      onClick={() => {
                        setProjectMenuOpen(false);
                        onNewProject();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 text-left transition-colors font-medium"
                    >
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>+ Nuevo Proyecto</span>
                    </button>

                    {!hasDemoProject && onRestoreDemo && (
                      <button
                        onClick={() => {
                          setProjectMenuOpen(false);
                          onRestoreDemo();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-left transition-colors text-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                        <span>Restaurar Proyecto Demo</span>
                      </button>
                    )}

                    {currentProject && !currentProject.isDemo && (
                      <div className="pt-2 mt-1 border-t border-slate-100 dark:border-white/[0.08] px-1 space-y-1.5">
                        <div className="px-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          Formato de Almacenamiento Local
                        </div>
                        {currentProject.storageType === 'json' && onConvertToMd && (
                          <button
                            onClick={() => {
                              setProjectMenuOpen(false);
                              setProjectToConvertMd(currentProject);
                            }}
                            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-600/20 text-left text-[11px] transition-colors"
                          >
                            <FileCode className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium">Pasar a archivos .md individuales</div>
                              <div className="text-[10px] text-slate-400">Crea carpeta backlog/tasks/*.md para colaborar con agentes de IA sin merge conflicts</div>
                            </div>
                          </button>
                        )}
                        {currentProject.storageType === 'markdown' && onConvertToJson && (
                          <button
                            onClick={() => {
                              setProjectMenuOpen(false);
                              setProjectToConvertJson(currentProject);
                            }}
                            className="w-full flex items-start gap-2 px-2 py-1.5 rounded-lg text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-600/20 text-left text-[11px] transition-colors"
                          >
                            <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium">Unificar en un solo archivo JSON</div>
                              <div className="text-[10px] text-slate-400">Guarda todas las tareas en .devboard/backlog.json</div>
                            </div>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-1 rounded-xl justify-self-center">
            {isKanbanEnabled && (
              <button
                onClick={() => onSelectTab('kanban')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'kanban'
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>{config?.methodology === 'scrumban' ? 'Sprint Board' : 'Tablero'}</span>
              </button>
            )}

            {isSprintEnabled && (
              <button
                onClick={() => onSelectTab('sprint')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'sprint'
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Sprint & Priorización</span>
              </button>
            )}

            {isReleaseEnabled && (
              <button
                onClick={() => onSelectTab('release')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'release'
                    ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Releases</span>
              </button>
            )}
          </nav>

          {/* Right: Actions, Live Sync, Archive, Theme Switcher & Settings */}
          <div className="flex items-center gap-2.5 justify-self-end">
            {/* Update available badge (DEV-107) */}
            {updateAvailable?.hasUpdate && (
              <a
                href={updateAvailable.url || 'https://github.com/pablojavierrodriguez/dev-board/releases'}
                target="_blank"
                rel="noreferrer"
                title={`Nueva versión disponible: v${updateAvailable.latestVersion} (actual: v${updateAvailable.currentVersion})`}
                className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-medium transition-all group shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse group-hover:rotate-12 transition-transform" />
                <span className="font-mono text-[11px] font-semibold">v{updateAvailable.latestVersion}</span>
              </a>
            )}

            {/* Live Sync Status Indicator (DEV-014) */}
            <div 
              title={liveConnected ? 'Sincronización en vivo activa (SSE conectado al backend)' : 'Reconectando con el servidor local...'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
                liveConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {liveConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${liveConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              </span>
              <span className="hidden xl:inline">{liveConnected ? 'Live Sync' : 'Reconectando...'}</span>
            </div>

            {/* Theme Switcher Toggle Button (hidden on mobile, in drawer) */}
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="hidden sm:flex relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 transition-all duration-200 transform active:scale-90 hover:shadow-sm"
            >
              <div className="w-3.5 h-3.5 relative flex items-center justify-center">
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600 transform transition-transform duration-300 -rotate-12 hover:rotate-0" />
                )}
              </div>
            </button>

            {/* Settings Button */}
            <button
              onClick={() => onSelectTab(activeTab === 'settings' ? (config?.defaultView || 'kanban') : 'settings')}
              title={activeTab === 'settings' ? 'Volver al tablero' : 'Configuración de DevBoard (⌘+,)'}
              aria-label="Configuración de DevBoard"
              className={`hidden sm:flex relative p-1.5 rounded-lg border text-xs font-medium transition-all duration-200 transform active:scale-90 ${
                activeTab === 'settings'
                  ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 ring-1 ring-indigo-500/20'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 hover:text-indigo-500 dark:hover:text-indigo-400'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* Papelera discrete icon button (DEV-097) */}
            <button
              onClick={() => onSelectTab(activeTab === 'trash' ? (config?.defaultView || 'kanban') : 'trash')}
              title={activeTab === 'trash' ? 'Volver al tablero' : `Ver papelera (${trashedCount ?? archivedCount})`}
              aria-label="Ver papelera"
              className={`hidden sm:flex relative p-1.5 rounded-lg border text-xs font-medium transition-all duration-200 transform active:scale-90 ${
                activeTab === 'trash'
                  ? 'bg-rose-50 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              {(trashedCount ?? archivedCount) > 0 && (
                <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 text-[9px] font-mono font-bold rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs">
                  {trashedCount ?? archivedCount}
                </span>
              )}
            </button>

            {/* Resync button (DEV-012, hidden on mobile, in drawer) */}
            {currentProject?.hasDocs && (
              <button
                onClick={onResyncDocs}
                disabled={isResyncing}
                title={`Re-sincronizar /docs de ${currentProject.name}`}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isResyncing ? 'animate-spin text-indigo-500' : ''}`} />
                <span className="hidden lg:inline">{isResyncing ? 'Sincronizando...' : 'Re-sync /docs'}</span>
              </button>
            )}

            {/* New item button */}
            <button
              onClick={onNewItem}
              aria-label="Crear nuevo ítem"
              className="min-h-[40px] sm:min-h-[36px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Nuevo Ítem</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-indigo-700/50 text-[10px] font-mono border border-indigo-400/30 ml-0.5">
                N
              </kbd>
            </button>

            {/* Mobile Hamburger Menu Trigger (DEV-007) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú de opciones"
              title="Menú móvil"
              className="md:hidden min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] text-slate-700 dark:text-slate-200 active:scale-95 transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer (DEV-007) */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-full max-w-xs h-full bg-white dark:bg-[#0d1322] border-l border-slate-200 dark:border-white/10 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-sm tracking-tight text-slate-800 dark:text-white">
                    DevBoard
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Cerrar menú"
                  title="Cerrar"
                  className="h-9 w-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions List */}
              <div className="mt-4 space-y-1">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 py-1">
                  Acciones Rápidas
                </div>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNewItem();
                  }}
                  className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <Plus className="w-4 h-4 text-indigo-500" />
                  <span>Crear Nuevo Ítem</span>
                </button>

                {!singleProject && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNewProject();
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <FolderPlus className="w-4 h-4 text-emerald-500" />
                    <span>Nuevo Proyecto</span>
                  </button>
                )}

                {currentProject?.hasDocs && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onResyncDocs();
                    }}
                    disabled={isResyncing}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 text-indigo-500 ${isResyncing ? 'animate-spin' : ''}`} />
                    <span>{isResyncing ? 'Sincronizando docs...' : `Re-sync /docs (${currentProject.name})`}</span>
                  </button>
                )}

                {!singleProject && onOpenImportWizard && (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenImportWizard();
                    }}
                    className="w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                  >
                    <Upload className="w-4 h-4 text-violet-500" />
                    <span>Importar Backlog Markdown</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSelectTab('settings');
                  }}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                  }`}
                >
                  <Settings className="w-4 h-4 text-indigo-500" />
                  <span>Configuración del Espacio de Trabajo</span>
                </button>

                <button
                  onClick={onToggleTheme}
                  className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    <span>Tema {isDarkMode ? 'Claro' : 'Oscuro'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-mono">{isDarkMode ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            </div>

            {/* Live Sync & Version Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${liveConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>{liveConnected ? 'Live Sync Activo' : 'Reconectando...'}</span>
              </div>
              <div className="flex items-center gap-2">
                {updateAvailable?.hasUpdate && (
                  <a
                    href={updateAvailable.url || 'https://github.com/pablojavierrodriguez/dev-board/releases'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
                  >
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    <span>v{updateAvailable.latestVersion}</span>
                  </a>
                )}
                <span className="text-[10px] font-mono opacity-60">v{updateAvailable?.currentVersion || '0.5.0'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal for Deleting/Unlinking Project */}
      <ConfirmModal
        isOpen={!!projectToDelete}
        title={projectToDelete?.isDemo ? "Eliminar Proyecto Demo" : "Desvincular Proyecto"}
        message={
          projectToDelete?.isDemo
            ? "¿Deseas eliminar el proyecto Demo? Podrás restaurarlo en cualquier momento desde este mismo menú."
            : "¿Deseas desvincular este proyecto de DevBoard? Tus archivos de código y tareas en el repositorio local no se borrarán."
        }
        detail={projectToDelete ? `${projectToDelete.name} (${projectToDelete.codePrefix})` : undefined}
        confirmText={projectToDelete?.isDemo ? "Eliminar Demo" : "Desvincular"}
        variant="danger"
        onConfirm={async () => {
          if (projectToDelete && onDeleteProject) {
            await onDeleteProject(projectToDelete.id);
          }
        }}
        onClose={() => setProjectToDelete(null)}
      />

      {/* Confirm Modal for Converting to Backlog.md */}
      <ConfirmModal
        isOpen={!!projectToConvertMd}
        title="Cambiar a Colección de Archivos Markdown"
        message="Esta acción tomará las tareas de tu archivo JSON y creará archivos individuales .md para cada una en la carpeta backlog/tasks/ de tu repositorio. Ideal para trabajar en ramas de Git concurrentes con agentes de IA sin merge conflicts."
        detail={projectToConvertMd ? `${projectToConvertMd.name} → ${projectToConvertMd.repoPath}/backlog/tasks/*.md` : undefined}
        confirmText="Convertir a Archivos .md"
        variant="info"
        onConfirm={async () => {
          if (projectToConvertMd && onConvertToMd) {
            await onConvertToMd(projectToConvertMd.id);
          }
        }}
        onClose={() => setProjectToConvertMd(null)}
      />

      {/* Confirm Modal for Converting to JSON */}
      <ConfirmModal
        isOpen={!!projectToConvertJson}
        title="Unificar en un Solo Archivo JSON"
        message="Esta acción unificará todas las tareas individuales en un único archivo .devboard/backlog.json dentro de tu repositorio. Podrás volver a dividirlas en archivos .md en cualquier momento."
        detail={projectToConvertJson ? `${projectToConvertJson.name} → ${projectToConvertJson.repoPath}/.devboard/backlog.json` : undefined}
        confirmText="Unificar en un Solo JSON"
        variant="warning"
        onConfirm={async () => {
          if (projectToConvertJson && onConvertToJson) {
            await onConvertToJson(projectToConvertJson.id);
          }
        }}
        onClose={() => setProjectToConvertJson(null)}
      />
    </>
  );
};
