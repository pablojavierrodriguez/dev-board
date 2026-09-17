#!/usr/bin/env node
/**
 * DevBoard MCP Server (Model Context Protocol)
 * stdio-based JSON-RPC 2.0 server for AI Agents (Cursor, Claude Code, Antigravity, etc.)
 * Provides tools to read and mutate the DevBoard backlog without friction.
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';
import {
  parseBacklogMd,
  serializeBacklogMd,
  normalizeStatus,
  normalizePriority,
  generateTaskFilename,
  generateMonolithicBacklogMd,
  type BacklogMdTask
} from './backlogMdParser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'data/projects-registry.json');
const DEMO_FILE = path.join(ROOT_DIR, 'data/demo-backlog.json');

interface ProjectMeta {
  id: string;
  name: string;
  codePrefix: string;
  repoPath?: string;
  description?: string;
  isDemo?: boolean;
  storageType?: 'json' | 'markdown';
  backlogDir?: string;
  createdAt: string;
  error?: string;
}

function getRegistry(): { activeProjectId: string; projects: ProjectMeta[] } {
  let reg: { activeProjectId: string; projects: ProjectMeta[] } = { activeProjectId: '', projects: [] };
  if (fs.existsSync(REGISTRY_FILE)) {
    try {
      reg = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
    } catch {}
  }

  // CLI arg support: --repo <dir> or -p <dir>
  const args = process.argv.slice(2);
  let cliRepo: string | null = null;
  const repoIdx = args.findIndex(a => a === '--repo' || a === '-p');
  if (repoIdx !== -1 && args[repoIdx + 1]) {
    cliRepo = path.resolve(args[repoIdx + 1]);
  }

  const targetRepo = cliRepo || process.cwd();
  const hasMdBacklog = fs.existsSync(path.join(targetRepo, 'backlog/tasks'));
  const hasJsonBacklog = fs.existsSync(path.join(targetRepo, '.devboard/backlog.json'));

  if (hasMdBacklog || hasJsonBacklog || cliRepo) {
    const existing = reg.projects.find(p => p.repoPath && path.resolve(p.repoPath) === targetRepo);
    if (existing) {
      reg.activeProjectId = existing.id;
    } else {
      const folderName = path.basename(targetRepo);
      const synthId = folderName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const synthProject: ProjectMeta = {
        id: synthId,
        name: folderName,
        codePrefix: folderName.substring(0, 4).toUpperCase(),
        repoPath: targetRepo,
        storageType: hasMdBacklog ? 'markdown' : 'json',
        backlogDir: 'backlog',
        createdAt: new Date().toISOString()
      };
      reg.projects.unshift(synthProject);
      reg.activeProjectId = synthId;
    }
  }

  return reg;
}

function getTasksDir(project: ProjectMeta): string {
  const dir = project.backlogDir || 'backlog';
  return path.join(project.repoPath || ROOT_DIR, dir, 'tasks');
}

function readTasksForProject(project: ProjectMeta): any[] {
  if (project.storageType === 'markdown' && project.repoPath) {
    const tasksDir = getTasksDir(project);
    if (!fs.existsSync(tasksDir)) return [];
    const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
    files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    const items: any[] = [];
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(tasksDir, file), 'utf8');
        const fallbackId = file.split(' - ')[0] || file.replace(/\.md$/, '');
        const task = parseBacklogMd(raw, fallbackId);
        items.push({
          id: task.id,
          code: task.id,
          projectId: project.id,
          title: task.title,
          status: task.status,
          type: task.type || 'feature',
          priority: task.priority,
          assignees: task.assignees || [],
          labels: task.labels || [],
          description: task.description,
          implementationPlan: task.implementationPlan,
          notes: task.implementationNotes,
          acceptanceCriteriaList: task.acceptanceCriteria,
          targetSprint: task.milestone,
          milestone: task.milestone,
          createdAt: task.createdDate ? `${task.createdDate}T00:00:00.000Z` : undefined,
          updatedAt: task.updatedDate ? `${task.updatedDate}T00:00:00.000Z` : undefined
        });
      } catch (err) {
        // Skip unparseable files
      }
    }
    return items;
  }

  // JSON storage fallback
  const filePath = project.isDemo 
    ? DEMO_FILE 
    : (project.repoPath ? path.join(project.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${project.id}-backlog.json`));
  
  if (fs.existsSync(filePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return data.items || [];
    } catch {}
  }
  return [];
}

// Tool definitions for MCP tools/list
const TOOLS = [
  {
    name: 'devboard_list_projects',
    description: 'Lista los proyectos registrados en DevBoard, su ruta y motor de almacenamiento (Backlog.md vs JSON).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'devboard_list_tasks',
    description: 'Lista tareas del backlog con filtros opcionales (openOnly, search, limit, format compacto para mínimo consumo de tokens).',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto (ej: "dev-board", "dom"). Si se omite lista el activo.' },
        status: { 
          type: 'string', 
          description: 'Filtrar por estado: "draft", "doing", "review", "ready", "done", "dismissed", "cancelled".' 
        },
        openOnly: {
          type: 'boolean',
          description: 'Si es true, excluye tareas en done, dismissed o cancelled, devolviendo solo tareas activas o en backlog.'
        },
        priority: { type: 'string', description: 'Filtrar por prioridad: "urgent", "high", "medium", "low".' },
        milestone: { type: 'string', description: 'Filtrar por milestone o sprint (ej: "v1.1.0").' },
        search: { type: 'string', description: 'Término de búsqueda para filtrar en título, código o etiquetas.' },
        prefix: { type: 'string', description: 'Filtrar por prefijo de código (ej: "FEAT-", "BUG-", "CORE-").' },
        taskIds: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'Lista explícita de IDs de tareas a consultar (ej: ["BUG-001", "BUG-002"]).' 
        },
        limit: { type: 'number', description: 'Límite máximo de tareas a retornar (ideal para no saturar ventana de tokens).' },
        offset: { type: 'number', description: 'Desplazamiento para paginación (por defecto 0).' },
        format: { 
          type: 'string', 
          enum: ['detailed', 'compact'], 
          description: 'Formato de salida. "compact" devuelve una lista resumida de 1 línea por tarea ideal para agentes (ahorra ~90% de tokens).' 
        }
      }
    }
  },
  {
    name: 'devboard_get_stats',
    description: 'Obtiene métricas agregadas del backlog: total de tareas, abiertas, cerradas, porcentaje completado, distribución por estado/prioridad y desglose agrupado por prefijos de código (ej: FEAT, BUG, CORE).',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto (ej: "dev-board", "mi-proyecto"). Si se omite analiza el activo.' }
      }
    }
  },
  {
    name: 'devboard_bulk_update_tasks',
    description: 'Actualiza en lote múltiples tareas simultáneamente (por lista de taskIds o por prefijo/filtro). Ideal para auditorías y limpiezas masivas sin hacer decenas de tool calls.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto.' },
        taskIds: { 
          type: 'array', 
          items: { type: 'string' }, 
          description: 'Lista explícita de IDs de tareas a actualizar (ej: ["TASK-01", "TASK-02"]).' 
        },
        filterPrefix: { 
          type: 'string', 
          description: 'Prefijo de código para aplicar actualización masiva (ej: "FEAT-", "EPIC-").' 
        },
        filterStatus: {
          type: 'string',
          description: 'Filtrar por estado actual antes de aplicar actualización (ej: "draft").'
        },
        updates: {
          type: 'object',
          description: 'Campos a actualizar en todas las tareas coincidentes.',
          properties: {
            status: { type: 'string', enum: ['draft', 'doing', 'review', 'ready', 'done', 'dismissed', 'cancelled'] },
            priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'] },
            milestone: { type: 'string' },
            implementationNotes: { type: 'string' },
            labels: { type: 'array', items: { type: 'string' } }
          }
        }
      },
      required: ['updates']
    }
  },
  {
    name: 'devboard_get_task',
    description: 'Obtiene el detalle completo de una tarea incluyendo Criterios de Aceptación (AC), Plan de Implementación y Notas.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Código o ID de la tarea (ej: "DEV-001", "AUTH-012").' },
        projectId: { type: 'string', description: 'ID del proyecto (opcional si el código es único).' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'devboard_create_task',
    description: 'Crea una nueva tarea en DevBoard (genera archivo .md individual si es Backlog.md o añade al JSON).',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto (ej: "dev-board").' },
        title: { type: 'string', description: 'Título descriptivo de la tarea.' },
        description: { type: 'string', description: 'Descripción técnica o requerimiento detallado.' },
        type: { type: 'string', enum: ['feature', 'bug', 'tech_debt', 'ux'], description: 'Tipo de ítem.' },
        priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'], description: 'Prioridad.' },
        status: { type: 'string', enum: ['draft', 'doing', 'review', 'ready', 'done'], description: 'Estado inicial.' },
        acceptanceCriteria: {
          type: 'array',
          items: { type: 'string' },
          description: 'Lista de criterios de aceptación en texto plano.'
        },
        implementationPlan: { type: 'string', description: 'Plan técnico paso a paso para la implementación.' },
        milestone: { type: 'string', description: 'Sprint o milestone asignado.' }
      },
      required: ['title']
    }
  },
  {
    name: 'devboard_update_task',
    description: 'Actualiza el estado (draft, doing, review, ready, done), Criterios de Aceptación o Plan de Implementación de una tarea.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Código o ID de la tarea a actualizar.' },
        projectId: { type: 'string', description: 'ID del proyecto.' },
        status: { type: 'string', enum: ['draft', 'doing', 'review', 'ready', 'done', 'dismissed', 'cancelled'] },
        title: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'string', enum: ['urgent', 'high', 'medium', 'low'] },
        implementationPlan: { type: 'string', description: 'Actualización del plan técnico.' },
        toggleAcIndex: { type: 'number', description: 'Índice de AC (1-indexed) a alternar como completado/pendiente.' },
        milestone: { type: 'string' }
      },
      required: ['taskId']
    }
  },
  {
    name: 'devboard_export_backlog',
    description: 'Genera o actualiza el archivo BACKLOG.md consolidado en la raíz del repositorio del proyecto.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto a consolidar.' }
      }
    }
  },
  {
    name: 'devboard_list_releases',
    description: 'Lista las versiones, releases y notas de cambio estructuradas del proyecto, permitiendo contrastar tareas asociadas.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto. Si se omite, usa el proyecto activo.' },
        version: { type: 'string', description: 'Versión específica a consultar (ej: "v1.2.0" o "1.2.0"). Si se omite, devuelve todas.' }
      }
    }
  }
];

// Tool execution handler
async function handleToolCall(name: string, args: any): Promise<any> {
  const registry = getRegistry();

  if (name === 'devboard_list_projects') {
    return {
      activeProjectId: registry.activeProjectId,
      projects: registry.projects.map(p => ({
        id: p.id,
        name: p.name,
        codePrefix: p.codePrefix,
        repoPath: p.repoPath,
        storageType: p.storageType || 'json'
      }))
    };
  }

  if (name === 'devboard_list_tasks') {
    const targetProject = registry.projects.find(p => p.id === args.projectId) 
      || registry.projects.find(p => p.id === registry.activeProjectId) 
      || registry.projects[0];

    if (!targetProject) throw new Error('No hay proyectos registrados en DevBoard.');

    let tasks = readTasksForProject(targetProject);

    if (args.openOnly) {
      const closedStatuses = ['done', 'dismissed', 'cancelled', 'released'];
      tasks = tasks.filter(t => !closedStatuses.includes(normalizeStatus(t.status)));
    }

    if (args.status) {
      const norm = normalizeStatus(args.status);
      tasks = tasks.filter(t => normalizeStatus(t.status) === norm);
    }
    if (args.priority) {
      const normP = normalizePriority(args.priority);
      tasks = tasks.filter(t => normalizePriority(t.priority) === normP);
    }
    if (args.milestone) {
      tasks = tasks.filter(t => t.milestone === args.milestone || t.targetSprint === args.milestone);
    }
    if (args.prefix) {
      const pfx = String(args.prefix).toLowerCase();
      tasks = tasks.filter(t => 
        (t.id && t.id.toLowerCase().startsWith(pfx)) || 
        (t.code && t.code.toLowerCase().startsWith(pfx))
      );
    }
    if (Array.isArray(args.taskIds) && args.taskIds.length > 0) {
      const idsLower = new Set(args.taskIds.map((id: string) => String(id).toLowerCase()));
      tasks = tasks.filter(t => 
        (t.id && idsLower.has(t.id.toLowerCase())) || 
        (t.code && idsLower.has(t.code.toLowerCase()))
      );
    }
    if (args.search) {
      const q = String(args.search).toLowerCase();
      tasks = tasks.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) || 
        (t.id && t.id.toLowerCase().includes(q)) ||
        (t.labels && Array.isArray(t.labels) && t.labels.some((l: string) => l.toLowerCase().includes(q)))
      );
    }

    const totalFiltered = tasks.length;
    const offset = typeof args.offset === 'number' ? Math.max(0, args.offset) : 0;
    if (args.limit && typeof args.limit === 'number' && args.limit > 0) {
      tasks = tasks.slice(offset, offset + args.limit);
    } else if (offset > 0) {
      tasks = tasks.slice(offset);
    }

    if (args.format === 'compact') {
      return {
        projectId: targetProject.id,
        projectName: targetProject.name,
        storageType: targetProject.storageType,
        total: totalFiltered,
        showing: tasks.length,
        offset,
        items: tasks.map(t => {
          const acInfo = t.acceptanceCriteriaList 
            ? `${t.acceptanceCriteriaList.filter((ac: any) => ac.checked).length}/${t.acceptanceCriteriaList.length} AC` 
            : '0/0 AC';
          const m = t.milestone || t.targetSprint ? ` [${t.milestone || t.targetSprint}]` : '';
          return `[${t.code || t.id}] (${t.status}/${t.priority}) ${t.title}${m} (${acInfo})`;
        })
      };
    }

    return {
      projectId: targetProject.id,
      projectName: targetProject.name,
      storageType: targetProject.storageType,
      total: totalFiltered,
      showing: tasks.length,
      offset,
      tasks: tasks.map(t => ({
        id: t.code || t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        type: t.type,
        milestone: t.milestone || t.targetSprint,
        acProgress: t.acceptanceCriteriaList 
          ? `${t.acceptanceCriteriaList.filter((ac: any) => ac.checked).length}/${t.acceptanceCriteriaList.length} AC` 
          : '0/0 AC'
      }))
    };
  }

  if (name === 'devboard_get_stats') {
    const targetProject = registry.projects.find(p => p.id === args.projectId) 
      || registry.projects.find(p => p.id === registry.activeProjectId) 
      || registry.projects[0];

    if (!targetProject) throw new Error('No hay proyectos registrados en DevBoard.');

    const tasks = readTasksForProject(targetProject);
    const total = tasks.length;
    const closedStatuses = ['done', 'dismissed', 'cancelled', 'released'];
    let openCount = 0;
    let doneCount = 0;
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byPrefix: Record<string, { total: number; open: number; done: number }> = {};

    for (const t of tasks) {
      const s = normalizeStatus(t.status);
      const p = normalizePriority(t.priority);
      const isClosed = closedStatuses.includes(s);
      if (isClosed) doneCount++; else openCount++;

      byStatus[s] = (byStatus[s] || 0) + 1;
      byPriority[p] = (byPriority[p] || 0) + 1;

      const code = String(t.code || t.id || '');
      const parts = code.split('-');
      const prefix = parts.length > 2 ? `${parts[0]}-${parts[1]}` : (parts[0] || 'OTHER');

      if (!byPrefix[prefix]) {
        byPrefix[prefix] = { total: 0, open: 0, done: 0 };
      }
      byPrefix[prefix].total++;
      if (isClosed) byPrefix[prefix].done++; else byPrefix[prefix].open++;
    }

    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    return {
      projectId: targetProject.id,
      projectName: targetProject.name,
      storageType: targetProject.storageType,
      summary: {
        total,
        open: openCount,
        done: doneCount,
        completionRate: `${completionRate}%`
      },
      byStatus,
      byPriority,
      byPrefix
    };
  }

  if (name === 'devboard_bulk_update_tasks') {
    const targetProject = registry.projects.find(p => p.id === args.projectId) 
      || registry.projects.find(p => p.id === registry.activeProjectId) 
      || registry.projects[0];

    if (!targetProject) throw new Error('No hay proyectos registrados en DevBoard.');

    const updates = args.updates || {};
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const cleanIds = Array.isArray(args.taskIds) ? new Set(args.taskIds.map((id: string) => String(id).toLowerCase())) : null;
    const pfxFilter = args.filterPrefix ? String(args.filterPrefix).toLowerCase() : null;
    const statusFilter = args.filterStatus ? normalizeStatus(args.filterStatus) : null;

    let updatedCount = 0;
    const updatedIds: string[] = [];

    // Markdown storage
    if (targetProject.storageType === 'markdown' && targetProject.repoPath) {
      const tasksDir = getTasksDir(targetProject);
      if (!fs.existsSync(tasksDir)) throw new Error('Carpeta de tareas no encontrada.');
      const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));

      for (const file of files) {
        try {
          const fullPath = path.join(tasksDir, file);
          const raw = fs.readFileSync(fullPath, 'utf8');
          const fallbackId = file.split(' - ')[0] || file.replace(/\.md$/, '');
          const current = parseBacklogMd(raw, fallbackId);
          const taskId = String(current.id || fallbackId).toLowerCase();

          // Match criteria
          let match = false;
          if (cleanIds) {
            match = cleanIds.has(taskId);
          } else if (pfxFilter) {
            match = taskId.startsWith(pfxFilter);
          } else {
            match = true;
          }

          if (statusFilter && normalizeStatus(current.status) !== statusFilter) {
            match = false;
          }

          if (match) {
            if (updates.status) current.status = normalizeStatus(updates.status);
            if (updates.priority) current.priority = normalizePriority(updates.priority);
            if (updates.milestone !== undefined) current.milestone = updates.milestone;
            if (updates.implementationNotes !== undefined) current.implementationNotes = updates.implementationNotes;
            if (Array.isArray(updates.labels)) current.labels = updates.labels;
            current.updatedDate = today;

            const serialized = serializeBacklogMd(current);
            const canonicalName = generateTaskFilename(current.id, current.title);
            const canonicalPath = path.join(tasksDir, canonicalName);

            if (file !== canonicalName) {
              try { fs.unlinkSync(fullPath); } catch {}
            }
            fs.writeFileSync(canonicalPath, serialized, 'utf8');
            updatedCount++;
            updatedIds.push(current.id);
          }
        } catch {}
      }

      return {
        ok: true,
        projectId: targetProject.id,
        storageType: 'markdown',
        updatedCount,
        updatedIds
      };
    }

    // JSON storage
    const filePath = targetProject.isDemo 
      ? DEMO_FILE 
      : (targetProject.repoPath ? path.join(targetProject.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${targetProject.id}-backlog.json`));

    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const items = data.items || [];

      for (let i = 0; i < items.length; i++) {
        const current = items[i];
        const taskId = String(current.id || current.code || '').toLowerCase();

        let match = false;
        if (cleanIds) {
          match = cleanIds.has(taskId);
        } else if (pfxFilter) {
          match = taskId.startsWith(pfxFilter);
        } else {
          match = true;
        }

        if (statusFilter && normalizeStatus(current.status) !== statusFilter) {
          match = false;
        }

        if (match) {
          if (updates.status) current.status = normalizeStatus(updates.status);
          if (updates.priority) current.priority = normalizePriority(updates.priority);
          if (updates.milestone !== undefined) {
            current.milestone = updates.milestone;
            current.targetSprint = updates.milestone;
          }
          if (updates.implementationNotes !== undefined) {
            current.implementationNotes = updates.implementationNotes;
            current.fix = updates.implementationNotes;
          }
          if (Array.isArray(updates.labels)) current.labels = updates.labels;
          current.updatedAt = now;

          items[i] = current;
          updatedCount++;
          updatedIds.push(current.code || current.id);
        }
      }

      data.items = items;
      data.lastUpdated = now;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

      return {
        ok: true,
        projectId: targetProject.id,
        storageType: 'json',
        updatedCount,
        updatedIds
      };
    }

    throw new Error('No se pudo encontrar el archivo de almacenamiento del proyecto.');
  }

  if (name === 'devboard_get_task') {
    const cleanId = String(args.taskId).toLowerCase();
    for (const p of registry.projects) {
      if (args.projectId && p.id !== args.projectId) continue;
      const tasks = readTasksForProject(p);
      const match = tasks.find(t => 
        (t.id && t.id.toLowerCase() === cleanId) || 
        (t.code && t.code.toLowerCase() === cleanId)
      );
      if (match) {
        return {
          found: true,
          project: { id: p.id, name: p.name, storageType: p.storageType },
          task: match
        };
      }
    }
    throw new Error(`Tarea ${args.taskId} no encontrada.`);
  }

  if (name === 'devboard_create_task') {
    const project = registry.projects.find(p => p.id === args.projectId) 
      || registry.projects.find(p => p.id === registry.activeProjectId) 
      || registry.projects[0];
    if (!project) throw new Error('Proyecto no encontrado.');

    const tasks = readTasksForProject(project);
    const code = `${project.codePrefix}-${String(tasks.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const acList = (args.acceptanceCriteria || []).map((text: string, i: number) => ({
      index: i + 1,
      text,
      checked: false
    }));

    const taskData: BacklogMdTask = {
      id: code,
      title: args.title,
      status: normalizeStatus(args.status || 'draft'),
      priority: normalizePriority(args.priority || 'medium'),
      type: args.type || 'feature',
      createdDate: today,
      updatedDate: today,
      milestone: args.milestone,
      description: args.description || '',
      acceptanceCriteria: acList,
      implementationPlan: args.implementationPlan || ''
    };

    if (project.storageType === 'markdown' && project.repoPath) {
      const tasksDir = getTasksDir(project);
      if (!fs.existsSync(tasksDir)) fs.mkdirSync(tasksDir, { recursive: true });
      const filename = generateTaskFilename(code, args.title);
      const filepath = path.join(tasksDir, filename);
      fs.writeFileSync(filepath, serializeBacklogMd(taskData), 'utf8');
      return { ok: true, task: taskData, savedFile: filepath };
    }

    // JSON fallback
    const filePath = project.isDemo 
      ? DEMO_FILE 
      : (project.repoPath ? path.join(project.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${project.id}-backlog.json`));
    
    const now = new Date().toISOString();
    const newItem = {
      ...taskData,
      code,
      projectId: project.id,
      acceptanceCriteriaList: acList,
      createdAt: now,
      updatedAt: now
    };

    let existingData = { project, items: [] as any[], releases: [] };
    if (fs.existsSync(filePath)) {
      existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    existingData.items.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf8');
    return { ok: true, task: newItem, savedFile: filePath };
  }

  if (name === 'devboard_update_task') {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    for (const project of registry.projects) {
      if (args.projectId && project.id !== args.projectId) continue;

      if (project.storageType === 'markdown' && project.repoPath) {
        const tasksDir = getTasksDir(project);
        if (!fs.existsSync(tasksDir)) continue;
        const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
        const cleanId = String(args.taskId).toLowerCase();

        // 1. Coincidencia por convención de nombre de archivo (case-insensitive)
        let resolvedFile = files.find(f => {
          const fLower = f.toLowerCase();
          return fLower.startsWith(`${cleanId} `) || fLower === `${cleanId}.md` || fLower.startsWith(`${cleanId}-`);
        });

        // 2. Reconciliación por frontmatter YAML si el archivo fue renombrado (DEV-019)
        if (!resolvedFile) {
          for (const f of files) {
            try {
              const raw = fs.readFileSync(path.join(tasksDir, f), 'utf8');
              const fallbackId = f.split(' - ')[0] || f.replace(/\.md$/, '');
              const task = parseBacklogMd(raw, fallbackId);
              if (task.id && task.id.toLowerCase() === cleanId) {
                resolvedFile = f;
                break;
              }
            } catch {}
          }
        }

        if (resolvedFile) {
          const fullPath = path.join(tasksDir, resolvedFile);
          const raw = fs.readFileSync(fullPath, 'utf8');
          const current = parseBacklogMd(raw, args.taskId);

          if (args.status) current.status = normalizeStatus(args.status);
          if (args.title) current.title = args.title;
          if (args.description !== undefined) current.description = args.description;
          if (args.priority) current.priority = normalizePriority(args.priority);
          if (args.implementationPlan !== undefined) current.implementationPlan = args.implementationPlan;
          if (args.milestone !== undefined) current.milestone = args.milestone;
          current.updatedDate = today;

          if (args.toggleAcIndex !== undefined && current.acceptanceCriteria) {
            current.acceptanceCriteria = current.acceptanceCriteria.map(ac => 
              ac.index === args.toggleAcIndex ? { ...ac, checked: !ac.checked } : ac
            );
          }

          const serialized = serializeBacklogMd(current);
          const canonicalName = generateTaskFilename(current.id, current.title);
          const canonicalPath = path.join(tasksDir, canonicalName);

          // Si el archivo tenía un nombre no estándar, renombrar al canónico
          if (resolvedFile !== canonicalName) {
            try {
              fs.unlinkSync(fullPath);
            } catch {}
          }

          fs.writeFileSync(canonicalPath, serialized, 'utf8');
          return { ok: true, updatedTask: current, filePath: canonicalPath };
        }
      } else {
        // JSON storage update
        const filePath = project.isDemo 
          ? DEMO_FILE 
          : (project.repoPath ? path.join(project.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${project.id}-backlog.json`));
        
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const cleanId = String(args.taskId).toLowerCase();
          const idx = data.items.findIndex((i: any) => 
            (i.id && String(i.id).toLowerCase() === cleanId) || 
            (i.code && String(i.code).toLowerCase() === cleanId)
          );
          if (idx >= 0) {
            const current = data.items[idx];
            if (args.status) current.status = normalizeStatus(args.status);
            if (args.title) current.title = args.title;
            if (args.description !== undefined) current.description = args.description;
            if (args.priority) current.priority = normalizePriority(args.priority);
            if (args.implementationPlan !== undefined) current.implementationPlan = args.implementationPlan;
            if (args.milestone !== undefined) current.milestone = args.milestone;
            current.updatedAt = now;

            if (args.toggleAcIndex !== undefined && current.acceptanceCriteriaList) {
              current.acceptanceCriteriaList = current.acceptanceCriteriaList.map((ac: any) =>
                ac.index === args.toggleAcIndex ? { ...ac, checked: !ac.checked } : ac
              );
            }

            data.items[idx] = current;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return { ok: true, updatedTask: current, filePath };
          }
        }
      }
    }
    throw new Error(`Tarea ${args.taskId} no encontrada para actualizar.`);
  }

  if (name === 'devboard_export_backlog') {
    const project = registry.projects.find(p => p.id === args.projectId) 
      || registry.projects.find(p => p.id === registry.activeProjectId) 
      || registry.projects[0];
    if (!project) throw new Error('Proyecto no encontrado.');

    const tasks = readTasksForProject(project);
    const mdTasks: BacklogMdTask[] = tasks.map(t => ({
      id: t.code || t.id,
      title: t.title,
      status: normalizeStatus(t.status),
      type: t.type,
      priority: t.priority,
      milestone: t.milestone || t.targetSprint,
      description: t.description,
      acceptanceCriteria: t.acceptanceCriteriaList || []
    }));

    const content = generateMonolithicBacklogMd(project.name, mdTasks);
    let savedPath = null;
    if (project.repoPath) {
      savedPath = path.join(project.repoPath, 'BACKLOG.md');
      fs.writeFileSync(savedPath, content, 'utf8');
    }

    return {
      ok: true,
      savedPath,
      taskCount: tasks.length
    };
  }

  if (name === 'devboard_list_releases') {
    const targetProject = registry.projects.find(p => p.id === args.projectId) 
      || registry.projects.find(p => p.id === registry.activeProjectId) 
      || registry.projects[0];

    if (!targetProject) throw new Error('No hay proyectos registrados en DevBoard.');

    let releases: any[] = [];
    const repoPath = targetProject.repoPath || ROOT_DIR;
    const releasesJsonPath = path.join(repoPath, targetProject.backlogDir || 'backlog', 'releases.json');
    const legacyReleasesPath = path.join(repoPath, '.devboard/releases.json');
    const dataReleasesPath = path.join(ROOT_DIR, 'data/releases.json');

    if (fs.existsSync(releasesJsonPath)) {
      try { releases = JSON.parse(fs.readFileSync(releasesJsonPath, 'utf8')); } catch {}
    } else if (fs.existsSync(legacyReleasesPath)) {
      try { releases = JSON.parse(fs.readFileSync(legacyReleasesPath, 'utf8')); } catch {}
    } else if (fs.existsSync(dataReleasesPath)) {
      try { releases = JSON.parse(fs.readFileSync(dataReleasesPath, 'utf8')); } catch {}
    }

    const allTasks = readTasksForProject(targetProject);
    const knownCodes = new Set(allTasks.map(t => (t.code || t.id || '').toUpperCase()).filter(Boolean));
    const codePrefix = (targetProject.codePrefix || '').toUpperCase().trim();

    // Fallback: parse docs/RELEASE_NOTES.md or RELEASE_NOTES.md
    if (releases.length === 0) {
      const notesPaths = [
        path.join(repoPath, 'docs/RELEASE_NOTES.md'),
        path.join(repoPath, 'docs/releasenotes.md'),
        path.join(repoPath, 'RELEASE_NOTES.md'),
        path.join(repoPath, 'releasenotes.md'),
        path.join(repoPath, 'CHANGELOG.md')
      ];
      for (const np of notesPaths) {
        if (fs.existsSync(np)) {
          try {
            const content = fs.readFileSync(np, 'utf8');
            const sections = content.split(/(?=^##\s+)/m);
            for (const section of sections) {
              const trimmed = section.trim();
              if (!trimmed.startsWith('##')) continue;
              const firstLineEnd = trimmed.indexOf('\n');
              const headerLine = firstLineEnd > 0 ? trimmed.substring(0, firstLineEnd) : trimmed;
              const vMatch = headerLine.match(/^##\s*\[?([vV]?\d+(?:\.\d+)*(?:-[a-zA-Z0-9.]+)?(?:[^\s\]—–-]+)?)\]?/);
              if (!vMatch) continue;

              const rawVersion = vMatch[1].trim();
              const version = rawVersion.replace(/^v(?=\d)/i, '');
              const dateMatch = headerLine.match(/\b(\d{4}-\d{2}-\d{2})\b/);
              const date = dateMatch ? dateMatch[1] : '';

              let title = headerLine.replace(/^##\s*\[?[^\]]+\]?/, '').trim();
              if (date) title = title.replace(date, '').trim();
              title = title.replace(/^[-—–:🚀 ]+/, '').trim();

              const itemCodesSet = new Set<string>();
              const candidates = trimmed.match(/\b([A-Za-z0-9]+(?:-[A-Za-z0-9]+)+)\b/g) || [];
              for (const c of candidates) {
                const upper = c.toUpperCase();
                if (knownCodes.has(upper) || (codePrefix && upper.startsWith(`${codePrefix}-`))) {
                  itemCodesSet.add(upper);
                }
              }
              for (const t of allTasks) {
                const m = (t.milestone || t.targetSprint || '').replace(/^v/i, '');
                if (m && m === version) itemCodesSet.add(t.code || t.id);
              }

              releases.push({
                version,
                date: date || '',
                title: title || `Release ${version}`,
                itemCodes: Array.from(itemCodesSet),
                itemCount: itemCodesSet.size
              });
            }
          } catch {}
          if (releases.length > 0) break;
        }
      }
    }

    if (args.version) {
      const vClean = String(args.version).trim().toLowerCase().replace(/^v/, '');
      const foundRelease = releases.find(r => String(r.version).toLowerCase().replace(/^v/, '') === vClean);
      if (!foundRelease) {
        return {
          project: targetProject.id,
          version: args.version,
          found: false,
          message: `No se encontró el release para la versión "${args.version}".`,
          availableVersions: releases.map(r => r.version)
        };
      }

      const relatedCodes = new Set((foundRelease.itemCodes || []).map((c: string) => c.toLowerCase()));
      const relatedTasks = allTasks.filter(t => {
        const idLower = String(t.id || t.code || '').toLowerCase();
        if (relatedCodes.has(idLower)) return true;
        const mLower = String(t.milestone || t.targetSprint || '').toLowerCase().replace(/^v/, '');
        return mLower === vClean;
      });

      return {
        project: targetProject.id,
        release: foundRelease,
        taskCount: relatedTasks.length,
        tasks: relatedTasks.map(t => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          type: t.type
        }))
      };
    }

    return {
      project: targetProject.id,
      totalReleases: releases.length,
      releases: releases.map(r => ({
        version: r.version,
        date: r.date,
        title: r.title,
        itemCount: Array.isArray(r.itemCodes) ? r.itemCodes.length : 0,
        itemCodes: r.itemCodes || []
      }))
    };
  }

  throw new Error(`Herramienta desconocida: ${name}`);
}

// JSON-RPC stdio event loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function sendJsonRpc(response: any) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const request = JSON.parse(line);
    const { id, method, params } = request;

    if (method === 'initialize') {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'devboard-mcp',
            version: '1.0.0'
          }
        }
      });
      return;
    }

    if (method === 'notifications/initialized') {
      // No response required for notifications
      return;
    }

    if (method === 'tools/list') {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      });
      return;
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};

      try {
        const result = await handleToolCall(toolName, toolArgs);
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2)
              }
            ]
          }
        });
      } catch (toolErr: any) {
        sendJsonRpc({
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [
              {
                type: 'text',
                text: `Error ejecutando ${toolName}: ${toolErr.message}`
              }
            ]
          }
        });
      }
      return;
    }

    // Unknown method
    if (id !== undefined) {
      sendJsonRpc({
        jsonrpc: '2.0',
        id,
        error: {
          code: -32601,
          message: `Método desconocido: ${method}`
        }
      });
    }
  } catch (parseErr: any) {
    sendJsonRpc({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32700,
        message: 'Parse error: invalid JSON'
      }
    });
  }
});
