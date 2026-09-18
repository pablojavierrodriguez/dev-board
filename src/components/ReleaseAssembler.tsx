import { useState, useMemo, useEffect, type FC } from 'react';
import { 
  Rocket, 
  Copy, 
  Archive, 
  ChevronDown, 
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Target,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  X
} from 'lucide-react';
import type { BacklogItem, Release } from '../types';
import { syncLegacyReleases } from '../api';

interface ReleaseAssemblerProps {
  items: BacklogItem[];
  releases: Release[];
  projectId: string;
  onArchiveRelease: (release: Partial<Release>, itemCodes: string[]) => Promise<void>;
  onDeleteRelease?: (id: string) => Promise<void>;
  onShowToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReleaseAssembler: FC<ReleaseAssemblerProps> = ({
  items,
  releases,
  projectId,
  onArchiveRelease,
  onDeleteRelease,
  onShowToast
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Predict next version based on past releases
  const defaultVersion = useMemo(() => {
    if (releases.length > 0) {
      const parts = releases[0].version.split('.').map(Number);
      if (parts.length === 3 && !parts.some(isNaN)) {
        return `${parts[0]}.${parts[1] + 1}.0`;
      }
    }
    return '0.6.0';
  }, [releases]);

  const [version, setVersion] = useState(defaultVersion);
  const [date, setDate] = useState(todayStr);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedReleaseId, setExpandedReleaseId] = useState<string | null>(null);
  const [showAlreadyReleased, setShowAlreadyReleased] = useState(false);
  const [isSyncingReleases, setIsSyncingReleases] = useState(false);

  // Split releases into Planned (targets in progress) and Published (historical) (DEV-032)
  const plannedReleases = useMemo(() => {
    return releases.filter((r) => r.status === 'planned');
  }, [releases]);

  const publishedReleases = useMemo(() => {
    return releases.filter((r) => r.status !== 'planned');
  }, [releases]);

  // Planning Modal State (DEV-032)
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [planVersion, setPlanVersion] = useState(defaultVersion);
  const [planTitle, setPlanTitle] = useState('');
  const [planTargetDate, setPlanTargetDate] = useState(todayStr);
  const [planScopeNotes, setPlanScopeNotes] = useState('');

  const openNewPlanModal = () => {
    setPlanId(null);
    setPlanVersion(defaultVersion);
    setPlanTitle('');
    setPlanTargetDate(todayStr);
    setPlanScopeNotes('');
    setPlannerOpen(true);
  };

  const openEditPlanModal = (rel: Release) => {
    setPlanId(rel.id);
    setPlanVersion(rel.version);
    setPlanTitle(rel.title.replace(/^Planificado:\s*/i, ''));
    setPlanTargetDate(rel.targetDate || rel.date || todayStr);
    setPlanScopeNotes(rel.scopeNotes || rel.summary || '');
    setPlannerOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planVersion.trim()) {
      onShowToast('La versión es requerida', 'error');
      return;
    }
    const cleanVer = planVersion.trim().replace(/^v/i, '');
    const planData: Partial<Release> = {
      id: planId || `rel-${cleanVer.replace(/\./g, '-')}-${Date.now()}`,
      projectId: projectId === 'all' ? (items[0]?.projectId || 'dev-board') : projectId,
      version: cleanVer,
      title: planTitle.trim() || `Planificado: v${cleanVer}`,
      summary: planScopeNotes.trim(),
      scopeNotes: planScopeNotes.trim(),
      targetDate: planTargetDate || todayStr,
      date: planTargetDate || todayStr,
      status: 'planned'
    };
    try {
      await onArchiveRelease(planData, []);
      setPlannerOpen(false);
      onShowToast(`Release target v${cleanVer} guardado exitosamente`, 'success');
    } catch (err: any) {
      onShowToast(err.message || 'Error al guardar release planificado', 'error');
    }
  };

  const handleLoadPlannedIntoAssembler = (rel: Release) => {
    setVersion(rel.version);
    setTitle(rel.title.replace(/^Planificado:\s*/i, ''));
    setSummary(rel.scopeNotes || rel.summary || '');
    setDate(todayStr);

    const matchingCodes = items
      .filter((it) => it.milestone === rel.version || it.targetSprint === rel.version || (rel.itemCodes || []).includes(it.code))
      .map((it) => it.code);

    if (matchingCodes.length > 0) {
      setSelectedCodes(new Set(matchingCodes));
    }
    onShowToast(`Release v${rel.version} cargado en el ensamblador con ${matchingCodes.length} tareas asociadas.`, 'info');

    const el = document.getElementById('release-assembler-form');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Set of all task codes already included in any release
  const releasedCodeSet = useMemo(() => {
    const set = new Set<string>();
    for (const rel of releases) {
      if (Array.isArray(rel.itemCodes)) {
        for (const code of rel.itemCodes) {
          if (code) set.add(code.toUpperCase());
        }
      }
    }
    return set;
  }, [releases]);

  // Candidate items: status === 'finish' or status === 'done', excluding already released items unless toggled
  const candidateItems = useMemo(() => {
    return items.filter((it) => {
      const matchProject = projectId === 'all' || it.projectId === projectId;
      if (!matchProject) return false;
      const isCandidateStatus = it.status === 'finish' || it.status === 'done' || it.status === 'ready';
      if (!isCandidateStatus) return false;

      const codeUpper = (it.code || it.id).toUpperCase();
      const isAlreadyReleased = releasedCodeSet.has(codeUpper) || Boolean(it.releasedAt);

      if (isAlreadyReleased && !showAlreadyReleased) {
        return false;
      }
      return true;
    });
  }, [items, projectId, releasedCodeSet, showAlreadyReleased]);

  // Count of historical released items hidden from candidate view
  const hiddenReleasedCount = useMemo(() => {
    return items.filter((it) => {
      const matchProject = projectId === 'all' || it.projectId === projectId;
      if (!matchProject) return false;
      const codeUpper = (it.code || it.id).toUpperCase();
      const isCandidateStatus = it.status === 'done' || it.status === 'finish' || it.status === 'ready';
      const isAlreadyReleased = releasedCodeSet.has(codeUpper) || Boolean(it.releasedAt);
      return isCandidateStatus && isAlreadyReleased;
    }).length;
  }, [items, projectId, releasedCodeSet]);

  const handleSyncLegacyReleases = async () => {
    try {
      setIsSyncingReleases(true);
      const result = await syncLegacyReleases(projectId === 'all' ? undefined : projectId);
      if (result.ok) {
        onShowToast(`Sincronización completada: ${result.count} releases detectados y asociados.`, 'success');
      }
    } catch (err: any) {
      onShowToast(err.message || 'Error al sincronizar releases', 'error');
    } finally {
      setIsSyncingReleases(false);
    }
  };

  // Pre-select items with status 'finish' or 'ready' by default on mount
  useEffect(() => {
    const finishCodes = new Set(candidateItems.filter((i) => i.status === 'finish' || i.status === 'ready').map((i) => i.code));
    setSelectedCodes(finishCodes);
  }, [candidateItems]);

  const toggleSelectCode = (code: string) => {
    const next = new Set(selectedCodes);
    if (next.has(code)) next.delete(code);
    else next.add(code);
    setSelectedCodes(next);
  };

  const selectAllCandidates = () => {
    setSelectedCodes(new Set(candidateItems.map((i) => i.code)));
  };

  const clearSelection = () => {
    setSelectedCodes(new Set());
  };

  // Generate markdown compliant with DOM official release notes standard
  const generatedMarkdown = useMemo(() => {
    const v = version.trim() || '0.6.0';
    const d = date || todayStr;
    const t = title.trim() || 'Release de Estabilización y Mejoras';
    const sum = summary.trim() || 'Hito enfocado en la solidez funcional, integridad y optimización.';

    const selectedItems = candidateItems.filter((i) => selectedCodes.has(i.code));

    const features = selectedItems.filter((i) => i.type === 'feature');
    const bugs = selectedItems.filter((i) => i.type === 'bug');
    const tech = selectedItems.filter((i) => i.type === 'tech_debt');
    const ux = selectedItems.filter((i) => i.type === 'ux');

    let md = `## [${v}] — ${d} 🚀 ${t}\n\n`;
    md += `### 🎯 Resumen\n*${sum}*\n\n`;

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
  }, [version, date, title, summary, selectedCodes, candidateItems, todayStr]);

  const handleCopyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(generatedMarkdown);
      onShowToast('¡Markdown de notas de release copiado al portapapeles!', 'success');
    } catch {
      onShowToast('Error al copiar al portapapeles', 'error');
    }
  };

  const handleArchive = async () => {
    if (!version.trim()) {
      onShowToast('Por favor especifica una versión válida (ej. 0.6.0)', 'error');
      return;
    }
    if (selectedCodes.size === 0) {
      onShowToast('Selecciona al menos un ítem para incluir en el release', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await onArchiveRelease(
        {
          projectId: projectId === 'all' ? 'dom' : projectId,
          version: version.trim(),
          date,
          title: title.trim() || `Release v${version}`,
          summary: summary.trim() || 'Release empaquetado desde DevBoard',
          markdownContent: generatedMarkdown
        },
        Array.from(selectedCodes)
      );

      onShowToast(`¡Release v${version} archivado exitosamente!`, 'success');
      setTitle('');
      setSummary('');
      setSelectedCodes(new Set());
    } catch (err: any) {
      onShowToast(err.message || 'Error al archivar release', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex-1 p-4 sm:p-6 max-w-[1680px] mx-auto overflow-y-auto space-y-8">
      {/* Top Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Rocket className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-slate-100">
                Ensamblador de Releases (Release Hub)
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Selecciona ítems listos (<span className="text-teal-400 font-mono">finish</span> o <span className="text-emerald-400 font-mono">done</span>) para empaquetar un nuevo hito de versión. Genera notas de release en formato Markdown estándar de DOM automáticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncLegacyReleases}
              disabled={isSyncingReleases}
              title="Detecta RELEASE_NOTES.md / CHANGELOG.md y asocia las tareas históricas a sus versiones"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncingReleases ? 'animate-spin' : ''}`} />
              <span>{isSyncingReleases ? 'Sincronizando...' : 'Sincronizar RELEASE_NOTES.md'}</span>
            </button>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 transition-colors"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Copiar Markdown</span>
            </button>
            <button
              onClick={handleArchive}
              disabled={isSubmitting || selectedCodes.size === 0}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Archivando...' : 'Cerrar y Archivar Release'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Planned Releases & Targets Section (DEV-032) */}
      <div className="glass-panel p-5 rounded-2xl border border-indigo-500/20 bg-gradient-to-b from-indigo-500/[0.04] to-transparent space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Target className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                Releases en Planificación & Targets
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {plannedReleases.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Planifica versiones objetivo, fechas meta estimadas y supervisa el avance del alcance antes del despliegue.
              </p>
            </div>
          </div>

          <button
            onClick={openNewPlanModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Planificar Próximo Release</span>
          </button>
        </div>

        {plannedReleases.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-white/[0.08] bg-white/[0.01] space-y-2">
            <Sparkles className="w-6 h-6 text-indigo-400 mx-auto opacity-70" />
            <p className="text-xs text-slate-300 font-medium">
              No tienes ningún release planificado actualmente.
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Define tu próximo hito objetivo (ej: <span className="font-mono text-indigo-400">0.3.0</span> o <span className="font-mono text-indigo-400">0.4.0</span>), fecha límite estimada y objetivos para monitorear el avance del ciclo.
            </p>
            <button
              onClick={openNewPlanModal}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-slate-200 border border-white/[0.1] transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Crear Target de Release</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plannedReleases.map((rel) => {
              const targetItems = items.filter(
                (it) =>
                  it.milestone === rel.version ||
                  it.targetSprint === rel.version ||
                  (rel.itemCodes || []).includes(it.code)
              );
              const total = targetItems.length;
              const done = targetItems.filter((it) => it.status === 'done').length;
              const inProgress = targetItems.filter((it) =>
                ['doing', 'in_progress', 'review', 'testing_qa', 'ready'].includes(it.status)
              ).length;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <div
                  key={rel.id}
                  className="rounded-xl border border-indigo-500/30 bg-slate-900/60 dark:bg-white/[0.02] p-4 flex flex-col justify-between space-y-4 relative overflow-hidden transition-all hover:border-indigo-500/50"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          v{rel.version}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          Target en Planificación
                        </span>
                        {rel.targetDate && (
                          <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            Meta: {rel.targetDate}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditPlanModal(rel)}
                          title="Editar Target"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteRelease && (
                          <button
                            onClick={() => onDeleteRelease(rel.id)}
                            title="Eliminar Plan"
                            className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-white/[0.06] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">
                        {rel.title.replace(/^Planificado:\s*/i, '')}
                      </h4>
                      {rel.scopeNotes && (
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {rel.scopeNotes}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar & Stats */}
                    <div className="p-3 rounded-lg bg-black/20 border border-white/[0.04] space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Progreso del Target:</span>
                        <span className="font-semibold text-slate-200">
                          {done} / {total} tareas ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="text-emerald-400">● {done} completadas</span>
                        <span className="text-amber-400">● {inProgress} en curso</span>
                        <span className="text-slate-500">● {Math.max(0, total - done - inProgress)} pendientes</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {targetItems.length} tareas vinculadas
                    </span>
                    <button
                      onClick={() => handleLoadPlannedIntoAssembler(rel)}
                      className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Cargar en Ensamblador</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Left Selector & Form / Right Markdown Preview */}
      <div id="release-assembler-form" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Item Checklist (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Release Metadata Form */}
          <div className="glass-panel p-4 rounded-xl border border-white/[0.07] space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Metadatos del Release
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Versión</label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="0.6.0"
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Fecha</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Título del Hito</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Integridad Financiera y Resiliencia"
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Resumen Ejecutivo</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={2}
                placeholder="Breve párrafo resumiendo los avances clave del release para los stakeholders..."
                className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
              />
            </div>
          </div>

          {/* Candidate Items Checklist */}
          <div className="glass-panel p-4 rounded-xl border border-white/[0.07] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Ítems Candidatos ({selectedCodes.size} de {candidateItems.length} seleccionados)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Solo se listan ítems en estado <span className="text-teal-400 font-mono">finish</span> o <span className="text-emerald-400 font-mono">done</span>.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={selectAllCandidates}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Seleccionar todos
                </button>
                <span className="text-slate-600">•</span>
                <button
                  onClick={clearSelection}
                  className="text-slate-400 hover:text-slate-200"
                >
                  Limpiar
                </button>
              </div>
            </div>

            {hiddenReleasedCount > 0 && (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {hiddenReleasedCount} {hiddenReleasedCount === 1 ? 'tarea histórica ya liberada en versiones previas está oculta' : 'tareas históricas ya liberadas en versiones previas están ocultas'}.
                  </span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white font-medium select-none">
                  <input
                    type="checkbox"
                    checked={showAlreadyReleased}
                    onChange={(e) => setShowAlreadyReleased(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5"
                  />
                  Mostrar ya liberadas
                </label>
              </div>
            )}

            <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/[0.02]">
              {candidateItems.map((item) => {
                const isSelected = selectedCodes.has(item.code);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSelectCode(item.code)}
                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/15 border border-indigo-500/20'
                        : 'hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-1 rounded bg-white/10 border-white/20 text-indigo-600 focus:ring-0 cursor-pointer"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[11px] font-semibold text-slate-300">
                          {item.code}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase ${
                          item.status === 'finish' ? 'bg-teal-500/20 text-teal-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {item.status}
                        </span>
                        {item.module && (
                          <span className="text-[10px] text-slate-400 truncate">
                            • {item.module}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-200 leading-snug line-clamp-1 font-medium">
                        {item.title}
                      </p>
                    </div>
                  </div>
                );
              })}

              {candidateItems.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No hay ítems en estado 'finish' o 'done' para el proyecto actual.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Live Markdown Preview (5 cols) */}
        <div className="lg:col-span-5">
          <div className="glass-panel p-4 rounded-xl border border-white/[0.07] h-full flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-slate-200">
                  Previsualización Markdown Generado
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Estándar DOM
                </span>
              </div>
              <button
                onClick={handleCopyMarkdown}
                className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>Copiar</span>
              </button>
            </div>

            <div className="flex-1 bg-[#090d15] p-3 rounded-lg border border-white/[0.06] overflow-y-auto max-h-[500px]">
              <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                {generatedMarkdown}
              </pre>
            </div>
          </div>
        </div>

      </div>

      {/* Historical Releases Section */}
      <div className="glass-panel p-5 rounded-2xl border border-white/[0.08] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">
              Historial de Releases Publicados ({publishedReleases.length})
            </h3>
            <p className="text-xs text-slate-400">
              Releases archivados formalmente con sus notas de versión históricas.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {publishedReleases.map((rel) => {
            const isExpanded = expandedReleaseId === rel.id;

            return (
              <div
                key={rel.id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-colors hover:border-white/[0.1]"
              >
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedReleaseId(isExpanded ? null : rel.id)}
                >
                  <div className="flex items-center gap-3">
                    <button className="p-0.5 text-slate-400">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          v{rel.version}
                        </span>
                        <span className="text-slate-300 font-medium text-xs">
                          {rel.title}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {rel.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {rel.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.05]">
                      {rel.itemCodes.length} ítems
                    </span>
                    {onDeleteRelease && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`¿Eliminar release v${rel.version} del registro histórico?`)) {
                            onDeleteRelease(rel.id);
                          }
                        }}
                        title="Eliminar release del historial"
                        className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/[0.05] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Release Details & Markdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Contenido del Release (Markdown)
                      </span>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(rel.markdownContent);
                          onShowToast(`¡Notas de v${rel.version} copiadas!`, 'success');
                        }}
                        className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copiar notas</span>
                      </button>
                    </div>

                    <div className="bg-[#090d15] p-3 rounded-lg border border-white/[0.06] max-h-72 overflow-y-auto">
                      <pre className="font-mono text-[11px] text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                        {rel.markdownContent}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {publishedReleases.length === 0 && (
            <div className="py-6 text-center text-slate-500 text-xs">
              Aún no se han registrado releases publicados en este proyecto.
            </div>
          )}
        </div>
      </div>

      {/* Target Planning Modal (DEV-032) */}
      {plannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel max-w-lg w-full rounded-2xl border border-white/[0.1] bg-[#0d131f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-100">
                  {planId ? 'Editar Release Target' : 'Planificar Nuevo Release'}
                </h3>
              </div>
              <button
                onClick={() => setPlannerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Versión Target <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={planVersion}
                    onChange={(e) => setPlanVersion(e.target.value)}
                    placeholder="0.3.0"
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Fecha Objetivo Estimada
                  </label>
                  <input
                    type="date"
                    value={planTargetDate}
                    onChange={(e) => setPlanTargetDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Título del Release Target
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Ej: Sprint UX & Estabilización de Navegación"
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Alcance & Notas de Objetivos (Scope Notes)
                </label>
                <textarea
                  rows={3}
                  value={planScopeNotes}
                  onChange={(e) => setPlanScopeNotes(e.target.value)}
                  placeholder="Describe los objetivos clave, módulos a entregar o criterios de éxito para este release..."
                  className="w-full px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlannerOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-white/[0.08] text-xs text-slate-300 hover:bg-white/[0.04] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-md shadow-indigo-600/25 transition-all"
                >
                  Guardar Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
