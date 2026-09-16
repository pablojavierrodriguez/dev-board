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
  Trash2
} from 'lucide-react';
import type { Project, ViewMode } from '../types';

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
  onResyncDocs: () => void;
  isResyncing: boolean;
  archivedCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
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
  onDeleteProject
}) => {
  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
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

  return (
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
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${projectMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {projectMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 shadow-2xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                  Proyectos Registrados
                </div>
                
                {projects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] group/item transition-colors pr-1.5">
                    <button
                      onClick={() => {
                        onSelectProject(p.id);
                        setProjectMenuOpen(false);
                      }}
                      className={`flex-1 flex items-center justify-between px-2.5 py-2 text-left ${
                        selectedProjectId === p.id
                          ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-300 font-medium rounded-lg'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-1.5 font-medium truncate">
                          <span>{p.name}</span>
                          {p.isDemo && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                              Demo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {p.repoPath ? p.repoPath.split('/').slice(-2).join('/') : `Prefijo: ${p.codePrefix}`}
                        </div>
                      </div>
                      {selectedProjectId === p.id && <Check className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />}
                    </button>

                    {onDeleteProject && projects.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`¿Desvincular proyecto "${p.name}" de DevBoard? (Tus archivos en el repositorio no se borrarán).`)) {
                            onDeleteProject(p.id);
                          }
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
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-600" />
            )}
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
  );
};
