import { useState, useRef, useEffect, type FC } from 'react';
import { 
  Kanban, 
  Target, 
  Rocket, 
  Archive, 
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
  Download,
  RotateCcw,
  Database
} from 'lucide-react';
import type { Project, ViewMode } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface HeaderProps {
  projects: Project[];
  selectedProjectId: string; // 'all' or project.id
  onSelectProject: (id: string) => void;
  activeTab: 'kanban' | 'sprint' | 'release' | 'archive';
  onSelectTab: (tab: 'kanban' | 'sprint' | 'release' | 'archive') => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onNewItem: () => void;
  onNewProject: () => void;
  onDeleteProject?: (id: string) => void;
  onRestoreDemo?: () => void;
  onResyncDocs: () => void;
  isResyncing: boolean;
  archivedCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onConvertToMd?: (projectId: string) => void;
  onConvertToJson?: (projectId: string) => void;
  onExportMonolithic?: (projectId: string) => void;
  onExportJson?: (projectId: string) => void;
}

export const Header: FC<HeaderProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  activeTab,
  onSelectTab,
  viewMode,
  onChangeViewMode,
  onNewItem,
  onNewProject,
  onResyncDocs,
  isResyncing,
  archivedCount,
  isDarkMode,
  onToggleTheme,
  onDeleteProject,
  onRestoreDemo,
  onConvertToMd,
  onConvertToJson,
  onExportMonolithic,
  onExportJson
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
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

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-white/[0.08] bg-white/90 dark:bg-[#090d15]/85 backdrop-blur-md transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Left: Brand + Project Selector */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-sm tracking-tight text-slate-800 dark:text-white hidden sm:inline">
                DevBoard
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

            {/* Project Dropdown */}
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

                        <div className="px-1.5 pt-1.5 text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          Exportar & Descargas
                        </div>
                        {onExportMonolithic && (
                          <button
                            onClick={() => {
                              setProjectMenuOpen(false);
                              onExportMonolithic(currentProject.id);
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-left text-[11px] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>Reporte de documentación (BACKLOG.md)</span>
                          </button>
                        )}
                        {onExportJson && (
                          <button
                            onClick={() => {
                              setProjectMenuOpen(false);
                              onExportJson(currentProject.id);
                            }}
                            className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05] text-left text-[11px] transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            <span>Copia de seguridad completa (backlog.json)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'kanban'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.04]'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Tablero</span>
            </button>

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

            <button
              onClick={() => onSelectTab('archive')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'archive'
                  ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-white/[0.04]'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Archivo</span>
              {archivedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  {archivedCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right: Kanban View Mode Switcher + Theme Switcher + Actions */}
          <div className="flex items-center gap-2.5">
            {activeTab === 'kanban' && (
              <div className="hidden md:flex items-center bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] p-0.5 rounded-lg text-[11px]">
                <button
                  onClick={() => onChangeViewMode('simplificada')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    viewMode === 'simplificada'
                      ? 'bg-white dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-200 border border-slate-200 dark:border-indigo-500/30 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  ⚡ Simple
                </button>
                <button
                  onClick={() => onChangeViewMode('ampliada')}
                  className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                    viewMode === 'ampliada'
                      ? 'bg-white dark:bg-indigo-600/30 text-indigo-600 dark:text-indigo-200 border border-slate-200 dark:border-indigo-500/30 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  🔍 Ampliada
                </button>
              </div>
            )}

            {/* Theme Switcher Toggle Button */}
            <button
              onClick={onToggleTheme}
              title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              aria-label={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
              className="relative p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.09] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 transition-all duration-200 transform active:scale-90 hover:shadow-sm"
            >
              <div className="w-3.5 h-3.5 relative flex items-center justify-center">
                {isDarkMode ? (
                  <Sun className="w-3.5 h-3.5 text-amber-400 transform transition-transform duration-300 rotate-0 hover:rotate-45" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-slate-600 transform transition-transform duration-300 -rotate-12 hover:rotate-0" />
                )}
              </div>
            </button>

            {/* Resync button */}
            <button
              onClick={onResyncDocs}
              disabled={isResyncing}
              title="Re-sincronizar /docs de m3"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${isResyncing ? 'animate-spin text-indigo-500' : ''}`} />
              <span className="hidden lg:inline">{isResyncing ? 'Sincronizando...' : 'Re-sync /docs'}</span>
            </button>

            {/* New item button */}
            <button
              onClick={onNewItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/25 transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Ítem</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-indigo-700/50 text-[10px] font-mono border border-indigo-400/30 ml-0.5">
                N
              </kbd>
            </button>
          </div>

        </div>
      </header>

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
