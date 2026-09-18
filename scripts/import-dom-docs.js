import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const M3_DOCS_DIR = process.env.M3_DOCS_DIR || '/Users/adrisol/Pablo/code/m3/docs';
const DATA_DIR = path.join(__dirname, '../data');
const OUT_FILE = path.join(DATA_DIR, 'dev-board.json');

/**
 * @param {string} [docsDir]
 * @param {string | null} [targetFile]
 * @param {any} [projectMeta]
 * @returns {{ projects: any[], items: any[], releases: any[], lastUpdated: string }}
 */
export function runMigration(docsDir = M3_DOCS_DIR, targetFile = OUT_FILE, projectMeta = null) {
  console.log(`[DevBoard Migrator] Starting migration from: ${docsDir}`);

  if (!fs.existsSync(docsDir)) {
    throw new Error(`Docs directory not found: ${docsDir}`);
  }

  const itemsMap = new Map(); // code -> BacklogItem

  // 1. Parse QUALITY_LOG.md
  const qualityLogPath = path.join(docsDir, 'QUALITY_LOG.md');
  if (fs.existsSync(qualityLogPath)) {
    const content = fs.readFileSync(qualityLogPath, 'utf8');
    parseQualityLog(content, itemsMap);
  } else {
    console.warn(`[DevBoard Migrator] Warning: QUALITY_LOG.md not found at ${qualityLogPath}`);
  }

  // 2. Parse BACKLOG.md
  const backlogPath = path.join(docsDir, 'BACKLOG.md');
  if (fs.existsSync(backlogPath)) {
    const content = fs.readFileSync(backlogPath, 'utf8');
    parseBacklog(content, itemsMap);
  } else {
    console.warn(`[DevBoard Migrator] Warning: BACKLOG.md not found at ${backlogPath}`);
  }

  // 3. Parse specs/ directory
  const specsDir = path.join(docsDir, 'specs');
  if (fs.existsSync(specsDir)) {
    parseSpecs(specsDir, itemsMap);
  }

  // 4. Parse RELEASE_NOTES.md
  const releases = [];
  const releaseNotesPath = path.join(docsDir, 'RELEASE_NOTES.md');
  if (fs.existsSync(releaseNotesPath)) {
    const content = fs.readFileSync(releaseNotesPath, 'utf8');
    const parsedReleases = parseReleaseNotes(content, itemsMap);
    releases.push(...parsedReleases);
  }

  // Convert map to array and assign clean sequential orders
  const items = Array.from(itemsMap.values());
  items.sort((a, b) => {
    // Sort priority: p0 -> p1 -> p2 -> p3, then code
    const pOrder = { p0: 0, p1: 1, p2: 2, p3: 3 };
    if (pOrder[a.priority] !== pOrder[b.priority]) {
      return pOrder[a.priority] - pOrder[b.priority];
    }
    return a.code.localeCompare(b.code, undefined, { numeric: true });
  });

  const project = projectMeta || {
    id: 'dom',
    name: 'DOM (Personal Finances)',
    codePrefix: 'DOM',
    repoPath: '/Users/adrisol/Pablo/code/m3',
    description: 'Sistema de gestión financiera personal, multi-divisa, tracking de patrimonio y presupuestos inteligentes.',
    createdAt: '2026-09-01T00:00:00.000Z'
  };

  items.forEach((item, index) => {
    item.order = index + 1;
    if (projectMeta) {
      item.projectId = projectMeta.id;
    }
  });

  const boardData = {
    projects: [project],
    items,
    releases,
    lastUpdated: new Date().toISOString()
  };

  if (targetFile) {
    if (!fs.existsSync(path.dirname(targetFile))) {
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(boardData, null, 2), 'utf8');
    console.log(`[DevBoard Migrator] Migration successfully written to ${targetFile}`);
  }
  console.log(`[DevBoard Migrator] Summary: ${items.length} items, ${releases.length} releases, 1 project.`);

  return boardData;
}

function parseQualityLog(content, itemsMap) {
  // Extract phase verification details first to enrich items with verification info
  const verificationMap = new Map();
  const phaseLines = content.split('\n');
  for (const line of phaseLines) {
    const match = line.match(/^-\s*\[x\]\s*`?([A-Z0-9_-]+)`?\s*Verificado\s*\((.*?)\)/i);
    if (match) {
      verificationMap.set(match[1].trim(), match[2].trim());
    }
  }

  // Parse markdown table: | ID | Área | Descripción | Archivo Impactado | Severidad | Estado |
  const lines = content.split('\n');
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('| ID') || trimmed.startsWith('|ID')) {
      inTable = true;
      continue;
    }
    if (inTable && trimmed.startsWith('|---')) {
      continue;
    }
    if (inTable && !trimmed.startsWith('|')) {
      inTable = false;
      continue;
    }
    if (inTable && trimmed.startsWith('|')) {
      const cols = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cols.length >= 6) {
        const rawId = cols[0].replace(/\*\*/g, '').replace(/`/g, '').trim();
        const area = cols[1].replace(/\*\*/g, '').trim();
        const desc = cols[2].trim();
        const impactedFile = cols[3].replace(/`/g, '').trim();
        const rawSev = cols[4].replace(/\*\*/g, '').toLowerCase().trim();
        const rawStatus = cols[5].toLowerCase().trim();

        if (!rawId || rawId === 'ID') continue;

        let priority = 'p2';
        if (rawSev.includes('crítica') || rawSev.includes('critica')) priority = 'p0';
        else if (rawSev.includes('alta')) priority = 'p1';
        else if (rawSev.includes('media')) priority = 'p2';
        else if (rawSev.includes('baja')) priority = 'p3';

        let type = 'bug';
        if (rawId.startsWith('UX-')) type = 'ux';
        else if (rawId.startsWith('TEC-')) type = 'tech_debt';

        let status = 'done';
        if (rawStatus.includes('[ ]')) status = 'backlog';

        const code = `DOM-${rawId}`;
        const fixNote = verificationMap.get(rawId) || 'Verificado en suite de estabilización DOM v0.5.0';

        itemsMap.set(rawId, {
          id: `item-${rawId.toLowerCase()}`,
          code,
          projectId: 'dom',
          title: desc.length > 90 ? desc.slice(0, 90) + '...' : desc,
          description: desc,
          type,
          priority,
          status,
          module: area,
          impactedFile: impactedFile !== '—' && impactedFile !== '-' ? impactedFile : undefined,
          fix: fixNote,
          targetRelease: '0.5.0',
          targetSprint: 'Integridad Financiera',
          sourceDoc: 'QUALITY_LOG.md',
          order: itemsMap.size + 1,
          createdAt: '2026-09-10T12:00:00.000Z',
          updatedAt: '2026-09-15T18:00:00.000Z',
          completedAt: status === 'done' ? '2026-09-15T18:00:00.000Z' : undefined,
          releasedAt: status === 'done' ? '2026-09-15T20:00:00.000Z' : undefined
        });
      }
    }
  }
}

function parseBacklog(content, itemsMap) {
  // Track suggested sprints
  const sprintMap = new Map(); // itemId -> { sprint, isResolved }
  const sprintRegex = /### Sprint\s+"([^"]+)"\s*\(([^)]+)\)([\s\S]*?)(?=### Sprint|## |$)/g;
  let sMatch;
  while ((sMatch = sprintRegex.exec(content)) !== null) {
    const sprintName = sMatch[1].trim();
    const sprintBody = sMatch[3];
    const itemLines = sprintBody.split('\n');
    for (const l of itemLines) {
      const lineMatch = l.match(/^-\s*\[([ xX])\]\s*\*\*([A-Z0-9_-]+):?\*\*:?\s*(.*)/);
      if (lineMatch) {
        const isResolved = lineMatch[1].toLowerCase() === 'x';
        const id = lineMatch[2].trim();
        const shortNote = lineMatch[3].trim();
        sprintMap.set(id, { sprint: sprintName, isResolved, shortNote });
      }
    }
  }

  // Parse detailed sections: ### BUG-C1 — Race Condition...
  const sectionRegex = /###\s+([A-Z0-9_-]+)\s+[—-]\s+([^\n]+)([\s\S]*?)(?=\n###\s+[A-Z0-9_-]+\s+[—-]|## |$)/g;
  let match;
  while ((match = sectionRegex.exec(content)) !== null) {
    const rawId = match[1].trim();
    const rawTitle = match[2].trim();
    const body = match[3];

    // Extract Archivo, Problema, Riesgo, Fix
    const fileMatch = body.match(/\*\*Archivo:\*\*\s*(?:\[([^\]]+)\]\([^)]+\)|`([^`]+)`|([^\n]+))/i);
    const probMatch = body.match(/\*\*Problema:\*\*\s*([\s\S]*?)(?=\*\*(?:Riesgo|Fix|Impacto):|\n\n##|$)/i);
    const riskMatch = body.match(/\*\*Riesgo:\*\*\s*([\s\S]*?)(?=\*\*(?:Fix|Problema):|\n\n##|$)/i);
    const fixMatch = body.match(/\*\*Fix:\*\*\s*([\s\S]*?)(?=\*\*(?:Riesgo|Problema):|\n\n##|$)/i);

    const impactedFile = fileMatch ? (fileMatch[1] || fileMatch[2] || fileMatch[3] || '').trim() : undefined;
    const problema = probMatch ? probMatch[1].trim() : '';
    const riesgo = riskMatch ? riskMatch[1].trim() : '';
    const fix = fixMatch ? fixMatch[1].trim() : '';

    let type = 'bug';
    if (rawId.startsWith('FEAT-')) type = 'feature';
    else if (rawId.startsWith('TEC-')) type = 'tech_debt';
    else if (rawId.startsWith('UX-')) type = 'ux';

    let priority = 'p2';
    if (rawId.startsWith('BUG-C')) priority = 'p0';
    else if (rawId.startsWith('BUG-A')) priority = 'p1';
    else if (rawId.startsWith('TEC-M') || rawId.startsWith('UX-M')) priority = 'p2';
    else if (rawId.startsWith('FEAT-S')) priority = 'p1';

    const sprintInfo = sprintMap.get(rawId);
    let targetSprint = sprintInfo ? sprintInfo.sprint : undefined;
    let status = 'backlog';

    if (sprintInfo) {
      status = sprintInfo.isResolved ? 'done' : 'backlog';
      if (sprintInfo.sprint.includes('P0')) priority = 'p0';
      else if (sprintInfo.sprint.includes('P1')) priority = 'p1';
      else if (sprintInfo.sprint.includes('P2')) priority = 'p2';
      else if (sprintInfo.sprint.includes('P3')) priority = 'p3';
      else if (sprintInfo.sprint.includes('P4')) priority = 'p3';
    }

    // Determine module from title / file
    let module = 'Core / Store';
    if (impactedFile) {
      if (impactedFile.includes('supabase') || impactedFile.includes('sql')) module = 'Base de Datos / RLS';
      else if (impactedFile.includes('sync') || impactedFile.includes('offline')) module = 'Sincronización Offline';
      else if (impactedFile.includes('components') || impactedFile.includes('pages')) module = 'UI / Ergonomía';
      else if (impactedFile.includes('rules')) module = 'Reglas / Automatización';
      else if (impactedFile.includes('forecast') || impactedFile.includes('cashflow')) module = 'Multi-Divisa / Proyección';
    } else {
      if (type === 'feature') module = 'Arquitectura / Features';
      else if (type === 'tech_debt') module = 'Deuda Técnica / Rendimiento';
    }

    // Check if item already exists from QUALITY_LOG.md
    if (itemsMap.has(rawId)) {
      const existing = itemsMap.get(rawId);
      // Enrich with detailed info
      existing.title = rawTitle || existing.title;
      if (problema) existing.description = `${existing.description}\n\n${problema}`;
      if (riesgo) existing.risk = riesgo;
      if (fix) existing.fix = `${existing.fix ? existing.fix + '\n\n' : ''}${fix}`;
      if (impactedFile && !existing.impactedFile) existing.impactedFile = impactedFile;
      if (targetSprint) existing.targetSprint = targetSprint;
      if (sprintInfo && sprintInfo.isResolved) existing.status = 'done';
    } else {
      // New item from BACKLOG.md
      itemsMap.set(rawId, {
        id: `item-${rawId.toLowerCase()}`,
        code: `DOM-${rawId}`,
        projectId: 'dom',
        title: rawTitle,
        description: problema || rawTitle,
        type,
        priority,
        status,
        module,
        impactedFile,
        risk: riesgo || undefined,
        fix: fix || undefined,
        targetSprint,
        targetRelease: status === 'done' ? '0.5.0' : (status === 'backlog' ? '0.6.0' : undefined),
        sourceDoc: 'BACKLOG.md',
        order: itemsMap.size + 1,
        createdAt: '2026-09-12T10:00:00.000Z',
        updatedAt: '2026-09-15T18:00:00.000Z',
        completedAt: status === 'done' ? '2026-09-15T18:00:00.000Z' : undefined,
        releasedAt: status === 'done' ? '2026-09-15T20:00:00.000Z' : undefined
      });
    }
  }
}

function parseSpecs(specsDir, itemsMap) {
  const files = fs.readdirSync(specsDir).filter(f => f.endsWith('.md'));

  for (const file of files) {
    const filePath = path.join(specsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract title (first # Heading)
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].replace(/—.*$/, '').replace(/–.*$/, '').trim() : file.replace('.md', '');

    // Extract summary or first paragraph
    const paras = content.split('\n\n').map(p => p.trim()).filter(p => p && !p.startsWith('#'));
    const description = paras.length > 0 ? paras.slice(0, 2).join('\n\n') : 'Especificación técnica y requerimientos.';

    // Derive code
    let code = `DOM-${file.replace('.md', '').toUpperCase()}`;
    const specNumMatch = file.match(/SPEC-(\d+)/i);
    if (specNumMatch) {
      code = `DOM-SPEC-${specNumMatch[1]}`;
    }

    let type = 'feature';
    if (file.includes('BENCHMARK') || file.includes('DISCOVERY')) type = 'tech_debt';
    if (file.includes('brand') || file.includes('a11y') || file.includes('design')) type = 'ux';

    let module = 'Especificaciones & Arquitectura';
    if (file.includes('supabase') || file.includes('sync')) module = 'Sincronización Offline';
    else if (file.includes('receipt') || file.includes('csv')) module = 'Ingesta & Archivos';
    else if (file.includes('whatsapp') || file.includes('bot')) module = 'Agentes & Canales';
    else if (file.includes('budget') || file.includes('goals')) module = 'Presupuestos & Metas';
    else if (file.includes('cashflow') || file.includes('multicurrency')) module = 'Finanzas & Proyección';

    const itemId = `spec-${file.replace('.md', '').toLowerCase()}`;

    itemsMap.set(itemId, {
      id: itemId,
      code,
      projectId: 'dom',
      title,
      description: description.length > 500 ? description.slice(0, 500) + '...' : description,
      type,
      priority: file.includes('SPEC-001') || file.includes('SPEC-029') ? 'p1' : 'p2',
      status: 'ideas',
      module,
      sourceDoc: `specs/${file}`,
      order: itemsMap.size + 1,
      createdAt: '2026-09-05T00:00:00.000Z',
      updatedAt: '2026-09-15T00:00:00.000Z'
    });
  }
}

function parseReleaseNotes(content, itemsMap) {
  const releases = [];
  // Parse ## [0.5.0] — 2026-09-15 🚀 <Title>
  const releaseMatch = content.match(/##\s+\[([0-9.]+)\]\s+[—-]\s+([0-9-]+)\s+(?:🚀\s+)?([^\n]+)/);
  if (releaseMatch) {
    const version = releaseMatch[1];
    const date = releaseMatch[2];
    const title = releaseMatch[3].trim();

    // Extract Resumen
    const summaryMatch = content.match(/### 🎯 Resumen\s*\n\*?([^\n]+(?:\n[^\n#]+)*)\*?/);
    const summary = summaryMatch ? summaryMatch[1].replace(/\*/g, '').trim() : '';

    // Collect all items completed in v0.5.0
    const itemCodes = [];
    for (const item of itemsMap.values()) {
      if (item.status === 'done' || item.targetRelease === '0.5.0') {
        itemCodes.push(item.code);
      }
    }

    releases.push({
      id: `rel-${version.replace(/\./g, '-')}`,
      projectId: 'dom',
      version,
      date,
      title,
      summary,
      itemCodes,
      markdownContent: content.trim(),
      createdAt: `${date}T20:00:00.000Z`
    });
  }

  return releases;
}

// Auto-run when executed directly via CLI
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    runMigration();
  } catch (err) {
    console.error('[DevBoard Migrator] Error during migration:', err);
    process.exit(1);
  }
}
