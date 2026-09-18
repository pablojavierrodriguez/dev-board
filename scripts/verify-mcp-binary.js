import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

console.log('🧪 Iniciando prueba de bin/devboard-mcp.js sin flags experimentales (DEV-016 y DEV-023)...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const binaryPath = path.resolve(__dirname, '../bin/devboard-mcp.js');

const child = spawn(process.execPath, [binaryPath], {
  stdio: ['pipe', 'pipe', 'inherit']
});

let stdoutData = '';

child.stdout.on('data', (chunk) => {
  stdoutData += chunk.toString();
});

function send(req) {
  child.stdin.write(JSON.stringify(req) + '\n');
}

// 1. Send initialize
send({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'test-runner', version: '1.0' }
  }
});

// 2. Send tools/list
send({
  jsonrpc: '2.0',
  id: 2,
  method: 'tools/list',
  params: {}
});

// 3. Call devboard_list_releases (DEV-023)
send({
  jsonrpc: '2.0',
  id: 3,
  method: 'tools/call',
  params: {
    name: 'devboard_list_releases',
    arguments: {}
  }
});

// 4. Call devboard_get_stats
send({
  jsonrpc: '2.0',
  id: 4,
  method: 'tools/call',
  params: {
    name: 'devboard_get_stats',
    arguments: {}
  }
});

// 5. Call devboard_sync_backlog (DEV-064)
send({
  jsonrpc: '2.0',
  id: 5,
  method: 'tools/call',
  params: {
    name: 'devboard_sync_backlog',
    arguments: { autoFix: true }
  }
});

setTimeout(() => {
  child.kill();

  const lines = stdoutData.trim().split('\n').filter(Boolean);
  const responses = lines.map(l => {
    try { return JSON.parse(l); } catch { return null; }
  }).filter(Boolean);

  console.log(`📡 Recibidas ${responses.length} respuestas JSON-RPC`);

  const initRes = responses.find(r => r.id === 1);
  if (!initRes || !initRes.result?.serverInfo) {
    throw new Error('Respuesta de initialize no válida');
  }
  console.log(`✅ [1/5] initialize OK: Servidor ${initRes.result.serverInfo.name} v${initRes.result.serverInfo.version}`);

  const toolsRes = responses.find(r => r.id === 2);
  const toolNames = (toolsRes?.result?.tools || []).map(t => t.name);
  if (!toolNames.includes('devboard_list_releases') || !toolNames.includes('devboard_sync_backlog')) {
    throw new Error(`devboard_sync_backlog o releases no encontrado en tools/list: ${toolNames.join(', ')}`);
  }
  console.log(`✅ [2/5] tools/list OK: ${toolNames.length} herramientas disponibles (incluye devboard_sync_backlog, devboard_list_releases)`);

  const releasesRes = responses.find(r => r.id === 3);
  if (!releasesRes || releasesRes.error) {
    throw new Error(`Llamada a devboard_list_releases falló: ${JSON.stringify(releasesRes)}`);
  }
  const releasesData = JSON.parse(releasesRes.result.content[0].text);
  console.log(`✅ [3/5] devboard_list_releases (DEV-023) OK: Total releases: ${releasesData.totalReleases || 0}`);

  const statsRes = responses.find(r => r.id === 4);
  const statsData = JSON.parse(statsRes.result.content[0].text);
  console.log(`✅ [4/5] devboard_get_stats OK: Total tareas: ${statsData.total}, Open: ${statsData.open}, Completion: ${statsData.completionRate}`);

  const syncRes = responses.find(r => r.id === 5);
  if (!syncRes || syncRes.error) {
    throw new Error(`Llamada a devboard_sync_backlog falló: ${JSON.stringify(syncRes)}`);
  }
  const syncData = JSON.parse(syncRes.result.content[0].text);
  console.log(`✅ [5/5] devboard_sync_backlog (DEV-064) OK: Tareas: ${syncData.taskCount}, BacklogPath: ${syncData.backlogPath ? 'presente' : 'null'}`);

  console.log('🎉 DEV-016, DEV-023 y DEV-064 (MCP Hardening & Sync Backlog) completamente validados!');
  process.exit(0);
}, 2000);
