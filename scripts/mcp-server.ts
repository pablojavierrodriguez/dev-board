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
}

function getRegistry(): { activeProjectId: string; projects: ProjectMeta[] } {
  if (!fs.existsSync(REGISTRY_FILE)) {
    return { activeProjectId: '', projects: [] };
  }
  return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
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
    description: 'Lista tareas del backlog con filtros opcionales por proyecto, estado, prioridad o sprint.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'ID del proyecto (ej: "dev-board", "dom"). Si se omite lista el activo.' },
        status: { 
          type: 'string', 
          description: 'Filtrar por estado: "draft", "doing", "review", "ready", "done", "dismissed", "cancelled".' 
        },
        priority: { type: 'string', description: 'Filtrar por prioridad: "urgent", "high", "medium", "low".' },
        milestone: { type: 'string', description: 'Filtrar por milestone o sprint (ej: "v1.1.0").' }
      }
    }
  },
  {
    name: 'devboard_get_task',
    description: 'Obtiene el detalle completo de una tarea incluyendo Criterios de Aceptación (AC), Plan de Implementación y Notas.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Código o ID de la tarea (ej: "DEV-001", "DOM-012").' },
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

    return {
      projectId: targetProject.id,
      projectName: targetProject.name,
      storageType: targetProject.storageType,
      total: tasks.length,
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

  if (name === 'devboard_get_task') {
    for (const p of registry.projects) {
      if (args.projectId && p.id !== args.projectId) continue;
      const tasks = readTasksForProject(p);
      const match = tasks.find(t => t.id === args.taskId || t.code === args.taskId);
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
        const targetFile = files.find(f => f.startsWith(`${args.taskId} `) || f === `${args.taskId}.md` || f.startsWith(`${args.taskId}-`));

        if (targetFile) {
          const fullPath = path.join(tasksDir, targetFile);
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

          fs.writeFileSync(fullPath, serializeBacklogMd(current), 'utf8');
          return { ok: true, updatedTask: current, filePath: fullPath };
        }
      } else {
        // JSON storage update
        const filePath = project.isDemo 
          ? DEMO_FILE 
          : (project.repoPath ? path.join(project.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${project.id}-backlog.json`));
        
        if (fs.existsSync(filePath)) {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const idx = data.items.findIndex((i: any) => i.id === args.taskId || i.code === args.taskId);
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
