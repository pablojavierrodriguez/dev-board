import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEVBOARD_DATA = path.join(__dirname, '../data/dev-board.json');
const REGISTRY_FILE = path.join(__dirname, '../data/projects-registry.json');
const TARGET_REPO = '/Users/adrisol/Pablo/code/m3';
const TARGET_DIR = path.join(TARGET_REPO, '.devboard');
const TARGET_BACKLOG = path.join(TARGET_DIR, 'backlog.json');

export function migrateToRepo() {
  console.log('[DevBoard Migration] Migrating DOM backlog to target repo...');

  if (!fs.existsSync(DEVBOARD_DATA)) {
    console.log('[DevBoard Migration] No legacy dev-board.json found, skipping.');
    return;
  }

  const legacyData = JSON.parse(fs.readFileSync(DEVBOARD_DATA, 'utf8'));
  const domProject = legacyData.projects?.find(p => p.id === 'dom') || {
    id: 'dom',
    name: 'DOM (Personal Finances)',
    codePrefix: 'DOM',
    repoPath: TARGET_REPO,
    description: 'Sistema de gestión financiera personal, multi-divisa, tracking de patrimonio y presupuestos inteligentes.',
    createdAt: '2026-09-01T00:00:00.000Z'
  };

  const domItems = legacyData.items?.filter(i => i.projectId === 'dom') || legacyData.items || [];
  const domReleases = legacyData.releases?.filter(r => r.projectId === 'dom') || legacyData.releases || [];

  const repoBacklog = {
    project: domProject,
    items: domItems,
    releases: domReleases,
    lastUpdated: new Date().toISOString()
  };

  // Ensure .devboard in target repo
  if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
  }

  fs.writeFileSync(TARGET_BACKLOG, JSON.stringify(repoBacklog, null, 2), 'utf8');
  console.log(`[DevBoard Migration] Successfully wrote ${domItems.length} items and ${domReleases.length} releases to: ${TARGET_BACKLOG}`);

  // Create registry in DevBoard
  const registry = {
    activeProjectId: 'dom',
    projects: [
      {
        id: 'dom',
        name: 'DOM (Personal Finances)',
        codePrefix: 'DOM',
        repoPath: TARGET_REPO,
        createdAt: domProject.createdAt || '2026-09-01T00:00:00.000Z'
      },
      {
        id: 'demo',
        name: 'Proyecto Demo (Tour)',
        codePrefix: 'DEMO',
        isDemo: true,
        createdAt: '2026-09-16T00:00:00.000Z'
      }
    ]
  };

  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), 'utf8');
  console.log(`[DevBoard Migration] Registry created at: ${REGISTRY_FILE}`);

  // Remove legacy dev-board.json to ensure zero leak
  fs.unlinkSync(DEVBOARD_DATA);
  console.log('[DevBoard Migration] Legacy data/dev-board.json successfully purged from DevBoard.');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  migrateToRepo();
}
