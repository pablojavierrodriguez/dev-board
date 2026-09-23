/**
 * backlogMdParser.ts
 * Parser y serializador nativo (zero-dependency) para el estándar Backlog.md (MrLesk/Backlog.md)
 * Compatible con Node.js y navegadores.
 */

export type CanonicalStatus = 'draft' | 'doing' | 'review' | 'ready' | 'done' | 'dismissed' | 'cancelled';

export interface ParsedAcceptanceCriteria {
  index: number;
  text: string;
  checked: boolean;
}

export interface BacklogMdTask {
  id: string;
  title: string;
  status: CanonicalStatus;
  rawStatus?: string;
  type?: string;
  priority?: string;
  assignees?: string[];
  labels?: string[];
  dependencies?: string[];
  milestone?: string;
  sprint?: string;
  targetSprint?: string;
  parentId?: string;
  blocks?: string[];
  blockedBy?: string[];
  relatedTo?: string[];
  sprints?: string[];
  releases?: string[];
  createdDate?: string;
  updatedDate?: string;
  description?: string;
  acceptanceCriteria?: ParsedAcceptanceCriteria[];
  implementationPlan?: string;
  implementationNotes?: string;
  finalSummary?: string;
  rawExtraFrontmatter?: Record<string, string>;
}

/**
 * Normaliza cualquier estado (legacy o comunidad) al estándar unificado:
 * 'draft' | 'doing' | 'review' | 'ready' | 'done' | 'dismissed' | 'cancelled'
 */
export function normalizeStatus(raw: string | undefined | null): CanonicalStatus {
  if (!raw) return 'draft';
  const clean = raw.trim().toLowerCase().replace(/[\s_-]+/g, '');

  switch (clean) {
    case 'draft':
    case 'drafts':
    case 'ideas':
    case 'idea':
    case 'backlog':
    case 'todo':
    case 'open':
      return 'draft';

    case 'doing':
    case 'inprogress':
    case 'wip':
    case 'inprog':
    case 'active':
    case 'started':
      return 'doing';

    case 'review':
    case 'testing':
    case 'testingqa':
    case 'qa':
    case 'test':
    case 'inreview':
      return 'review';

    case 'ready':
    case 'finish':
    case 'readyfordeploy':
    case 'staged':
    case 'resolved':
      return 'ready';

    case 'done':
    case 'deployed':
    case 'closed':
    case 'completed':
    case 'shipped':
      return 'done';

    case 'dismissed':
    case 'cancelled':
    case 'canceled':
    case 'abandoned':
    case 'archived':
    case 'archive':
      return 'dismissed';

    default:
      return 'draft';
  }
}

/**
 * Convierte un estado canónico al formato legible para Backlog.md
 */
export function formatStatusForMd(status: CanonicalStatus): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'doing': return 'Doing';
    case 'review': return 'Review';
    case 'ready': return 'Ready';
    case 'done': return 'Done';
    case 'dismissed': return 'Dismissed';
    case 'cancelled': return 'Cancelled';
    default: return 'Draft';
  }
}

/**
 * Normaliza prioridad hacia p0..p3
 */
export function normalizePriority(raw: string | undefined | null): 'p0' | 'p1' | 'p2' | 'p3' {
  if (!raw) return 'p2';
  const clean = raw.trim().toLowerCase();
  if (clean === 'p0' || clean === 'urgent' || clean === 'critical') return 'p0';
  if (clean === 'p1' || clean === 'high') return 'p1';
  if (clean === 'p2' || clean === 'medium' || clean === 'med') return 'p2';
  if (clean === 'p3' || clean === 'low') return 'p3';
  return 'p2';
}

/**
 * Formatea prioridad para Backlog.md frontmatter
 */
export function formatPriorityForMd(p: 'p0' | 'p1' | 'p2' | 'p3' | string): string {
  if (p === 'p0') return 'urgent';
  if (p === 'p1') return 'high';
  if (p === 'p2') return 'medium';
  if (p === 'p3') return 'low';
  return p || 'medium';
}

/**
 * Parsea un archivo de tarea Markdown con YAML frontmatter y secciones
 */
export function parseBacklogMd(content: string, defaultId = ''): BacklogMdTask {
  const result: BacklogMdTask = {
    id: defaultId,
    title: 'Sin título',
    status: 'draft',
    type: 'feature',
    priority: 'p2',
    assignees: [],
    labels: [],
    dependencies: [],
    acceptanceCriteria: [],
    rawExtraFrontmatter: {}
  };

  if (!content) return result;

  // 1. Extraer Frontmatter
  let bodyContent = content;
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  
  if (frontmatterMatch) {
    const rawFm = frontmatterMatch[1];
    bodyContent = frontmatterMatch[2];

    const lines = rawFm.split(/\r?\n/);
    let currentKey = '';
    let currentList: string[] = [];
    let inList = false;

    const finalizeList = () => {
      if (inList && currentKey) {
        if (currentKey === 'labels') result.labels = currentList;
        else if (currentKey === 'assignee' || currentKey === 'assignees') result.assignees = currentList;
        else if (currentKey === 'dependencies') result.dependencies = currentList;
        else if (currentKey === 'blocks') result.blocks = currentList;
        else if (currentKey === 'blocked_by' || currentKey === 'blockedby') result.blockedBy = currentList;
        else if (currentKey === 'related_to' || currentKey === 'relatedto') result.relatedTo = currentList;
        else if (currentKey === 'sprints') result.sprints = currentList;
        else if (currentKey === 'releases') result.releases = currentList;
      }
      inList = false;
      currentList = [];
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      if (trimmed.startsWith('- ')) {
        // Elemento de lista
        const itemVal = trimmed.replace(/^- /, '').trim().replace(/^['"]|['"]$/g, '');
        currentList.push(itemVal);
        continue;
      }

      // Si teníamos una lista abierta y encontramos una clave nueva, finalizarla
      if (inList && !line.startsWith(' ') && !line.startsWith('\t')) {
        finalizeList();
      }

      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const rawVal = line.slice(colonIdx + 1).trim();
        const cleanVal = rawVal.replace(/^['"]|['"]$/g, '');

        currentKey = key;

        if (!rawVal) {
          // Posible inicio de lista en la siguiente línea
          inList = true;
          currentList = [];
          continue;
        }

        if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
          // Inline list [a, b, c]
          const items = rawVal.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
          if (key === 'labels') result.labels = items;
          else if (key === 'assignee' || key === 'assignees') result.assignees = items;
          else if (key === 'dependencies') result.dependencies = items;
          else if (key === 'blocks') result.blocks = items;
          else if (key === 'blocked_by' || key === 'blockedby') result.blockedBy = items;
          else if (key === 'related_to' || key === 'relatedto') result.relatedTo = items;
          else if (key === 'sprints') result.sprints = items;
          else if (key === 'releases') result.releases = items;
          continue;
        }

        switch (key) {
          case 'id':
            result.id = cleanVal;
            break;
          case 'title':
            result.title = cleanVal;
            break;
          case 'status':
            result.rawStatus = cleanVal;
            result.status = normalizeStatus(cleanVal);
            break;
          case 'type':
            result.type = cleanVal;
            break;
          case 'priority':
            result.priority = cleanVal;
            break;
          case 'milestone':
            result.milestone = cleanVal;
            break;
          case 'parent':
          case 'parentid':
            result.parentId = cleanVal;
            break;
          case 'blocks':
            result.blocks = [cleanVal];
            break;
          case 'blocked_by':
          case 'blockedby':
            result.blockedBy = [cleanVal];
            break;
          case 'related_to':
          case 'relatedto':
            result.relatedTo = [cleanVal];
            break;
          case 'sprints':
            result.sprints = [cleanVal];
            break;
          case 'releases':
            result.releases = [cleanVal];
            break;
          case 'sprint':
          case 'targetsprint':
            result.sprint = cleanVal;
            result.targetSprint = cleanVal;
            if (result.rawExtraFrontmatter) {
              result.rawExtraFrontmatter.sprint = cleanVal;
              result.rawExtraFrontmatter.targetSprint = cleanVal;
            }
            break;
          case 'release':
          case 'targetrelease':
            if (result.rawExtraFrontmatter) {
              result.rawExtraFrontmatter.release = cleanVal;
              result.rawExtraFrontmatter.targetRelease = cleanVal;
            }
            break;
          case 'created_date':
          case 'createdat':
            result.createdDate = cleanVal;
            break;
          case 'updated_date':
          case 'updatedat':
            result.updatedDate = cleanVal;
            break;
          case 'assignee':
            result.assignees = [cleanVal];
            break;
          default:
            if (result.rawExtraFrontmatter) {
              result.rawExtraFrontmatter[key] = cleanVal;
            }
            break;
        }
      }
    }
    finalizeList();
  }

  // 2. Extraer Secciones Delimitadas
  // A. Descripción
  const descMatch = bodyContent.match(/<!--\s*SECTION:DESCRIPTION:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:DESCRIPTION:END\s*-->/i);
  if (descMatch) {
    result.description = descMatch[1].trim();
  } else {
    const descHeaderMatch = bodyContent.match(/## Description\r?\n([\s\S]*?)(?=\r?\n## |$)/i);
    if (descHeaderMatch) {
      result.description = descHeaderMatch[1].trim();
    }
  }

  // B. Acceptance Criteria (AC)
  const acMatch = bodyContent.match(/<!--\s*AC:BEGIN\s*-->([\s\S]*?)<!--\s*AC:END\s*-->/i);
  const acText = acMatch ? acMatch[1] : (bodyContent.match(/## Acceptance Criteria\r?\n([\s\S]*?)(?=\r?\n## |$)/i)?.[1] || '');
  
  if (acText) {
    const acLines = acText.split(/\r?\n/);
    const parsedAC: ParsedAcceptanceCriteria[] = [];
    let autoIndex = 1;

    for (const line of acLines) {
      const match = line.match(/^-\s*\[([ xX])\]\s*(?:#(\d+)\s+)?(.*)$/);
      if (match) {
        const checked = match[1].toLowerCase() === 'x';
        const num = match[2] ? parseInt(match[2], 10) : autoIndex++;
        const text = match[3].trim();
        parsedAC.push({ index: num, text, checked });
      }
    }
    result.acceptanceCriteria = parsedAC;
  }

  // C. Implementation Plan
  const planMatch = bodyContent.match(/<!--\s*SECTION:PLAN:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:PLAN:END\s*-->/i);
  if (planMatch) {
    result.implementationPlan = planMatch[1].trim();
  } else {
    const planHeaderMatch = bodyContent.match(/## Implementation Plan\r?\n([\s\S]*?)(?=\r?\n## |$)/i);
    if (planHeaderMatch) {
      result.implementationPlan = planHeaderMatch[1].trim();
    }
  }

  // D. Implementation Notes
  const notesMatch = bodyContent.match(/<!--\s*SECTION:NOTES:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:NOTES:END\s*-->/i);
  if (notesMatch) {
    result.implementationNotes = notesMatch[1].trim();
  }

  // E. Final Summary
  const summaryMatch = bodyContent.match(/<!--\s*SECTION:FINAL_SUMMARY:BEGIN\s*-->([\s\S]*?)<!--\s*SECTION:FINAL_SUMMARY:END\s*-->/i);
  if (summaryMatch) {
    result.finalSummary = summaryMatch[1].trim();
  }

  return result;
}

/**
 * Serializa un objeto BacklogMdTask a un archivo Markdown compatible con el estándar Backlog.md
 */
export function serializeBacklogMd(task: BacklogMdTask): string {
  const frontmatterLines: string[] = ['---'];

  frontmatterLines.push(`id: ${task.id}`);
  frontmatterLines.push(`title: ${JSON.stringify(task.title || 'Sin título')}`);
  frontmatterLines.push(`status: ${formatStatusForMd(task.status)}`);
  
  if (task.assignees && task.assignees.length > 0) {
    frontmatterLines.push('assignee:');
    task.assignees.forEach(a => frontmatterLines.push(`  - ${JSON.stringify(a)}`));
  }

  const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
  frontmatterLines.push(`created_date: '${task.createdDate || nowStr}'`);
  frontmatterLines.push(`updated_date: '${nowStr}'`);

  if (task.labels && task.labels.length > 0) {
    frontmatterLines.push('labels:');
    task.labels.forEach(l => frontmatterLines.push(`  - ${l}`));
  } else {
    frontmatterLines.push('labels: []');
  }

  if (task.dependencies && task.dependencies.length > 0) {
    frontmatterLines.push('dependencies:');
    task.dependencies.forEach(d => frontmatterLines.push(`  - ${d}`));
  } else {
    frontmatterLines.push('dependencies: []');
  }

  frontmatterLines.push(`priority: ${formatPriorityForMd(task.priority || 'p2')}`);

  if (task.type) {
    frontmatterLines.push(`type: ${task.type}`);
  }

  if (task.milestone) {
    frontmatterLines.push(`milestone: ${JSON.stringify(task.milestone)}`);
  }

  if (task.parentId) {
    frontmatterLines.push(`parent: ${JSON.stringify(task.parentId)}`);
  }

  if (task.blocks && task.blocks.length > 0) {
    frontmatterLines.push('blocks:');
    task.blocks.forEach(b => frontmatterLines.push(`  - ${JSON.stringify(b)}`));
  }

  if (task.blockedBy && task.blockedBy.length > 0) {
    frontmatterLines.push('blocked_by:');
    task.blockedBy.forEach(b => frontmatterLines.push(`  - ${JSON.stringify(b)}`));
  }

  if (task.relatedTo && task.relatedTo.length > 0) {
    frontmatterLines.push('related_to:');
    task.relatedTo.forEach(r => frontmatterLines.push(`  - ${JSON.stringify(r)}`));
  }

  if (task.sprints && task.sprints.length > 0) {
    frontmatterLines.push('sprints:');
    task.sprints.forEach(s => frontmatterLines.push(`  - ${JSON.stringify(s)}`));
  }

  if (task.releases && task.releases.length > 0) {
    frontmatterLines.push('releases:');
    task.releases.forEach(r => frontmatterLines.push(`  - ${JSON.stringify(r)}`));
  }

  if (task.rawExtraFrontmatter) {
    for (const [k, v] of Object.entries(task.rawExtraFrontmatter)) {
      if (!['id', 'title', 'status', 'assignee', 'created_date', 'updated_date', 'labels', 'dependencies', 'priority', 'type', 'milestone', 'parent', 'parentid', 'blocks', 'blocked_by', 'blockedby', 'related_to', 'relatedto', 'sprints', 'releases'].includes(k.toLowerCase())) {
        frontmatterLines.push(`${k}: ${JSON.stringify(v)}`);
      }
    }
  }

  frontmatterLines.push('---');
  frontmatterLines.push('');

  // Cuerpo Markdown con secciones delimitadas
  const bodySections: string[] = [];

  // 1. Description
  bodySections.push('## Description\n');
  bodySections.push('<!-- SECTION:DESCRIPTION:BEGIN -->');
  bodySections.push(task.description || 'Sin descripción detallada.');
  bodySections.push('<!-- SECTION:DESCRIPTION:END -->\n');

  // 2. Acceptance Criteria
  bodySections.push('## Acceptance Criteria\n');
  bodySections.push('<!-- AC:BEGIN -->');
  if (task.acceptanceCriteria && task.acceptanceCriteria.length > 0) {
    task.acceptanceCriteria.forEach((ac, i) => {
      const idx = ac.index || (i + 1);
      const mark = ac.checked ? 'x' : ' ';
      bodySections.push(`- [${mark}] #${idx} ${ac.text}`);
    });
  } else {
    bodySections.push('- [ ] #1 Criterio de aceptación inicial definido.');
  }
  bodySections.push('<!-- AC:END -->\n');

  // 3. Implementation Plan
  bodySections.push('## Implementation Plan\n');
  bodySections.push('<!-- SECTION:PLAN:BEGIN -->');
  if (task.implementationPlan) {
    bodySections.push(task.implementationPlan);
  } else {
    bodySections.push('1. Investigar archivos afectados.\n2. Implementar solución y pruebas.\n3. Validar con criterios de aceptación.');
  }
  bodySections.push('<!-- SECTION:PLAN:END -->\n');

  // 4. Implementation Notes (si existen)
  if (task.implementationNotes) {
    bodySections.push('## Implementation Notes\n');
    bodySections.push('<!-- SECTION:NOTES:BEGIN -->');
    bodySections.push(task.implementationNotes);
    bodySections.push('<!-- SECTION:NOTES:END -->\n');
  }

  // 5. Final Summary (si existe)
  if (task.finalSummary) {
    bodySections.push('## Final Summary\n');
    bodySections.push('<!-- SECTION:FINAL_SUMMARY:BEGIN -->');
    bodySections.push(task.finalSummary);
    bodySections.push('<!-- SECTION:FINAL_SUMMARY:END -->\n');
  }

  return `${frontmatterLines.join('\n')}\n${bodySections.join('\n')}`;
}

/**
 * Genera el nombre estándar de archivo para una tarea Backlog.md:
 * e.g. "back-355 - Add-task-type-field.md"
 */
export function generateTaskFilename(id: string, title: string): string {
  const cleanTitle = (title || 'task')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);

  const cleanId = id.toLowerCase();
  return `${cleanId} - ${cleanTitle}.md`;
}

/**
 * Genera un archivo Markdown unificado consolidado (BACKLOG.md) a partir de una lista de tareas.
 */
export function generateMonolithicBacklogMd(projectName: string, items: BacklogMdTask[]): string {
  const now = new Date().toISOString().slice(0, 10);
  const lines: string[] = [
    `# Backlog: ${projectName}`,
    `> Consolidado generado el ${now} por DevBoard ⚡`,
    '',
    '## Resumen de Estados',
    ''
  ];

  const statuses: CanonicalStatus[] = ['doing', 'review', 'ready', 'draft', 'done', 'dismissed'];
  const grouped: Record<CanonicalStatus, BacklogMdTask[]> = {
    doing: [],
    review: [],
    ready: [],
    draft: [],
    done: [],
    dismissed: [],
    cancelled: []
  };

  for (const item of items) {
    const s = item.status || 'draft';
    if (grouped[s]) grouped[s].push(item);
    else grouped.draft.push(item);
  }

  for (const s of statuses) {
    const list = grouped[s];
    if (list.length === 0) continue;

    const titleMap: Record<string, string> = {
      doing: '⚡ In Progress / Doing',
      review: '🔍 Review & QA',
      ready: '🚀 Ready for Deploy',
      draft: '📋 Backlog / Draft',
      done: '✅ Done / Deployed',
      dismissed: '📦 Archivadas / Descartadas'
    };

    lines.push(`### ${titleMap[s] || s.toUpperCase()} (${list.length})`);
    lines.push('');

    for (const item of list) {
      lines.push(`#### [${item.id}] ${item.title}`);
      lines.push(`- **Prioridad**: \`${item.priority || 'p2'}\` | **Tipo**: \`${item.type || 'feature'}\``);
      if (item.milestone) lines.push(`- **Sprint / Milestone**: ${item.milestone}`);
      if (item.description) lines.push(`\n${item.description}\n`);

      if (item.acceptanceCriteria && item.acceptanceCriteria.length > 0) {
        lines.push('**Criterios de Aceptación:**');
        item.acceptanceCriteria.forEach(ac => {
          lines.push(`- [${ac.checked ? 'x' : ' '}] #${ac.index} ${ac.text}`);
        });
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    }
  }

  return lines.join('\n');
}
