#!/usr/bin/env node
/**
 * DevBoard CLI
 * Herramienta de línea de comandos para consultar, analizar y mutar en lote tareas del backlog
 * de forma limpia, eficiente en tokens y agnóstica del almacenamiento (Markdown o JSON).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseBacklogMd, serializeBacklogMd, generateTaskFilename, normalizeStatus, normalizePriority } from './backlogMdParser.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const REGISTRY_FILE = path.join(ROOT_DIR, 'data/projects-registry.json');
const DEMO_FILE = path.join(ROOT_DIR, 'data/demo-backlog.json');

function getRegistry(): { activeProjectId: string; projects: any[] } {
  if (!fs.existsSync(REGISTRY_FILE)) {
    return { activeProjectId: '', projects: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8'));
  } catch {
    return { activeProjectId: '', projects: [] };
  }
}

function getProject(projectId?: string) {
  const registry = getRegistry();
  if (projectId) {
    const found = registry.projects.find(p => p.id === projectId || p.codePrefix?.toLowerCase() === projectId.toLowerCase());
    if (found) return found;
  }

  // Si se ejecuta dentro de un repo con backlog, priorizar el directorio actual (estilo Git)
  const cwd = process.cwd();
  const matched = registry.projects.find(p => p.repoPath && path.normalize(p.repoPath) === path.normalize(cwd));
  if (matched) return matched;

  const hasMdBacklog = fs.existsSync(path.join(cwd, 'backlog/tasks'));
  const hasJsonBacklog = fs.existsSync(path.join(cwd, '.devboard/backlog.json'));
  if (hasMdBacklog || hasJsonBacklog) {
    const folderName = path.basename(cwd);
    return {
      id: folderName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
      name: folderName,
      codePrefix: folderName.substring(0, 4).toUpperCase(),
      repoPath: cwd,
      storageType: hasMdBacklog ? 'markdown' : 'json',
      backlogDir: 'backlog',
      createdAt: new Date().toISOString()
    };
  }

  if (registry.activeProjectId) {
    const active = registry.projects.find(p => p.id === registry.activeProjectId);
    if (active) return active;
  }

  return registry.projects[0];
}

function loadTasks(project: any): any[] {
  if (!project) return [];

  // 1. Storage Markdown
  if (project.storageType === 'markdown' && project.repoPath) {
    const tasksDir = path.join(project.repoPath, project.backlogDir || 'backlog', 'tasks');
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
          id: task.id || fallbackId,
          code: task.id || fallbackId,
          title: task.title,
          status: normalizeStatus(task.status),
          priority: normalizePriority(task.priority),
          type: task.type,
          milestone: task.milestone,
          acceptanceCriteria: task.acceptanceCriteria || [],
          labels: task.labels || [],
          _file: file,
          _raw: task
        });
      } catch {}
    }
    return items;
  }

  // 2. Storage JSON
  const jsonPath = project.isDemo 
    ? DEMO_FILE 
    : (project.repoPath ? path.join(project.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${project.id}-backlog.json`));

  if (fs.existsSync(jsonPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return (data.items || []).map((i: any) => ({
        ...i,
        status: normalizeStatus(i.status),
        priority: normalizePriority(i.priority)
      }));
    } catch {}
  }

  return [];
}

function printUsage() {
  console.log(`
📋 DevBoard CLI - Gestión, Auditoría y Mutaciones de Backlog

Uso:
  devboard [comando] [opciones]
  npm run tasks -- [opciones]

Comandos / Modos:
  list                 (Por defecto) Lista las tareas con filtros aplicados
  --stats              Muestra un panel consolidado de métricas y agrupación por prefijo
  --update-status <s>  Actualiza masivamente el estado de todas las tareas filtradas

Filtros:
  --open, -o           Muestra solo tareas abiertas (excluye done, dismissed, released)
  --prefix <prefijo>   Filtra por prefijo de código (ej: FEAT, BUG, DEV)
  --ids <id1,id2>      Filtra por lista explícita de IDs separados por coma
  --status <estado>    Filtra por estado (draft, doing, review, ready, done)
  --priority <prio>    Filtra por prioridad (urgent, high, medium, low)
  --sprint <milestone> Filtra por sprint / milestone (ej: v1.1.0)
  --project <id>       ID del proyecto (por defecto el activo)
  --limit <n>          Cantidad máxima a mostrar (por defecto 30)
  --search <texto>     Filtra por texto en título o etiquetas
  --json               Emite la salida en formato JSON
  --help, -h           Muestra esta ayuda
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h') || args[0] === 'help') {
    printUsage();
    return;
  }

  const showStats = args.includes('--stats');
  const openOnly = args.includes('--open') || args.includes('-o') || args.includes('--active');
  const asJson = args.includes('--json');

  const getArgValue = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    return (idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('-')) ? args[idx + 1] : undefined;
  };

  const status = getArgValue('--status');
  const priority = getArgValue('--priority');
  const sprint = getArgValue('--sprint') || getArgValue('--milestone');
  const projectId = getArgValue('--project');
  const search = getArgValue('--search') || getArgValue('-s');
  const prefix = getArgValue('--prefix') || getArgValue('-p');
  const idsArg = getArgValue('--ids');
  const updateStatus = getArgValue('--update-status');
  const limitStr = getArgValue('--limit') || getArgValue('-n');
  const limit = limitStr ? parseInt(limitStr, 10) : (showStats ? 999999 : 30);

  const project = getProject(projectId);
  if (!project) {
    console.error('❌ No se encontró ningún proyecto registrado en DevBoard.');
    process.exit(1);
  }

  let tasks = loadTasks(project);

  // Modo Estadísticas / Dashboard
  if (showStats) {
    const total = tasks.length;
    const closedStatuses = ['done', 'dismissed', 'cancelled', 'released'];
    let openCount = 0;
    let doneCount = 0;
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    const byPrefix: Record<string, { total: number; open: number; done: number }> = {};

    for (const t of tasks) {
      const isClosed = closedStatuses.includes(t.status);
      if (isClosed) doneCount++; else openCount++;

      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      byPriority[t.priority] = (byPriority[t.priority] || 0) + 1;

      const code = String(t.code || t.id || '');
      const parts = code.split('-');
      const pfx = parts.length > 2 ? `${parts[0]}-${parts[1]}` : (parts[0] || 'OTHER');

      if (!byPrefix[pfx]) {
        byPrefix[pfx] = { total: 0, open: 0, done: 0 };
      }
      byPrefix[pfx].total++;
      if (isClosed) byPrefix[pfx].done++; else byPrefix[pfx].open++;
    }

    const completionRate = total > 0 ? Math.round((doneCount / total) * 100) : 0;

    if (asJson) {
      console.log(JSON.stringify({
        project: { id: project.id, name: project.name, storage: project.storageType },
        summary: { total, open: openCount, done: doneCount, completionRate: `${completionRate}%` },
        byStatus,
        byPriority,
        byPrefix
      }, null, 2));
      return;
    }

    console.log(`\n📊 Dashboard de Métricas: ${project.name} [${project.storageType.toUpperCase()}]`);
    console.log(`══════════════════════════════════════════════════════════════`);
    console.log(`  Total Ítems:       ${total}`);
    console.log(`  Abiertos:          ${openCount} (${total > 0 ? Math.round((openCount / total) * 100) : 0}%)`);
    console.log(`  Terminados:        ${doneCount} (${completionRate}%)`);
    console.log(`  Tasa de Avance:    [${'█'.repeat(Math.round(completionRate / 5))}${'░'.repeat(20 - Math.round(completionRate / 5))}] ${completionRate}%`);

    console.log(`\n📌 Por Estado:`);
    for (const [st, cnt] of Object.entries(byStatus)) {
      console.log(`  • ${st.padEnd(12, ' ')} : ${cnt}`);
    }

    console.log(`\n🏷️ Agrupación por Prefijo de Tarea:`);
    console.log(`  Prefijo          Total      Abiertas   Terminadas`);
    console.log(`  ───────────────  ─────────  ─────────  ──────────`);
    for (const [pfx, data] of Object.entries(byPrefix)) {
      console.log(`  ${pfx.padEnd(15, ' ')}  ${String(data.total).padEnd(9, ' ')}  ${String(data.open).padEnd(9, ' ')}  ${data.done}`);
    }
    console.log('');
    return;
  }

  // Filtros aplicados
  if (openOnly) {
    const closed = ['done', 'dismissed', 'cancelled', 'released'];
    tasks = tasks.filter(t => !closed.includes(t.status));
  }
  if (prefix) {
    const pfxLower = prefix.toLowerCase();
    tasks = tasks.filter(t => 
      (t.code && t.code.toLowerCase().startsWith(pfxLower)) || 
      (t.id && t.id.toLowerCase().startsWith(pfxLower))
    );
  }
  if (idsArg) {
    const setIds = new Set(idsArg.split(',').map(s => s.trim().toLowerCase()));
    tasks = tasks.filter(t => 
      (t.code && setIds.has(t.code.toLowerCase())) || 
      (t.id && setIds.has(t.id.toLowerCase()))
    );
  }
  if (status) {
    const sNorm = normalizeStatus(status);
    tasks = tasks.filter(t => t.status === sNorm);
  }
  if (priority) {
    const pNorm = normalizePriority(priority);
    tasks = tasks.filter(t => t.priority === pNorm);
  }
  if (sprint) {
    tasks = tasks.filter(t => t.milestone === sprint || t.targetSprint === sprint);
  }
  if (search) {
    const q = search.toLowerCase();
    tasks = tasks.filter(t => 
      (t.title && t.title.toLowerCase().includes(q)) || 
      (t.code && t.code.toLowerCase().includes(q)) ||
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.labels && t.labels.some((l: string) => l.toLowerCase().includes(q)))
    );
  }

  // Modo Actualización Masiva (CLI Bulk Update DEV-021)
  if (updateStatus) {
    const newStatus = normalizeStatus(updateStatus);
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    let updatedCount = 0;

    if (tasks.length === 0) {
      console.log('⚠️ No hay tareas que coincidan con los filtros para actualizar.');
      return;
    }

    if (project.storageType === 'markdown' && project.repoPath) {
      const tasksDir = path.join(project.repoPath, project.backlogDir || 'backlog', 'tasks');
      for (const t of tasks) {
        if (!t._raw || !t._file) continue;
        const taskData = t._raw;
        taskData.status = newStatus;
        taskData.updatedDate = today;

        const serialized = serializeBacklogMd(taskData);
        const canonicalName = generateTaskFilename(taskData.id, taskData.title);
        const canonicalPath = path.join(tasksDir, canonicalName);

        if (t._file !== canonicalName) {
          try { fs.unlinkSync(path.join(tasksDir, t._file)); } catch {}
        }
        fs.writeFileSync(canonicalPath, serialized, 'utf8');
        updatedCount++;
      }
    } else {
      // JSON storage
      const jsonPath = project.isDemo 
        ? DEMO_FILE 
        : (project.repoPath ? path.join(project.repoPath, '.devboard/backlog.json') : path.join(ROOT_DIR, `data/${project.id}-backlog.json`));

      if (fs.existsSync(jsonPath)) {
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const matchedIds = new Set(tasks.map(t => (t.code || t.id).toLowerCase()));
        for (const it of data.items) {
          if (matchedIds.has(String(it.id || it.code).toLowerCase())) {
            it.status = newStatus;
            it.updatedAt = now;
            updatedCount++;
          }
        }
        data.lastUpdated = now;
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
      }
    }

    console.log(`\n⚡ Actualización masiva completada: ${updatedCount} tareas pasadas a estado '${newStatus}'.\n`);
    return;
  }

  const totalFiltered = tasks.length;
  const sliced = tasks.slice(0, limit);

  if (asJson) {
    console.log(JSON.stringify({
      project: { id: project.id, name: project.name, storage: project.storageType },
      total: totalFiltered,
      showing: sliced.length,
      items: sliced
    }, null, 2));
    return;
  }

  console.log(`\n📋 Backlog: ${project.name} (${project.storageType.toUpperCase()})`);
  console.log(`Mostrando ${sliced.length} de ${totalFiltered} tareas ${openOnly ? 'abiertas' : ''}:\n`);

  if (sliced.length === 0) {
    console.log('  (No hay tareas que coincidan con los filtros)\n');
    return;
  }

  sliced.forEach((t, i) => {
    const acList = t.acceptanceCriteria || t.acceptanceCriteriaList || [];
    const acProgress = acList.length > 0 
      ? ` [${acList.filter((ac: any) => ac.checked).length}/${acList.length} AC]` 
      : '';
    const sprintTag = t.milestone || t.targetSprint ? ` <${t.milestone || t.targetSprint}>` : '';
    const statusColor = t.status === 'doing' ? '⚡' : t.status === 'review' ? '👀' : t.status === 'ready' ? '📦' : t.status === 'done' ? '✅' : '⏳';

    console.log(`${String(i + 1).padStart(2, ' ')}. ${statusColor} [${t.code || t.id}] (${t.status.toUpperCase()} / ${t.priority})${sprintTag} - ${t.title}${acProgress}`);
  });

  if (totalFiltered > limit) {
    console.log(`\n  ... y ${totalFiltered - limit} tareas más (usa --limit ${totalFiltered} para ver todas)`);
  }
  console.log('');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
