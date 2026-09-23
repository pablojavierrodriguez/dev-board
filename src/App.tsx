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
  ViewMode,
  DevBoardConfig,
  ActiveTab,
  Sprint
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
  deleteReleaseApi,
  subscribeToBoardEvents,
  setActiveProjectApi,
  fetchSettings,
  saveSettings,
  createSprint,
  updateSprint,
  deleteSprint,
  restoreItem,
  purgeItem
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
import { SettingsView } from './components/SettingsView';
import { TrashView } from './components/TrashView';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { AlertTriangle, LayoutGrid, Target, Rocket, Archive, Trash2 } from 'lucide-react';

export function App() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('devboard_active_project_id');
      if (saved) return saved;
    } catch {}
    return 'dev-board';
  });

  useEffect(() => {
    if (selectedProjectId && selectedProjectId !== 'all') {
      try {
        localStorage.setItem('devboard_active_project_id', selectedProjectId);
      } catch {}
      setActiveProjectApi(selectedProjectId).catch(() => {});
    }
  }, [selectedProjectId]);
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      const saved = localStorage.getItem('devboard_active_tab');
      if (saved === 'kanban' || saved === 'sprint' || saved === 'release' || saved === 'archive' || saved === 'settings') return saved;
    } catch {}
    return 'kanban';
  });
  const [viewMode, setViewMode] = useState<ViewMode>('simplificada');

  useEffect(() => {
    try {
      localStorage.setItem('devboard_active_tab', activeTab);
    } catch {}
  }, [activeTab]);

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
  const [filters, setFilters] = useState<FilterState>(() => {
    let initialIdeas = false;
    try {
      const stored = localStorage.getItem('devboard_kanban_show_ideas');
      if (stored !== null) initialIdeas = JSON.parse(stored);
    } catch {}
    return {
      search: '',
      type: 'all',
      types: [],
      priority: 'all',
      priorities: [],
      statuses: ['draft', 'doing', 'review', 'ready', 'done'],
      includeIdeas: initialIdeas,
      includePreviousDone: false,
      includeDismissedCancelled: false,
      module: 'all',
      modules: [],
      sprint: 'all',
      sprints: [],
      release: 'all',
      releases: [],
    };
  });

  // Modals & Popups
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BacklogItem | null>(null);
  const [defaultNewStatus, setDefaultNewStatus] = useState<ItemStatus>('backlog');
  const [defaultNewSprint, setDefaultNewSprint] = useState<string>('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [importWizardOpen, setImportWizardOpen] = useState(false);

  // Settings / Config State (DEV-006 & DEV-009)
  const [config, setConfig] = useState<DevBoardConfig>({});

  // Computed tab visibility helpers
  const isKanbanTabEnabled = config?.enabledTabs?.kanban !== undefined
    ? config.enabledTabs.kanban
    : config?.methodology !== 'scrum';

  const isSprintTabEnabled = config?.enabledTabs?.sprint !== undefined
    ? config.enabledTabs.sprint
    : config?.methodology !== 'kanban';

  const isReleaseTabEnabled = config?.enabledTabs?.release !== false;

  // Auto-redirect activeTab if current tab became disabled
  useEffect(() => {
    if (activeTab === 'kanban' && !isKanbanTabEnabled) {
      const fallback = isSprintTabEnabled ? 'sprint' : (isReleaseTabEnabled ? 'release' : 'settings');
      setActiveTab(fallback);
    } else if (activeTab === 'sprint' && !isSprintTabEnabled) {
      const fallback = isKanbanTabEnabled ? 'kanban' : (isReleaseTabEnabled ? 'release' : 'settings');
      setActiveTab(fallback);
    } else if (activeTab === 'release' && !isReleaseTabEnabled) {
      const fallback = isKanbanTabEnabled ? 'kanban' : (isSprintTabEnabled ? 'sprint' : 'settings');
      setActiveTab(fallback);
    }
  }, [activeTab, isKanbanTabEnabled, isSprintTabEnabled, isReleaseTabEnabled]);

  const loadSettings = useCallback(async (projId?: string) => {
    try {
      const cfg = await fetchSettings(projId && projId !== 'all' ? projId : undefined);
      setConfig(cfg);
      if (cfg.theme && (cfg.theme === 'dark' || cfg.theme === 'light')) {
        setIsDarkMode(cfg.theme === 'dark');
      }
    } catch (err: any) {
      console.warn('[DevBoard] Failed to load config:', err.message);
    }
  }, []);

  const handleSaveConfig = useCallback(async (newConfig: DevBoardConfig) => {
    const saved = await saveSettings(
      newConfig, 
      selectedProjectId !== 'all' ? selectedProjectId : undefined
    );
    setConfig(saved);
    if (saved.theme && (saved.theme === 'dark' || saved.theme === 'light')) {
      setIsDarkMode(saved.theme === 'dark');
    }
  }, [selectedProjectId]);

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

  const handleUpdateColumnTitle = useCallback(async (colId: string, newTitle: string) => {
    if (!config) return;
    const currentColumns = config.kanban?.columns || (viewMode === 'simplificada' ? SIMPLIFIED_COLUMNS : EXPANDED_COLUMNS);
    const updatedCols = currentColumns.map((col) => {
      if (col.id === colId) {
        return { ...col, title: newTitle };
      }
      return col;
    });

    const updatedConfig: DevBoardConfig = {
      ...config,
      kanban: {
        ...config.kanban,
        columns: updatedCols
      }
    };

    try {
      await handleSaveConfig(updatedConfig);
      showToast(`Columna actualizada a "${newTitle}"`, 'success');
    } catch (err: any) {
      showToast(`Error al actualizar columna: ${err.message}`, 'error');
    }
  }, [config, viewMode, handleSaveConfig, showToast]);

  const [liveConnected, setLiveConnected] = useState<boolean>(false);

  // Initial & Live Load
  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const data = await fetchBoardData();
      setBoardData(data);
      if (data.projects.length > 0 && selectedProjectId !== 'all') {
        const exists = data.projects.some((p) => p.id === selectedProjectId);
        if (!exists) {
          const serverActive = data.activeProjectId && data.projects.some(p => p.id === data.activeProjectId) ? data.activeProjectId : null;
          const fallback = serverActive || data.projects.find(p => p.id === 'dev-board')?.id || data.projects[0].id;
          setSelectedProjectId(fallback);
          try {
            localStorage.setItem('devboard_active_project_id', fallback);
          } catch {}
        }
      }
    } catch (err: any) {
      if (!silent) showToast(`Error al cargar datos: ${err.message}`, 'error');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [selectedProjectId, showToast]);

  useEffect(() => {
    loadData();
    loadSettings(selectedProjectId);
  }, [selectedProjectId]);

  // SSE Real-time Live Watcher Subscription (DEV-014 & DEV-006)
  useEffect(() => {
    const unsubscribe = subscribeToBoardEvents((event) => {
      if (event.type === 'connected') {
        setLiveConnected(true);
      } else if (event.type === 'disconnected') {
        setLiveConnected(false);
      } else if (event.type === 'backlog_changed') {
        loadData(true);
        showToast('Tablero sincronizado con cambios en disco', 'info');
      } else if (event.type === 'settings_changed') {
        loadSettings(selectedProjectId);
        showToast('Configuración sincronizada con cambios en disco', 'info');
      }
    });

    return unsubscribe;
  }, [loadData, loadSettings, selectedProjectId, showToast]);

  // Keyboard Shortcuts: 'N' for new item, '1'-'4' for tabs, '⌘+,' for settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setActiveTab((prev) => (prev === 'settings' ? (config?.defaultView === 'settings' ? 'kanban' : (config?.defaultView || 'kanban')) : 'settings'));
        return;
      }

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

  // Re-sync from project docs (DEV-012)
  const handleResyncDocs = useCallback(async () => {
    setIsResyncing(true);
    try {
      const result = await triggerResync(selectedProjectId);
      const refreshed = await fetchBoardData();
      setBoardData(refreshed);
      showToast(
        `¡${result.projectName || 'Proyecto'} sincronizado: ${result.importedCount} tareas actualizadas!`,
        'success'
      );
    } catch (err: any) {
      showToast(`Fallo al sincronizar docs: ${err.message}`, 'error');
    } finally {
      setIsResyncing(false);
    }
  }, [selectedProjectId, showToast]);

  // Item Handlers
  const handleUpdateStatus = useCallback(async (
    id: string, 
    newStatus: ItemStatus, 
    bypassGuard = false, 
    targetColId?: string, 
    targetIndex?: number,
    calculatedOrder?: number
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

    // Determine new order
    let newOrder = calculatedOrder;

    if (newOrder === undefined) {
      let targetStatuses: ItemStatus[] = [newStatus];
      if (targetColId) {
        const cols = viewMode === 'simplificada' ? SIMPLIFIED_COLUMNS : EXPANDED_COLUMNS;
        const foundCol = cols.find(c => c.id === targetColId);
        if (foundCol) targetStatuses = foundCol.statuses;
      }

      const colItems = boardData.items
        .filter(it => targetStatuses.includes(it.status) && it.id !== id)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

      const insertIdx = targetIndex !== undefined
        ? Math.max(0, Math.min(targetIndex, colItems.length))
        : colItems.length;

      const prevItem = insertIdx > 0 ? colItems[insertIdx - 1] : null;
      const nextItem = insertIdx < colItems.length ? colItems[insertIdx] : null;

      if (prevItem && nextItem) {
        const p = prevItem.order ?? 0;
        const n = nextItem.order ?? (p + 20);
        newOrder = n > p ? p + (n - p) / 2 : p + 1;
      } else if (nextItem) {
        newOrder = (nextItem.order ?? 10) - 10;
      } else if (prevItem) {
        newOrder = (prevItem.order ?? 0) + 10;
      } else {
        newOrder = 10;
      }
    }

    const orderChanged = targetItem.order !== newOrder;

    // Si ni el estado ni el orden cambiaron, no hacer nada
    if (!statusChanged && !orderChanged) {
      return;
    }

    const newItems = boardData.items.map(it => {
      if (it.id === id) {
        return { ...it, status: newStatus, order: newOrder };
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
          items: prev.items.map((it) => (it.id === id ? { ...it, ...updated, order: newOrder } : it))
        };
      });
      if (statusChanged) {
        showToast(`Estado actualizado: ${updated.code} → ${newStatus}`, 'info');
      } else if (orderChanged) {
        showToast(`Orden de ${targetItem.code} actualizado`, 'success');
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
    const existing = boardData.items.find((it) => it.id === id);
    if (existing && existing.priority === newPriority) return;
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

  const handleReorderBacklogItem = useCallback(async (
    draggedId: string, 
    targetSprint: string, 
    targetIndex: number
  ) => {
    if (!boardData) return;
    const item = boardData.items.find((it) => it.id === draggedId);
    if (!item) return;

    // Items belonging to target group (excluding dragged item), sorted by order
    const groupItems = boardData.items
      .filter((it) => {
        const itSprint = it.sprint || it.targetSprint || '';
        return itSprint === targetSprint && it.id !== draggedId;
      })
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Clamp insert index
    const insertIdx = Math.max(0, Math.min(targetIndex, groupItems.length));
    
    // Insert dragged item at exact target position
    const updatedItem = {
      ...item,
      sprint: targetSprint,
      targetSprint: targetSprint
    };
    groupItems.splice(insertIdx, 0, updatedItem);

    // Compute sequential orders (10, 20, 30, ...)
    const orderMap = new Map<string, number>();
    groupItems.forEach((it, i) => {
      orderMap.set(it.id, (i + 1) * 10);
    });

    const newOrder = orderMap.get(draggedId) ?? item.order;

    // Optimistic UI state update
    const prevItems = [...boardData.items];
    const newItems = boardData.items.map((it) => {
      if (it.id === draggedId) {
        return { ...it, sprint: targetSprint, targetSprint: targetSprint, order: newOrder };
      }
      if (orderMap.has(it.id)) {
        return { ...it, order: orderMap.get(it.id)! };
      }
      return it;
    });

    setBoardData((prev) => (prev ? { ...prev, items: newItems } : null));

    try {
      // 1. Update dragged item via API
      await updateItem(draggedId, {
        sprint: targetSprint,
        targetSprint: targetSprint,
        order: newOrder
      });

      // 2. Persist updated sibling orders in parallel
      const siblingUpdates = Array.from(orderMap.entries())
        .filter(([id]) => id !== draggedId)
        .map(([id, ord]) => updateItem(id, { order: ord }));
      if (siblingUpdates.length > 0) {
        await Promise.all(siblingUpdates);
      }
      showToast('Orden de tareas actualizado', 'success');
    } catch (err: any) {
      setBoardData((prev) => (prev ? { ...prev, items: prevItems } : null));
      showToast('Error al reordenar tarea: ' + err.message, 'error');
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

  // Sprint lifecycle handlers (DEV-055)
  const handleCreateSprint = useCallback(async (sprintData: Partial<Sprint>) => {
    try {
      const created = await createSprint({
        ...sprintData,
        projectId: selectedProjectId !== 'all' ? selectedProjectId : undefined,
      });
      setBoardData((prev) => {
        if (!prev) return prev;
        const existingSprints = prev.sprints || [];
        return {
          ...prev,
          sprints: [...existingSprints, created],
        };
      });
      showToast(`Sprint "${created.name}" creado con éxito`, 'success');
    } catch (err: any) {
      showToast(`Error al crear sprint: ${err.message}`, 'error');
    }
  }, [selectedProjectId, showToast]);

  const handleUpdateSprintMeta = useCallback(async (id: string, sprintData: Partial<Sprint>) => {
    try {
      const existing = boardData?.sprints?.find((s) => s.id === id);
      const updated = await updateSprint(id, {
        ...sprintData,
        projectId: sprintData.projectId || existing?.projectId || (selectedProjectId !== 'all' ? selectedProjectId : undefined),
      });
      setBoardData((prev) => {
        if (!prev) return prev;
        const existingSprints = prev.sprints || [];
        return {
          ...prev,
          sprints: existingSprints.map((s) => (s.id === id ? updated : s)),
        };
      });
      showToast(`Sprint "${updated.name}" actualizado`, 'info');
    } catch (err: any) {
      showToast(`Error al actualizar sprint: ${err.message}`, 'error');
    }
  }, [boardData?.sprints, selectedProjectId, showToast]);

  const handleStartSprint = useCallback(async (sprint: Sprint) => {
    try {
      const updated = await updateSprint(sprint.id, {
        status: 'active',
        projectId: sprint.projectId || (selectedProjectId !== 'all' ? selectedProjectId : undefined),
      });
      setBoardData((prev) => {
        if (!prev) return prev;
        const existingSprints = prev.sprints || [];
        return {
          ...prev,
          sprints: existingSprints.map((s) => {
            if (s.id === sprint.id) return updated;
            if (s.status === 'active') return { ...s, status: 'completed' as const };
            return s;
          }),
        };
      });
      showToast(`Sprint "${sprint.name}" iniciado (Activo)`, 'success');
    } catch (err: any) {
      showToast(`Error al iniciar sprint: ${err.message}`, 'error');
    }
  }, [selectedProjectId, showToast]);

  const handleCompleteSprint = useCallback(async (sprint: Sprint, destinationSprintName: string, retroData?: any) => {
    try {
      const updatedSprint = await updateSprint(sprint.id, {
        status: 'completed',
        projectId: sprint.projectId || (selectedProjectId !== 'all' ? selectedProjectId : undefined),
        retro: retroData
      } as any);
      
      const sprintPendingItems = (boardData?.items || []).filter(
        (i) => (i.sprint === sprint.name || i.targetSprint === sprint.name) &&
               !(i.status === 'done' || i.status === 'ready' || i.status === 'finish')
      );

      for (const item of sprintPendingItems) {
        const existingSprints = item.sprints || [sprint.name];
        const updatedSprints = Array.from(new Set([...existingSprints, sprint.name, ...(destinationSprintName ? [destinationSprintName] : [])]));
        await updateItem(item.id, {
          sprint: destinationSprintName || '',
          targetSprint: destinationSprintName || '',
          sprints: updatedSprints
        });
      }

      // Preserve sprint history on completed tasks as well (DEV-056)
      const sprintDoneItems = (boardData?.items || []).filter(
        (i) => (i.sprint === sprint.name || i.targetSprint === sprint.name) &&
               (i.status === 'done' || i.status === 'ready' || i.status === 'finish')
      );
      for (const item of sprintDoneItems) {
        const existingSprints = item.sprints || [sprint.name];
        if (!existingSprints.includes(sprint.name)) {
          await updateItem(item.id, {
            sprints: [...existingSprints, sprint.name]
          });
        }
      }

      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sprints: (prev.sprints || []).map((s) => (s.id === sprint.id ? updatedSprint : s)),
          items: prev.items.map((i) => {
            const isPendingInThisSprint = (i.sprint === sprint.name || i.targetSprint === sprint.name) &&
              !(i.status === 'done' || i.status === 'ready' || i.status === 'finish');
            if (isPendingInThisSprint) {
              const prevSp = i.sprints || [sprint.name];
              const nextSp = Array.from(new Set([...prevSp, sprint.name, ...(destinationSprintName ? [destinationSprintName] : [])]));
              return { 
                ...i, 
                sprint: destinationSprintName || '', 
                targetSprint: destinationSprintName || '',
                sprints: nextSp 
              };
            }
            if (i.sprint === sprint.name || i.targetSprint === sprint.name) {
              const prevSp = i.sprints || [sprint.name];
              return { ...i, sprints: Array.from(new Set([...prevSp, sprint.name])) };
            }
            return i;
          }),
        };
      });

      const destMsg = destinationSprintName ? `al ${destinationSprintName}` : 'al Backlog';
      showToast(`Sprint "${sprint.name}" completado. ${sprintPendingItems.length} tareas pendientes movidas ${destMsg}.`, 'success');
    } catch (err: any) {
      showToast(`Error al completar sprint: ${err.message}`, 'error');
    }
  }, [boardData?.items, selectedProjectId, showToast]);

  const handleDeleteSprint = useCallback(async (id: string) => {
    try {
      const sprintToDelete = boardData?.sprints?.find((s) => s.id === id);
      const targetProjectId = sprintToDelete?.projectId || (selectedProjectId !== 'all' ? selectedProjectId : undefined);
      await deleteSprint(id, targetProjectId);
      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sprints: (prev.sprints || []).filter((s) => s.id !== id),
          items: prev.items.map((i) => {
            if (sprintToDelete && (i.sprint === sprintToDelete.name || i.targetSprint === sprintToDelete.name)) {
              return { ...i, sprint: '', targetSprint: '' };
            }
            return i;
          }),
        };
      });
      showToast('Sprint eliminado. Las tareas fueron devueltas al Backlog.', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar sprint: ${err.message}`, 'error');
    }
  }, [boardData?.sprints, selectedProjectId, showToast]);

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

  const handleCreateTaskFromAction = useCallback(async (title: string) => {
    try {
      await handleSaveItem({
        title,
        description: 'Acción derivada de retrospectiva de sprint.',
        type: 'feature',
        priority: 'p2',
        status: 'draft'
      });
      showToast('Tarea creada desde acción de retrospectiva', 'success');
    } catch (err: any) {
      showToast(`Error al crear tarea desde retro: ${err.message}`, 'error');
    }
  }, [handleSaveItem, showToast]);

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
    const actionLabel = releaseData.status === 'unreleased' ? 'guardado en preparación' : 'liberado exitosamente';
    showToast(`Release v${created.version} ${actionLabel}`, 'success');
  }, [loadData, showToast]);

  const handleDeleteRelease = useCallback(async (releaseId: string) => {
    try {
      await deleteReleaseApi(releaseId);
      await loadData();
      showToast('Release eliminado del registro', 'info');
    } catch (err: any) {
      showToast(`Error al eliminar release: ${err.message}`, 'error');
    }
  }, [loadData, showToast]);

  const handleRestoreItem = useCallback(async (id: string, targetStatus: ItemStatus) => {
    await handleUpdateStatus(id, targetStatus, true);
    showToast(`Ítem restaurado al estado '${targetStatus}'`, 'success');
  }, [handleUpdateStatus, showToast]);

  // DEV-049: Soft delete (send to trash)
  const handleSoftDeleteItem = useCallback(async (id: string) => {
    if (!boardData) return;
    try {
      await deleteItem(id); // now does soft-delete by default
      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.id === id
              ? { ...it, status: 'dismissed' as ItemStatus, isDeleted: true, deletedAt: new Date().toISOString(), previousStatus: it.status }
              : it
          ),
        };
      });
      showToast('Ítem enviado a la papelera', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    }
  }, [boardData, showToast]);

  // DEV-049: Restore from trash via the new /restore endpoint
  const handleRestoreFromTrash = useCallback(async (id: string) => {
    if (!boardData) return;
    try {
      await restoreItem(id);
      // Optimistically: find previousStatus from item data
      const item = boardData.items.find((it) => it.id === id);
      const prevStatus = item?.previousStatus || ('draft' as ItemStatus);
      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((it) =>
            it.id === id
              ? { ...it, status: prevStatus, isDeleted: undefined, deletedAt: undefined, previousStatus: undefined }
              : it
          ),
        };
      });
      showToast('Ítem restaurado correctamente', 'success');
    } catch (err: any) {
      showToast(`Error al restaurar: ${err.message}`, 'error');
    }
  }, [boardData, showToast]);

  // DEV-049: Physical purge (irreversible)
  const handlePurgeItem = useCallback(async (id: string) => {
    if (!boardData) return;
    try {
      await purgeItem(id);
      setBoardData((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((it) => it.id !== id) };
      });
      showToast('Ítem eliminado definitivamente', 'success');
    } catch (err: any) {
      showToast(`Error al purgar: ${err.message}`, 'error');
    }
  }, [boardData, showToast]);

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

  // Sprints pertenecientes al proyecto seleccionado (o todos si selectedProjectId === 'all')
  const projectSprints = useMemo(() => {
    if (!boardData?.sprints) return [];
    if (selectedProjectId === 'all') return boardData.sprints;
    return boardData.sprints.filter((s) => s.projectId === selectedProjectId);
  }, [boardData?.sprints, selectedProjectId]);

  // Sprints oficiales registrados en boardData.sprints para el proyecto actual
  // NUNCA incluir sprints inferidos de tareas aquí (causa sprints fantasma en la vista)
  const availableSprints = useMemo(() => {
    return projectSprints.map((s) => s.name).filter(Boolean).sort();
  }, [projectSprints]);

  // Nombres de sprints enriquecidos (oficiales + históricos de tareas) para autocompletar en ItemModal
  const sprintNamesForAutocomplete = useMemo(() => {
    const set = new Set<string>(availableSprints);
    for (const it of allProjectItems) {
      if (it.sprint) set.add(it.sprint);
      else if (it.targetSprint) set.add(it.targetSprint);
    }
    return Array.from(set).sort();
  }, [availableSprints, allProjectItems]);

  // Unique releases for autocomplete (DEV-033)
  const availableReleases = useMemo(() => {
    const set = new Set<string>();
    for (const r of boardData?.releases || []) {
      if (r.version) set.add(r.version);
    }
    for (const it of allProjectItems) {
      if (it.release) set.add(it.release);
      else if (it.targetRelease) set.add(it.targetRelease);
    }
    return Array.from(set).sort();
  }, [allProjectItems, boardData]);

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
    // Archived = dismissed/cancelled but NOT soft-deleted (those go to Trash)
    return allProjectItems.filter((i) =>
      (i.status === 'dismissed' || i.status === 'cancelled') && !i.isDeleted
    ).length;
  }, [allProjectItems]);

  // DEV-049: Trashed items (soft-deleted)
  const trashedItems = useMemo(() => {
    return allProjectItems.filter((i) => i.isDeleted === true);
  }, [allProjectItems]);

  // DEV-049: Sub-tab for archive section
  const [archiveSubTab, setArchiveSubTab] = useState<'archive' | 'trash'>('archive');

  // Visible items after search/type/priority/module/status filters
  const visibleItems = useMemo(() => {
    return allProjectItems.filter((item) => {
      const isDismissedOrCancelled = item.status === 'dismissed' || item.status === 'cancelled';

      if (activeTab === 'archive') {
        return isDismissedOrCancelled;
      }

      // Canonical status normalization
      const canonicalStatus: ItemStatus =
        item.status === 'ideas' ? 'ideas'
        : (item.status === 'draft' || item.status === 'backlog') ? 'draft'
        : (item.status === 'doing' || item.status === 'in_progress') ? 'doing'
        : (item.status === 'review' || item.status === 'testing_qa') ? 'review'
        : (item.status === 'ready' || item.status === 'finish') ? 'ready'
        : (item.status === 'done') ? 'done'
        : (item.status === 'dismissed' || item.status === 'cancelled') ? 'dismissed'
        : item.status;

      // In non-archive tabs, verify if item's status is selected
      if (filters.statuses && filters.statuses.length > 0) {
        if (!filters.statuses.includes(canonicalStatus) && !filters.statuses.includes(item.status)) {
          return false;
        }
      } else {
        // If statuses list is somehow empty, exclude dismissed by default
        if (isDismissedOrCancelled && !filters.includeDismissedCancelled) {
          return false;
        }
      }

      // Search
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchCode = item.code.toLowerCase().includes(q);
        const matchModule = item.module ? item.module.toLowerCase().includes(q) : false;
        const matchDesc = item.description ? item.description.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchCode && !matchModule && !matchDesc) return false;
      }

      // Types (multiselect)
      if (filters.types && filters.types.length > 0) {
        if (!filters.types.includes(item.type)) return false;
      } else if (filters.type !== 'all' && item.type !== filters.type) {
        return false;
      }

      // Priorities (multiselect)
      if (filters.priorities && filters.priorities.length > 0) {
        if (!filters.priorities.includes(item.priority)) return false;
      } else if (filters.priority !== 'all' && item.priority !== filters.priority) {
        return false;
      }

      // Sprints
      if (filters.sprint && filters.sprint !== 'all') {
        if (filters.sprint === 'backlog') {
          if (item.sprint || item.targetSprint) return false;
        } else {
          if (item.sprint !== filters.sprint && item.targetSprint !== filters.sprint) return false;
        }
      }

      // Releases
      if (filters.release && filters.release !== 'all') {
        if (item.release !== filters.release && item.targetRelease !== filters.release && item.milestone !== filters.release) {
          return false;
        }
      }

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
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      
      {/* Header */}
      <Header
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
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
        onOpenImportWizard={() => setImportWizardOpen(true)}
        liveConnected={liveConnected}
        config={config}
        singleProject={boardData?.singleProject}
      />

      {/* Filter Bar (Active in Kanban, Sprint, and Archive tabs) */}
      {activeTab !== 'release' && activeTab !== 'settings' && (
        <FilterBar
          filters={filters}
          onChangeFilters={setFilters}
          availableModules={availableModules}
          availableSprints={availableSprints}
          availableReleases={availableReleases}
          stats={stats}
          customItemTypes={config?.customItemTypes}
        />
      )}

      {/* Project Error Warning Banner (e.g. EPERM or missing path) */}
      {(() => {
        const activeProj = projects.find(p => p.id === selectedProjectId);
        if (!activeProj?.error) return null;
        return (
          <div className="mx-4 sm:mx-6 lg:mx-8 mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 flex items-start gap-3 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-amber-800 dark:text-amber-300">
                No se pudieron cargar las tareas de {activeProj.name}
              </div>
              <div className="text-slate-600 dark:text-slate-400 mt-0.5">
                El proceso del servidor Vite no pudo acceder a la carpeta: <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[11px]">{activeProj.repoPath}</code>
              </div>
              <div className="mt-1 text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">Detalle:</span> {activeProj.error}
              </div>
              <div className="mt-2 text-slate-700 dark:text-slate-300 bg-amber-500/5 p-2 rounded-lg border border-amber-500/15">
                💡 <strong>Solución:</strong> Si el servidor Vite fue iniciado dentro de un sandbox o proceso aislado, reinicia el servidor en tu terminal habitual con <code className="px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono font-bold">npm run dev</code> para que cuente con permisos de acceso a las carpetas de otros repositorios en tu máquina.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Main Tab Content */}
      <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        {activeTab === 'kanban' && (
          <KanbanBoard
            items={visibleItems}
            viewMode={viewMode}
            onChangeViewMode={setViewMode}
            config={config}
            availableSprints={availableSprints}
            sprints={projectSprints}
            includePreviousDone={filters.includePreviousDone}
            onTogglePreviousDone={(val) => setFilters((prev) => ({ ...prev, includePreviousDone: val }))}
            includeDismissedCancelled={filters.includeDismissedCancelled}
            includeIdeas={filters.includeIdeas}
            onToggleIdeas={(val) => setFilters((prev) => ({ ...prev, includeIdeas: val }))}
            onNavigateToTab={setActiveTab}
            onUpdateColumnTitle={handleUpdateColumnTitle}
            onUpdateStatus={(id, status, targetColId, targetIndex, calculatedOrder) => handleUpdateStatus(id, status, false, targetColId, targetIndex, calculatedOrder)}
            onDeleteItem={handleDeleteItem}
            onClickItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
            onQuickAddItem={(status, defaultSprint) => {
              setEditingItem(null);
              setDefaultNewStatus(status);
              setDefaultNewSprint(defaultSprint || '');
              setItemModalOpen(true);
            }}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'sprint' && (
          <SprintView
            items={visibleItems}
            sprints={projectSprints}
            onClickItem={(item) => {
              setEditingItem(item);
              setItemModalOpen(true);
            }}
            onUpdateStatus={(id, s) => handleUpdateStatus(id, s)}
            onUpdatePriority={handleUpdatePriority}
            onReorderItem={handleReorderBacklogItem}
            onUpdateSprint={async (id, newSprint) => {
              const existing = boardData?.items.find((it) => it.id === id);
              const curSprint = existing ? (existing.sprint || existing.targetSprint || '') : '';
              if (curSprint === newSprint) return;
              try {
                const updated = await updateItem(id, { sprint: newSprint, targetSprint: newSprint });
                setBoardData((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    items: prev.items.map((it) => (it.id === id ? { ...it, ...updated } : it))
                  };
                });
                showToast(`Tarea ${updated.code} asignada a ${newSprint || 'Backlog'}`, 'info');
              } catch (err: any) {
                showToast(`Error al reasignar sprint: ${err.message}`, 'error');
              }
            }}
            onCreateSprint={handleCreateSprint}
            onUpdateSprintMeta={handleUpdateSprintMeta}
            onStartSprint={handleStartSprint}
            onCompleteSprint={handleCompleteSprint}
            onCreateTaskFromAction={handleCreateTaskFromAction}
            onDeleteSprint={handleDeleteSprint}
            onDeleteItem={handleDeleteItem}
            availableSprints={availableSprints}
            rankingEnabled={config.rankingEnabled !== false}
          />
        )}

        {activeTab === 'release' && (
          <ReleaseAssembler
            items={allProjectItems}
            releases={releases}
            projectId={selectedProjectId}
            onArchiveRelease={handleArchiveRelease}
            onDeleteRelease={handleDeleteRelease}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'archive' && (
          <div className="flex flex-col h-full">
            {/* Sub-tab switcher: Archive vs Trash */}
            <div className="flex items-center gap-1 px-6 pt-4 pb-0 shrink-0">
              <button
                type="button"
                onClick={() => setArchiveSubTab('archive')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  archiveSubTab === 'archive'
                    ? 'bg-slate-900 dark:bg-white/10 text-white dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                Archivo
                {archivedCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                    {archivedCount}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setArchiveSubTab('trash')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  archiveSubTab === 'trash'
                    ? 'bg-rose-600 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Papelera
                {trashedItems.length > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                    archiveSubTab === 'trash'
                      ? 'bg-white/20 text-white'
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  }`}>
                    {trashedItems.length}
                  </span>
                )}
              </button>
            </div>

            {archiveSubTab === 'archive' ? (
              <ArchiveView
                items={allProjectItems.filter((i) => !i.isDeleted)}
                onRestoreItem={handleRestoreItem}
                onDeleteItem={handleSoftDeleteItem}
                onClickItem={(item) => {
                  setEditingItem(item);
                  setItemModalOpen(true);
                }}
              />
            ) : (
              <TrashView
                trashedItems={trashedItems}
                onRestore={handleRestoreFromTrash}
                onPurge={handlePurgeItem}
              />
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsView
            config={config}
            onSaveConfig={handleSaveConfig}
            currentProject={projects.find(p => p.id === selectedProjectId)}
            onBack={() => setActiveTab(config?.defaultView === 'settings' ? 'kanban' : (config?.defaultView || 'kanban'))}
            onShowToast={showToast}
            onOpenImportWizard={() => setImportWizardOpen(true)}
            onExportMonolithic={handleExportMonolithic}
            onExportJson={handleExportJson}
          />
        )}
      </main>

      {/* Item Detail / Edit / Create Modal */}
      <ItemModal
        isOpen={itemModalOpen}
        onClose={() => {
          setItemModalOpen(false);
          setEditingItem(null);
          setDefaultNewSprint('');
        }}
        item={editingItem}
        defaultStatus={defaultNewStatus}
        defaultSprint={defaultNewSprint}
        projects={projects}
        availableModules={availableModules}
        availableSprints={sprintNamesForAutocomplete}
        availableReleases={availableReleases}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
        activeProjectId={selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id}
        config={config}
        allItems={boardData?.items || []}
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

      {/* Mobile Bottom Navigation Bar (DEV-007) */}
      <nav 
        aria-label="Navegación principal móvil"
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#090d15]/95 backdrop-blur-lg border-t border-slate-200 dark:border-white/[0.08] px-2 py-1 flex items-center justify-around shadow-lg"
      >
        {isKanbanTabEnabled && (
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all min-h-[48px] active:scale-95 ${
              activeTab === 'kanban'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">{config?.methodology === 'scrumban' ? 'Sprint Board' : 'Tablero'}</span>
          </button>
        )}

        {isSprintTabEnabled && (
          <button
            onClick={() => setActiveTab('sprint')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all min-h-[48px] active:scale-95 ${
              activeTab === 'sprint'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Target className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Sprint</span>
          </button>
        )}

        {isReleaseTabEnabled && (
          <button
            onClick={() => setActiveTab('release')}
            className={`flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all min-h-[48px] active:scale-95 ${
              activeTab === 'release'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Rocket className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Releases</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('archive')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 rounded-xl transition-all min-h-[48px] active:scale-95 ${
            activeTab === 'archive'
              ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/10'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Archive className="w-5 h-5 mb-0.5" />
            {archivedCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[9px] font-bold rounded-full bg-indigo-600 text-white">
                {archivedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Archivo</span>
        </button>
      </nav>

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

    </div>
  );
}

export default App;
