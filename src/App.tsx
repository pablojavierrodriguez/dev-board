import { useState, useEffect, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import type { 
  BacklogItem, 
  BoardData, 
  FilterState, 
  ItemStatus, 
  Priority, 
  Project, 
  Release, 
  ViewMode 
} from './types';
import { 
  fetchBoardData, 
  createItem, 
  updateItem, 
  deleteItem, 
  createProject, 
  deleteProject,
  createRelease, 
  triggerResync,
  convertProjectToMd,
  convertProjectToJson,
  exportMonolithicMd,
  exportProjectJson,
  restoreDemoProject,
  subscribeToBoardEvents
} from './api';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard, SIMPLIFIED_COLUMNS, EXPANDED_COLUMNS } from './components/KanbanBoard';
import { SprintView } from './components/SprintView';
import { ReleaseAssembler } from './components/ReleaseAssembler';
import { ArchiveView } from './components/ArchiveView';
import { ItemModal } from './components/ItemModal';
import { ProjectModal } from './components/ProjectModal';
import { PlanGuardModal } from './components/PlanGuardModal';
import { ImportWizardModal } from './components/ImportWizardModal';
import { ToastContainer, type ToastMessage } from './components/Toast';

export function App() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('dom');
  const [activeTab, setActiveTab] = useState<'kanban' | 'sprint' | 'release' | 'archive'>('kanban');
  const [viewMode, setViewMode] = useState<ViewMode>('simplificada');

  // Theme state: default dark mode, persist in localStorage
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('devboard-theme');
    return saved ? saved !== 'light' : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('devboard-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleToggleTheme = useCallback(() => {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    window.setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 350);

    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document as any).startViewTransition(() => {
        flushSync(() => {
          setIsDarkMode((prev) => !prev);
        });
      });
    } else {
      setIsDarkMode((prev) => !prev);
    }
  }, []);

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    priority: 'all',
    module: 'all',
    sprint: 'all'
  });

  // Modals & Popups
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null);
  const [defaultNewStatus, setDefaultNewStatus] = useState<ItemStatus>('backlog');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  // Plan Guard Modal (validates plan/spec before in_progress)
  const [planGuardOpen, setPlanGuardOpen] = useState(false);
  const [planGuardItem, setPlanGuardItem] = useState<BacklogItem | null>(null);

  // Syncing & Notifications
  const [isResyncing, setIsResyncing] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const [liveConnected, setLiveConnected] = useState<boolean>(false);

  // Initial & Live Load
  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchBoardData();
      setBoardData(data);
      if (data.projects.length > 0 && selectedProjectId !== 'all') {
        const exists = data.projects.some((p) => p.id === selectedProjectId);
        if (!exists) setSelectedProjectId(data.projects[0].id);
      }
    } catch (err: any) {
      if (!silent) showToast(`Error al cargar datos: ${err.message}`, 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedProjectId, showToast]);

  useEffect(() => {
    loadData();
  }, []);

  // SSE Real-time Live Watcher Subscription (DEV-014)
  useEffect(() => {
    const unsubscribe = subscribeToBoardEvents((event) => {
      if (event.type === 'connected') {
        setLiveConnected(true);
      } else if (event.type === 'disconnected') {
        setLiveConnected(false);
      } else if (event.type === 'backlog_changed') {
        loadData(true);
        showToast('Tablero sincronizado con cambios en disco', 'info');
      }
    });

    return unsubscribe;
  }, [loadData, showToast]);

  // Keyboard Shortcuts: 'N' for new item, '1'-'4' for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setEditingItem(null);
        setDefaultNewStatus('backlog');
        setItemModalOpen(true);
      } else if (e.key === '1') {
        setActiveTab('kanban');
      } else if (e.key === '2') {
        setActiveTab('sprint');
      } else if (e.key === '3') {
        setActiveTab('release');
      } else if (e.key === '4') {
        setActiveTab('archive');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Re-sync from m3 docs
  const handleResyncDocs = useCallback(async () => {
    setIsResyncing(true);
    try {
      const refreshed = await triggerResync();
      setBoardData(refreshed);
      showToast('¡Datos sincronizados exitosamente desde /docs de m3!', 'success');
    } catch (err: any) {
      showToast(`Fallo al sincronizar: ${err.message}`, 'error');
    } finally {
      setIsResyncing(false);
    }
  }, [showToast]);

  // Item Handlers
  const handleUpdateStatus = useCallback(async (
    id: string, 
    newStatus: ItemStatus, 
    bypassGuard = false, 
    targetColId?: string, 
    targetIndex?: number
  ) => {
    if (!boardData) return;
    const targetItem = boardData.items.find((i) => i.id === id);
    if (!targetItem) return;

    const statusChanged = targetItem.status !== newStatus;

    // Validate if item moving to doing/in_progress has a defined plan/spec
    if ((newStatus === 'doing' || newStatus === 'in_progress') && statusChanged && !bypassGuard) {
      const hasSpecOrPlan = 
        (targetItem.implementationPlan && targetItem.implementationPlan.trim().length > 10) ||
        (targetItem.acceptanceCriteriaList && targetItem.acceptanceCriteriaList.length > 0) ||
        (targetItem.fix && targetItem.fix.trim().length > 10) || 
        (targetItem.description && targetItem.description.trim().length > 50) ||
        targetItem.sourceDoc;

      if (!hasSpecOrPlan) {
        setPlanGuardItem(targetItem);
        setPlanGuardOpen(true);
        return;
      }
    }

    // Determine target column supported statuses
    let targetStatuses: ItemStatus[] = [newStatus];
    if (targetColId) {
      const cols = viewMode === 'simplificada' ? SIMPLIFIED_COLUMNS : EXPANDED_COLUMNS;
      const foundCol = cols.find(c => c.id === targetColId);
      if (foundCol) targetStatuses = foundCol.statuses;
    }

    // Existing items in destination column (excluding the dragged item) sorted by order
    const colItems = boardData.items
      .filter(it => targetStatuses.includes(it.status) && it.id !== id)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Clamp insert index
    const insertIdx = targetIndex !== undefined
      ? Math.max(0, Math.min(targetIndex, colItems.length))
      : colItems.length;

    // Insert the dragged item into the destination list at exact position
    const updatedMovedItem = { ...targetItem, status: newStatus };
    colItems.splice(insertIdx, 0, updatedMovedItem);

    // Compute sequential order numbers (10, 20, 30, ...)
    const orderMap = new Map<string, number>();
    colItems.forEach((it, i) => {
      orderMap.set(it.id, (i + 1) * 10);
    });

    const newOrder = orderMap.get(id) ?? targetItem.order;
    const orderChanged = targetItem.order !== newOrder;

    // Si ni el estado ni el orden cambiaron (soltó en el mismo lugar), no hacer nada
    if (!statusChanged && !orderChanged) {
      return;
    }

    // Generate new board items list with updated orders and status
    const newItems = boardData.items.map(it => {
      if (it.id === id) {
        return { ...it, status: newStatus, order: newOrder };
      }
      if (orderMap.has(it.id)) {
        return { ...it, order: orderMap.get(it.id)! };
      }
      return it;
    });

    const prevItems = [...boardData.items];

    // Optimistic update
    setBoardData({
      ...boardData,
      items: newItems
    });

    try {
      const updated = await updateItem(id, { status: newStatus, order: newOrder });
      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((it) => (it.id === id ? { ...it, ...updated } : it))
        };
      });
      if (statusChanged) {
        showToast(`Estado actualizado: ${updated.code} → ${newStatus}`, 'info');
      }
    } catch (err: any) {
      // Rollback
      setBoardData({ ...boardData, items: prevItems });
      showToast(`Error al actualizar estado: ${err.message}`, 'error');
    }
  }, [boardData, viewMode, showToast]);

  const handleConfirmStartWithPlan = useCallback(async (itemId: string, updatedPlan?: string) => {
    if (!boardData) return;
    const updates: Partial<BacklogItem> = { status: 'doing' };
    if (updatedPlan) {
      updates.implementationPlan = updatedPlan;
      updates.fix = updatedPlan;
    }
    const updated = await updateItem(itemId, updates);
    setBoardData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((it) => (it.id === itemId ? updated : it))
      };
    });
    setPlanGuardOpen(false);
    setPlanGuardItem(null);
  }, [boardData]);

  const handleUpdatePriority = useCallback(async (id: string, newPriority: Priority) => {
    if (!boardData) return;
    try {
      const updated = await updateItem(id, { priority: newPriority });
      setBoardData({
        ...boardData,
        items: boardData.items.map((it) => (it.id === id ? updated : it))
      });
      showToast(`Prioridad de ${updated.code} cambiada a ${newPriority.toUpperCase()}`, 'info');
    } catch (err: any) {
      showToast(`Error al cambiar prioridad: ${err.message}`, 'error');
    }
  }, [boardData, showToast]);

  const handleDeleteItem = useCallback(async (id: string) => {
    if (!boardData) return;
    try {
      await deleteItem(id);
      setBoardData({
        ...boardData,
        items: boardData.items.filter((it) => it.id !== id)
      });
      showToast('Ítem eliminado correctamente', 'success');
    } catch (err: any) {
      showToast(`Error al eliminar ítem: ${err.message}`, 'error');
    }
  }, [boardData, showToast]);

  const handleSaveItem = useCallback(async (itemData: Partial<BacklogItem> & { expectedMtime?: number; force?: boolean }) => {
    if (!boardData) return;
    if (itemData.id) {
      // Update
      const updated = await updateItem(itemData.id, itemData);
      setBoardData({
        ...boardData,
        items: boardData.items.map((it) => (it.id === updated.id ? updated : it))
      });
      showToast(`Ítem ${updated.code} guardado con éxito`, 'success');
    } else {
      // Create
      const created = await createItem({
        ...itemData,
        projectId: itemData.projectId || (selectedProjectId === 'all' ? 'dom' : selectedProjectId)
      });
      setBoardData({
        ...boardData,
        items: [created, ...boardData.items]
      });
      showToast(`Nuevo ítem ${created.code} creado con éxito`, 'success');
    }
  }, [boardData, selectedProjectId, showToast]);

  const handleCreateProject = useCallback(async (projectData: Partial<Project>) => {
    const created = await createProject(projectData);
    if (boardData) {
      setBoardData({
        ...boardData,
        projects: [...boardData.projects, created]
      });
    }
    setSelectedProjectId(created.id);
    showToast(`Proyecto '${created.name}' creado con éxito`, 'success');
  }, [boardData, showToast]);

  const handleDeleteProject = useCallback(async (id: string) => {
    try {
      await deleteProject(id);
      showToast('Proyecto desvinculado de DevBoard', 'info');
      if (selectedProjectId === id) {
        setSelectedProjectId('all');
      }
      await loadData();
    } catch (err: any) {
      showToast(`Error al desvincular proyecto: ${err.message}`, 'error');
    }
  }, [selectedProjectId, loadData, showToast]);

  const handleRestoreDemo = useCallback(async () => {
    try {
      await restoreDemoProject();
      showToast('Proyecto Demo restaurado correctamente', 'success');
      await loadData();
    } catch (err: any) {
      showToast(`Error al restaurar demo: ${err.message}`, 'error');
    }
  }, [loadData, showToast]);

  const handleConvertToMd = useCallback(async (projectId: string) => {
    try {
      const res = await convertProjectToMd(projectId);
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast(`Error al convertir a Backlog.md: ${err.message}`, 'error');
    }
  }, [loadData, showToast]);

  const handleConvertToJson = useCallback(async (projectId: string) => {
    try {
      const res = await convertProjectToJson(projectId);
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast(`Error al unificar en JSON: ${err.message}`, 'error');
    }
  }, [loadData, showToast]);

  const handleExportMonolithic = useCallback(async (projectId: string) => {
    try {
      const res = await exportMonolithicMd(projectId, true);
      if (res.savedPath) {
        showToast(`Reporte guardado en ${res.savedPath}`, 'success');
      } else {
        const blob = new Blob([res.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'BACKLOG.md';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Reporte BACKLOG.md descargado', 'success');
      }
    } catch (err: any) {
      showToast(`Error al exportar reporte: ${err.message}`, 'error');
    }
  }, [showToast]);

  const handleExportJson = useCallback(async (projectId: string) => {
    try {
      const res = await exportProjectJson(projectId);
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${res.project.codePrefix.toLowerCase()}-backlog.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Copia de seguridad backlog.json descargada', 'success');
    } catch (err: any) {
      showToast(`Error al exportar JSON: ${err.message}`, 'error');
    }
  }, [showToast]);

  const handleArchiveRelease = useCallback(async (releaseData: Partial<Release>, itemCodes: string[]) => {
    const created = await createRelease(releaseData, itemCodes);
    await loadData();
    showToast(`Release v${created.version} archivado exitosamente`, 'success');
  }, [loadData, showToast]);

  const handleRestoreItem = useCallback(async (id: string, targetStatus: ItemStatus) => {
    await handleUpdateStatus(id, targetStatus, true);
    showToast(`Ítem restaurado al estado '${targetStatus}'`, 'success');
  }, [handleUpdateStatus, showToast]);

  // Filtered Items Calculation
  const allProjectItems = useMemo(() => {
    if (!boardData) return [];
    if (selectedProjectId === 'all') return boardData.items;
    return boardData.items.filter((i) => i.projectId === selectedProjectId);
  }, [boardData, selectedProjectId]);

  // Unique modules for filtering dropdown
  const availableModules = useMemo(() => {
    const set = new Set<string>();
    for (const it of allProjectItems) {
      if (it.module) set.add(it.module);
    }
    return Array.from(set).sort();
  }, [allProjectItems]);

  // Metrics
  const stats = useMemo(() => {
    const active = allProjectItems.filter((i) => i.status !== 'dismissed' && i.status !== 'cancelled');
    const pending = active.filter((i) => i.status === 'draft' || i.status === 'ideas' || i.status === 'backlog').length;
    const inProgress = active.filter((i) => i.status === 'doing' || i.status === 'in_progress' || i.status === 'review' || i.status === 'testing_qa').length;
    const completed = active.filter((i) => i.status === 'ready' || i.status === 'done' || i.status === 'finish').length;
    return {
      total: active.length,
      pending,
      inProgress,
      completed
    };
  }, [allProjectItems]);

  const archivedCount = useMemo(() => {
    return allProjectItems.filter((i) => i.status === 'dismissed' || i.status === 'cancelled').length;
  }, [allProjectItems]);

  // Visible items after search/type/priority/module filter
  const visibleItems = useMemo(() => {
    return allProjectItems.filter((item) => {
      // Do not show archived in Kanban or Sprint views
      if (activeTab === 'kanban' || activeTab === 'sprint') {
        if (item.status === 'dismissed' || item.status === 'cancelled') return false;
      }

      // Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchModule = item.module ? item.module.toLowerCase().includes(q) : false;
        const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchCode && !matchModule && !matchDesc) return false;
      }

      // Type
      if (filters.type !== 'all' && item.type !== filters.type) return false;

      // Priority
      if (filters.priority !== 'all' && item.priority !== filters.priority) return false;

      // Module
      if (filters.module !== 'all' && item.module !== filters.module) return false;

      return true;
    });
  }, [allProjectItems, activeTab, filters]);

  if (loading && !boardData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
        <p className="text-xs font-mono">Cargando DevBoard & persistencia local...</p>
      </div>
    );
  }

  const projects = boardData?.projects || [];
  const releases = (boardData?.releases || []).filter(
    (r) => selectedProjectId === 'all' || r.projectId === selectedProjectId
  );

  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Header */}
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onNewItem={() => {
          setEditingItem(null);
          setDefaultNewStatus('draft');
          setItemModalOpen(true);
        }}
        onNewProject={() => setProjectModalOpen(true)}
        onResyncDocs={handleResyncDocs}
        isResyncing={isResyncing}
        archivedCount={archivedCount}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onDeleteProject={handleDeleteProject}
        onRestoreDemo={handleRestoreDemo}
        onConvertToMd={handleConvertToMd}
        onConvertToJson={handleConvertToJson}
        onExportMonolithic={handleExportMonolithic}
        onExportJson={handleExportJson}
        onOpenImportWizard={() => setImportWizardOpen(true)}
        liveConnected={liveConnected}
      />

      {/* Filter Bar (Active in Kanban, Sprint, and Archive tabs) */}
      {activeTab !== 'release' && (
        <FilterBar
          filters={filters}
          onChangeFilters={setFilters}
          availableModules={availableModules}
          stats={stats}
        />
      )}

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'kanban' && (
          <KanbanBoard
            items={visibleItems}
            viewMode={viewMode}
            onUpdateStatus={(id, status, targetColId, targetIndex) => handleUpdateStatus(id, status, false, targetColId, targetIndex)}
            onDeleteItem={handleDeleteItem}
            onClickItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
            onQuickAddItem={(status) => {
              setEditingItem(null);
              setDefaultNewStatus(status);
              setItemModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'sprint' && (
          <SprintView
            items={visibleItems}
            onClickItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
            onUpdateStatus={(id, s) => handleUpdateStatus(id, s)}
            onUpdatePriority={handleUpdatePriority}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === 'release' && (
          <ReleaseAssembler
            items={allProjectItems}
            releases={releases}
            projectId={selectedProjectId}
            onArchiveRelease={handleArchiveRelease}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            items={allProjectItems}
            onRestoreItem={handleRestoreItem}
            onDeleteItem={handleDeleteItem}
            onClickItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Item Detail / Edit / Create Modal */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        defaultStatus={defaultNewStatus}
        projects={projects}
        availableModules={availableModules}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />

      {/* Project Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        onClose={() => setProjectModalOpen(false)}
        onSave={handleCreateProject}
      />

      {/* Plan Guard Modal (verifies plan before moving to In Progress) */}
      <PlanGuardModal
        isOpen={planGuardOpen}
        item={planGuardItem}
        onClose={() => {
          setPlanGuardOpen(false);
          setPlanGuardItem(null);
        }}
        onConfirmStart={handleConfirmStartWithPlan}
        onShowToast={showToast}
      />

      {/* Import Wizard Modal (DEV-018: Legacy Markdown Import) */}
      <ImportWizardModal
        isOpen={importWizardOpen}
        onClose={() => setImportWizardOpen(false)}
        projects={boardData?.projects || []}
        activeProjectId={selectedProjectId === 'all' ? (boardData?.projects[0]?.id || 'dom') : selectedProjectId}
        onImportComplete={() => {
          loadData(true);
          showToast('Tareas importadas exitosamente desde archivo legacy', 'success');
        }}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export default App;
