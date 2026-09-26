#!/usr/bin/env node

/**
 * DevBoard CLI (Zero-Install Runner - DEV-015 / DEV-026)
 * Usage: npx devboard [--port 4100] [--repo <path>] [--no-open]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { loadRegistryFile, saveRegistryFile, getRegistryPath } from '../scripts/registryConfig.js';
import { formatUpdateBanner, checkForUpdates, getCachedUpdateInfo } from '../scripts/updateChecker.js';
import { runInitWizard } from '../scripts/initScaffold.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');
const pkgJson = JSON.parse(fs.readFileSync(path.join(PKG_ROOT, 'package.json'), 'utf8'));
const currentVersion = pkgJson.version || '0.5.0';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  🚀 DevBoard CLI - Cockpit Ágil para Desarrollo Pair-Programming con IA
  
  Uso:
    npx devboard [opciones]
    devboard [opciones] (o dev-board)

  Opciones:
    --port, -p <puerto>   Puerto para el servidor web (por defecto: 4100)
    --host <host>         Host de enlace (por defecto: localhost)
    --repo, -r <ruta>     Ruta del repositorio a gestionar (por defecto: process.cwd())
    --no-open             No abrir el navegador automáticamente
    --init                Iniciar asistente interactivo de configuración y scaffolding
    --yes, -y             Aceptar opciones por defecto sin preguntas (para CI / no interactivo)
    --help, -h            Muestra esta ayuda
  `);
  process.exit(0);
}

// Parse options
let port = 4100;
const portIdx = args.findIndex(a => a === '--port' || a === '-p');
if (portIdx !== -1 && args[portIdx + 1]) {
  port = parseInt(args[portIdx + 1], 10) || 4100;
}

let host = 'localhost';
const hostIdx = args.findIndex(a => a === '--host');
if (hostIdx !== -1 && args[hostIdx + 1]) {
  host = args[hostIdx + 1];
}

let targetRepo = process.cwd();
const repoIdx = args.findIndex(a => a === '--repo' || a === '-r');
if (repoIdx !== -1 && args[repoIdx + 1]) {
  targetRepo = path.resolve(args[repoIdx + 1]);
}

const shouldOpen = !args.includes('--no-open');

// Set Single-Project or Multi-Project mode (DEV-041)
const isHub = args.includes('--hub') || args.includes('--multi');
process.env.DEVBOARD_MODE = isHub ? 'multi' : 'single';
process.env.DEVBOARD_TARGET_REPO = targetRepo;

// DEV-042 & DEV-109: Handle --init flag to bootstrap .devboard/, backlog/, skills, AGENTS.md, gitignore
if (args.includes('--init')) {
  const isYes = args.includes('--yes') || args.includes('-y') || args.includes('--defaults');
  const isHubInit = args.includes('--hub') || args.includes('--multi');
  const isSingleInit = args.includes('--single');
  
  await runInitWizard(targetRepo, {
    yes: isYes,
    mode: isHubInit ? 'multi' : (isSingleInit ? 'single' : undefined),
    skill: args.includes('--no-skill') ? false : (args.includes('--skill') ? true : undefined),
    agentsMd: args.includes('--no-agents') ? false : (args.includes('--agents') ? true : undefined),
    packageJson: args.includes('--no-scripts') ? false : (args.includes('--scripts') ? true : undefined),
    gitignore: args.includes('--no-gitignore') ? false : (args.includes('--gitignore') ? true : undefined),
    force: args.includes('--force')
  });
  process.exit(0);
}

// Detect project storage
const tasksDir = path.join(targetRepo, 'backlog/tasks');
const jsonBacklog = path.join(targetRepo, '.devboard/backlog.json');
let storageType = 'markdown';

if (fs.existsSync(tasksDir)) {
  storageType = 'markdown';
} else if (fs.existsSync(jsonBacklog)) {
  storageType = 'json';
} else {
  // Initialize minimal distributed markdown structure if not present
  try {
    fs.mkdirSync(tasksDir, { recursive: true });
    storageType = 'markdown';
  } catch (err) {
    // Ignore if readonly or sandbox
  }
}

// Register project in ~/.devboard/registry.json dynamically (DEV-104)
try {
  const registry = loadRegistryFile(PKG_ROOT);
  
  const projectName = path.basename(targetRepo);
  const projectId = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
  const codePrefix = projectName.substring(0, 4).toUpperCase();
  
  const existingIdx = registry.projects.findIndex(p => p.id === projectId || (p.repoPath && path.resolve(p.repoPath) === targetRepo));
  const projectMeta = {
    id: projectId,
    name: projectName,
    codePrefix,
    repoPath: targetRepo,
    storageType,
    backlogDir: 'backlog',
    createdAt: new Date().toISOString()
  };

  if (existingIdx !== -1) {
    registry.projects[existingIdx] = { ...registry.projects[existingIdx], ...projectMeta };
  } else {
    registry.projects.unshift(projectMeta);
  }
  registry.activeProjectId = projectId;
  
  saveRegistryFile(registry, PKG_ROOT);
} catch (err) {
  // Gracefully continue
}

// Open browser helper
function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} ${url}`, (err) => {
    if (err) console.log(`Para acceder abre tu navegador en: ${url}`);
  });
}

// Start Vite server
async function start() {
  const { createServer } = await import('vite');
  
  const server = await createServer({
    root: PKG_ROOT,
    configFile: path.resolve(PKG_ROOT, 'vite.config.ts'),
    server: {
      port,
      host,
      strictPort: false
    }
  });

  await server.listen();
  const address = server.httpServer?.address();
  const actualPort = typeof address === 'object' && address?.port ? address.port : port;
  const url = `http://${host}:${actualPort}`;

  console.log(`
┌────────────────────────────────────────────────────────────┐
│  🚀 DevBoard - Tablero Ágil de Desarrollo con IA           │
│                                                            │
│  📁 Repositorio:  ${targetRepo.slice(0, 39).padEnd(41)}│
│  📦 Almacén:      ${storageType.toUpperCase().padEnd(41)}│
│  🌐 Interfaz Web: ${url.padEnd(41)}│
│  ⚡ En Tiempo Real: Activo (SSE y observador de archivos)   │
└────────────────────────────────────────────────────────────┘
  `);

  const cachedUpdate = getCachedUpdateInfo(currentVersion);
  if (cachedUpdate && cachedUpdate.hasUpdate) {
    console.log(formatUpdateBanner(currentVersion, cachedUpdate.latestVersion) + '\n');
  }

  // Non-blocking background check for newer releases (cached for 24h)
  checkForUpdates(currentVersion).then((res) => {
    if (res.hasUpdate && !cachedUpdate?.hasUpdate) {
      console.log('\n' + formatUpdateBanner(currentVersion, res.latestVersion) + '\n');
    }
  }).catch(() => {});

  if (shouldOpen) {
    openBrowser(url);
  }
}

start().catch((err) => {
  console.error('Error al iniciar DevBoard:', err);
  process.exit(1);
});
