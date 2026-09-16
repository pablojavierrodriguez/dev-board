import type { BacklogItem, BoardData, Project, Release } from './types';

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
