import esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const BIN_DIR = path.join(ROOT_DIR, 'bin');

if (!fs.existsSync(BIN_DIR)) {
  fs.mkdirSync(BIN_DIR, { recursive: true });
}

console.log('📦 Empaquetando ejecutables standalone para distribución (DEV-015 y DEV-016)...');

// 1. Bundle mcp-server.ts into bin/devboard-mcp.js (Zero-flags, Node 18+ native)
await esbuild.build({
  entryPoints: [path.join(ROOT_DIR, 'scripts/mcp-server.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: path.join(BIN_DIR, 'devboard-mcp.js'),
  external: ['fsevents']
});

// Set executable permissions
fs.chmodSync(path.join(BIN_DIR, 'devboard-mcp.js'), 0o755);
console.log('✅ bin/devboard-mcp.js generado con éxito (DEV-016).');
