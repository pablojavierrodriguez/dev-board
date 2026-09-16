import type { BacklogItem, BoardData, Project, Release, StorageType } from './types';

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

export async function updateItem(id: string, updates: Partial<BacklogItem>): Promise<BacklogItem> {
  const res = await fetch(`${API_BASE}/items/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
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
    throw new Error(`Error deleting item: ${res.statusText}`);
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

export async function triggerResync(): Promise<BoardData> {
  const res = await fetch(`${API_BASE}/import`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Error syncing docs: ${res.statusText}`);
  }
  const data = await res.json();
  return data.data;
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
