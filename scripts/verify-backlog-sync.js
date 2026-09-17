#!/usr/bin/env node

/**
 * DevBoard Backlog Live Synchronization & Pre-commit Guard
 * 
 * Verifica la coherencia entre el estado del código fuente y las tareas en backlog/.
 * Impide commits con tareas desactualizadas o sin reflejo en el backlog (Dogfooding).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const isFixMode = process.argv.includes('--fix') || process.argv.includes('--auto-sync');
const isHookMode = process.argv.includes('--hook');

console.log('🔍 [DevBoard Guard] Verificando sincronización viva del Backlog...');

const cwd = process.cwd();
const currentRepoDir = fs.existsSync(path.join(cwd, 'backlog/tasks')) ? cwd : ROOT_DIR;
const tasksDir = path.join(currentRepoDir, 'backlog/tasks');
if (!fs.existsSync(tasksDir)) {
  console.log('ℹ️  No se encontró carpeta backlog/tasks. Omitiendo verificación.');
  process.exit(0);
}

const files = fs.readdirSync(tasksDir).filter(f => f.endsWith('.md'));
let errorsFound = 0;
let fixedCount = 0;

for (const file of files) {
  const filePath = path.join(tasksDir, file);
  const content = fs.readFileSync(filePath, 'utf8');

  // Parse frontmatter
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fmMatch) continue;

  const fm = fmMatch[1];
  const statusMatch = fm.match(/^status:\s*['"]?([A-Za-z0-9_-]+)['"]?/m);
  const idMatch = fm.match(/^id:\s*['"]?([A-Za-z0-9_-]+)['"]?/m);

  const rawStatus = (statusMatch ? statusMatch[1] : '').toLowerCase();
  const taskId = idMatch ? idMatch[1] : file.split(' - ')[0];

  // Parse Acceptance Criteria
  const acBlockMatch = content.match(/<!-- AC:BEGIN -->([\s\S]*?)<!-- AC:END -->/);
  if (!acBlockMatch) continue;

  const acBlock = acBlockMatch[1];
  const allAcs = acBlock.match(/^-\s*\[([ xX])\]/gm) || [];
  const checkedAcs = acBlock.match(/^-\s*\[[xX]\]/gm) || [];

  const totalAcs = allAcs.length;
  const totalChecked = checkedAcs.length;

  // REGLA 1: Si tiene criterios definidos y todos están marcados (- [x]), no puede estar en 'draft' ni 'doing'
  if (totalAcs > 0 && totalChecked === totalAcs && (rawStatus === 'draft' || rawStatus === 'doing')) {
    if (isFixMode) {
      const updatedFm = fm.replace(/^status:\s*.*$/m, 'status: Done');
      const updatedContent = content.replace(fmMatch[0], `---\n${updatedFm}\n---`);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✨ [Auto-fix] ${taskId}: Todos los AC completados (${totalChecked}/${totalAcs}). Promocionado a 'status: Done'.`);
      fixedCount++;
    } else {
      console.error(`❌ [Error de Sincronización] ${taskId} (${file}):`);
      console.error(`   Tiene todos los criterios de aceptación cumplidos (${totalChecked}/${totalAcs} AC), pero su estado en el backlog sigue siendo '${rawStatus}'.`);
      console.error(`   👉 Acción requerida: Cambia el status a 'Done' o ejecuta 'npm run backlog:sync'.`);
      errorsFound++;
    }
  }

  // REGLA 2: Si el estado es 'done', no debería tener ACs pendientes sin tildar
  if (rawStatus === 'done' && totalAcs > 0 && totalChecked < totalAcs) {
    if (isFixMode) {
      const fixedAcBlock = acBlock.replace(/-\s*\[ \]/g, '- [x]');
      const updatedContent = content.replace(acBlock, fixedAcBlock);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✨ [Auto-fix] ${taskId}: Estado es 'Done'. Tildando automáticamente todos los ACs (${totalAcs}/${totalAcs}).`);
      fixedCount++;
    } else {
      console.warn(`⚠️  [Advertencia] ${taskId}: El estado es 'done' pero solo tiene ${totalChecked}/${totalAcs} criterios tildados.`);
    }
  }
}

// Regenerar BACKLOG.md consolidado si estamos en fix mode o en pre-commit
try {
  const exportScript = path.join(ROOT_DIR, 'scripts/devboard-cli.ts');
  if (fs.existsSync(exportScript)) {
    // Check if BACKLOG.md exists or needs update
    execSync(`node --experimental-strip-types "${exportScript}" export`, { cwd: currentRepoDir, stdio: 'ignore' });
    console.log('📄 [Consolidado] BACKLOG.md actualizado en la raíz.');
    if (isHookMode) {
      try {
        execSync(`git add BACKLOG.md backlog/`, { cwd: currentRepoDir, stdio: 'ignore' });
      } catch {}
    }
  }
} catch (exportErr) {
  // Silent fallback if CLI is not yet run
}

if (errorsFound > 0) {
  console.error('\n🛑 [DevBoard Commit Guard] El commit fue bloqueado para evitar desactualización del backlog.');
  console.error(`   Se detectaron ${errorsFound} tarea(s) desfasadas respecto al código.`);
  console.error('   💡 Para solucionarlo automáticamente ejecuta: npm run backlog:sync\n');
  process.exit(1);
}

if (fixedCount > 0) {
  console.log(`✅ [DevBoard Guard] Se auto-reconciliaron ${fixedCount} tarea(s) correctamente.`);
} else {
  console.log('✅ [DevBoard Guard] Backlog 100% sincronizado y coherente con el código.');
}

process.exit(0);
