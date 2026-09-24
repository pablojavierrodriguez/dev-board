import { useState, useMemo, useEffect, type FC } from 'react';
import { 
  Rocket, 
  Copy, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Edit2, 
  Trash2, 
  Sparkles, 
  X,
  Save,
  Clock,
  Search,
  Layers,
  FileText
} from 'lucide-react';
import type { BacklogItem, Release } from '../types';
import { syncLegacyReleases } from '../api';
import { typeConfig, priorityConfig } from './ItemCard';

interface ReleaseAssemblerProps {
  items: BacklogItem[];
  releases: Release[];
  projectId: string;
  onArchiveRelease: (release: Partial<Release>, itemCodes: string[]) => Promise<void>;
  onDeleteRelease?: (id: string) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type TabFilter = 'all' | 'unreleased' | 'released';
type DrawerTab = 'details' | 'tasks' | 'changelog';

export const ReleaseAssembler: FC<ReleaseAssemblerProps> = ({
  items,
  releases,
  projectId,
  onArchiveRelease,
  onDeleteRelease,
  onShowToast
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Auto-calculated next suggested version
  const defaultVersion = useMemo(() => {
    if (releases.length > 0) {
      const parts = releases[0].version.split('.').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        return `${parts[0]}.${parts[1] + 1}.0`;
      }
    }
    return '0.4.0';
  }, [releases]);

  // Filtering & Search
  const [tabFilter, setTabFilter] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncingReleases, setIsSyncingReleases] = useState(false);

  // Progressive Disclosure Drawer state
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('details');

  // New Release Modal state
  const [newReleaseModalOpen, setNewReleaseModalOpen] = useState(false);
  const [newVersion, setNewVersion] = useState(defaultVersion);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState(todayStr);
  const [newSummary, setNewSummary] = useState('');

  // Drawer Edit state (for active release)
  const activeRelease = useMemo(() => {
    return releases.find((r) => r.id === activeReleaseId) || null;
  }, [releases, activeReleaseId]);

  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTargetDate, setEditTargetDate] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editScopeNotes, setEditScopeNotes] = useState('');
  const [editMarkdown, setEditMarkdown] = useState('');
  const [editItemCodes, setEditItemCodes] = useState<string[]>([]);
  const [isSavingDrawer, setIsSavingDrawer] = useState(false);

  // Sync Drawer state with active release
  useEffect(() => {
    if (activeRelease) {
      setEditTitle(activeRelease.title || '');
      setEditDate(activeRelease.date || todayStr);
      setEditTargetDate(activeRelease.targetDate || activeRelease.date || todayStr);
      setEditSummary(activeRelease.summary || '');
      setEditScopeNotes(activeRelease.scopeNotes || '');
      setEditMarkdown(activeRelease.markdownContent || '');
      setEditItemCodes(activeRelease.itemCodes || []);
    }
  }, [activeRelease, todayStr]);

  // Pure binary model: unreleased vs released
  const unreleasedReleases = useMemo(() => {
    return releases.filter((r) => r.status === 'unreleased' || (!r.status && r.version !== '0.2.0'));
  }, [releases]);

  const publishedReleases = useMemo(() => {
    return releases.filter((r) => r.status === 'released' || (!r.status && r.version === '0.2.0'));
  }, [releases]);

  // Filtered releases list
  const visibleReleases = useMemo(() => {
    let list = releases;
    if (tabFilter === 'unreleased') {
      list = unreleasedReleases;
    } else if (tabFilter === 'released') {
      list = publishedReleases;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.version.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          (r.summary && r.summary.toLowerCase().includes(q)) ||
          (r.itemCodes && r.itemCodes.some((code) => code.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [releases, tabFilter, unreleasedReleases, publishedReleases, searchQuery]);

  // Available finished tasks not assigned to any release
  const availableDoneTasks = useMemo(() => {
    const assignedCodes = new Set<string>();
    for (const r of releases) {
      for (const c of r.itemCodes || []) {
        assignedCodes.add(c);
      }
    }
    return items.filter(
      (it) =>
        (it.status === 'done' || it.status === 'ready' || it.status === 'finish') &&
        !assignedCodes.has(it.code) &&
        !editItemCodes.includes(it.code)
    );
  }, [items, releases, editItemCodes]);

  // Helper to generate markdown changelog from items
  const generateChangelogForTasks = (versionStr: string, titleStr: string, summaryStr: string, itemCodeList: string[]) => {
    const selectedItems = items.filter((it) => itemCodeList.includes(it.code));
    const features = selectedItems.filter((i) => i.type === 'feature');
    const bugs = selectedItems.filter((i) => i.type === 'bug');
    const tech = selectedItems.filter((i) => i.type === 'tech_debt');
    const ux = selectedItems.filter((i) => i.type === 'ux');

    let md = `## [${versionStr}] — ${todayStr} 🚀 ${titleStr}\n\n`;
    md += `### 🎯 Resumen\n*${summaryStr || 'Notas de versión y mejoras implementadas.'}*\n\n`;

    if (features.length > 0) {
      md += `### 🚀 Nuevas Funcionalidades & Evolutivos\n`;
      features.forEach((item) => {
        md += `- **${item.title} (${item.code}):**\n`;
        const desc = item.description || item.title;
        md += `  - ${desc.split('\n')[0]}\n`;
      });
      md += `\n`;
    }

    if (bugs.length > 0) {
      md += `### 🛡️ Integridad & Correcciones Críticas\n`;
      bugs.forEach((item) => {
        md += `- **${item.title} (${item.code}):**\n`;
        if (item.impactedFile) {
          md += `  - Archivo impactado: \`${item.impactedFile}\`\n`;
        }
        if (item.fix) {
          md += `  - Corrección: ${item.fix.split('\n')[0]}\n`;
        } else {
          md += `  - ${item.description.split('\n')[0]}\n`;
        }
      });
      md += `\n`;
    }

    if (tech.length > 0) {
      md += `### ⚡ Rendimiento & Arquitectura\n`;
      tech.forEach((item) => {
        md += `- **${item.title} (${item.code}):**\n`;
        md += `  - ${item.description.split('\n')[0]}\n`;
      });
      md += `\n`;
    }

    if (ux.length > 0) {
      md += `### 🎨 Experiencia de Usuario & Micro-UI\n`;
      ux.forEach((item) => {
        md += `- **${item.title} (${item.code}):**\n`;
        md += `  - ${item.description.split('\n')[0]}\n`;
      });
      md += `\n`;
    }

    return md.trim();
  };

  // Actions
  const handleOpenNewRelease = () => {
    setNewVersion(defaultVersion);
    setNewTitle('');
    setNewTargetDate(todayStr);
    setNewSummary('');
    setNewReleaseModalOpen(true);
  };

  const handleCreateNewRelease = async () => {
    const v = newVersion.trim();
    if (!v) {
      onShowToast('Por favor especifica una versión válida', 'error');
      return;
    }

    const newRel: Partial<Release> = {
      projectId: projectId === 'all' ? (items[0]?.projectId || 'dev-board') : projectId,
      version: v,
      title: newTitle.trim() || `En Preparación: v${v}`,
      targetDate: newTargetDate,
      date: newTargetDate,
      summary: newSummary.trim() || 'Versión en preparación',
      status: 'unreleased',
      itemCodes: [],
      markdownContent: `## [${v}] — En Preparación 🛠️ ${newTitle.trim() || 'Versión en desarrollo'}\n\n### 🎯 Resumen\n*${newSummary.trim() || 'En desarrollo.'}*`
    };

    try {
      await onArchiveRelease(newRel, []);
      onShowToast(`Versión v${v} creada en preparación (Unreleased)`, 'success');
      setNewReleaseModalOpen(false);
      // Auto open drawer for the newly created release
      setTimeout(() => {
        const found = releases.find((r) => r.version === v);
        if (found) {
          setActiveReleaseId(found.id);
        }
      }, 300);
    } catch (err: any) {
      onShowToast(err.message || 'Error al crear la versión', 'error');
    }
  };

  const handleSaveDrawer = async () => {
    if (!activeRelease) return;
    setIsSavingDrawer(true);
    try {
      await onArchiveRelease(
        {
          id: activeRelease.id,
          projectId: activeRelease.projectId || (projectId === 'all' ? (items[0]?.projectId || 'dev-board') : projectId),
          version: activeRelease.version,
          title: editTitle.trim(),
          date: editDate,
          targetDate: editTargetDate,
          summary: editSummary.trim(),
          scopeNotes: editScopeNotes.trim(),
          markdownContent: editMarkdown.trim(),
          status: activeRelease.status || 'unreleased'
        },
        editItemCodes
      );
      onShowToast(`Cambios en v${activeRelease.version} guardados exitosamente`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Error al guardar cambios', 'error');
    } finally {
      setIsSavingDrawer(false);
    }
  };

  const handlePromoteToProduction = async (rel: Release) => {
    if (!window.confirm(`¿Confirmas la liberación formal de la versión v${rel.version} a Producción? Esta versión pasará a ser inmutable y se sellará con fecha ${todayStr}.`)) {
      return;
    }

    try {
      await onArchiveRelease(
        {
          id: rel.id,
          projectId: rel.projectId || (projectId === 'all' ? (items[0]?.projectId || 'dev-board') : projectId),
          version: rel.version,
          title: rel.title.replace(/^En Preparación:\s*/i, ''),
          date: todayStr,
          targetDate: rel.targetDate || todayStr,
          summary: rel.summary,
          markdownContent: rel.markdownContent,
          status: 'released'
        },
        rel.itemCodes || []
      );
      onShowToast(`🚀 ¡Versión v${rel.version} liberada a Producción!`, 'success');
      setActiveReleaseId(null);
    } catch (err: any) {
      onShowToast(err.message || 'Error al liberar a producción', 'error');
    }
  };

  const handleQuickCopyMarkdown = async (content: string, ver: string) => {
    try {
      await navigator.clipboard.writeText(content);
      onShowToast(`¡Changelog v${ver} copiado al portapapeles!`, 'success');
    } catch {
      onShowToast('Error al copiar al portapapeles', 'error');
    }
  };

  const handleRegenerateMarkdown = () => {
    if (!activeRelease) return;
    const gen = generateChangelogForTasks(activeRelease.version, editTitle, editSummary, editItemCodes);
    setEditMarkdown(gen);
    onShowToast('Notas de release regeneradas a partir de las tareas vinculadas', 'info');
  };

  const handleToggleTaskInRelease = (code: string) => {
    setEditItemCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      } else {
        return [...prev, code];
      }
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header & Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] bg-slate-950/40 backdrop-blur-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Rocket className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Centro de Releases & Versionado
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Modelo binario simplificado: versiones <strong className="text-amber-400 font-medium">En Preparación</strong> (desarrollo activo mutable) y versiones <strong className="text-emerald-400 font-medium">Implementadas</strong> (histórico oficial inmutable en producción).
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleOpenNewRelease}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Versión (En Preparación)</span>
            </button>

            <button
              onClick={async () => {
                setIsSyncingReleases(true);
                try {
                  const res = await syncLegacyReleases(projectId);
                  onShowToast(`Sincronizados ${res.count} releases desde el repositorio`, 'success');
                } catch (err: any) {
                  onShowToast(err.message || 'Error sincronizando releases', 'error');
                } finally {
                  setIsSyncingReleases(false);
                }
              }}
              disabled={isSyncingReleases}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/[0.08] transition-all"
              title="Sincroniza notas de release con releases.json y el árbol local"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingReleases ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Tab Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/30 border border-white/[0.06] w-full sm:w-auto">
            <button
              onClick={() => setTabFilter('all')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tabFilter === 'all'
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Todas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/[0.08] text-slate-300 font-mono">
                {releases.length}
              </span>
            </button>

            <button
              onClick={() => setTabFilter('unreleased')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tabFilter === 'unreleased'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>En Preparación</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                {unreleasedReleases.length}
              </span>
            </button>

            <button
              onClick={() => setTabFilter('released')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tabFilter === 'released'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Implementadas</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                {publishedReleases.length}
              </span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por versión o título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-black/20 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>
      </div>

      {/* Streamlined Compact Feed */}
      <div className="space-y-3">
        {visibleReleases.length === 0 ? (
          <div className="glass-panel py-12 text-center rounded-2xl border border-dashed border-white/[0.08] space-y-2">
            <Rocket className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-400">
              No se encontraron versiones con el filtro seleccionado.
            </p>
            <p className="text-xs text-slate-500">
              Crea una versión en preparación pulsando <span className="text-indigo-400 font-medium">"Nueva Versión"</span>.
            </p>
          </div>
        ) : (
          visibleReleases.map((rel) => {
            const isUnrel = rel.status === 'unreleased' || (!rel.status && rel.version !== '0.2.0');
            const matchingItems = items.filter(
              (it) =>
                (rel.itemCodes || []).includes(it.code) ||
                it.milestone === rel.version ||
                it.targetRelease === rel.version
            );
            const total = matchingItems.length;
            const done = matchingItems.filter(
              (it) => it.status === 'done' || it.status === 'finish' || it.status === 'ready'
            ).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={rel.id}
                onClick={() => setActiveReleaseId(rel.id)}
                className={`group rounded-xl border p-4 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isUnrel
                    ? 'border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40 hover:bg-amber-500/[0.04]'
                    : 'border-white/[0.06] bg-slate-900/40 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]'
                }`}
              >
                {/* Left info: Version, Status, Title, Summary */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-lg border ${
                        isUnrel
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      v{rel.version}
                    </span>

                    <span
                      className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                        isUnrel
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {isUnrel ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>En Preparación (Dev)</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Implementado en Producción</span>
                        </>
                      )}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>{rel.targetDate || rel.date}</span>
                    </span>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
                    {rel.title.replace(/^En Preparación:\s*/i, '')}
                  </h3>

                  {rel.summary && (
                    <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                      {rel.summary}
                    </p>
                  )}
                </div>

                {/* Right Progress & Quick Actions */}
                <div className="flex items-center gap-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {/* Progress Indicator */}
                  <div className="w-36 space-y-1 text-right">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Alcance:</span>
                      <span className="font-semibold text-slate-200">
                        {done}/{total} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          pct === 100
                            ? 'bg-emerald-500'
                            : isUnrel
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickCopyMarkdown(rel.markdownContent, rel.version)}
                      className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.06] transition-all"
                      title="Copiar Changelog Markdown"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {isUnrel && (
                      <button
                        onClick={() => handlePromoteToProduction(rel)}
                        disabled={total === 0}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all"
                        title="Liberar formalmente esta versión a Producción"
                      >
                        <Rocket className="w-3.5 h-3.5 text-emerald-100" />
                        <span className="hidden sm:inline">Liberar</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveReleaseId(rel.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium border border-indigo-500/20 transition-all"
                    >
                      <span>Detalle</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {isUnrel && onDeleteRelease && (
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la versión en preparación v${rel.version}?`)) {
                            onDeleteRelease(rel.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all"
                        title="Eliminar borrador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* PROGRESSIVE DISCLOSURE DRAWER (Master-Detail Linear-Style)                */}
      {/* ========================================================================= */}
      {activeRelease && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-2xl h-full bg-slate-950 border-l border-white/[0.1] shadow-2xl flex flex-col overflow-hidden animate-slide-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/[0.08] bg-slate-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                    activeRelease.status === 'released'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  v{activeRelease.version}
                </span>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {editTitle || activeRelease.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        activeRelease.status === 'released' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {activeRelease.status === 'released'
                        ? 'Implementado en Producción (Inmutable)'
                        : 'En Preparación (Editable)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeRelease.status !== 'released' && (
                  <button
                    onClick={handleSaveDrawer}
                    disabled={isSavingDrawer}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveReleaseId(null)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-all"
                  title="Cerrar panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer Sub-tabs */}
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-white/[0.06] bg-slate-900/30">
              <button
                onClick={() => setDrawerTab('details')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-medium border-b-2 transition-all ${
                  drawerTab === 'details'
                    ? 'border-indigo-500 text-white bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Metadatos & Alcance</span>
              </button>

              <button
                onClick={() => setDrawerTab('tasks')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-medium border-b-2 transition-all ${
                  drawerTab === 'tasks'
                    ? 'border-indigo-500 text-white bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Tareas Asociadas ({editItemCodes.length})</span>
              </button>

              <button
                onClick={() => setDrawerTab('changelog')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-t-lg text-xs font-medium border-b-2 transition-all ${
                  drawerTab === 'changelog'
                    ? 'border-indigo-500 text-white bg-white/[0.04]'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Notas de Cambio (Changelog)</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: METADATOS */}
              {drawerTab === 'details' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Título Descriptivo de la Versión
                    </label>
                    <input
                      type="text"
                      disabled={activeRelease.status === 'released'}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Ej: Workflow Views & Drag and Drop"
                      className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        {activeRelease.status === 'released' ? 'Fecha de Lanzamiento' : 'Fecha Objetivo (Target Date)'}
                      </label>
                      <input
                        type="date"
                        disabled={activeRelease.status === 'released'}
                        value={activeRelease.status === 'released' ? editDate : editTargetDate}
                        onChange={(e) => {
                          if (activeRelease.status === 'released') setEditDate(e.target.value);
                          else setEditTargetDate(e.target.value);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-300">
                        Estado del Paquete
                      </label>
                      <div className="px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs font-medium flex items-center gap-2">
                        {activeRelease.status === 'released' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Implementado en Producción</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-amber-300">En Preparación (Unreleased)</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Resumen Ejecutivo (Summary)
                    </label>
                    <textarea
                      rows={3}
                      disabled={activeRelease.status === 'released'}
                      value={editSummary}
                      onChange={(e) => setEditSummary(e.target.value)}
                      placeholder="Breve resumen de los aportes de esta versión para el usuario final..."
                      className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Notas de Alcance / Definición de Hito
                    </label>
                    <textarea
                      rows={3}
                      disabled={activeRelease.status === 'released'}
                      value={editScopeNotes}
                      onChange={(e) => setEditScopeNotes(e.target.value)}
                      placeholder="Criterios de alcance, dependencias clave o metas de negocio asociadas a esta versión..."
                      className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-60"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: TAREAS ASOCIADAS */}
              {drawerTab === 'tasks' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200">
                      Tareas en este Paquete ({editItemCodes.length})
                    </h4>
                    {activeRelease.status !== 'released' && (
                      <span className="text-[11px] text-slate-400">
                        Pulsa en la cruz para desvincular una tarea
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {editItemCodes.length === 0 ? (
                      <p className="text-xs text-slate-500 py-3 text-center border border-dashed border-white/[0.08] rounded-xl">
                        No hay tareas asignadas todavía a este paquete.
                      </p>
                    ) : (
                      editItemCodes.map((code) => {
                        const item = items.find((it) => it.code === code);
                        const pConf = item?.priority ? priorityConfig[item.priority] : null;
                        const tConf = item?.type ? typeConfig[item.type] : null;

                        return (
                          <div
                            key={code}
                            className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-mono text-xs font-semibold text-indigo-400">
                                {code}
                              </span>
                              <span className="text-xs text-slate-200 truncate">
                                {item?.title || 'Tarea registrada'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              {tConf && (
                                <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${tConf.badge}`}>
                                  {tConf.label}
                                </span>
                              )}
                              {pConf && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono bg-white/[0.05] ${pConf.text}`}>
                                  {pConf.label}
                                </span>
                              )}

                              {activeRelease.status !== 'released' && (
                                <button
                                  onClick={() => handleToggleTaskInRelease(code)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                  title="Desvincular del release"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Add Unassigned Finished Tasks (only if unreleased) */}
                  {activeRelease.status !== 'released' && availableDoneTasks.length > 0 && (
                    <div className="pt-4 border-t border-white/[0.06] space-y-3">
                      <h4 className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                        <span>Tareas Terminadas Disponibles para Vincular</span>
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                          {availableDoneTasks.length} disponibles
                        </span>
                      </h4>

                      <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                        {availableDoneTasks.map((it) => (
                          <div
                            key={it.code}
                            onClick={() => handleToggleTaskInRelease(it.code)}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-black/20 hover:bg-indigo-500/10 border border-white/[0.04] hover:border-indigo-500/30 cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-mono text-xs font-semibold text-slate-300">
                                {it.code}
                              </span>
                              <span className="text-xs text-slate-300 truncate">
                                {it.title}
                              </span>
                            </div>

                            <button className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" />
                              <span>Vincular</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CHANGELOG */}
              {drawerTab === 'changelog' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-200">
                      Markdown Oficial del Changelog
                    </h4>

                    <div className="flex items-center gap-2">
                      {activeRelease.status !== 'released' && (
                        <button
                          onClick={handleRegenerateMarkdown}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-xs font-medium border border-indigo-500/20 transition-all"
                          title="Regenera el markdown a partir de las tareas vinculadas"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Regenerar Notas</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleQuickCopyMarkdown(editMarkdown, activeRelease.version)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 text-xs font-medium border border-white/[0.08] transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={12}
                    disabled={activeRelease.status === 'released'}
                    value={editMarkdown}
                    onChange={(e) => setEditMarkdown(e.target.value)}
                    className="w-full p-4 rounded-xl bg-black/40 border border-white/[0.08] font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-indigo-500 disabled:opacity-75 resize-y"
                    placeholder="El contenido Markdown de las notas de release aparecerá aquí..."
                  />
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-white/[0.08] bg-slate-900/60 flex items-center justify-between gap-3">
              {activeRelease.status === 'released' ? (
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Versión sellada e implementada en producción.</span>
                </span>
              ) : (
                <button
                  onClick={() => handlePromoteToProduction(activeRelease)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98]"
                >
                  <Rocket className="w-4 h-4 text-emerald-100" />
                  <span>Promover y Liberar a Producción</span>
                </button>
              )}

              <button
                onClick={() => setActiveReleaseId(null)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/[0.08] transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVA VERSIÓN (EN PREPARACIÓN)                                     */}
      {/* ========================================================================= */}
      {newReleaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full max-w-lg bg-slate-950 border border-white/[0.1] rounded-2xl p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <Rocket className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  Crear Versión en Preparación (Unreleased)
                </h3>
              </div>
              <button
                onClick={() => setNewReleaseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Número de Versión *
                  </label>
                  <input
                    type="text"
                    value={newVersion}
                    onChange={(e) => setNewVersion(e.target.value)}
                    placeholder="Ej: 0.4.0"
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Fecha Objetivo (Target Date)
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Título de la Versión *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Sprint Lifecycle & Epics Support"
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Resumen Ejecutivo / Meta del Hito
                </label>
                <textarea
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Describe los principales objetivos y alcances que se entregarán en esta versión..."
                  className="w-full px-3 py-2 rounded-xl bg-black/30 border border-white/[0.08] text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                onClick={() => setNewReleaseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 text-xs font-medium border border-white/[0.08]"
              >
                Cancelar
              </button>

              <button
                onClick={handleCreateNewRelease}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Versión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
