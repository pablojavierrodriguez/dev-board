import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { runMigration } from './scripts/import-dom-docs.js';

const REGISTRY_FILE = path.resolve(__dirname, 'data/projects-registry.json');
const DEMO_FILE = path.resolve(__dirname, 'data/demo-backlog.json');

interface ProjectMeta {
  id: string;
  name: string;
  codePrefix: string;
  repoPath?: string;
  description?: string;
  isDemo?: boolean;
  createdAt: string;
}

interface ProjectBacklog {
  project: ProjectMeta;
  items: any[];
  releases: any[];
  lastUpdated: string;
}

function getRegistry(): { activeProjectId: string; projects: ProjectMeta[] } {
  if (!fs.existsSync(REGISTRY_FILE)) {
    const defaultRegistry = {
      activeProjectId: 'demo',
      projects: [
        {
          id: 'demo',
          name: 'Proyecto Demo (Tour)',
          codePrefix: 'DEMO',
          description: 'Proyecto de demostración de DevBoard. Puedes explorarlo o eliminarlo en cualquier momento.',
          isDemo: true,
          createdAt: new Date().toISOString()
        }
      ]
    };
    if (!fs.existsSync(path.dirname(REGISTRY_FILE))) {
      fs.mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });
    }
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(defaultRegistry, null, 2), 'utf8');
    return defaultRegistry;
  }
  return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
}

function saveRegistry(registry: { activeProjectId: string; projects: ProjectMeta[] }) {
  if (!fs.existsSync(path.dirname(REGISTRY_FILE))) {
    fs.mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });
  }
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
}

function getProjectBacklogPath(project: ProjectMeta): string {
  if (project.isDemo) {
    return DEMO_FILE;
  }
  if (project.repoPath) {
    return path.join(project.repoPath, '.devboard/backlog.json');
  }
  return path.resolve(__dirname, `data/${project.id}-backlog.json`);
}

function readProjectBacklog(project: ProjectMeta): ProjectBacklog {
  const filePath = getProjectBacklogPath(project);
  if (!fs.existsSync(filePath)) {
    const initial: ProjectBacklog = {
      project,
      items: [],
      releases: [],
      lastUpdated: new Date().toISOString()
    };
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return { project, items: [], releases: [], lastUpdated: new Date().toISOString() };
  }
}

function writeProjectBacklog(project: ProjectMeta, data: ProjectBacklog) {
  const filePath = getProjectBacklogPath(project);
  data.lastUpdated = new Date().toISOString();
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function devBoardApi(): PluginOption {
  return {
    name: 'vite-plugin-dev-board-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        const getBody = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              if (!body) return resolve({});
              try {
                resolve(JSON.parse(body));
              } catch (e) {
                reject(e);
              }
            });
            req.on('error', reject);
          });
        };

        const sendJson = (status: number, payload: any) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(payload));
        };

        const handle = async () => {
          try {
            const registry = getRegistry();

            // GET /api/data
            if (req.method === 'GET' && url === '/api/data') {
              const allItems: any[] = [];
              const allReleases: any[] = [];

              for (const p of registry.projects) {
                const backlog = readProjectBacklog(p);
                allItems.push(...(backlog.items || []));
                allReleases.push(...(backlog.releases || []));
              }

              return sendJson(200, {
                projects: registry.projects,
                items: allItems,
                releases: allReleases,
                lastUpdated: new Date().toISOString()
              });
            }

            // POST /api/items
            if (req.method === 'POST' && url === '/api/items') {
              const body = await getBody();
              const now = new Date().toISOString();

              const project = registry.projects.find(p => p.id === (body.projectId || registry.projects[0]?.id)) || registry.projects[0];
              if (!project) return sendJson(400, { error: 'No active project found' });

              const backlog = readProjectBacklog(project);
              const prefix = project.codePrefix || 'ITEM';

              let code = body.code;
              if (!code) {
                const count = backlog.items.length + 1;
                code = `${prefix}-${String(count).padStart(3, '0')}`;
              }

              const newItem = {
                id: body.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                code,
                projectId: project.id,
                title: body.title || 'Sin título',
                description: body.description || '',
                type: body.type || 'feature',
                priority: body.priority || 'p2',
                status: body.status || 'backlog',
                module: body.module || undefined,
                impactedFile: body.impactedFile || undefined,
                risk: body.risk || undefined,
                fix: body.fix || undefined,
                targetSprint: body.targetSprint || undefined,
                targetRelease: body.targetRelease || undefined,
                sourceDoc: body.sourceDoc || undefined,
                order: body.order ?? backlog.items.length + 1,
                createdAt: now,
                updatedAt: now,
                completedAt: body.status === 'done' ? now : undefined,
                releasedAt: body.releasedAt || undefined
              };

              backlog.items.push(newItem);
              writeProjectBacklog(project, backlog);
              return sendJson(201, { ok: true, item: newItem });
            }

            // PUT /api/items/:id
            if (req.method === 'PUT' && url.startsWith('/api/items/')) {
              const id = decodeURIComponent(url.replace('/api/items/', '').split('?')[0]);
              const body = await getBody();
              const now = new Date().toISOString();

              for (const p of registry.projects) {
                const backlog = readProjectBacklog(p);
                const index = backlog.items.findIndex(i => i.id === id || i.code === id);
                if (index !== -1) {
                  const existing = backlog.items[index];
                  const wasDone = existing.status === 'done';
                  const isNowDone = body.status === 'done';

                  const updatedItem = {
                    ...existing,
                    ...body,
                    id: existing.id,
                    updatedAt: now,
                    completedAt: isNowDone && !wasDone ? now : (isNowDone ? existing.completedAt : undefined)
                  };

                  backlog.items[index] = updatedItem;
                  writeProjectBacklog(p, backlog);
                  return sendJson(200, { ok: true, item: updatedItem });
                }
              }

              return sendJson(404, { error: 'Item not found in any registered project' });
            }

            // DELETE /api/items/:id
            if (req.method === 'DELETE' && url.startsWith('/api/items/')) {
              const id = decodeURIComponent(url.replace('/api/items/', '').split('?')[0]);

              for (const p of registry.projects) {
                const backlog = readProjectBacklog(p);
                const initialLen = backlog.items.length;
                backlog.items = backlog.items.filter(i => i.id !== id && i.code !== id);

                if (backlog.items.length !== initialLen) {
                  writeProjectBacklog(p, backlog);
                  return sendJson(200, { ok: true, id });
                }
              }

              return sendJson(404, { error: 'Item not found' });
            }

            // POST /api/projects
            if (req.method === 'POST' && url === '/api/projects') {
              const body = await getBody();
              const now = new Date().toISOString();

              const id = (body.id || body.codePrefix || body.name || `proj-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
              const newProject: ProjectMeta = {
                id,
                name: body.name || 'Nuevo Proyecto',
                codePrefix: (body.codePrefix || 'PRJ').toUpperCase(),
                repoPath: body.repoPath || undefined,
                description: body.description || '',
                isDemo: !!body.isDemo,
                createdAt: now
              };

              registry.projects.push(newProject);
              saveRegistry(registry);

              // Auto-initialize backlog in target repo if repoPath provided
              if (newProject.repoPath) {
                readProjectBacklog(newProject);
              }

              return sendJson(201, { ok: true, project: newProject });
            }

            // DELETE /api/projects/:id (Unlink project from DevBoard)
            if (req.method === 'DELETE' && url.startsWith('/api/projects/')) {
              const id = decodeURIComponent(url.replace('/api/projects/', '').split('?')[0]);
              const initialLen = registry.projects.length;
              registry.projects = registry.projects.filter(p => p.id !== id);

              if (registry.projects.length === initialLen) {
                return sendJson(404, { error: 'Project not found in registry' });
              }

              saveRegistry(registry);
              return sendJson(200, { ok: true, id });
            }

            // POST /api/releases
            if (req.method === 'POST' && url === '/api/releases') {
              const body = await getBody();
              const now = new Date().toISOString();

              const project = registry.projects.find(p => p.id === body.projectId) || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              const release = {
                id: body.id || `rel-${(body.version || '1.0.0').replace(/\./g, '-')}-${Date.now()}`,
                projectId: project.id,
                version: body.version || '1.0.0',
                date: body.date || now.split('T')[0],
                title: body.title || 'Nuevo Release',
                summary: body.summary || '',
                itemCodes: body.itemCodes || [],
                markdownContent: body.markdownContent || '',
                createdAt: now
              };

              const itemCodeSet = new Set(release.itemCodes);
              backlog.items = backlog.items.map((it: any) => {
                if (itemCodeSet.has(it.code) || itemCodeSet.has(it.id)) {
                  return {
                    ...it,
                    targetRelease: release.version,
                    releasedAt: now,
                    status: it.status === 'finish' ? 'done' : it.status,
                    completedAt: it.completedAt || now,
                    updatedAt: now
                  };
                }
                return it;
              });

              const existingIdx = backlog.releases.findIndex((r: any) => r.version === release.version);
              if (existingIdx >= 0) {
                backlog.releases[existingIdx] = release;
              } else {
                backlog.releases.unshift(release);
              }

              writeProjectBacklog(project, backlog);
              return sendJson(201, { ok: true, release });
            }

            // POST /api/import
            if (req.method === 'POST' && url === '/api/import') {
              try {
                const targetProject = registry.projects.find(p => p.id === 'dom') || registry.projects[0];
                const targetFile = targetProject?.repoPath
                  ? path.join(targetProject.repoPath, '.devboard/backlog.json')
                  : path.resolve(__dirname, 'data/dom-backlog.json');

                runMigration(process.env.M3_DOCS_DIR || '/Users/adrisol/Pablo/code/m3/docs', targetFile);
                return sendJson(200, { ok: true });
              } catch (importErr: any) {
                return sendJson(500, { ok: false, error: importErr.message });
              }
            }

            sendJson(404, { error: 'Endpoint not found' });
          } catch (err: any) {
            console.error('[DevBoard API Error]', err);
            sendJson(500, { error: err.message || 'Internal server error' });
          }
        };

        handle();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), devBoardApi()],
  server: {
    port: 4100,
    strictPort: true,
    host: true
  }
});
