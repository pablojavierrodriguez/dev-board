import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';
import { loadRegistryFile, saveRegistryFile } from './registryConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');

/**
 * Embedded canonical SKILL.md template for consumer repositories
 */
export function getSkillTemplate() {
  const sourceSkill = path.join(PKG_ROOT, '.agents/skills/devboard/SKILL.md');
  if (fs.existsSync(sourceSkill)) {
    try {
      return fs.readFileSync(sourceSkill, 'utf8');
    } catch {}
  }

  return `---
name: devboard
description: Skill de DevBoard para gestión ágil y Backlog.md. Guía a agentes de IA y LLMs para consultar, tomar, actualizar, planificar y completar tareas del backlog usando el servidor MCP o archivos Markdown nativos.
---

# DevBoard Agent Skill

Esta skill instruye a agentes de IA y LLMs para interactuar con **DevBoard**, el cockpit ágil local y motor compatible con el estándar **Backlog.md**.

## 1. Configuración del Servidor MCP

DevBoard incluye un servidor MCP autónomo sobre \`stdio\` (\`devboard-mcp\`). Para integrarlo en Antigravity, Cursor o Claude Code:

### Opción A: Mediante npm run (Recomendado en este repositorio)
\`\`\`json
{
  "mcpServers": {
    "devboard": {
      "command": "npm",
      "args": ["run", "mcp"]
    }
  }
}
\`\`\`

### Opción B: Mediante binario global (si instalaste con \`npm install -g\`)
\`\`\`json
{
  "mcpServers": {
    "devboard": {
      "command": "devboard-mcp"
    }
  }
}
\`\`\`

### Opción C: Mediante npx directo desde GitHub
\`\`\`json
{
  "mcpServers": {
    "devboard": {
      "command": "npx",
      "args": ["-y", "-p", "github:pablojavierrodriguez/dev-board", "devboard-mcp"]
    }
  }
}
\`\`\`

## 2. Herramientas MCP Disponibles

| Tool | Propósito | Parámetros Clave |
| :--- | :--- | :--- |
| **\`devboard_list_tasks\`** | Obtiene la lista de tareas del proyecto activo. | \`openOnly\`, \`status\`, \`format\`, \`search\` |
| **\`devboard_get_task\`** | Lee el detalle completo de una tarea y sus AC. | \`taskId\` (ej: \`"DEV-001"\`) |
| **\`devboard_create_task\`** | Registra una nueva tarea en el backlog. | \`title\`, \`description\`, \`type\`, \`priority\`, \`acceptanceCriteria\` |
| **\`devboard_update_task\`** | Actualiza estado, plan o tilda criterios (AC). | \`taskId\`, \`status\`, \`toggleAcIndex\`, \`implementationPlan\` |
| **\`devboard_sync_backlog\`** | Audita y reconcilia tareas desfasadas con criterios de aceptación. | \`autoFix\` |
| **\`devboard_get_stats\`** | Obtiene métricas de salud y progreso. | Ninguno |

## 3. Reglas de Interacción para Agentes
1. Dogfooding: Toda modificación debe asociarse a una tarea en \`backlog/tasks/\`.
2. Pasar tarea a \`doing\` antes de escribir código.
3. Tildar criterios de aceptación paso a paso con \`devboard_update_task\`.
4. El estado terminal del agente es \`ready\` (nunca \`done\` por cuenta propia).
`;
}

/**
 * Embedded canonical AGENTS.md template for consumer repositories
 */
export function getAgentsMdTemplate(projectName) {
  return `# Guía de Contribución para Agentes de IA (AGENTS.md)

Bienvenido a **${projectName}**. Al trabajar en este repositorio, tanto agentes de IA (Antigravity, Cursor, Claude Code) como desarrolladores humanos deben adherirse a las siguientes normas:

## 1. Dogfooding y Backlog Vivo
- **Toda modificación de código debe estar asociada a una tarea en \`backlog/tasks/\`**.
- Pasa la tarea a \`doing\` antes de comenzar a codificar.
- Tilda los criterios de aceptación (\`- [x]\`) en vivo a medida que se cumplan.
- **Límite Canónico del Desarrollo: Sólo hasta \`ready\`**. El agente NUNCA promueve una tarea a \`done\` durante el sprint. El estado \`ready\` (Ready for Release) es el estado terminal del desarrollo en el sprint.
- El estado \`done\` pertenece exclusivamente al Release formalmente liberado.
- Incluye el archivo \`.md\` de la tarea en el mismo commit que el código.

## 2. Servidor MCP de DevBoard
Usa las herramientas de DevBoard (\`devboard-mcp\` o \`npm run mcp\`):
- \`devboard_list_tasks\`: Lista y filtra tareas con mínimo consumo de tokens.
- \`devboard_get_task\`: Lee detalles y criterios de aceptación.
- \`devboard_update_task\`: Actualiza estado, plan y tilda criterios secuencialmente.
- \`devboard_sync_backlog\`: Reconcilia tareas y regenera \`BACKLOG.md\` automáticamente.

## 3. Salvaguarda Pre-Commit y Soberanía del Desarrollador
- **Prohibido \`git commit\` por deducción**: El agente solo prepara los cambios en el árbol de trabajo y valida pruebas y tipado (\`tsc\`). Se ejecuta \`git commit\` **única y exclusivamente ante una orden textual y explícita del usuario**.
- **Cero Releases Falsos**: Pertenecer a un sprint no implica tener versión asignada. Los campos de release permanecen sin asignar hasta decisión expresa del usuario.
`;
}

/**
 * Runs the interactive or non-interactive init wizard.
 */
export async function runInitWizard(targetRepo = process.cwd(), options = {}) {
  const isInteractive = options.isInteractive !== false && process.stdin.isTTY && !options.yes;
  const projectName = path.basename(targetRepo);

  console.log(`
┌────────────────────────────────────────────────────────────┐
│  🚀 DevBoard - Asistente de Inicialización de Repositorio  │
│                                                            │
│  📁 Repositorio:  ${targetRepo.slice(0, 40).padEnd(41)}│
└────────────────────────────────────────────────────────────┘
  `);

  let mode = options.mode || (options.hub ? 'multi' : 'single');
  let installSkill = options.skill !== undefined ? options.skill : true;
  let installAgentsMd = options.agentsMd !== undefined ? options.agentsMd : true;
  let updatePkgJson = options.packageJson !== undefined ? options.packageJson : true;
  let updateGitignore = options.gitignore !== undefined ? options.gitignore : true;

  if (isInteractive) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    try {
      console.log('  Configuración inicial personalizada:\n');

      // Question 1: Mode
      const modeAnswer = await rl.question(
        '  1. Modo de Instanciación:\n' +
        '     [1] Mono-Proyecto (Recomendado: tablero aislado y autocontenido para este repo)\n' +
        '     [2] Multi-Proyecto (Registrar en el Hub global para verlo junto a otros repositorios)\n' +
        '     Selecciona opción [1]: '
      );
      if (modeAnswer.trim() === '2') {
        mode = 'multi';
      } else {
        mode = 'single';
      }

      // Pregunta 2: Skill
      const skillAnswer = await rl.question('\n  2. ¿Instalar skill para agentes (.agents/skills/devboard/SKILL.md)? (S/n) [S]: ');
      installSkill = skillAnswer.trim().toLowerCase() !== 'n';

      // Question 3: AGENTS.md
      const agentsAnswer = await rl.question('  3. ¿Generar guía de gobernanza para agentes (AGENTS.md)? (S/n) [S]: ');
      installAgentsMd = agentsAnswer.trim().toLowerCase() !== 'n';

      // Question 4: package.json scripts
      const pkgAnswer = await rl.question('  4. ¿Configurar scripts de inicio ("board", "mcp") en package.json? (S/n) [S]: ');
      updatePkgJson = pkgAnswer.trim().toLowerCase() !== 'n';

      // Question 5: .gitignore
      const gitignoreAnswer = await rl.question('  5. ¿Añadir reglas recomendadas a .gitignore? (S/n) [S]: ');
      updateGitignore = gitignoreAnswer.trim().toLowerCase() !== 'n';

    } finally {
      rl.close();
    }
  }

  console.log('\n  ⚙️  Aplicando configuración elegida...\n');
  const results = {
    mode,
    devboardConfig: false,
    tasksDir: false,
    skill: false,
    agentsMd: false,
    packageJson: false,
    gitignore: false,
    registeredInHub: false
  };

  // 1. Ensure .devboard/ directory and config.json
  const devboardDir = path.join(targetRepo, '.devboard');
  if (!fs.existsSync(devboardDir)) {
    fs.mkdirSync(devboardDir, { recursive: true });
  }

  const configFile = path.join(devboardDir, 'config.json');
  let currentConfig = {
    theme: 'dark',
    density: 'comfortable',
    autoSave: true,
    mode,
    kanban: {
      showIdeasByDefault: false,
      showDoneHistoryByDefault: false,
      wipLimits: {
        'col-doing': 0,
        'col-review': 0,
        'col-ready': 0
      }
    },
    version: '1.0.0'
  };

  if (fs.existsSync(configFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      currentConfig = { ...existing, mode };
    } catch {}
  }
  fs.writeFileSync(configFile, JSON.stringify(currentConfig, null, 2) + '\n', 'utf8');
  results.devboardConfig = true;
  console.log(`  ✅ .devboard/config.json guardado (Modo: ${mode === 'single' ? 'Mono-Proyecto' : 'Multi-Proyecto Hub'})`);

  // 2. Ensure backlog/tasks directory (Idempotent and non-destructive)
  const tasksDir = path.join(targetRepo, 'backlog/tasks');
  if (!fs.existsSync(tasksDir)) {
    fs.mkdirSync(tasksDir, { recursive: true });
    console.log('  ✅ Directorio backlog/tasks/ creado para tareas Markdown');
  } else {
    console.log('  ℹ️  Directorio backlog/tasks/ existente preservado');
  }
  results.tasksDir = true;

  // 3. Handle Hub Registration if multi mode, or isolate if single
  if (mode === 'multi') {
    try {
      const registry = loadRegistryFile(PKG_ROOT);
      const projectId = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const codePrefix = projectName.substring(0, 4).toUpperCase();
      const existingIdx = registry.projects.findIndex(p => p.id === projectId || (p.repoPath && path.resolve(p.repoPath) === path.resolve(targetRepo)));

      const meta = {
        id: projectId,
        name: projectName,
        codePrefix,
        repoPath: path.resolve(targetRepo),
        storageType: 'markdown',
        backlogDir: 'backlog',
        createdAt: new Date().toISOString()
      };

      if (existingIdx !== -1) {
        registry.projects[existingIdx] = { ...registry.projects[existingIdx], ...meta };
      } else {
        registry.projects.unshift(meta);
      }
      registry.activeProjectId = projectId;
      saveRegistryFile(registry, PKG_ROOT);
      results.registeredInHub = true;
      console.log('  ✅ Proyecto registrado en el Hub global (~/.devboard/registry.json)');
    } catch (err) {
      console.warn('  ⚠️ No se pudo registrar en el Hub global:', err.message);
    }
  } else {
    console.log('  🔒 Modo Mono-Proyecto activo: Ejecución autocontenida sin dependencias externas');
  }

  // 4. Install Agent Skill
  if (installSkill) {
    const skillDir = path.join(targetRepo, '.agents/skills/devboard');
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    const skillPath = path.join(skillDir, 'SKILL.md');
    fs.writeFileSync(skillPath, getSkillTemplate(), 'utf8');
    results.skill = true;
    console.log('  ✅ Skill para agentes instalada en .agents/skills/devboard/SKILL.md');
  }

  // 5. Generate AGENTS.md
  if (installAgentsMd) {
    const agentsMdPath = path.join(targetRepo, 'AGENTS.md');
    if (!fs.existsSync(agentsMdPath) || options.force) {
      fs.writeFileSync(agentsMdPath, getAgentsMdTemplate(projectName), 'utf8');
      results.agentsMd = true;
      console.log('  ✅ Guía de gobernanza generada en AGENTS.md');
    } else {
      console.log('  ℹ️  AGENTS.md existente preservado');
      results.agentsMd = true;
    }
  }

  // 6. Configure package.json scripts
  if (updatePkgJson) {
    const hostPkgPath = path.join(targetRepo, 'package.json');
    if (fs.existsSync(hostPkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(hostPkgPath, 'utf8'));
        pkg.scripts = pkg.scripts || {};
        let modified = false;

        const canonicalBoard = 'devboard 2>/dev/null || npx -y github:pablojavierrodriguez/dev-board';
        const canonicalMcp = 'devboard-mcp 2>/dev/null || npx -y -p github:pablojavierrodriguez/dev-board devboard-mcp';

        if (!pkg.scripts.board || pkg.scripts.board === 'devboard') {
          pkg.scripts.board = canonicalBoard;
          modified = true;
        }
        if (!pkg.scripts.mcp || pkg.scripts.mcp === 'devboard-mcp') {
          pkg.scripts.mcp = canonicalMcp;
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(hostPkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
          console.log('  ✅ Scripts "board" y "mcp" agregados a package.json');
        } else {
          console.log('  ℹ️  Scripts de package.json ya estaban configurados');
        }
        results.packageJson = true;
      } catch (err) {
        console.warn('  ⚠️ No se pudo actualizar package.json:', err.message);
      }
    }
  }

  // 7. Configure .gitignore
  if (updateGitignore) {
    const gitignorePath = path.join(targetRepo, '.gitignore');
    const ignoreLines = [
      '',
      '# DevBoard local cache',
      '.devboard/update-cache.json',
      '.devboard/*.tmp'
    ].join('\n');

    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (!content.includes('.devboard/update-cache.json')) {
        fs.appendFileSync(gitignorePath, ignoreLines + '\n', 'utf8');
        console.log('  ✅ Reglas de DevBoard añadidas a .gitignore');
      } else {
        console.log('  ℹ️  .gitignore ya contenía las reglas de DevBoard');
      }
    } else {
      fs.writeFileSync(gitignorePath, ignoreLines.trim() + '\n', 'utf8');
      console.log('  ✅ Archivo .gitignore creado con reglas de DevBoard');
    }
    results.gitignore = true;
  }

  console.log(`
┌────────────────────────────────────────────────────────────┐
│  ✨ ¡DevBoard inicializado con éxito!                       │
│                                                            │
│  Para abrir el tablero:                                    │
│  • npm run board                                           │
│    (o directo: npx github:pablojavierrodriguez/dev-board)  │
│                                                            │
│  Para iniciar el servidor MCP:                             │
│  • npm run mcp                                             │
│    (o: npx -p github:pablojavierrodriguez/dev-board devboard-mcp) │
│                                                            │
│  💡 Consejo: Ejecuta 'npm install -g github:pablojavierrodriguez/dev-board' │
│  para usar el comando global directo 'devboard'.           │
└────────────────────────────────────────────────────────────┘
  `);

  return results;
}
