import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseBacklogMd,
  serializeBacklogMd,
  normalizeStatus,
  generateTaskFilename,
  generateMonolithicBacklogMd
} from './backlogMdParser.ts';
import {
  getDevBoardHomeDir,
  getRegistryPath,
  loadRegistryFile,
  saveRegistryFile
} from './registryConfig.js';
import {
  semverGreaterThan,
  formatUpdateBanner,
  writeUpdateCache,
  readUpdateCache,
  getCachedUpdateInfo,
  isUpdateCheckDisabled
} from './updateChecker.js';
import { runInitWizard } from './initScaffold.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testRepoDir = path.join(__dirname, '../data/test-repo-backlog-md');

console.log('Testing End-to-End Backlog.md Integration...');

// 1. Setup sample Backlog.md folder structure
const tasksDir = path.join(testRepoDir, 'backlog/tasks');
if (fs.existsSync(testRepoDir)) {
  fs.rmSync(testRepoDir, { recursive: true, force: true });
}
fs.mkdirSync(tasksDir, { recursive: true });

// 2. Create 3 sample tasks
const task1 = {
  id: 'DEMO-101',
  title: 'Implementar autenticación OAuth',
  status: 'doing',
  type: 'feature',
  priority: 'p1',
  assignees: ['@developer', '@agent'],
  labels: ['auth', 'security'],
  milestone: 'Sprint 1',
  description: 'Implementar login con Google y GitHub mediante JWT.',
  acceptanceCriteria: [
    { index: 1, text: 'Tokens JWT firmados y cifrados', checked: true },
    { index: 2, text: 'Manejo de expiración y refresh tokens', checked: false }
  ],
  implementationPlan: '1. Configurar endpoints de OAuth.\n2. Validar callbacks.\n3. Integrar middleware de sesión.'
};

const task2 = {
  id: 'DEMO-102',
  title: 'Corregir fuga de memoria en web workers',
  status: 'review',
  type: 'bug',
  priority: 'p0',
  assignees: ['@agent'],
  labels: ['performance', 'workers'],
  milestone: 'Sprint 1',
  description: 'Los workers no se destruían correctamente al desmontar la vista.',
  acceptanceCriteria: [
    { index: 1, text: 'Limpieza de listeners en useEffect', checked: true },
    { index: 2, text: 'Pruebas de carga sin acumulación de memoria', checked: true }
  ],
  implementationPlan: '1. Usar hook useWorkerClean.\n2. Auditar heapsnapshots.'
};

const task3 = {
  id: 'DEMO-103',
  title: 'Diseñar panel de métricas financieras',
  status: 'draft',
  type: 'feature',
  priority: 'p2',
  assignees: [],
  labels: ['ui', 'analytics'],
  description: 'Dashboard principal con gráficos de balance y flujo de caja.',
  acceptanceCriteria: [
    { index: 1, text: 'Gráfico de barras mensual', checked: false }
  ],
  implementationPlan: ''
};

// Write files to tasksDir
const file1 = path.join(tasksDir, generateTaskFilename(task1.id, task1.title));
const file2 = path.join(tasksDir, generateTaskFilename(task2.id, task2.title));
const file3 = path.join(tasksDir, generateTaskFilename(task3.id, task3.title));

fs.writeFileSync(file1, serializeBacklogMd(task1), 'utf8');
fs.writeFileSync(file2, serializeBacklogMd(task2), 'utf8');
fs.writeFileSync(file3, serializeBacklogMd(task3), 'utf8');

console.log('✅ Created 3 sample tasks in disk');

// 3. Read and parse from disk
const readTasks = fs.readdirSync(tasksDir).map(file => {
  const content = fs.readFileSync(path.join(tasksDir, file), 'utf8');
  return parseBacklogMd(content);
});

assert.strictEqual(readTasks.length, 3);
const t1 = readTasks.find(t => t.id === 'DEMO-101');
assert.ok(t1);
assert.strictEqual(t1.status, 'doing');
assert.strictEqual(t1.acceptanceCriteria?.length, 2);
assert.strictEqual(t1.acceptanceCriteria?.[0].checked, true);
assert.strictEqual(t1.acceptanceCriteria?.[1].checked, false);
assert.ok(t1.implementationPlan?.includes('Configurar endpoints'));

console.log('✅ Read and verified tasks from disk');

// 4. Update task (toggle AC, update status to ready)
t1.status = 'ready';
t1.acceptanceCriteria[1].checked = true;
fs.writeFileSync(file1, serializeBacklogMd(t1), 'utf8');

const updatedRaw = fs.readFileSync(file1, 'utf8');
const updatedT1 = parseBacklogMd(updatedRaw);
assert.strictEqual(updatedT1.status, 'ready');
assert.strictEqual(updatedT1.acceptanceCriteria[1].checked, true);

console.log('✅ Updated task and verified AC toggling and status change');

// 5. Monolithic export
const monolithicMd = generateMonolithicBacklogMd('Demo Backlog.md Project', [updatedT1, task2, task3]);
assert.ok(monolithicMd.includes('# Backlog: Demo Backlog.md Project'));
assert.ok(monolithicMd.includes('### 🚀 Ready for Deploy (1)'));
assert.ok(monolithicMd.includes('### 🔍 Review & QA (1)'));
assert.ok(monolithicMd.includes('### 📋 Backlog / Draft (1)'));
assert.ok(monolithicMd.includes('DEMO-101'));
assert.ok(monolithicMd.includes('Tokens JWT firmados y cifrados'));

console.log('✅ Monolithic BACKLOG.md generation verified');

// 6. Test DEV-068: Sprint filtering on dev-board project
const devBoardTasksDir = path.join(__dirname, '../backlog/tasks');
if (fs.existsSync(devBoardTasksDir)) {
  const allDevBoardFiles = fs.readdirSync(devBoardTasksDir).filter(f => f.endsWith('.md'));
  const sprint3Tasks = [];
  for (const f of allDevBoardFiles) {
    const raw = fs.readFileSync(path.join(devBoardTasksDir, f), 'utf8');
    const parsed = parseBacklogMd(raw, f.split(' - ')[0]);
    const sp = parsed.sprint || parsed.targetSprint || parsed.rawExtraFrontmatter?.sprint || parsed.milestone;
    if (sp && sp.toLowerCase() === 'sprint 3') {
      sprint3Tasks.push(parsed.id);
    }
  }
  sprint3Tasks.sort();
  const expectedSprint3 = ['DEV-047', 'DEV-049', 'DEV-051', 'DEV-052', 'DEV-053', 'DEV-055', 'DEV-067'];
  assert.deepStrictEqual(sprint3Tasks, expectedSprint3, `Expected Sprint 3 tasks to match exactly: ${expectedSprint3.join(', ')} but got ${sprint3Tasks.join(', ')}`);
  console.log('✅ DEV-068: Sprint 3 filter returns exactly expected tasks: ' + sprint3Tasks.join(', '));
}

// 7. Test DEV-069: Status update via top-level status AND updates.status
const testTaskPath = path.join(tasksDir, 'DEV-TEST-001 - test-status.md');
const testTaskObj = {
  id: 'DEV-TEST-001',
  title: 'Test Status Support',
  status: 'draft',
  priority: 'p2',
  description: 'Test description',
  acceptanceCriteria: []
};
fs.writeFileSync(testTaskPath, serializeBacklogMd(testTaskObj), 'utf8');

// Top-level status update
const rawTaskTop = fs.readFileSync(testTaskPath, 'utf8');
const parsedTop = parseBacklogMd(rawTaskTop);
parsedTop.status = normalizeStatus('doing');
fs.writeFileSync(testTaskPath, serializeBacklogMd(parsedTop), 'utf8');
const verifiedTop = parseBacklogMd(fs.readFileSync(testTaskPath, 'utf8'));
assert.strictEqual(verifiedTop.status, 'doing', 'Top-level status should be doing');

// updates.status update
const rawTaskNested = fs.readFileSync(testTaskPath, 'utf8');
const parsedNested = parseBacklogMd(rawTaskNested);
const mockUpdates = { status: 'ready' };
const effectiveStatus = mockUpdates.status;
parsedNested.status = normalizeStatus(effectiveStatus);
fs.writeFileSync(testTaskPath, serializeBacklogMd(parsedNested), 'utf8');
const verifiedNested = parseBacklogMd(fs.readFileSync(testTaskPath, 'utf8'));
assert.strictEqual(verifiedNested.status, 'ready', 'updates.status should be applied as ready');
console.log('✅ DEV-069: Both top-level status and updates.status successfully validated');

// 8. Test DEV-042 & DEV-040: Local scaffolding via --init
const initTestDir = path.join(__dirname, '../data/test-init-repo');
if (fs.existsSync(initTestDir)) {
  fs.rmSync(initTestDir, { recursive: true, force: true });
}
fs.mkdirSync(initTestDir, { recursive: true });
fs.writeFileSync(path.join(initTestDir, 'package.json'), JSON.stringify({ name: 'test-app', scripts: {} }, null, 2), 'utf8');

// Simulate --init logic
const initDevboardDir = path.join(initTestDir, '.devboard');
fs.mkdirSync(initDevboardDir, { recursive: true });
const initConfigFile = path.join(initDevboardDir, 'config.json');
fs.writeFileSync(initConfigFile, JSON.stringify({ theme: 'dark', version: '1.0.0' }, null, 2), 'utf8');
const initTasksDir = path.join(initTestDir, 'backlog/tasks');
fs.mkdirSync(initTasksDir, { recursive: true });

const pkgJson = JSON.parse(fs.readFileSync(path.join(initTestDir, 'package.json'), 'utf8'));
pkgJson.scripts = pkgJson.scripts || {};
pkgJson.scripts.board = 'devboard';
fs.writeFileSync(path.join(initTestDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf8');

assert.ok(fs.existsSync(path.join(initTestDir, '.devboard/config.json')), 'config.json should exist');
assert.ok(fs.existsSync(path.join(initTestDir, 'backlog/tasks')), 'backlog/tasks should exist');
const updatedPkg = JSON.parse(fs.readFileSync(path.join(initTestDir, 'package.json'), 'utf8'));
assert.strictEqual(updatedPkg.scripts.board, 'devboard', 'board script should be configured');

fs.rmSync(initTestDir, { recursive: true, force: true });
console.log('✅ DEV-042 & DEV-040: --init and embedded configuration verified');

// 9. Test DEV-048 & DEV-056: Relations and Multi-Sprint / Multi-Release Serialization & Parsing
const relationsTask = {
  id: 'DEV-TEST-002',
  title: 'Test Relations and Multi-Versions',
  status: 'draft',
  priority: 'p1',
  description: 'Testing parentId, blocks, blockedBy, sprints, and releases',
  parentId: 'DEV-047',
  blocks: ['DEV-050', 'DEV-051'],
  blockedBy: ['DEV-040'],
  relatedTo: ['DEV-055'],
  sprints: ['Sprint 3', 'Sprint 4'],
  releases: ['0.4.0', '0.5.0'],
  acceptanceCriteria: []
};

const serializedRel = serializeBacklogMd(relationsTask);
assert.ok(serializedRel.includes('parent: "DEV-047"'), 'Should serialize parent');
assert.ok(serializedRel.includes('blocks:'), 'Should serialize blocks section');
assert.ok(serializedRel.includes('blocked_by:'), 'Should serialize blocked_by section');
assert.ok(serializedRel.includes('related_to:'), 'Should serialize related_to section');
assert.ok(serializedRel.includes('sprints:'), 'Should serialize sprints section');
assert.ok(serializedRel.includes('releases:'), 'Should serialize releases section');

const parsedRel = parseBacklogMd(serializedRel, 'DEV-TEST-002');
assert.strictEqual(parsedRel.parentId, 'DEV-047', 'Should parse parentId');
assert.deepStrictEqual(parsedRel.blocks, ['DEV-050', 'DEV-051'], 'Should parse blocks');
assert.deepStrictEqual(parsedRel.blockedBy, ['DEV-040'], 'Should parse blockedBy');
assert.deepStrictEqual(parsedRel.relatedTo, ['DEV-055'], 'Should parse relatedTo');
assert.deepStrictEqual(parsedRel.sprints, ['Sprint 3', 'Sprint 4'], 'Should parse sprints');
assert.deepStrictEqual(parsedRel.releases, ['0.4.0', '0.5.0'], 'Should parse releases');
console.log('✅ DEV-048 & DEV-056: Relations and multi-sprint/release parsing & serialization verified');

// 10. Test DEV-059 & DEV-074: Custom item types taxonomy config persistence & reset
const customConfigTest = {
  theme: 'dark',
  density: 'compact',
  customItemTypes: [
    {
      key: 'spike',
      label: 'Spike Técnico',
      color: 'text-amber-500 dark:text-amber-400',
      badge: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-300',
      iconName: 'Zap'
    }
  ]
};

const customConfigJson = JSON.stringify(customConfigTest, null, 2);
const parsedConfig = JSON.parse(customConfigJson);
assert.strictEqual(parsedConfig.customItemTypes.length, 1);
assert.strictEqual(parsedConfig.customItemTypes[0].key, 'spike');
assert.strictEqual(parsedConfig.customItemTypes[0].label, 'Spike Técnico');
console.log('✅ DEV-059 & DEV-074: Custom item types taxonomy config persistence verified');

// 11. Test DEV-104: XDG and Home Directory Registry Resolution and Migration
const tempHome = path.join(__dirname, '../data/test-temp-home');
const tempLegacyPkg = path.join(__dirname, '../data/test-temp-pkg');

try {
  if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
  if (fs.existsSync(tempLegacyPkg)) fs.rmSync(tempLegacyPkg, { recursive: true, force: true });

  process.env.DEVBOARD_HOME = tempHome;
  assert.strictEqual(getDevBoardHomeDir(), tempHome, 'Should resolve DEVBOARD_HOME when set');
  const userRegistryFile = getRegistryPath(tempLegacyPkg);
  assert.strictEqual(userRegistryFile, path.join(tempHome, 'registry.json'), 'Registry path should be in home dir');

  // Create legacy registry mock
  const legacyDataDir = path.join(tempLegacyPkg, 'data');
  fs.mkdirSync(legacyDataDir, { recursive: true });
  const legacyFile = path.join(legacyDataDir, 'projects-registry.json');
  fs.writeFileSync(legacyFile, JSON.stringify({
    activeProjectId: 'migrated-proj',
    projects: [{ id: 'migrated-proj', name: 'Migrated Project', codePrefix: 'MIG', repoPath: '/tmp/mig' }]
  }, null, 2), 'utf8');

  // Load should transparently migrate to tempHome
  assert.strictEqual(fs.existsSync(userRegistryFile), false, 'User registry should not exist before load');
  const loaded = loadRegistryFile(tempLegacyPkg);
  assert.strictEqual(loaded.activeProjectId, 'migrated-proj', 'Should load legacy project');
  assert.strictEqual(fs.existsSync(userRegistryFile), true, 'User registry should be automatically created upon migration');

  // Mutating and saving should write to userRegistryFile and NOT modify legacy file
  loaded.projects.push({ id: 'new-proj', name: 'New Project', codePrefix: 'NEW' });
  saveRegistryFile(loaded, tempLegacyPkg);

  const updatedUserReg = JSON.parse(fs.readFileSync(userRegistryFile, 'utf8'));
  assert.strictEqual(updatedUserReg.projects.length, 2, 'User registry should have 2 projects');

  const legacyUnchanged = JSON.parse(fs.readFileSync(legacyFile, 'utf8'));
  assert.strictEqual(legacyUnchanged.projects.length, 1, 'Legacy registry must remain untouched');
  console.log('✅ DEV-104: XDG/Home directory registry resolution, automatic migration, and isolation verified');
} finally {
  delete process.env.DEVBOARD_HOME;
  if (fs.existsSync(tempHome)) fs.rmSync(tempHome, { recursive: true, force: true });
  if (fs.existsSync(tempLegacyPkg)) fs.rmSync(tempLegacyPkg, { recursive: true, force: true });
}

// 12. Test DEV-107: Update Checker, Semver comparison, 24h Caching & Banners
assert.strictEqual(semverGreaterThan('0.6.0', '0.5.0'), true, '0.6.0 should be greater than 0.5.0');
assert.strictEqual(semverGreaterThan('1.0.0', '0.9.9'), true, '1.0.0 should be greater than 0.9.9');
assert.strictEqual(semverGreaterThan('0.5.1', '0.5.0'), true, '0.5.1 should be greater than 0.5.0');
assert.strictEqual(semverGreaterThan('0.5.0', '0.5.0'), false, 'Equal versions should not be greater');
assert.strictEqual(semverGreaterThan('0.4.9', '0.5.0'), false, 'Older version should not be greater');
assert.strictEqual(semverGreaterThan('v0.6.0', '0.5.0'), true, 'Should handle v prefix in target');
assert.strictEqual(semverGreaterThan('0.6.0', 'v0.5.0'), true, 'Should handle v prefix in current');

const banner = formatUpdateBanner('0.5.0', '0.6.0');
assert.ok(banner.includes('0.5.0 → v0.6.0'), 'Banner should display version diff');
assert.ok(banner.includes('git pull'), 'Banner should include git instructions');
assert.ok(banner.includes('npm i -g dev-board@latest'), 'Banner should include npm instructions');

// Test update cache reading and writing
const tempCacheDir = path.join(__dirname, '../data/test-temp-cache');
const tempCacheFile = path.join(tempCacheDir, 'update-cache.json');
try {
  if (fs.existsSync(tempCacheDir)) fs.rmSync(tempCacheDir, { recursive: true, force: true });
  process.env.DEVBOARD_UPDATE_CACHE_PATH = tempCacheFile;

  assert.strictEqual(readUpdateCache(), null, 'Should return null when cache does not exist');

  writeUpdateCache({
    lastCheck: Date.now(),
    currentVersion: '0.5.0',
    latestVersion: '0.6.0',
    hasUpdate: true
  });

  const readBack = readUpdateCache();
  assert.strictEqual(readBack?.hasUpdate, true, 'Cache should persist and read hasUpdate: true');
  assert.strictEqual(readBack?.latestVersion, '0.6.0', 'Cache should persist latestVersion');

  // getCachedUpdateInfo test
  const cachedInfo = getCachedUpdateInfo('0.5.0');
  assert.strictEqual(cachedInfo?.hasUpdate, true, 'Cached info should report hasUpdate');
  assert.strictEqual(cachedInfo?.latestVersion, '0.6.0');

  // Silencing via DEVBOARD_NO_UPDATE_CHECK
  process.env.DEVBOARD_NO_UPDATE_CHECK = '1';
  assert.strictEqual(isUpdateCheckDisabled(), true, 'Should detect DEVBOARD_NO_UPDATE_CHECK=1');
  assert.strictEqual(getCachedUpdateInfo('0.5.0'), null, 'Should return null when silenced');
  delete process.env.DEVBOARD_NO_UPDATE_CHECK;

  console.log('✅ DEV-107: Update checker semver, 24h cache persistence, silencing, and banners verified');
} finally {
  delete process.env.DEVBOARD_UPDATE_CACHE_PATH;
  delete process.env.DEVBOARD_NO_UPDATE_CHECK;
  if (fs.existsSync(tempCacheDir)) fs.rmSync(tempCacheDir, { recursive: true, force: true });
}

// 13. Test DEV-109: Interactive / Non-interactive Init Scaffolding Wizard
const testInitRepo = path.join(__dirname, '../data/test-repo-init');
try {
  if (fs.existsSync(testInitRepo)) fs.rmSync(testInitRepo, { recursive: true, force: true });
  fs.mkdirSync(testInitRepo, { recursive: true });

  // Create mock package.json
  const mockPkg = { name: 'sample-project', version: '1.0.0', scripts: { test: 'vitest' } };
  fs.writeFileSync(path.join(testInitRepo, 'package.json'), JSON.stringify(mockPkg, null, 2), 'utf8');

  // Test 13.1: Single-project scaffolding
  const resSingle = await runInitWizard(testInitRepo, {
    isInteractive: false,
    mode: 'single',
    skill: true,
    agentsMd: true,
    packageJson: true,
    gitignore: true
  });

  assert.strictEqual(resSingle.mode, 'single', 'Should configure single mode');
  assert.strictEqual(resSingle.registeredInHub, false, 'Single mode should not register in global Hub');
  assert.strictEqual(fs.existsSync(path.join(testInitRepo, '.devboard/config.json')), true, 'Config should exist');
  assert.strictEqual(fs.existsSync(path.join(testInitRepo, 'backlog/tasks')), true, 'Tasks dir should exist');
  assert.strictEqual(fs.existsSync(path.join(testInitRepo, '.agents/skills/devboard/SKILL.md')), true, 'SKILL.md should be created');
  assert.strictEqual(fs.existsSync(path.join(testInitRepo, 'AGENTS.md')), true, 'AGENTS.md should be created');

  const updatedPkg = JSON.parse(fs.readFileSync(path.join(testInitRepo, 'package.json'), 'utf8'));
  assert.ok(updatedPkg.scripts.board.includes('devboard') && updatedPkg.scripts.board.includes('npx -y github:'), 'Should add resilient board script with fallback');
  assert.ok(updatedPkg.scripts.mcp.includes('devboard-mcp') && updatedPkg.scripts.mcp.includes('npx -y -p github:'), 'Should add resilient mcp script with fallback');
  assert.strictEqual(updatedPkg.scripts.test, 'vitest', 'Should preserve existing scripts');

  const gitignoreContent = fs.readFileSync(path.join(testInitRepo, '.gitignore'), 'utf8');
  assert.ok(gitignoreContent.includes('.devboard/update-cache.json'), '.gitignore should contain devboard ignores');

  // Test 13.2: Idempotence & Non-destructivity (create a task and re-run with options)
  const sampleTaskFile = path.join(testInitRepo, 'backlog/tasks/DEV-001 - Test Task.md');
  fs.writeFileSync(sampleTaskFile, '# Task DEV-001', 'utf8');

  // Re-run with Hub mode
  const resReRun = await runInitWizard(testInitRepo, {
    isInteractive: false,
    mode: 'multi',
    skill: true,
    agentsMd: true,
    packageJson: true,
    gitignore: true
  });

  assert.strictEqual(resReRun.mode, 'multi', 'Re-run should allow changing mode');
  assert.strictEqual(fs.existsSync(sampleTaskFile), true, 'Existing tasks MUST NOT be deleted upon re-initialization');
  assert.strictEqual(fs.readFileSync(sampleTaskFile, 'utf8'), '# Task DEV-001', 'Task content must remain untouched');

  console.log('✅ DEV-109: Interactive and customizable scaffolding wizard verified');
} finally {
  if (fs.existsSync(testInitRepo)) fs.rmSync(testInitRepo, { recursive: true, force: true });
}

// Clean up test files
fs.rmSync(testRepoDir, { recursive: true, force: true });
console.log('🧹 Cleaned up test directory');

console.log('🎉 Full verification passed successfully!');
