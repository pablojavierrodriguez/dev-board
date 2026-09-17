import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { parseBacklogMd, serializeBacklogMd } from './backlogMdParser.ts';

const TASKS_DIR = path.resolve(process.cwd(), 'backlog/tasks');
const TEST_ID = 'DEV-999';
const ANOMALOUS_FILENAME = 'anomalous-orphan-task-file.md';
const ANOMALOUS_PATH = path.join(TASKS_DIR, ANOMALOUS_FILENAME);

console.log('🧪 Iniciando pruebas de DEV-019 (Resiliencia) y DEV-020 (CLI y token efficiency)...');

// 1. Crear tarea con nombre anómalo sin prefijo de código en el nombre de archivo
const testTask = {
  id: TEST_ID,
  title: 'Tarea de prueba huérfana para resiliencia',
  status: 'draft',
  priority: 'p1',
  type: 'feature',
  createdDate: '2026-09-16',
  updatedDate: '2026-09-16',
  description: 'Esta tarea tiene un nombre de archivo que no sigue el prefijo.',
  acceptanceCriteria: [{ index: 1, text: 'Debe ser encontrada por frontmatter', checked: false }]
};

fs.writeFileSync(ANOMALOUS_PATH, serializeBacklogMd(testTask), 'utf8');
console.log('✅ Creado archivo anómalo:', ANOMALOUS_FILENAME);

try {
  // 2. Verificar que devboard-cli la lista correctamente reconociendo el ID de frontmatter
  const cliOutput = execSync('node --experimental-strip-types scripts/devboard-cli.ts list --open --search "huérfana"', {
    encoding: 'utf8'
  });
  console.log('Salida CLI:\n', cliOutput);
  if (!cliOutput.includes('[DEV-999]') || !cliOutput.includes('Tarea de prueba huérfana')) {
    throw new Error('DEV-019/DEV-020 FAILED: devboard-cli no reconoció la tarea por frontmatter.');
  }
  console.log('✅ DEV-019: CLI reconoció la tarea huérfana por frontmatter YAML');

  // 3. Verificar devboard-cli con --json
  const jsonOutput = execSync('node --experimental-strip-types scripts/devboard-cli.ts list --open --search "DEV-999" --json', {
    encoding: 'utf8'
  });
  const parsed = JSON.parse(jsonOutput);
  if (parsed.items.length !== 1 || parsed.items[0].id !== 'DEV-999') {
    throw new Error('DEV-020 FAILED: devboard-cli --json no retornó el ítem esperado.');
  }
  console.log('✅ DEV-020: Salida JSON estructurada validada');

  // 4. Verificar comando npm run tasks
  const npmTasksOutput = execSync('npm run tasks -- --limit 5', { encoding: 'utf8' });
  if (!npmTasksOutput.includes('DevBoard (Cockpit & Engine)')) {
    throw new Error('npm run tasks no funcionó como se esperaba.');
  }
  console.log('✅ npm run tasks ejecutado exitosamente');

} finally {
  // Limpieza
  if (fs.existsSync(ANOMALOUS_PATH)) {
    fs.unlinkSync(ANOMALOUS_PATH);
  }
  // Limpiar si se renombró canónicamente
  const canonicalPath = path.join(TASKS_DIR, 'DEV-999 - Tarea de prueba huérfana para resiliencia.md');
  if (fs.existsSync(canonicalPath)) {
    fs.unlinkSync(canonicalPath);
  }
  console.log('🧹 Limpieza de archivos de prueba completada');
}

console.log('🎉 Todas las validaciones de DEV-019 y DEV-020 pasaron con éxito!');
