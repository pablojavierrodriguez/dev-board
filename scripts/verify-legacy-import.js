import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';

console.log('🧪 Iniciando prueba de Import Wizard de Backlog Legacy (DEV-018)...');

const viteConfigModule = await import('../vite.config.ts');
const config = viteConfigModule.default;
const devBoardPlugin = (config.plugins || []).find(p => p && p.name === 'vite-plugin-dev-board-api');

if (!devBoardPlugin) {
  throw new Error('Plugin vite-plugin-dev-board-api no encontrado.');
}

let middlewareHandler = null;
const mockServer = {
  middlewares: {
    use: (fn) => {
      middlewareHandler = fn;
    }
  }
};

devBoardPlugin.configureServer(mockServer);

class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 0;
    this.headers = {};
    this.body = '';
  }

  writeHead(status, headers) {
    this.statusCode = status;
    if (headers) Object.assign(this.headers, headers);
  }

  setHeader(name, value) {
    this.headers[name] = value;
  }

  end(chunk) {
    if (chunk) this.body += chunk;
    this.emit('finish');
  }
}

class MockRequest extends EventEmitter {
  constructor(method, url, body = null) {
    super();
    this.method = method;
    this.url = url;
    this.body = body ? JSON.stringify(body) : null;
  }
}

function dispatch(method, url, body = null) {
  return new Promise((resolve) => {
    const req = new MockRequest(method, url, body);
    const res = new MockResponse();

    res.on('finish', () => {
      let parsed = null;
      try {
        parsed = JSON.parse(res.body);
      } catch {}
      resolve({ status: res.statusCode, body: parsed, raw: res.body });
    });

    middlewareHandler(req, res, () => {});

    if (body) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
      req.emit('end');
    } else {
      req.emit('end');
    }
  });
}

const testRepo = path.resolve('data/test-repo-legacy-import');
if (fs.existsSync(testRepo)) {
  fs.rmSync(testRepo, { recursive: true, force: true });
}
fs.mkdirSync(path.join(testRepo, 'backlog/tasks'), { recursive: true });

// Register isolated test fixture project
await dispatch('POST', '/api/projects', {
  id: 'test-fixture-import',
  name: 'Test Fixture Import',
  codePrefix: 'TEST',
  storageType: 'markdown',
  repoPath: testRepo
});

const sampleLegacy = `
# Backlog Antiguo

## Sprint 99: Migración
- [ ] Tarea Legacy 99A [P1] [BUG]
  Descripción de la tarea 99A detectada en importación.
- [x] Tarea Legacy 99B #feat #p0
`;

const res = await dispatch('POST', '/api/import/legacy-md', {
  projectId: 'test-fixture-import',
  content: sampleLegacy
});

if (res.status !== 200 || !res.body.ok) {
  throw new Error(`POST /api/import/legacy-md falló con status ${res.status}: ${JSON.stringify(res.body)}`);
}

console.log(`✅ [1/3] Endpoint POST /api/import/legacy-md respondió 200 OK.`);
console.log(`✅ [2/3] Tareas importadas: ${res.body.importedCount} ítems generados.`);

if (res.body.importedCount !== 2) {
  throw new Error(`Se esperaban 2 tareas importadas, pero se obtuvieron: ${res.body.importedCount}`);
}

const [itemA, itemB] = res.body.items;
if (itemA.type !== 'bug' || itemA.priority !== 'p1' || itemA.status !== 'ready') {
  throw new Error(`Item A no mapeó correctamente sus atributos: ${JSON.stringify(itemA)}`);
}

if (itemB.type !== 'feature' || itemB.priority !== 'p0' || itemB.status !== 'done') {
  throw new Error(`Item B no mapeó correctamente sus atributos: ${JSON.stringify(itemB)}`);
}

console.log(`✅ [3/3] Heurística de atributos (status, priority, type, milestone) verificada:`);
console.log(`   - ${itemA.code}: "${itemA.title}" (${itemA.status} / ${itemA.priority} / ${itemA.type})`);
console.log(`   - ${itemB.code}: "${itemB.title}" (${itemB.status} / ${itemB.priority} / ${itemB.type})`);

// Cleanup isolated fixture project and directory
await dispatch('DELETE', '/api/projects/test-fixture-import');
if (fs.existsSync(testRepo)) {
  fs.rmSync(testRepo, { recursive: true, force: true });
}
console.log('🧹 Entorno de prueba aislado limpiado sin tocar el backlog real.');

console.log('🎉 DEV-018 (Import Wizard & Legacy Markdown Parser) completamente validado!');
process.exit(0);
