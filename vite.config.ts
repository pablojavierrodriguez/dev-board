import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { runMigration } from './scripts/import-dom-docs.js';
import {
  parseBacklogMd,
  serializeBacklogMd,
  normalizeStatus,
  normalizePriority,
  generateTaskFilename,
  generateMonolithicBacklogMd,
  type BacklogMdTask
} from './scripts/backlogMdParser.ts';
import { parseLegacyMarkdown, type ParsedLegacyItem } from './src/utils/legacyParser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGISTRY_FILE = path.resolve(__dirname, 'data/projects-registry.json');
const DEMO_FILE = path.resolve(__dirname, 'data/demo-backlog.json');

interface ProjectMeta {
  id: string;
  name: string;
  codePrefix: string;
  repoPath?: string;
  description?: string;
  isDemo?: boolean;
  storageType?: 'json' | 'markdown';
  backlogDir?: string;
  docsPath?: string;
  hasDocs?: boolean;
  createdAt: string;
  error?: string;
}

interface ProjectBacklog {
  project: ProjectMeta;
  items: any[];
  releases: any[];
  sprints?: any[];
  lastUpdated: string;
}

function detectProjectStorage(repoPath?: string): { storageType: 'json' | 'markdown'; backlogDir: string } {
  if (!repoPath) return { storageType: 'json', backlogDir: 'backlog' };
  const normalized = path.normalize(repoPath.trim());
  try {
    if (fs.existsSync(path.join(normalized, 'backlog', 'tasks'))) {
      return { storageType: 'markdown', backlogDir: 'backlog' };
    }
    if (fs.existsSync(path.join(normalized, '.backlog', 'tasks'))) {
      return { storageType: 'markdown', backlogDir: '.backlog' };
    }
    if (fs.existsSync(path.join(normalized, 'backlog'))) {
      return { storageType: 'markdown', backlogDir: 'backlog' };
    }
    if (fs.existsSync(path.join(normalized, '.backlog'))) {
      return { storageType: 'markdown', backlogDir: '.backlog' };
    }
  } catch {}
  return { storageType: 'json', backlogDir: 'backlog' };
}

function isBacklogMdProject(project: ProjectMeta): boolean {
  if (project.isDemo) return false;
  if (project.storageType === 'markdown') return true;
  if (project.storageType === 'json') return false;
  if (project.repoPath) {
    return detectProjectStorage(project.repoPath).storageType === 'markdown';
  }
  return false;
}

function getBacklogTasksDir(project: ProjectMeta): string {
  const dir = project.backlogDir || 'backlog';
  return path.join(project.repoPath || '', dir, 'tasks');
}

function getProjectDocsPath(project: ProjectMeta): string | null {
  if (project.docsPath && fs.existsSync(project.docsPath)) {
    return project.docsPath;
  }
  if (project.repoPath) {
    const defaultDocs = path.join(project.repoPath, 'docs');
    if (fs.existsSync(defaultDocs)) {
      try {
        const files = fs.readdirSync(defaultDocs);
        const hasDocFiles = files.some(f =>
          ['quality_log.md', 'backlog.md', 'release_notes.md'].includes(f.toLowerCase()) ||
          f.toLowerCase() === 'specs'
        );
        if (hasDocFiles) return defaultDocs;
      } catch {}
    }
  }
  if (project.id === 'dom') {
    const fallback = process.env.M3_DOCS_DIR || '/Users/adrisol/Pablo/code/m3/docs';
    if (fs.existsSync(fallback)) return fallback;
  }
  return null;
}

function getSafeInitialBrowseDir(): string {
  const candidates = [
    path.resolve(process.cwd(), '..'),
    process.cwd(),
    os.homedir()
  ];
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate)) {
        fs.readdirSync(candidate);
        return candidate;
      }
    } catch {}
  }
  return process.cwd();
}

function getRegistry(): { activeProjectId: string; projects: ProjectMeta[] } {
  let reg: { activeProjectId: string; projects: ProjectMeta[] };
  if (!fs.existsSync(REGISTRY_FILE)) {
    reg = {
      activeProjectId: '',
      projects: []
    };
  } else {
    try {
      reg = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } catch {
      reg = { activeProjectId: '', projects: [] };
    }
  }

  // DEV-040: Auto-discover local repo if running inside a repo with .devboard/ or backlog/
  const cwd = process.cwd();
  const hasLocalDevboard = fs.existsSync(path.join(cwd, '.devboard')) || fs.existsSync(path.join(cwd, 'backlog'));
  if (hasLocalDevboard) {
    const cwdResolved = path.resolve(cwd);
    const existingLocal = reg.projects.find(p => p.repoPath && path.resolve(p.repoPath) === cwdResolved);
    if (!existingLocal) {
      const detected = detectProjectStorage(cwdResolved);
      const pkgJsonPath = path.join(cwdResolved, 'package.json');
      let localName = path.basename(cwdResolved);
      if (fs.existsSync(pkgJsonPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
          if (pkg.name) localName = pkg.name;
        } catch {}
      }
      const localId = localName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const localProject: ProjectMeta = {
        id: localId,
        name: localName,
        codePrefix: localName.substring(0, 4).toUpperCase(),
        repoPath: cwdResolved,
        storageType: detected.storageType,
        backlogDir: detected.backlogDir || 'backlog',
        createdAt: new Date().toISOString()
      };
      reg.projects.unshift(localProject);
      if (!reg.activeProjectId || reg.projects.length === 1) {
        reg.activeProjectId = localId;
      }
    } else {
      if (!reg.activeProjectId) {
        reg.activeProjectId = existingLocal.id;
      }
    }
  }

  if (reg.projects.length === 0) {
    reg = {
      activeProjectId: 'demo',
      projects: [
        {
          id: 'demo',
          name: 'Proyecto Demo (Tour)',
          codePrefix: 'DEMO',
          description: 'Proyecto de demostración de DevBoard. Puedes explorarlo o eliminarlo en cualquier momento.',
          isDemo: true,
          storageType: 'json' as const,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  // Ensure storageType is populated
  reg.projects = reg.projects.map((p: ProjectMeta) => {
    if (!p.storageType && p.repoPath) {
      const detected = detectProjectStorage(p.repoPath);
      return { ...p, storageType: detected.storageType, backlogDir: detected.backlogDir };
    }
    return { ...p, storageType: p.storageType || 'json' };
  });
  return reg;
}

function saveRegistry(registry: { activeProjectId: string; projects: ProjectMeta[] }) {
  if (!fs.existsSync(path.dirname(REGISTRY_FILE))) {
    fs.mkdirSync(path.dirname(REGISTRY_FILE), { recursive: true });
  }
  const sanitized = {
    ...registry,
    projects: registry.projects.map(p => {
      const clean: any = { ...p };
      if (!clean.isDemo) {
        delete clean.isDemo;
      }
      return clean;
    })
  };
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(sanitized, null, 2), 'utf8');
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

function getConfigFilepath(project?: ProjectMeta): string {
  if (project?.repoPath) {
    return path.join(project.repoPath, '.devboard/config.json');
  }
  return path.resolve(process.cwd(), '.devboard/config.json');
}

const DEFAULT_CONFIG = {
  theme: 'dark',
  density: 'comfortable',
  autoSave: true,
  kanban: {
    showIdeasByDefault: false,
    showDoneHistoryByDefault: false,
    wipLimits: {
      'col-doing': 0,
      'col-review': 0,
      'col-ready': 0
    }
  },
  version: '1.0.0'
};

function readProjectConfig(project?: ProjectMeta): any {
  const configFile = getConfigFilepath(project);
  try {
    if (fs.existsSync(configFile)) {
      const raw = fs.readFileSync(configFile, 'utf8');
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CONFIG, ...parsed, _filepath: configFile };
    }
  } catch (err: any) {
    console.warn(`[DevBoard Config] Failed to read ${configFile}:`, err.message);
  }
  return { ...DEFAULT_CONFIG, _filepath: configFile };
}

function writeProjectConfig(config: any, project?: ProjectMeta): string {
  const configFile = getConfigFilepath(project);
  const dir = path.dirname(configFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const toSave = { ...config };
  delete toSave._filepath;
  fs.writeFileSync(configFile, JSON.stringify(toSave, null, 2), 'utf8');
  return configFile;
}

function parseReleaseNotesMd(repoPath: string, projectPrefix?: string, knownItems: any[] = []): any[] {
  if (!repoPath) return [];
  const possiblePaths = [
    path.join(repoPath, 'docs/RELEASE_NOTES.md'),
    path.join(repoPath, 'docs/releasenotes.md'),
    path.join(repoPath, 'RELEASE_NOTES.md'),
    path.join(repoPath, 'releasenotes.md'),
    path.join(repoPath, 'docs/CHANGELOG.md'),
    path.join(repoPath, 'CHANGELOG.md'),
    path.join(repoPath, 'changelog.md')
  ];

  let notesContent = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        notesContent = fs.readFileSync(p, 'utf8');
        break;
      } catch {}
    }
  }

  if (!notesContent.trim()) return [];

  const knownCodeSet = new Set(knownItems.map(it => (it.code || it.id || '').toUpperCase()).filter(Boolean));
  const prefixUpper = (projectPrefix || '').toUpperCase().trim();

  // Split into version sections based on ## headers
  const sections = notesContent.split(/(?=^##\s+)/m);
  const releases: any[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed.startsWith('##')) continue;

    const firstLineEnd = trimmed.indexOf('\n');
    const headerLine = firstLineEnd > 0 ? trimmed.substring(0, firstLineEnd) : trimmed;
    const bodyContent = firstLineEnd > 0 ? trimmed.substring(firstLineEnd + 1) : '';

    const vMatch = headerLine.match(/^##\s*\[?([vV]?\d+(?:\.\d+)*(?:-[a-zA-Z0-9.]+)?(?:[^\s\]—–-]+)?)\]?/);
    if (!vMatch) continue;

    const rawVersion = vMatch[1].trim();
    const version = rawVersion.replace(/^v(?=\d)/i, '');

    const dateMatch = headerLine.match(/\b(\d{4}-\d{2}-\d{2})\b/);
    const date = dateMatch ? dateMatch[1] : '';

    let title = headerLine.replace(/^##\s*\[?[^\]]+\]?/, '').trim();
    if (date) {
      title = title.replace(date, '').trim();
    }
    title = title.replace(/^[-—–:🚀 ]+/, '').trim();
    if (!title) title = `Release ${version}`;

    let summary = '';
    const summaryMatch = bodyContent.match(/###\s*(?:🎯\s*)?Resumen\s*\n+([^\n#]+)/i);
    if (summaryMatch) {
      summary = summaryMatch[1].replace(/^\*+|\*+$/g, '').trim();
    }

    const itemCodesSet = new Set<string>();
    const codeCandidates = trimmed.match(/\b([A-Za-z0-9]+(?:-[A-Za-z0-9]+)+)\b/g) || [];
    for (const code of codeCandidates) {
      const upper = code.toUpperCase();
      if (knownCodeSet.has(upper)) {
        itemCodesSet.add(upper);
      } else if (prefixUpper && upper.startsWith(`${prefixUpper}-`)) {
        itemCodesSet.add(upper);
      }
    }

    for (const it of knownItems) {
      const m = (it.milestone || it.targetSprint || '').replace(/^v/i, '');
      if (m && m === version) {
        itemCodesSet.add(it.code || it.id);
      }
    }

    releases.push({
      id: `rel-${version.replace(/\./g, '-')}`,
      version,
      date: date || new Date().toISOString().split('T')[0],
      title,
      summary,
      itemCodes: Array.from(itemCodesSet),
      markdownContent: trimmed,
      createdAt: date ? `${date}T00:00:00.000Z` : new Date().toISOString()
    });
  }

  return releases;
}

function readProjectBacklog(project: ProjectMeta): ProjectBacklog {
  if (isBacklogMdProject(project) && project.repoPath) {
    const tasksDir = getBacklogTasksDir(project);
    try {
      if (!fs.existsSync(tasksDir)) {
        fs.mkdirSync(tasksDir, { recursive: true });
      }

      const items: any[] = [];
      const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
      files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      let order = 1;
      for (const filename of files) {
        const fullPath = path.join(tasksDir, filename);
        try {
          const fileStat = fs.statSync(fullPath);
          const raw = fs.readFileSync(fullPath, 'utf8');
          const fallbackId = filename.split(' - ')[0] || filename.replace(/\.md$/, '');
          const task = parseBacklogMd(raw, fallbackId);
          const rawFm = task.rawExtraFrontmatter || {};
          const sprintVal = task.sprint || task.targetSprint || rawFm.sprint || rawFm.targetSprint || (task.sprints && task.sprints.length > 0 ? task.sprints[task.sprints.length - 1] : undefined) || (task.milestone && task.milestone.toLowerCase().includes('sprint') ? task.milestone : undefined);
          const releaseVal = task.milestone || rawFm.release || rawFm.targetRelease || (task.releases && task.releases.length > 0 ? task.releases[task.releases.length - 1] : undefined);

          items.push({
            id: task.id || fallbackId,
            code: task.id || fallbackId,
            projectId: project.id,
            title: task.title,
            description: task.description || '',
            type: task.type || 'feature',
            priority: normalizePriority(task.priority),
            status: task.status, // normalized: draft, doing, review, ready, done, dismissed
            sprint: sprintVal,
            release: releaseVal,
            targetSprint: sprintVal,
            targetRelease: releaseVal,
            milestone: task.milestone || releaseVal || sprintVal,
            parentId: task.parentId || rawFm.parent || rawFm.parentId || undefined,
            blocks: task.blocks || (rawFm.blocks ? (Array.isArray(rawFm.blocks) ? rawFm.blocks : [rawFm.blocks]) : []),
            blockedBy: task.blockedBy || (rawFm.blocked_by ? (Array.isArray(rawFm.blocked_by) ? rawFm.blocked_by : [rawFm.blocked_by]) : []),
            relatedTo: task.relatedTo || (rawFm.related_to ? (Array.isArray(rawFm.related_to) ? rawFm.related_to : [rawFm.related_to]) : []),
            dependencies: task.dependencies || [],
            sprints: task.sprints && task.sprints.length > 0 ? task.sprints : (sprintVal ? [sprintVal] : []),
            releases: task.releases && task.releases.length > 0 ? task.releases : (releaseVal ? [releaseVal] : []),
            impactedFile: rawFm.impactedFile || undefined,
            risk: rawFm.risk || undefined,
            fix: rawFm.fix || undefined,
            acceptanceCriteriaList: task.acceptanceCriteria || [],
            implementationPlan: task.implementationPlan || '',
            assignees: task.assignees || [],
            labels: task.labels || [],
            order: rawFm.order !== undefined ? Number(rawFm.order) : order++,
            createdAt: task.createdDate || new Date().toISOString(),
            updatedAt: task.updatedDate || new Date().toISOString(),
            mtime: Math.round(fileStat.mtimeMs)
          });
        } catch (err) {
          console.warn(`[DevBoard Backlog.md] Error reading ${filename}:`, err);
        }
      }

      // Read releases
      let releases: any[] = [];
      const releasesPath = path.join(project.repoPath, project.backlogDir || 'backlog', 'releases.json');
      if (fs.existsSync(releasesPath)) {
        try {
          releases = JSON.parse(fs.readFileSync(releasesPath, 'utf8'));
        } catch {}
      }

      // Retrocompatibilidad: Si no hay releases registrados pero existe RELEASE_NOTES.md / CHANGELOG.md, auto-sincronizar
      if (releases.length === 0 && project.repoPath) {
        const parsed = parseReleaseNotesMd(project.repoPath, project.codePrefix, items);
        if (parsed.length > 0) {
          releases = parsed;
          try {
            if (!fs.existsSync(path.dirname(releasesPath))) {
              fs.mkdirSync(path.dirname(releasesPath), { recursive: true });
            }
            fs.writeFileSync(releasesPath, JSON.stringify(releases, null, 2), 'utf8');
          } catch (writeErr: any) {
            console.warn(`[DevBoard API] Error persisting auto-synced releases:`, writeErr.message);
          }
        }
      }

      // Asignar targetRelease a tareas de releases, y releasedAt ÚNICAMENTE si el release está liberado (released) a producción
      if (releases.length > 0) {
        const releaseByCode = new Map<string, { version: string; date: string; isReleased: boolean }>();
        for (const rel of releases) {
          const isReleased = rel.status === 'released';
          for (const code of rel.itemCodes || []) {
            const key = code.toUpperCase();
            if (!releaseByCode.has(key) || (!releaseByCode.get(key)!.isReleased && isReleased)) {
              releaseByCode.set(key, { version: rel.version, date: rel.date, isReleased });
            }
          }
        }
        for (const it of items) {
          const key = (it.code || it.id).toUpperCase();
          if (releaseByCode.has(key)) {
            const rInfo = releaseByCode.get(key)!;
            it.targetRelease = it.targetRelease || rInfo.version;
            if (rInfo.isReleased) {
              it.releasedAt = it.releasedAt || (rInfo.date ? new Date(rInfo.date).toISOString() : undefined);
            }
          }
        }
      }

      // Read sprints
      let sprints: any[] = [];
      const sprintsPath = path.join(project.repoPath, project.backlogDir || 'backlog', 'sprints.json');
      if (fs.existsSync(sprintsPath)) {
        try {
          sprints = JSON.parse(fs.readFileSync(sprintsPath, 'utf8'));
        } catch {}
      }

      // Asegurar que cada sprint tenga explícitamente su projectId asignado
      sprints = (sprints || []).map((s: any) => ({
        ...s,
        projectId: s.projectId || project.id
      }));

      // Auto-inicializar sprints desde tareas si sprints.json no existe o está vacío
      if (sprints.length === 0 && project.repoPath) {
        const detectedSprintNames = new Set<string>();
        for (const it of items) {
          const sp = it.sprint || it.targetSprint;
          if (sp && typeof sp === 'string' && sp.trim() && sp.toLowerCase() !== 'backlog') {
            detectedSprintNames.add(sp.trim());
          }
        }
        if (detectedSprintNames.size > 0) {
          const sorted = Array.from(detectedSprintNames).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
            const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
            return numA - numB;
          });
          const maxNum = sorted.length > 0 ? (parseInt(sorted[sorted.length - 1].replace(/\D/g, ''), 10) || 0) : 0;
          
          sprints = sorted.map((name) => {
            const num = parseInt(name.replace(/\D/g, ''), 10) || 0;
            const isLatest = num === maxNum;
            return {
              id: `sprint-${num || name.toLowerCase().replace(/\s+/g, '-')}`,
              projectId: project.id,
              name,
              goal: '',
              status: isLatest ? 'active' : 'completed',
              createdAt: new Date().toISOString()
            };
          });
          try {
            if (!fs.existsSync(path.dirname(sprintsPath))) {
              fs.mkdirSync(path.dirname(sprintsPath), { recursive: true });
            }
            fs.writeFileSync(sprintsPath, JSON.stringify(sprints, null, 2), 'utf8');
          } catch {}
        }
      }

      return {
        project: { ...project, storageType: 'markdown' },
        items,
        releases,
        sprints,
        lastUpdated: new Date().toISOString()
      };
    } catch (err: any) {
      console.warn(`[DevBoard API] Error reading Backlog.md tasks for ${project.id} at ${tasksDir}:`, err.message);
      return {
        project: { ...project, storageType: 'markdown', error: err.message },
        items: [],
        releases: [],
        sprints: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  // Classic JSON mode: Operates directly on the project repository
  const filePath = getProjectBacklogPath(project);
  try {
    if (!fs.existsSync(filePath)) {
      const initial: ProjectBacklog = {
        project: { ...project, storageType: 'json' },
        items: [],
        releases: [],
        lastUpdated: new Date().toISOString()
      };
      try {
        if (!fs.existsSync(path.dirname(filePath))) {
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(initial, null, 2), 'utf8');
      } catch (writeErr: any) {
        console.error(`[DevBoard API] Cannot initialize backlog at ${filePath}:`, writeErr.message);
      }
      return initial;
    }

    const jsonStat = fs.existsSync(filePath) ? fs.statSync(filePath) : null;
    const jsonMtime = jsonStat ? Math.round(jsonStat.mtimeMs) : Date.now();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    let items = Array.isArray(parsed.items) ? parsed.items : [];
    items = items.map((it: any) => ({
      ...it,
      projectId: it.projectId || project.id,
      status: normalizeStatus(it.status),
      mtime: it.mtime || jsonMtime
    }));

    return {
      project: { ...project, storageType: 'json' },
      items,
      releases: Array.isArray(parsed.releases) ? parsed.releases : [],
      lastUpdated: parsed.lastUpdated || new Date().toISOString()
    };
  } catch (err: any) {
    console.error(`[DevBoard API] Error reading backlog for project ${project.id} from ${filePath}:`, err.message);
    return { project: { ...project, storageType: 'json', error: err.message }, items: [], releases: [], lastUpdated: new Date().toISOString() };
  }
}

function saveBacklogMdItem(project: ProjectMeta, item: any) {
  if (!project.repoPath) return;
  const tasksDir = getBacklogTasksDir(project);
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
  }

  const cleanId = (item.code || item.id).toLowerCase();
  const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
  
  // 1. Coincidencia por prefijo de archivo
  let existingFile = files.find(f => {
    const fLower = f.toLowerCase();
    return fLower.startsWith(`${cleanId} `) || fLower.startsWith(`${cleanId}-`) || fLower === `${cleanId}.md`;
  });

  // 2. Reconciliación por frontmatter si fue renombrado manualmente (DEV-019)
  if (!existingFile) {
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(tasksDir, f), 'utf8');
        const fallbackId = f.split(' - ')[0] || f.replace(/\.md$/, '');
        const parsed = parseBacklogMd(raw, fallbackId);
        if (parsed.id && parsed.id.toLowerCase() === cleanId) {
          existingFile = f;
          break;
        }
      } catch {}
    }
  }

  let existingTask: Partial<BacklogMdTask> = {};
  if (existingFile) {
    try {
      const raw = fs.readFileSync(path.join(tasksDir, existingFile), 'utf8');
      existingTask = parseBacklogMd(raw, item.code || item.id);
    } catch {}
  }

  const taskData: BacklogMdTask = {
    id: item.code || item.id,
    title: item.title || existingTask.title || 'Sin título',
    status: normalizeStatus(item.status),
    type: item.type || existingTask.type || 'feature',
    priority: item.priority || existingTask.priority || 'p2',
    assignees: item.assignees || existingTask.assignees || [],
    labels: item.labels || existingTask.labels || [],
    dependencies: item.dependencies || existingTask.dependencies || [],
    parentId: item.parentId !== undefined ? item.parentId : existingTask.parentId,
    blocks: item.blocks !== undefined ? item.blocks : existingTask.blocks,
    blockedBy: item.blockedBy !== undefined ? item.blockedBy : existingTask.blockedBy,
    relatedTo: item.relatedTo !== undefined ? item.relatedTo : existingTask.relatedTo,
    sprints: item.sprints !== undefined ? item.sprints : existingTask.sprints,
    releases: item.releases !== undefined ? item.releases : existingTask.releases,
    milestone: item.release || item.targetRelease || item.milestone || existingTask.milestone,
    createdDate: item.createdAt || existingTask.createdDate,
    updatedDate: item.updatedAt || new Date().toISOString(),
    description: item.description !== undefined ? item.description : (existingTask.description || ''),
    acceptanceCriteria: item.acceptanceCriteriaList || existingTask.acceptanceCriteria || [],
    implementationPlan: item.implementationPlan !== undefined ? item.implementationPlan : (existingTask.implementationPlan || ''),
    implementationNotes: item.fix || item.implementationNotes || existingTask.implementationNotes,
    finalSummary: item.finalSummary || existingTask.finalSummary,
    rawExtraFrontmatter: {
      ...(existingTask.rawExtraFrontmatter || {})
    }
  };

  if (item.impactedFile) taskData.rawExtraFrontmatter!.impactedFile = item.impactedFile;
  if (item.risk) taskData.rawExtraFrontmatter!.risk = item.risk;
  if (item.fix) taskData.rawExtraFrontmatter!.fix = item.fix;
  if (item.sprint !== undefined || item.targetSprint !== undefined || item.sprints !== undefined) {
    const sVal = item.sprint || item.targetSprint || (item.sprints && item.sprints.length > 0 ? item.sprints[item.sprints.length - 1] : '') || '';
    if (sVal) {
      taskData.sprint = sVal;
      taskData.targetSprint = sVal;
      taskData.sprints = Array.from(new Set([...(taskData.sprints || []), sVal]));
      taskData.rawExtraFrontmatter!.sprint = sVal;
      taskData.rawExtraFrontmatter!.targetSprint = sVal;
    } else {
      taskData.sprint = undefined;
      taskData.targetSprint = undefined;
      taskData.sprints = [];
      delete taskData.rawExtraFrontmatter!.sprint;
      delete taskData.rawExtraFrontmatter!.targetSprint;
      if (taskData.milestone && taskData.milestone.toLowerCase().includes('sprint')) {
        taskData.milestone = undefined;
      }
    }
  } else if (existingTask.sprint || existingTask.targetSprint || (existingTask.sprints && existingTask.sprints.length > 0)) {
    const sVal = existingTask.sprint || existingTask.targetSprint || (existingTask.sprints && existingTask.sprints.length > 0 ? existingTask.sprints[existingTask.sprints.length - 1] : '');
    if (sVal) {
      taskData.sprint = sVal;
      taskData.targetSprint = sVal;
      if (!taskData.sprints || taskData.sprints.length === 0) {
        taskData.sprints = [sVal];
      }
    }
  }
  if (item.release !== undefined || item.targetRelease !== undefined || item.milestone !== undefined) {
    const rVal = item.release || item.targetRelease || item.milestone || '';
    if (rVal) {
      taskData.rawExtraFrontmatter!.release = rVal;
      taskData.rawExtraFrontmatter!.targetRelease = rVal;
      taskData.milestone = rVal;
    } else {
      delete taskData.rawExtraFrontmatter!.release;
      delete taskData.rawExtraFrontmatter!.targetRelease;
      taskData.milestone = undefined;
    }
  }
  if (item.order !== undefined) taskData.rawExtraFrontmatter!.order = item.order;

  const content = serializeBacklogMd(taskData);
  const newFilename = generateTaskFilename(taskData.id, taskData.title);
  const newFilePath = path.join(tasksDir, newFilename);

  // Si existía un archivo con nombre distinto (o no canónico), eliminar el anterior
  if (existingFile && existingFile !== newFilename) {
    try {
      fs.unlinkSync(path.join(tasksDir, existingFile));
    } catch {}
  }

  fs.writeFileSync(newFilePath, content, 'utf8');
}

// DEV-049: Find a backlog MD task file by id/code, returns { file, task } or null
function findBacklogMdFile(project: ProjectMeta, id: string): { filePath: string; filename: string; task: any } | null {
  if (!project.repoPath) return null;
  const tasksDir = getBacklogTasksDir(project);
  if (!fs.existsSync(tasksDir)) return null;

  const cleanId = id.toLowerCase();
  const files = fs.readdirSync(tasksDir).filter((f: string) => f.endsWith('.md'));
  let found = files.find((f: string) => {
    const fLower = f.toLowerCase();
    return fLower.startsWith(`${cleanId} `) || fLower.startsWith(`${cleanId}-`) || fLower === `${cleanId}.md`;
  });

  if (!found) {
    for (const f of files) {
      try {
        const raw = fs.readFileSync(path.join(tasksDir, f), 'utf8');
        const fallbackId = f.split(' - ')[0] || f.replace(/\.md$/, '');
        const parsed = parseBacklogMd(raw, fallbackId);
        if (parsed.id && parsed.id.toLowerCase() === cleanId) {
          found = f;
          break;
        }
      } catch {}
    }
  }

  if (!found) return null;
  const filePath = path.join(tasksDir, found);
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const fallbackId = found.split(' - ')[0] || found.replace(/\.md$/, '');
    const task = parseBacklogMd(raw, fallbackId);
    return { filePath, filename: found, task };
  } catch {
    return { filePath, filename: found, task: {} };
  }
}

// DEV-049: Soft delete — marks isDeleted=true, status=dismissed, saves deletedAt and previousStatus
function softDeleteBacklogMdItem(project: ProjectMeta, id: string): boolean {
  const found = findBacklogMdFile(project, id);
  if (!found) return false;
  const { filePath, task } = found;

  // Protect done items from deletion
  const currentStatus = (task.status || '').toLowerCase();
  if (currentStatus === 'done') return false;

  const previousStatus = task.status || 'draft';
  const raw = fs.readFileSync(filePath, 'utf8');
  // Inject soft-delete fields into frontmatter
  let updated = raw;
  // Replace or add status
  if (/^status:/m.test(updated)) {
    updated = updated.replace(/^status:.*$/m, `status: dismissed`);
  }
  // Add isDeleted, deletedAt, previousStatus after status line
  if (!/^isDeleted:/m.test(updated)) {
    updated = updated.replace(/^(status:.*$)/m, `$1\nisDeleted: true\ndeletedAt: "${new Date().toISOString()}"\npreviousStatus: "${previousStatus}"`);
  } else {
    updated = updated.replace(/^isDeleted:.*$/m, `isDeleted: true`);
    updated = updated.replace(/^deletedAt:.*$/m, `deletedAt: "${new Date().toISOString()}"`);
    updated = updated.replace(/^previousStatus:.*$/m, `previousStatus: "${previousStatus}"`);
  }
  fs.writeFileSync(filePath, updated, 'utf8');
  return true;
}

// DEV-049: Restore — reverts status to previousStatus and clears soft-delete fields
function restoreBacklogMdItem(project: ProjectMeta, id: string): boolean {
  const found = findBacklogMdFile(project, id);
  if (!found) return false;
  const { filePath } = found;

  let raw = fs.readFileSync(filePath, 'utf8');
  // Extract previousStatus
  const prevMatch = raw.match(/^previousStatus:\s*"?([^"\n]+)"?/m);
  const restoreStatus = prevMatch ? prevMatch[1].trim() : 'draft';

  raw = raw.replace(/^status:.*$/m, `status: ${restoreStatus}`);
  raw = raw.replace(/^isDeleted:.*\n?/m, '');
  raw = raw.replace(/^deletedAt:.*\n?/m, '');
  raw = raw.replace(/^previousStatus:.*\n?/m, '');
  fs.writeFileSync(filePath, raw, 'utf8');
  return true;
}

// DEV-049: Physical purge — moves file to backlog/archive/ (permanent, irreversible)
function purgeBacklogMdItem(project: ProjectMeta, id: string): boolean {
  if (!project.repoPath) return false;
  const found = findBacklogMdFile(project, id);
  if (!found) return false;

  const archiveDir = path.join(project.repoPath, project.backlogDir || 'backlog', 'archive');
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  fs.renameSync(found.filePath, path.join(archiveDir, found.filename));
  return true;
}

// DEV-049 legacy: kept for compat - now delegates to softDeleteBacklogMdItem
function deleteBacklogMdItem(project: ProjectMeta, id: string): boolean {
  return softDeleteBacklogMdItem(project, id);
}

function writeProjectBacklog(project: ProjectMeta, data: ProjectBacklog) {
  if (isBacklogMdProject(project)) {
    // In backlog-md mode, save releases into backlog/releases.json and sprints into backlog/sprints.json
    if (project.repoPath) {
      try {
        const dir = path.join(project.repoPath, project.backlogDir || 'backlog');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'releases.json'), JSON.stringify(data.releases || [], null, 2), 'utf8');
        if (data.sprints !== undefined) {
          fs.writeFileSync(path.join(dir, 'sprints.json'), JSON.stringify(data.sprints || [], null, 2), 'utf8');
        }
      } catch (err: any) {
        console.warn(`[DevBoard API] Warning writing releases/sprints: ${err.message}`);
      }
    }
    return;
  }

  const filePath = getProjectBacklogPath(project);
  data.lastUpdated = new Date().toISOString();

  try {
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (err: any) {
    console.error(`[DevBoard API] Error writing project backlog to ${filePath}:`, err.message);
  }
}

function devBoardApi(): PluginOption {
  // SSE clients connection pool for real-time live sync (DEV-014)
  const sseClients = new Set<any>();

  function broadcastSse(event: string, data: any) {
    const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of sseClients) {
      try {
        client.write(msg);
      } catch {
        sseClients.delete(client);
      }
    }
  }

  let activeWatchers: fs.FSWatcher[] = [];

  function setupProjectWatchers() {
    for (const w of activeWatchers) {
      try { w.close(); } catch {}
    }
    activeWatchers = [];

    const registry = getRegistry();
    const dirsToWatch = new Set<string>();

    const dataDir = path.resolve(__dirname, 'data');
    if (fs.existsSync(dataDir)) dirsToWatch.add(dataDir);

    for (const p of registry.projects) {
      try {
        if (p.repoPath && fs.existsSync(p.repoPath)) {
          const backlogDir = path.join(p.repoPath, p.backlogDir || 'backlog');
          if (fs.existsSync(backlogDir)) dirsToWatch.add(backlogDir);
          const devboardDir = path.join(p.repoPath, '.devboard');
          if (fs.existsSync(devboardDir)) dirsToWatch.add(devboardDir);
        }
      } catch (err: any) {
        console.warn(`[DevBoard Watcher] Error checking repoPath for ${p.id}:`, err.message);
      }
    }

    let debounceTimer: any = null;
    const notifyChange = (eventDir: string, filename: string | null) => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        broadcastSse('backlog_changed', {
          dir: eventDir,
          file: filename,
          timestamp: Date.now()
        });
      }, 250);
    };

    for (const dir of dirsToWatch) {
      try {
        const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
          if (filename && (filename.endsWith('.log') || filename.endsWith('.tmp') || filename.includes('.git') || (filename.startsWith('.') && !filename.includes('devboard') && !filename.includes('backlog')))) {
            return;
          }
          notifyChange(dir, filename);
        });
        if (typeof watcher.unref === 'function') watcher.unref();
        activeWatchers.push(watcher);
      } catch (err: any) {
        console.warn(`[DevBoard Watcher] Could not watch ${dir}:`, err.message);
      }
    }
  }

  const apiMiddleware = (req: any, res: any, next: any) => {
    const url = req.url || '';
    const pathname = url.split('?')[0];
    if (!pathname.startsWith('/api/')) {
      return next();
    }

        // GET /api/events (SSE endpoint for real-time live sync DEV-014)
        if (req.method === 'GET' && pathname === '/api/events') {
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
          });
          res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clients: sseClients.size + 1 })}\n\n`);
          sseClients.add(res);

          const pingInterval = setInterval(() => {
            try {
              res.write(': ping\n\n');
            } catch {
              clearInterval(pingInterval);
              sseClients.delete(res);
            }
          }, 25000);
          if (typeof pingInterval.unref === 'function') pingInterval.unref();

          req.on('close', () => {
            clearInterval(pingInterval);
            sseClients.delete(res);
          });
          return;
        }

        const getBody = (): Promise<any> => {
          return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
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

            // GET /api/settings (DEV-006)
            if (req.method === 'GET' && pathname === '/api/settings') {
              const urlObj = new URL(`http://localhost${url}`);
              const projectId = urlObj.searchParams.get('projectId');
              const project = registry.projects.find(p => p.id === (projectId || registry.activeProjectId)) || registry.projects[0];
              const config = readProjectConfig(project);
              return sendJson(200, { ok: true, config, projectId: project?.id });
            }

            // POST /api/settings (DEV-006 & DEV-009)
            if (req.method === 'POST' && pathname === '/api/settings') {
              const body = await getBody();
              const projectId = body.projectId || registry.activeProjectId;
              const project = registry.projects.find(p => p.id === projectId) || registry.projects[0];
              const configToSave = body.config || body;
              const savedPath = writeProjectConfig(configToSave, project);
              
              broadcastSse('settings_changed', {
                projectId: project?.id,
                config: configToSave,
                timestamp: Date.now()
              });

              return sendJson(200, {
                ok: true,
                config: readProjectConfig(project),
                savedPath
              });
            }

            // GET /api/data
            if (req.method === 'GET' && url === '/api/data') {
              const allItems: any[] = [];
              const allReleases: any[] = [];
              const allSprints: any[] = [];
              const resolvedProjects: ProjectMeta[] = [];

              for (const p of registry.projects) {
                const backlog = readProjectBacklog(p);
                const proj = backlog.project || p;
                const docsPath = getProjectDocsPath(proj);
                resolvedProjects.push({
                  ...proj,
                  docsPath: docsPath || undefined,
                  hasDocs: Boolean(docsPath)
                });
                allItems.push(...(backlog.items || []));
                allReleases.push(...(backlog.releases || []));
                allSprints.push(...(backlog.sprints || []));
              }

              const isMultiMode = process.env.DEVBOARD_MODE === 'multi';
              const isSingleMode = process.env.DEVBOARD_MODE === 'single' || (!isMultiMode && resolvedProjects.length <= 1);

              return sendJson(200, {
                projects: resolvedProjects,
                activeProjectId: registry.activeProjectId,
                singleProject: isSingleMode,
                items: allItems,
                releases: allReleases,
                sprints: allSprints,
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
              const cleanPrefix = (project.codePrefix || 'ITEM').replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'ITEM';

              let code = body.code;
              if (!code) {
                let maxNum = 0;
                const regex = new RegExp(`^${cleanPrefix}[-_]+(\\d+)`, 'i');
                for (const t of backlog.items) {
                  const m = (t.code || t.id || '').match(regex);
                  if (m) {
                    const n = parseInt(m[1], 10);
                    if (!isNaN(n) && n > maxNum) maxNum = n;
                  }
                }
                if (isBacklogMdProject(project)) {
                  const tasksDir = getBacklogTasksDir(project);
                  if (fs.existsSync(tasksDir)) {
                    const diskFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
                    for (const f of diskFiles) {
                      const m = f.match(regex);
                      if (m) {
                        const n = parseInt(m[1], 10);
                        if (!isNaN(n) && n > maxNum) maxNum = n;
                      }
                    }
                  }
                }
                const nextNum = maxNum > 0 ? maxNum + 1 : backlog.items.length + 1;
                code = `${cleanPrefix}-${String(nextNum).padStart(3, '0')}`;
              }

              const normalizedSt = normalizeStatus(body.status || 'draft');
              const newItem = {
                id: body.id || `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                code,
                projectId: project.id,
                title: body.title || 'Sin título',
                description: body.description || '',
                type: body.type || 'feature',
                priority: normalizePriority(body.priority),
                status: normalizedSt,
                module: body.module || undefined,
                impactedFile: body.impactedFile || undefined,
                risk: body.risk || undefined,
                sprint: body.sprint || body.targetSprint || undefined,
                release: body.release || body.targetRelease || undefined,
                targetSprint: body.sprint || body.targetSprint || undefined,
                targetRelease: body.release || body.targetRelease || undefined,
                milestone: body.release || body.targetRelease || body.milestone || undefined,
                acceptanceCriteriaList: body.acceptanceCriteriaList || [],
                implementationPlan: body.implementationPlan || '',
                assignees: body.assignees || [],
                labels: body.labels || [],
                sourceDoc: body.sourceDoc || undefined,
                order: body.order ?? backlog.items.length + 1,
                createdAt: now,
                updatedAt: now,
                completedAt: normalizedSt === 'done' ? now : undefined,
                releasedAt: body.releasedAt || undefined
              };

              if (isBacklogMdProject(project)) {
                saveBacklogMdItem(project, newItem);
              } else {
                backlog.items.push(newItem);
                writeProjectBacklog(project, backlog);
              }

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

                  // DEV-017: Optimistic Concurrency Check (ETag / Mtime)
                  if (!body.force && typeof body.expectedMtime === 'number' && typeof existing.mtime === 'number') {
                    if (existing.mtime > body.expectedMtime + 1000) {
                      return sendJson(409, {
                        error: 'conflict',
                        message: `La tarea "${existing.code}" fue modificada en disco por otro proceso o agente.`,
                        currentMtime: existing.mtime,
                        currentItem: existing
                      });
                    }
                  }

                  const newNormalizedStatus = body.status ? normalizeStatus(body.status) : existing.status;
                  const wasDone = existing.status === 'done';
                  const isNowDone = newNormalizedStatus === 'done';

                  const updatedItem = {
                    ...existing,
                    ...body,
                    id: existing.id,
                    code: existing.code,
                    status: newNormalizedStatus,
                    priority: body.priority ? normalizePriority(body.priority) : existing.priority,
                    updatedAt: now,
                    completedAt: isNowDone && !wasDone ? now : (isNowDone ? existing.completedAt : undefined)
                  };

                  if (body.sprint !== undefined) {
                    updatedItem.sprint = body.sprint || undefined;
                    updatedItem.targetSprint = body.sprint || undefined;
                    if (!body.sprint && updatedItem.milestone && updatedItem.milestone.toLowerCase().includes('sprint')) {
                      updatedItem.milestone = undefined;
                    }
                    if (body.sprint) {
                      updatedItem.sprints = Array.from(new Set([...(updatedItem.sprints || []), body.sprint]));
                    } else {
                      updatedItem.sprints = [];
                    }
                  }
                  if (body.sprints !== undefined) {
                    updatedItem.sprints = body.sprints;
                  }
                  if (body.release !== undefined) {
                    updatedItem.release = body.release || undefined;
                    updatedItem.targetRelease = body.release || undefined;
                    updatedItem.milestone = body.release || undefined;
                  }

                  if (isBacklogMdProject(p)) {
                    saveBacklogMdItem(p, updatedItem);
                  } else {
                    backlog.items[index] = updatedItem;
                    writeProjectBacklog(p, backlog);
                  }

                  updatedItem.mtime = Date.now();
                  return sendJson(200, { ok: true, item: updatedItem });
                }
              }

              return sendJson(404, { error: 'Item not found in any registered project' });
            }

            // PATCH /api/items/:id/restore (DEV-049: Restore soft-deleted item)
            if (req.method === 'PATCH' && /^\/api\/items\/[^/]+\/restore$/.test(url)) {
              const id = decodeURIComponent(url.replace('/api/items/', '').replace('/restore', ''));
              for (const p of registry.projects) {
                if (isBacklogMdProject(p)) {
                  const restored = restoreBacklogMdItem(p, id);
                  if (restored) {
                    broadcastSse('change', { type: 'item_restored', id });
                    return sendJson(200, { ok: true, id });
                  }
                } else {
                  const backlog = readProjectBacklog(p);
                  const item = backlog.items.find((i: any) => i.id === id || i.code === id);
                  if (item) {
                    const restoreStatus = (item as any).previousStatus || 'draft';
                    item.status = restoreStatus;
                    delete (item as any).isDeleted;
                    delete (item as any).deletedAt;
                    delete (item as any).previousStatus;
                    writeProjectBacklog(p, backlog);
                    broadcastSse('change', { type: 'item_restored', id });
                    return sendJson(200, { ok: true, id, item });
                  }
                }
              }
              return sendJson(404, { error: 'Item not found' });
            }

            // DELETE /api/items/:id (DEV-049: soft-delete by default, ?purge=true for physical removal)
            if (req.method === 'DELETE' && url.startsWith('/api/items/')) {
              const rawUrl = url;
              const isPurge = rawUrl.includes('?purge=true');
              const id = decodeURIComponent(rawUrl.replace('/api/items/', '').split('?')[0]);

              for (const p of registry.projects) {
                if (isBacklogMdProject(p)) {
                  if (isPurge) {
                    const purged = purgeBacklogMdItem(p, id);
                    if (purged) {
                      broadcastSse('change', { type: 'item_purged', id });
                      return sendJson(200, { ok: true, id, purged: true });
                    }
                  } else {
                    // Check done protection
                    const found = findBacklogMdFile(p, id);
                    if (found && (found.task.status || '').toLowerCase() === 'done') {
                      return sendJson(403, { error: 'Cannot soft-delete a done item. Done items are protected historical records.' });
                    }
                    const deleted = softDeleteBacklogMdItem(p, id);
                    if (deleted) {
                      broadcastSse('change', { type: 'item_soft_deleted', id });
                      return sendJson(200, { ok: true, id, softDeleted: true });
                    }
                  }
                } else {
                  const backlog = readProjectBacklog(p);
                  const idx = backlog.items.findIndex((i: any) => i.id === id || i.code === id);
                  if (idx !== -1) {
                    const item = backlog.items[idx] as any;
                    if (!isPurge) {
                      // Protect done items
                      if (item.status === 'done') {
                        return sendJson(403, { error: 'Cannot soft-delete a done item.' });
                      }
                      item.previousStatus = item.status;
                      item.status = 'dismissed';
                      item.isDeleted = true;
                      item.deletedAt = new Date().toISOString();
                    } else {
                      backlog.items.splice(idx, 1);
                    }
                    writeProjectBacklog(p, backlog);
                    broadcastSse('change', { type: isPurge ? 'item_purged' : 'item_soft_deleted', id });
                    return sendJson(200, { ok: true, id, softDeleted: !isPurge, purged: isPurge });
                  }
                }
              }

              return sendJson(404, { error: 'Item not found' });
            }

            // POST /api/import/legacy-md (DEV-018)
            if (req.method === 'POST' && url === '/api/import/legacy-md') {
              const body = await getBody();
              const projectId = body.projectId || registry.projects[0]?.id;
              const project = registry.projects.find(p => p.id === projectId);
              if (!project) return sendJson(404, { error: 'Proyecto no encontrado' });

              let itemsToImport: ParsedLegacyItem[] = [];
              if (Array.isArray(body.items) && body.items.length > 0) {
                itemsToImport = body.items.filter((it: any) => it.selected !== false);
              } else if (body.content) {
                itemsToImport = parseLegacyMarkdown(body.content, body.defaultMilestone);
              }

              if (itemsToImport.length === 0) {
                return sendJson(400, { error: 'No se encontraron tareas seleccionadas para importar' });
              }

              const currentBacklog = readProjectBacklog(project);
              const prefix = (project.codePrefix || 'ITEM').toUpperCase();

              // Calculate starting code number
              let maxNum = 0;
              for (const item of currentBacklog.items) {
                const code = String(item.code || item.id || '');
                const match = code.match(new RegExp(`^${prefix}-(\\d+)`, 'i'));
                if (match) {
                  const num = parseInt(match[1], 10);
                  if (!isNaN(num) && num > maxNum) maxNum = num;
                }
              }

              const now = new Date().toISOString();
              const createdItems: any[] = [];
              let order = currentBacklog.items.length + 1;

              for (const it of itemsToImport) {
                maxNum++;
                const itemCode = `${prefix}-${String(maxNum).padStart(3, '0')}`;
                const newItem = {
                  id: itemCode,
                  code: itemCode,
                  projectId: project.id,
                  title: it.title || 'Sin título',
                  description: it.description || '',
                  type: it.type || 'feature',
                  priority: normalizePriority(it.priority || 'p2'),
                  module: it.module || undefined,
                  sprint: it.sprint || it.targetSprint || (it.milestone?.toLowerCase().includes('sprint') ? it.milestone : undefined),
                  release: it.release || it.targetRelease || (it.milestone && !it.milestone.toLowerCase().includes('sprint') ? it.milestone : undefined),
                  targetSprint: it.sprint || it.targetSprint || it.milestone || undefined,
                  targetRelease: it.release || it.targetRelease || undefined,
                  milestone: it.milestone || undefined,
                  order: order++,
                  createdAt: now,
                  updatedAt: now,
                  completedAt: it.status === 'done' ? now : undefined
                };

                if (isBacklogMdProject(project)) {
                  saveBacklogMdItem(project, newItem);
                } else {
                  currentBacklog.items.push(newItem);
                }
                createdItems.push(newItem);
              }

              if (!isBacklogMdProject(project)) {
                writeProjectBacklog(project, currentBacklog);
              }

              broadcastSse('backlog_changed', {
                projectId: project.id,
                action: 'imported',
                count: createdItems.length,
                timestamp: Date.now()
              });

              return sendJson(200, {
                ok: true,
                importedCount: createdItems.length,
                items: createdItems
              });
            }

            // POST /api/projects
            if (req.method === 'POST' && url === '/api/projects') {
              const body = await getBody();
              const now = new Date().toISOString();

              const id = (body.id || body.codePrefix || body.name || `proj-${Date.now()}`).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
              
              let storageType = body.storageType;
              let backlogDir = body.backlogDir || 'backlog';

              const normalizedRepoPath = body.repoPath ? path.normalize(body.repoPath.trim()) : undefined;
              if (!storageType && normalizedRepoPath) {
                const detected = detectProjectStorage(normalizedRepoPath);
                storageType = detected.storageType;
                backlogDir = detected.backlogDir;
              }

              const newProject: ProjectMeta = {
                id,
                name: body.name || 'Nuevo Proyecto',
                codePrefix: (body.codePrefix || 'PRJ').toUpperCase().replace(/[^A-Z0-9]/g, '') || 'PRJ',
                repoPath: normalizedRepoPath,
                ...(body.isDemo ? { isDemo: true } : {}),
                storageType: storageType || 'json',
                backlogDir,
                createdAt: now
              };

              registry.projects.push(newProject);
              saveRegistry(registry);

              if (newProject.repoPath) {
                readProjectBacklog(newProject);
              }

              return sendJson(201, { ok: true, project: newProject });
            }

            // POST /api/projects/restore-demo
            if (req.method === 'POST' && url === '/api/projects/restore-demo') {
              const hasDemo = registry.projects.some(p => p.id === 'demo');
              if (!hasDemo) {
                registry.projects.push({
                  id: 'demo',
                  name: 'Proyecto Demo (Tour)',
                  codePrefix: 'DEMO',
                  description: 'Proyecto de demostración de DevBoard. Puedes explorarlo o eliminarlo en cualquier momento.',
                  isDemo: true,
                  storageType: 'json',
                  createdAt: new Date().toISOString()
                });
                saveRegistry(registry);
              }
              return sendJson(200, { ok: true, projects: registry.projects });
            }

            // POST /api/projects/detect-path
            if (req.method === 'POST' && url === '/api/projects/detect-path') {
              const body = await getBody();
              const inputPath = body.repoPath ? path.normalize(body.repoPath.trim()) : '';
              if (!inputPath) {
                return sendJson(400, { error: 'repoPath required' });
              }
              const exists = fs.existsSync(inputPath);
              const isGit = exists && fs.existsSync(path.join(inputPath, '.git'));
              const detection = detectProjectStorage(inputPath);
              return sendJson(200, {
                ok: true,
                exists,
                isGit,
                normalizedPath: inputPath,
                ...detection
              });
            }

            // DELETE /api/projects/:id (Unlink project from DevBoard)
            if (req.method === 'DELETE' && url.startsWith('/api/projects/')) {
              const id = decodeURIComponent(url.replace('/api/projects/', '').split('?')[0]);
              const initialLen = registry.projects.length;
              registry.projects = registry.projects.filter(p => p.id !== id);

              if (registry.projects.length === initialLen) {
                return sendJson(404, { error: 'Project not found in registry' });
              }

              if (registry.activeProjectId === id) {
                registry.activeProjectId = registry.projects[0]?.id || '';
              }

              saveRegistry(registry);
              return sendJson(200, { ok: true, id, remainingProjects: registry.projects });
            }

            // POST /api/projects/active
            if (req.method === 'POST' && url === '/api/projects/active') {
              const body = await getBody();
              const { projectId } = body || {};
              if (projectId && registry.projects.some(p => p.id === projectId)) {
                registry.activeProjectId = projectId;
                saveRegistry(registry);
                return sendJson(200, { ok: true, activeProjectId: projectId });
              }
              return sendJson(400, { error: 'Invalid or missing projectId' });
            }

            // GET /api/fs/browse?dir=...
            if (req.method === 'GET' && url.startsWith('/api/fs/browse')) {
              const urlObj = new URL(`http://localhost${url}`);
              let targetDir = urlObj.searchParams.get('dir') || '';

              if (!targetDir.trim()) {
                targetDir = getSafeInitialBrowseDir();
              }

              try {
                targetDir = path.resolve(path.normalize(targetDir));
                if (!fs.existsSync(targetDir)) {
                  targetDir = getSafeInitialBrowseDir();
                }

                const stat = fs.statSync(targetDir);
                if (!stat.isDirectory()) {
                  targetDir = path.dirname(targetDir);
                }

                const parent = path.dirname(targetDir);
                const parentPath = parent === targetDir ? null : parent;

                let entries: fs.Dirent[] = [];
                let dirWarning: string | undefined = undefined;

                try {
                  entries = fs.readdirSync(targetDir, { withFileTypes: true });
                } catch (readErr: any) {
                  console.warn(`[DevBoard FS] Cannot scan ${targetDir}: ${readErr.message}`);
                  dirWarning = readErr.code === 'EPERM' || readErr.code === 'EACCES'
                    ? `Permiso restringido por el sistema al explorar esta carpeta (${readErr.message}). Puedes escribir o pegar la ruta exacta manualmente.`
                    : `No se pudieron leer subcarpetas: ${readErr.message}`;
                }

                const folders: Array<{ name: string; path: string; isGit: boolean; hasBacklog: boolean }> = [];

                for (const entry of entries) {
                  if (!entry.isDirectory()) continue;
                  // Skip noisy/hidden directories
                  if (entry.name.startsWith('.') && entry.name !== '.backlog') continue;
                  if (['node_modules', 'dist', 'build', '.git', '$RECYCLE.BIN', 'System Volume Information'].includes(entry.name)) continue;

                  const fullPath = path.join(targetDir, entry.name);
                  let isGit = false;
                  let hasBacklog = false;
                  try {
                    isGit = fs.existsSync(path.join(fullPath, '.git'));
                    hasBacklog = fs.existsSync(path.join(fullPath, 'backlog')) || fs.existsSync(path.join(fullPath, '.backlog'));
                  } catch {}

                  folders.push({
                    name: entry.name,
                    path: fullPath,
                    isGit,
                    hasBacklog
                  });
                }

                folders.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

                let isCurrentGit = false;
                let hasCurrentBacklog = false;
                let hasCurrentDevBoard = false;
                try {
                  isCurrentGit = fs.existsSync(path.join(targetDir, '.git'));
                  hasCurrentBacklog = fs.existsSync(path.join(targetDir, 'backlog')) || fs.existsSync(path.join(targetDir, '.backlog'));
                  hasCurrentDevBoard = fs.existsSync(path.join(targetDir, '.devboard'));
                } catch {}

                return sendJson(200, {
                  ok: true,
                  currentPath: targetDir,
                  parentPath,
                  folders,
                  isGit: isCurrentGit,
                  hasBacklog: hasCurrentBacklog,
                  hasDevBoard: hasCurrentDevBoard,
                  warning: dirWarning
                });
              } catch (browseErr: any) {
                const safeDir = getSafeInitialBrowseDir();
                const parent = path.dirname(safeDir);
                return sendJson(200, {
                  ok: true,
                  currentPath: safeDir,
                  parentPath: parent === safeDir ? null : parent,
                  folders: [],
                  warning: `No se pudo acceder a la ruta solicitada (${browseErr.message}). Se cargó una ruta segura.`
                });
              }
            }

            // POST /api/projects/:id/detect-storage
            if (req.method === 'POST' && url.includes('/detect-storage')) {
              const id = url.split('/')[3];
              const p = registry.projects.find(proj => proj.id === id);
              if (!p) return sendJson(404, { error: 'Project not found' });
              const detection = detectProjectStorage(p.repoPath);
              return sendJson(200, { ok: true, ...detection });
            }

            // POST /api/projects/:id/convert-to-md
            if (req.method === 'POST' && url.includes('/convert-to-md')) {
              const id = url.split('/')[3];
              const project = registry.projects.find(proj => proj.id === id);
              if (!project || !project.repoPath) {
                return sendJson(400, { error: 'Project not found or lacks repoPath' });
              }

              // Read current JSON items
              const currentBacklog = readProjectBacklog(project);
              const tasksDir = path.join(project.repoPath, 'backlog/tasks');
              if (!fs.existsSync(tasksDir)) {
                fs.mkdirSync(tasksDir, { recursive: true });
              }

              let converted = 0;
              for (const item of currentBacklog.items) {
                saveBacklogMdItem({ ...project, storageType: 'markdown', backlogDir: 'backlog' }, item);
                converted++;
              }

              project.storageType = 'markdown';
              project.backlogDir = 'backlog';
              saveRegistry(registry);

              return sendJson(200, {
                ok: true,
                message: `Convertidos ${converted} items a Backlog.md en ${tasksDir}`,
                convertedCount: converted,
                tasksDir
              });
            }

            // POST /api/projects/:id/convert-to-json
            if (req.method === 'POST' && url.includes('/convert-to-json')) {
              const id = url.split('/')[3];
              const project = registry.projects.find(proj => proj.id === id);
              if (!project || !project.repoPath) {
                return sendJson(400, { error: 'Project not found or lacks repoPath' });
              }

              const currentBacklog = readProjectBacklog(project);
              const jsonPath = path.join(project.repoPath, '.devboard/backlog.json');
              const devboardDir = path.dirname(jsonPath);
              if (!fs.existsSync(devboardDir)) {
                fs.mkdirSync(devboardDir, { recursive: true });
              }

              fs.writeFileSync(jsonPath, JSON.stringify(currentBacklog, null, 2), 'utf8');

              project.storageType = 'json';
              saveRegistry(registry);

              return sendJson(200, {
                ok: true,
                message: `Unificadas ${currentBacklog.items.length} tareas en ${jsonPath}`,
                savedPath: jsonPath
              });
            }

            // GET /api/projects/:id/export-json
            if (req.method === 'GET' && url.includes('/export-json')) {
              const id = url.split('?')[0].split('/')[3];
              const project = registry.projects.find(proj => proj.id === id);
              if (!project) return sendJson(404, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              return sendJson(200, {
                ok: true,
                project,
                data: backlog
              });
            }

            // GET /api/projects/:id/export-monolithic-md
            if (req.method === 'GET' && url.includes('/export-monolithic-md')) {
              const id = url.split('?')[0].split('/')[3];
              const project = registry.projects.find(proj => proj.id === id);
              if (!project) return sendJson(404, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              const tasks: BacklogMdTask[] = backlog.items.map((it: any) => ({
                id: it.code || it.id,
                title: it.title,
                status: normalizeStatus(it.status),
                type: it.type,
                priority: it.priority,
                milestone: it.targetSprint || it.milestone,
                description: it.description,
                acceptanceCriteria: it.acceptanceCriteriaList || []
              }));

              const markdownContent = generateMonolithicBacklogMd(project.name, tasks);

              const shouldSave = url.includes('save=true');
              let savedPath = null;
              if (shouldSave && project.repoPath) {
                savedPath = path.join(project.repoPath, 'BACKLOG.md');
                fs.writeFileSync(savedPath, markdownContent, 'utf8');
              }

              return sendJson(200, {
                ok: true,
                content: markdownContent,
                savedPath
              });
            }

            // POST /api/releases
            if (req.method === 'POST' && url === '/api/releases') {
              const body = await getBody();
              const now = new Date().toISOString();

              const project = registry.projects.find(p => p.id === body.projectId) || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              const requestedStatus = body.status === 'released' ? 'released' : 'unreleased';
              const isReleased = requestedStatus === 'released';
              const isUnreleased = requestedStatus === 'unreleased';
              const release = {
                id: body.id || `rel-${(body.version || '1.0.0').replace(/\./g, '-')}-${Date.now()}`,
                projectId: project.id,
                version: body.version || '1.0.0',
                date: body.date || now.split('T')[0],
                title: body.title || (isUnreleased ? `En Preparación: v${body.version}` : `Release v${body.version}`),
                summary: body.summary || '',
                itemCodes: body.itemCodes || [],
                markdownContent: body.markdownContent || '',
                createdAt: body.createdAt || now,
                status: requestedStatus,
                targetDate: body.targetDate || undefined,
                scopeNotes: body.scopeNotes || undefined
              };

              const itemCodeSet = new Set(release.itemCodes);
              if (isReleased) {
                // When officially publishing/releasing to production: mark releasedAt and complete ready/finish tasks
                backlog.items = backlog.items.map((it: any) => {
                  if (itemCodeSet.has(it.code) || itemCodeSet.has(it.id)) {
                    const updated = {
                      ...it,
                      targetRelease: release.version,
                      releasedAt: now,
                      status: it.status === 'ready' || it.status === 'finish' ? 'done' : it.status,
                      completedAt: it.completedAt || now,
                      updatedAt: now
                    };
                    if (isBacklogMdProject(project)) {
                      saveBacklogMdItem(project, updated);
                    }
                    return updated;
                  }
                  return it;
                });
              } else {
                // When unreleased (dev) or planning: associate targetRelease without marking releasedAt or closing tasks
                backlog.items = backlog.items.map((it: any) => {
                  if (itemCodeSet.has(it.code) || itemCodeSet.has(it.id)) {
                    if (it.targetRelease !== release.version || (isUnreleased && it.milestone !== release.version)) {
                      const updated = {
                        ...it,
                        targetRelease: release.version,
                        milestone: it.milestone || release.version,
                        updatedAt: now
                      };
                      if (isBacklogMdProject(project)) {
                        saveBacklogMdItem(project, updated);
                      }
                      return updated;
                    }
                  }
                  return it;
                });
              }

              const existingIdx = backlog.releases.findIndex((r: any) => r.id === release.id || r.version === release.version);
              if (existingIdx >= 0) {
                backlog.releases[existingIdx] = { ...backlog.releases[existingIdx], ...release };
              } else {
                backlog.releases.unshift(release);
              }

              writeProjectBacklog(project, backlog);
              return sendJson(201, { ok: true, release });
            }

            // DELETE /api/releases/:id
            if (req.method === 'DELETE' && url.startsWith('/api/releases/')) {
              const releaseId = decodeURIComponent(url.replace('/api/releases/', '').split('?')[0]);
              const project = registry.projects.find(p => p.id === registry.activeProjectId) || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });
              const backlog = readProjectBacklog(project);
              const initialCount = backlog.releases.length;
              backlog.releases = (backlog.releases || []).filter((r: any) => r.id !== releaseId && r.version !== releaseId);
              writeProjectBacklog(project, backlog);
              return sendJson(200, { ok: true, deleted: initialCount > backlog.releases.length });
            }

            // POST /api/releases/sync-legacy
            if (req.method === 'POST' && url === '/api/releases/sync-legacy') {
              const body = await getBody();
              const project = registry.projects.find(p => p.id === body.projectId) 
                || registry.projects.find(p => p.id === registry.activeProjectId)
                || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              if (project.repoPath) {
                const parsed = parseReleaseNotesMd(project.repoPath, project.codePrefix, backlog.items);
                if (parsed.length > 0) {
                  backlog.releases = parsed;
                  const releasesPath = path.join(project.repoPath, project.backlogDir || 'backlog', 'releases.json');
                  try {
                    if (!fs.existsSync(path.dirname(releasesPath))) fs.mkdirSync(path.dirname(releasesPath), { recursive: true });
                    fs.writeFileSync(releasesPath, JSON.stringify(backlog.releases, null, 2), 'utf8');
                  } catch (err: any) {
                    console.warn(`[DevBoard API] Error saving synced releases:`, err.message);
                  }
                  broadcastSse('backlog_changed', { projectId: project.id, action: 'releases_synced', timestamp: Date.now() });
                }
              }

              return sendJson(200, {
                ok: true,
                releases: backlog.releases,
                count: backlog.releases.length
              });
            }

            // GET /api/sprints
            if (req.method === 'GET' && url.startsWith('/api/sprints')) {
              const urlObj = new URL(url, 'http://localhost');
              const projectId = urlObj.searchParams.get('projectId') || registry.activeProjectId || registry.projects[0]?.id;
              const project = registry.projects.find(p => p.id === projectId) || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });
              const backlog = readProjectBacklog(project);
              return sendJson(200, { ok: true, sprints: backlog.sprints || [] });
            }

            // POST /api/sprints
            if (req.method === 'POST' && url === '/api/sprints') {
              const body = await getBody();
              const now = new Date().toISOString();
              const project = registry.projects.find(p => p.id === body.projectId) 
                || registry.projects.find(p => p.id === registry.activeProjectId)
                || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              backlog.sprints = backlog.sprints || [];

              const requestedStatus = body.status === 'active' ? 'active' : (body.status === 'completed' ? 'completed' : 'planned');

              // Si se crea como activo, desmarcar cualquier otro sprint activo
              if (requestedStatus === 'active') {
                backlog.sprints = backlog.sprints.map((s: any) => s.status === 'active' ? { ...s, status: 'planned' } : s);
              }

              const newSprint = {
                id: body.id || `sprint-${Date.now()}`,
                projectId: project.id,
                name: (body.name || `Sprint ${backlog.sprints.length + 1}`).trim(),
                goal: body.goal || '',
                startDate: body.startDate || undefined,
                endDate: body.endDate || undefined,
                durationWeeks: body.durationWeeks || undefined,
                status: requestedStatus,
                createdAt: now
              };

              backlog.sprints.push(newSprint);
              writeProjectBacklog(project, backlog);
              broadcastSse('backlog_changed', { projectId: project.id, action: 'sprint_created', sprintId: newSprint.id, timestamp: Date.now() });

              return sendJson(201, { ok: true, sprint: newSprint });
            }

            // PUT /api/sprints/:id
            if (req.method === 'PUT' && url.startsWith('/api/sprints/')) {
              const sprintId = decodeURIComponent(url.replace('/api/sprints/', '').split('?')[0]);
              const body = await getBody();
              const now = new Date().toISOString();
              const project = registry.projects.find(p => p.id === body.projectId) 
                || registry.projects.find(p => p.id === registry.activeProjectId)
                || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              backlog.sprints = backlog.sprints || [];

              const sIdx = backlog.sprints.findIndex((s: any) => s.id === sprintId || s.name === sprintId);
              if (sIdx === -1) return sendJson(404, { error: 'Sprint no encontrado' });

              const existingSprint = backlog.sprints[sIdx];
              const oldName = existingSprint.name;
              const newName = body.name ? body.name.trim() : oldName;
              const newStatus = body.status || existingSprint.status;

              // Si pasa a activo, asegurar que solo 1 sprint esté activo a la vez
              if (newStatus === 'active') {
                backlog.sprints = backlog.sprints.map((s: any) => s.id !== existingSprint.id && s.status === 'active' ? { ...s, status: 'planned' } : s);
              }

              const updatedSprint = {
                ...existingSprint,
                name: newName,
                goal: body.goal !== undefined ? body.goal : existingSprint.goal,
                startDate: body.startDate !== undefined ? body.startDate : existingSprint.startDate,
                endDate: body.endDate !== undefined ? body.endDate : existingSprint.endDate,
                durationWeeks: body.durationWeeks !== undefined ? body.durationWeeks : existingSprint.durationWeeks,
                status: newStatus,
                completedAt: newStatus === 'completed' ? (existingSprint.completedAt || now) : undefined
              };

              backlog.sprints[sIdx] = updatedSprint;

              // Si se cambió el nombre del sprint, actualizar referencias en las tareas
              if (oldName && newName && oldName !== newName) {
                backlog.items.forEach((it: any) => {
                  if (it.sprint === oldName || it.targetSprint === oldName) {
                    it.sprint = newName;
                    it.targetSprint = newName;
                    if (isBacklogMdProject(project)) {
                      saveBacklogMdItem(project, it);
                    }
                  }
                });
              }

              // DEV-070: Guardar retro en backlog/retros/ si se incluyó en la llamada
              if (body.retro) {
                try {
                  const retrosDir = path.join(project.repoPath || '', project.backlogDir || 'backlog', 'retros');
                  if (!fs.existsSync(retrosDir)) {
                    fs.mkdirSync(retrosDir, { recursive: true });
                  }
                  const todayStr = new Date().toISOString().split('T')[0];
                  const sprintKey = String(updatedSprint.id || newName).toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                  const retroFile = path.join(retrosDir, `${sprintKey}-retro.md`);
                  const r = body.retro;
                  const md = `# Retrospectiva — ${newName}

**Fecha:** ${todayStr}  
**Sprint:** ${newName}  
**Proyecto:** ${project.name}

---

## 🟢 Fortalezas (¿Qué funcionó bien y debe repetirse?)
${r.whatWentWell ? r.whatWentWell.trim() : 'No se registraron comentarios específicos.'}

## 🔴 Problemas (¿Qué falló, se rompió o tomó más tiempo del esperado?)
${r.whatWentWrong ? r.whatWentWrong.trim() : 'No se registraron incidentes críticos.'}

## 🟡 Eficiencia (¿Qué podría haberse hecho en menos pasos o con menos tokens?)
${r.whatToImprove ? r.whatToImprove.trim() : 'Flujo eficiente y directo.'}

## 📌 Acciones Concretas (Compromisos y Mejoras)
${Array.isArray(r.actions) && r.actions.length > 0 
  ? r.actions.map((act: string) => `- [ ] ${act}`).join('\n') 
  : '- [ ] Continuar aplicando las buenas prácticas establecidas.'}
`;
                  fs.writeFileSync(retroFile, md, 'utf8');
                } catch (e: any) {
                  console.warn('[Retro Save Error]', e.message);
                }
              }

              writeProjectBacklog(project, backlog);
              broadcastSse('backlog_changed', { projectId: project.id, action: 'sprint_updated', sprintId: updatedSprint.id, timestamp: Date.now() });

              return sendJson(200, { ok: true, sprint: updatedSprint });
            }

            // GET /api/retros (DEV-070)
            if (req.method === 'GET' && url.startsWith('/api/retros')) {
              const urlObj = new URL(url, 'http://localhost');
              const projectId = urlObj.searchParams.get('projectId');
              const project = registry.projects.find(p => p.id === projectId) 
                || registry.projects.find(p => p.id === registry.activeProjectId)
                || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });
              const retrosDir = path.join(project.repoPath || '', project.backlogDir || 'backlog', 'retros');
              if (!fs.existsSync(retrosDir)) return sendJson(200, { retros: [] });
              const files = fs.readdirSync(retrosDir).filter(f => f.endsWith('.md'));
              const retros = files.map(f => {
                const full = path.join(retrosDir, f);
                const raw = fs.readFileSync(full, 'utf8');
                const titleMatch = raw.match(/^#\s+(.+)$/m);
                const dateMatch = raw.match(/\*\*Fecha:\*\*\s*([^\n]+)/);
                return {
                  file: f,
                  sprintId: f.replace(/-retro\.md$/, ''),
                  title: titleMatch ? titleMatch[1].trim() : f,
                  date: dateMatch ? dateMatch[1].trim() : '',
                  content: raw
                };
              });
              return sendJson(200, { retros });
            }

            // DELETE /api/sprints/:id
            if (req.method === 'DELETE' && url.startsWith('/api/sprints/')) {
              const urlObj = new URL(url, 'http://localhost');
              const sprintId = decodeURIComponent(url.replace('/api/sprints/', '').split('?')[0]);
              const projectId = urlObj.searchParams.get('projectId') || registry.activeProjectId || registry.projects[0]?.id;
              const project = registry.projects.find(p => p.id === projectId) || registry.projects[0];
              if (!project) return sendJson(400, { error: 'Project not found' });

              const backlog = readProjectBacklog(project);
              backlog.sprints = backlog.sprints || [];

              const sIdx = backlog.sprints.findIndex((s: any) => s.id === sprintId || s.name === sprintId);
              if (sIdx === -1) return sendJson(404, { error: 'Sprint no encontrado' });

              const deletedSprint = backlog.sprints[sIdx];
              backlog.sprints.splice(sIdx, 1);

              // Reasignar tareas que pertenecían a este sprint hacia el Backlog
              backlog.items.forEach((it: any) => {
                if (it.sprint === deletedSprint.name || it.targetSprint === deletedSprint.name || it.sprint === deletedSprint.id) {
                  it.sprint = undefined;
                  it.targetSprint = undefined;
                  if (it.milestone && it.milestone.toLowerCase().includes('sprint')) {
                    it.milestone = undefined;
                  }
                  if (isBacklogMdProject(project)) {
                    saveBacklogMdItem(project, it);
                  }
                }
              });

              writeProjectBacklog(project, backlog);
              broadcastSse('backlog_changed', { projectId: project.id, action: 'sprint_deleted', sprintId, timestamp: Date.now() });

              return sendJson(200, { ok: true, deleted: true });
            }

            // POST /api/import (DEV-012)
            if (req.method === 'POST' && url === '/api/import') {
              try {
                const body = await getBody().catch(() => ({}));
                const projectId = body.projectId || registry.activeProjectId || registry.projects[0]?.id;
                const targetProject = registry.projects.find(p => p.id === projectId) || registry.projects[0];
                if (!targetProject) {
                  return sendJson(404, { ok: false, error: 'Proyecto no encontrado' });
                }

                const docsDir = body.docsPath || getProjectDocsPath(targetProject);
                if (!docsDir || !fs.existsSync(docsDir)) {
                  return sendJson(400, {
                    ok: false,
                    error: `El proyecto "${targetProject.name}" no tiene una carpeta de documentación vinculada (/docs) válida o existente.`
                  });
                }

                if (isBacklogMdProject(targetProject)) {
                  // Importación directa a tareas Markdown individuales
                  const boardData: any = runMigration(docsDir, null, targetProject as any);
                  let updatedCount = 0;
                  for (const item of (boardData.items || [])) {
                    item.projectId = targetProject.id;
                    saveBacklogMdItem(targetProject, item);
                    updatedCount++;
                  }

                  if (boardData.releases && boardData.releases.length > 0 && targetProject.repoPath) {
                    const releasesPath = path.join(targetProject.repoPath, targetProject.backlogDir || 'backlog', 'releases.json');
                    try {
                      if (!fs.existsSync(path.dirname(releasesPath))) fs.mkdirSync(path.dirname(releasesPath), { recursive: true });
                      fs.writeFileSync(releasesPath, JSON.stringify(boardData.releases, null, 2), 'utf8');
                    } catch (relErr: any) {
                      console.warn('[DevBoard] Error saving releases during import:', relErr.message);
                    }
                  }

                  return sendJson(200, {
                    ok: true,
                    projectId: targetProject.id,
                    projectName: targetProject.name,
                    importedCount: updatedCount,
                    releasesCount: boardData.releases?.length || 0,
                    storageType: 'markdown'
                  });
                } else {
                  // Almacenamiento JSON
                  const targetFile = getProjectBacklogPath(targetProject);
                  const boardData: any = runMigration(docsDir, targetFile, targetProject as any);
                  return sendJson(200, {
                    ok: true,
                    projectId: targetProject.id,
                    projectName: targetProject.name,
                    importedCount: boardData.items?.length || 0,
                    releasesCount: boardData.releases?.length || 0,
                    storageType: 'json'
                  });
                }
              } catch (importErr: any) {
                console.error('[DevBoard API] Error in /api/import:', importErr);
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
  };

  return {
    name: 'vite-plugin-dev-board-api',
    configureServer(server: any) {
      setupProjectWatchers();
      server.middlewares.use(apiMiddleware);
    },
    configurePreviewServer(server: any) {
      setupProjectWatchers();
      server.middlewares.use(apiMiddleware);
    }
  };
}

export default defineConfig({
  plugins: [react(), devBoardApi()],
  server: {
    port: 4100,
    strictPort: true,
    host: true,
    watch: {
      ignored: ['**/backlog/**', '**/.devboard/**', '**/data/**']
    }
  }
});
