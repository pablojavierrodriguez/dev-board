#!/usr/bin/env node

/**
 * DevBoard CLI (Zero-Install Runner - DEV-015 / DEV-026)
 * Usage: npx devboard [--port 4100] [--repo <path>] [--no-open]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');

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
    --init                Inicializar estructura de backlog en el repositorio actual
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

// Register project in projects-registry.json dynamically
const registryFile = path.join(PKG_ROOT, 'data/projects-registry.json');
try {
  let registry = { activeProjectId: '', projects: [] };
  if (fs.existsSync(registryFile)) {
    registry = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
  }
  
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
  
  if (!fs.existsSync(path.dirname(registryFile))) {
    fs.mkdirSync(path.dirname(registryFile), { recursive: true });
  }
  fs.writeFileSync(registryFile, JSON.stringify(registry, null, 2), 'utf8');
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
│  📁 Repositorio:  ${targetRepo.slice(0, 40).padEnd(41)}│
│  📦 Modo Almacén: ${storageType.toUpperCase().padEnd(41)}│
│  🌐 Interfaz Web: ${url.padEnd(41)}│
│  ⚡ Live Sync:    Activa (SSE & Watcher en tiempo real)    │
└────────────────────────────────────────────────────────────┘
  `);

  if (shouldOpen) {
    openBrowser(url);
  }
}

start().catch((err) => {
  console.error('Error al iniciar DevBoard:', err);
  process.exit(1);
});
