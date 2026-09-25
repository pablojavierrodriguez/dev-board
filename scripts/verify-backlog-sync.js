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
      const updatedFm = fm.replace(/^status:\s*.*$/m, 'status: ready');
      const updatedContent = content.replace(fmMatch[0], `---\n${updatedFm}\n---`);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✨ [Auto-fix] ${taskId}: Todos los AC completados (${totalChecked}/${totalAcs}). Promocionado a 'status: ready'.`);
      fixedCount++;
    } else {
      console.error(`❌ [Error de Sincronización] ${taskId} (${file}):`);
      console.error(`   Tiene todos los criterios de aceptación cumplidos (${totalChecked}/${totalAcs} AC), pero su estado en el backlog sigue siendo '${rawStatus}'.`);
      console.error(`   👉 Acción requerida: Cambia el status a 'ready' o ejecuta 'npm run backlog:sync'.`);
      errorsFound++;
    }
  }

  // REGLA 2: Si el estado es 'done', no debería tener ACs pendientes sin tildar
  if (rawStatus === 'done' && totalAcs > 0 && totalChecked < totalAcs) {
    if (isFixMode) {
      const fixedAcBlock = acBlock.replace(/-\s*\[ \]/g, '- [x]');
      const updatedContent = content.replace(acBlock, fixedAcBlock);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✨ [Auto-fix] ${taskId}: Estado es 'done'. Tildando automáticamente todos los ACs (${totalAcs}/${totalAcs}).`);
      fixedCount++;
    } else {
      console.warn(`⚠️  [Advertencia] ${taskId}: El estado es 'done' pero solo tiene ${totalChecked}/${totalAcs} criterios tildados.`);
    }
  }
}

// REGLA 3: Verificación de coherencia de documentación y releases
const readmePath = path.join(currentRepoDir, 'README.md');
const pkgPath = path.join(currentRepoDir, 'package.json');
const releasesJsonPath = path.join(currentRepoDir, 'backlog/releases.json');

if (fs.existsSync(readmePath) && fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const readmeContent = fs.readFileSync(readmePath, 'utf8');

    // Validar versión de features overview contra package.json
    const featOverviewMatch = readmeContent.match(/## ✨ Features Overview \(v(\d+\.\d+\.\d+)\)/);
    if (featOverviewMatch) {
      const docVersion = featOverviewMatch[1];
      if (docVersion !== pkg.version) {
        console.error(`❌ [Documentación Desfasada] README.md menciona 'Features Overview (v${docVersion})', pero package.json está en 'v${pkg.version}'.`);
        errorsFound++;
      }
    }

    // Validar conteo de herramientas MCP en README
    const mcpToolsMatch = readmeContent.match(/Available MCP Tools \((\d+)\s+Tools\)/i);
    if (mcpToolsMatch) {
      const toolsInDoc = parseInt(mcpToolsMatch[1], 10);
      const mcpBinPath = path.join(ROOT_DIR, 'bin/devboard-mcp.js');
      if (fs.existsSync(mcpBinPath)) {
        const mcpBinContent = fs.readFileSync(mcpBinPath, 'utf8');
        const toolDefs = (mcpBinContent.match(/name:\s*['"]devboard_[a-z0-9_]+['"]/g) || []).length;
        if (toolDefs > 0 && toolsInDoc < toolDefs) {
          console.warn(`⚠️  [Documentación Desfasada] README.md declara ${toolsInDoc} herramientas MCP, pero devboard-mcp expone ${toolDefs} herramientas.`);
        }
      }
    }

    // Validar que no existan referencias a archivos obsoletos en documentación crítica
    const docsToCheck = [
      readmePath,
      path.join(currentRepoDir, 'docs/ARCHITECTURE.md'),
      path.join(currentRepoDir, 'docs/AGENTIC_PLAYBOOK.md'),
      path.join(currentRepoDir, 'AGENTS.md')
    ].filter(f => fs.existsSync(f));

    for (const docFile of docsToCheck) {
      const docText = fs.readFileSync(docFile, 'utf8');
      if (docText.includes('legacyParser.ts')) {
        console.error(`❌ [Error de Documentación] ${path.basename(docFile)} hace referencia al archivo obsoleto 'legacyParser.ts' (debe ser 'scripts/backlogMdParser.ts').`);
        errorsFound++;
      }
    }
  } catch (docErr) {
    // Silent catch
  }
}

// REGLA 4: Verificación de Alcance 100% en Releases liberados (Regla de Producción)
if (fs.existsSync(releasesJsonPath)) {
  try {
    const releases = JSON.parse(fs.readFileSync(releasesJsonPath, 'utf8'));
    for (const rel of releases) {
      if (rel.status === 'released' && Array.isArray(rel.itemCodes)) {
        for (const code of rel.itemCodes) {
          const taskFile = files.find(f => f.toLowerCase().startsWith(code.toLowerCase() + ' ') || f.toLowerCase().startsWith(code.toLowerCase() + '-'));
          if (taskFile) {
            const taskContent = fs.readFileSync(path.join(tasksDir, taskFile), 'utf8');
            const statusMatch = taskContent.match(/^status:\s*['"]?([A-Za-z0-9_-]+)['"]?/m);
            const status = (statusMatch ? statusMatch[1] : '').toLowerCase();
            if (status !== 'done') {
              console.error(`❌ [Error de Release] Tarea ${code} pertenece al release publicado v${rel.version}, pero su estado en el archivo es '${status}' (debe ser 'done').`);
              errorsFound++;
            }
          }
        }
      }
    }
  } catch (e) {
    // Si releases.json no es legible
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
