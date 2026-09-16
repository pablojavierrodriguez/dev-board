import { useState, useEffect, useMemo, useCallback } from 'react';
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
  triggerResync 
} from './api';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { SprintView } from './components/SprintView';
import { ReleaseAssembler } from './components/ReleaseAssembler';
import { ArchiveView } from './components/ArchiveView';
import { ItemModal } from './components/ItemModal';
import { ProjectModal } from './components/ProjectModal';
import { PlanGuardModal } from './components/PlanGuardModal';
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
    setIsDarkMode((prev) => !prev);
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

  // Initial Load
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBoardData();
      setBoardData(data);
      if (data.projects.length > 0 && selectedProjectId !== 'all') {
        const exists = data.projects.some((p) => p.id === selectedProjectId);
        if (!exists) setSelectedProjectId(data.projects[0].id);
      }
    } catch (err: any) {
      showToast(`Error al cargar datos: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedProjectId, showToast]);

  useEffect(() => {
    loadData();
  }, []);

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
  const handleUpdateStatus = useCallback(async (id: string, newStatus: ItemStatus, bypassGuard = false) => {
    if (!boardData) return;
    const targetItem = boardData.items.find((i) => i.id === id);

    // Validate if item moving to in_progress has a defined plan/spec
    if (newStatus === 'in_progress' && targetItem && !bypassGuard) {
      const hasSpecOrPlan = 
        (targetItem.fix && targetItem.fix.trim().length > 10) || 
        (targetItem.description && targetItem.description.trim().length > 50) ||
        targetItem.sourceDoc;

      if (!hasSpecOrPlan) {
        setPlanGuardItem(targetItem);
        setPlanGuardOpen(true);
        return;
      }
    }

    const prevItems = [...boardData.items];
    // Optimistic update
    setBoardData({
      ...boardData,
      items: boardData.items.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
    });

    try {
      const updated = await updateItem(id, { status: newStatus });
      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((it) => (it.id === id ? updated : it))
        };
      });
      showToast(`Estado actualizado: ${updated.code} → ${newStatus}`, 'info');
    } catch (err: any) {
      // Rollback
      setBoardData({ ...boardData, items: prevItems });
      showToast(`Error al actualizar estado: ${err.message}`, 'error');
    }
  }, [boardData, showToast]);

  const handleConfirmStartWithPlan = useCallback(async (itemId: string, updatedPlan?: string) => {
    if (!boardData) return;
    const updates: Partial<BacklogItem> = { status: 'in_progress' };
    if (updatedPlan) {
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

  const handleSaveItem = useCallback(async (itemData: Partial<BacklogItem>) => {
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
      await loadData();
      setSelectedProjectId('all');
      showToast('Proyecto desvinculado de DevBoard', 'info');
    } catch (err: any) {
      showToast(err.message || 'Error al desvincular proyecto', 'error');
    }
  }, [loadData, showToast]);

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
    const pending = active.filter((i) => i.status === 'ideas' || i.status === 'backlog').length;
    const inProgress = active.filter((i) => i.status === 'in_progress' || i.status === 'testing_qa').length;
    const completed = active.filter((i) => i.status === 'finish' || i.status === 'done').length;
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
          setDefaultNewStatus('backlog');
          setItemModalOpen(true);
        }}
        onNewProject={() => setProjectModalOpen(true)}
        onResyncDocs={handleResyncDocs}
        isResyncing={isResyncing}
        archivedCount={archivedCount}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        onDeleteProject={handleDeleteProject}
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
            onUpdateStatus={handleUpdateStatus}
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
          />
        )}

        {activeTab === 'sprint' && (
          <SprintView
            items={visibleItems}
            onClickItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
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

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export default App;
