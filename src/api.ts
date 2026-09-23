import type { BacklogItem, BoardData, Project, Release, StorageType, DevBoardConfig, Sprint } from './types';

const API_BASE = '/api';

export async function fetchBoardData(): Promise<BoardData> {
  const res = await fetch(`${API_BASE}/data`);
  if (!res.ok) {
    throw new Error(`Error fetching board data: ${res.statusText}`);
  }
  return res.json();
}

export async function createItem(item: Partial<BacklogItem>): Promise<BacklogItem> {
  const res = await fetch(`${API_BASE}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    throw new Error(`Error creating item: ${res.statusText}`);
  }
  const data = await res.json();
  return data.item;
}

export async function updateItem(
  id: string, 
  updates: Partial<BacklogItem> & { expectedMtime?: number; force?: boolean }
): Promise<BacklogItem> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (res.status === 409) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || 'Conflict: item modificado en disco externamente');
    err.status = 409;
    err.conflict = true;
    err.currentMtime = errorData.currentMtime;
    err.currentItem = errorData.currentItem;
    throw err;
  }
  if (!res.ok) {
    throw new Error(`Error updating item: ${res.statusText}`);
  }
  const data = await res.json();
  return data.item;
}

export async function deleteItem(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error deleting item: ${res.statusText}`);
  }
  return true;
}

// DEV-049: Restore a soft-deleted item to its previous status
export async function restoreItem(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}/restore`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    throw new Error(`Error restoring item: ${res.statusText}`);
  }
  return true;
}

// DEV-049: Physically purge an item (irreversible, moves to archive/)
export async function purgeItem(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}?purge=true`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Error purging item: ${res.statusText}`);
  }
  return true;
}

export async function bulkUpdateItems(items: Array<Partial<BacklogItem>>): Promise<number> {
  const res = await fetch(`${API_BASE}/items/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    throw new Error(`Error bulk updating items: ${res.statusText}`);
  }
  const data = await res.json();
  return data.count;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
  });
  if (!res.ok) {
    throw new Error(`Error creating project: ${res.statusText}`);
  }
  const data = await res.json();
  return data.project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    throw new Error(`Error updating project: ${res.statusText}`);
  }
  const data = await res.json();
  return data.project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Error deleting project: ${res.statusText}`);
  }
  return true;
}

export async function createRelease(release: Partial<Release>, itemCodes: string[]): Promise<Release> {
  const res = await fetch(`${API_BASE}/releases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...release, itemCodes }),
  });
  if (!res.ok) {
    throw new Error(`Error creating release: ${res.statusText}`);
  }
  const data = await res.json();
  return data.release;
}

export async function syncLegacyReleases(projectId?: string): Promise<{ ok: boolean; releases: Release[]; count: number }> {
  const res = await fetch(`${API_BASE}/releases/sync-legacy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    throw new Error(`Error sincronizando releases: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteReleaseApi(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/releases/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  return res.ok;
}

export async function triggerResync(projectId?: string): Promise<{
  ok: boolean;
  projectId: string;
  projectName: string;
  importedCount: number;
  releasesCount: number;
  storageType?: string;
}> {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error syncing docs: ${res.statusText}`);
  }
  return await res.json();
}

export async function convertProjectToMd(projectId: string): Promise<{ ok: boolean; message: string; convertedCount: number }> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/convert-to-md`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error convirtiendo a Backlog.md: ${res.statusText}`);
  }
  return res.json();
}

export async function convertProjectToJson(projectId: string): Promise<{ ok: boolean; message: string; savedPath: string }> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/convert-to-json`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error convirtiendo a JSON: ${res.statusText}`);
  }
  return res.json();
}

export async function exportProjectJson(projectId: string): Promise<{ ok: boolean; project: Project; data: any }> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/export-json`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error exportando JSON: ${res.statusText}`);
  }
  return res.json();
}

export async function exportMonolithicMd(projectId: string, save = false): Promise<{ ok: boolean; content: string; savedPath?: string }> {
  const res = await fetch(`${API_BASE}/projects/${encodeURIComponent(projectId)}/export-monolithic-md${save ? '?save=true' : ''}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error exportando BACKLOG.md: ${res.statusText}`);
  }
  return res.json();
}

export async function restoreDemoProject(): Promise<{ ok: boolean; projects: Project[] }> {
  const res = await fetch(`${API_BASE}/projects/restore-demo`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error restaurando demo: ${res.statusText}`);
  }
  return res.json();
}

export interface FsBrowseResult {
  ok: boolean;
  currentPath: string;
  parentPath: string | null;
  folders: Array<{ name: string; path: string; isGit: boolean; hasBacklog: boolean }>;
  isGit: boolean;
  hasBacklog: boolean;
  hasDevBoard: boolean;
  warning?: string;
}

export async function browseDirectory(dir?: string): Promise<FsBrowseResult> {
  const query = dir ? `?dir=${encodeURIComponent(dir)}` : '';
  const res = await fetch(`${API_BASE}/fs/browse${query}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error explorando directorios: ${res.statusText}`);
  }
  return res.json();
}

export async function detectPathStorage(repoPath: string): Promise<{
  ok: boolean;
  exists: boolean;
  isGit: boolean;
  normalizedPath: string;
  storageType: StorageType;
  backlogDir: string;
}> {
  const res = await fetch(`${API_BASE}/projects/detect-path`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repoPath }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Error detectando ruta: ${res.statusText}`);
  }
  return res.json();
}

export type BoardEventType = 'connected' | 'disconnected' | 'backlog_changed';

export interface BoardEvent {
  type: BoardEventType;
  data: any;
}

export function subscribeToBoardEvents(onEvent: (event: BoardEvent) => void): () => void {
  let es: EventSource | null = null;
  let reconnectTimer: any = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;
    try {
      es = new EventSource(`${API_BASE}/events`);

      es.onopen = () => {
        onEvent({ type: 'connected', data: null });
      };

      es.addEventListener('backlog_changed', (evt: any) => {
        try {
          const data = JSON.parse(evt.data);
          onEvent({ type: 'backlog_changed', data });
        } catch {
          onEvent({ type: 'backlog_changed', data: null });
        }
      });

      es.onerror = () => {
        if (es) {
          es.close();
          es = null;
        }
        onEvent({ type: 'disconnected', data: null });
        if (!isClosed) {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
    } catch {
      onEvent({ type: 'disconnected', data: null });
      if (!isClosed) {
        reconnectTimer = setTimeout(connect, 3000);
      }
    }
  }

  connect();

  return () => {
    isClosed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (es) {
      es.close();
      es = null;
    }
  };
}

export async function importLegacyBacklog(params: {
  projectId: string;
  content?: string;
  items?: any[];
  defaultMilestone?: string;
}): Promise<{ ok: boolean; importedCount: number; items: BacklogItem[] }> {
  const res = await fetch(`${API_BASE}/import/legacy-md`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error importing legacy backlog: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchSettings(projectId?: string): Promise<DevBoardConfig> {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  const res = await fetch(`${API_BASE}/settings${query}`);
  if (!res.ok) {
    throw new Error(`Error fetching settings: ${res.statusText}`);
  }
  const data = await res.json();
  return data.config;
}

export async function saveSettings(config: DevBoardConfig, projectId?: string): Promise<DevBoardConfig> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ config, projectId }),
  });
  if (!res.ok) {
    throw new Error(`Error saving settings: ${res.statusText}`);
  }
  const data = await res.json();
  return data.config;
}

export async function setActiveProjectApi(projectId: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/projects/active`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchSprints(projectId?: string): Promise<Sprint[]> {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  const res = await fetch(`${API_BASE}/sprints${query}`);
  if (!res.ok) {
    throw new Error(`Error fetching sprints: ${res.statusText}`);
  }
  const data = await res.json();
  return data.sprints || [];
}

export async function createSprint(sprint: Partial<Sprint>): Promise<Sprint> {
  const res = await fetch(`${API_BASE}/sprints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sprint),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error creating sprint: ${res.statusText}`);
  }
  const data = await res.json();
  return data.sprint;
}

export async function updateSprint(id: string, updates: Partial<Sprint>): Promise<Sprint> {
  const res = await fetch(`${API_BASE}/sprints/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error updating sprint: ${res.statusText}`);
  }
  const data = await res.json();
  return data.sprint;
}

export async function deleteSprint(id: string, projectId?: string): Promise<boolean> {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  const res = await fetch(`${API_BASE}/sprints/${encodeURIComponent(id)}${query}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Error deleting sprint: ${res.statusText}`);
  }
  return true;
}


