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

// Clean up test files
fs.rmSync(testRepoDir, { recursive: true, force: true });
console.log('🧹 Cleaned up test directory');

console.log('🎉 Full verification passed successfully!');
