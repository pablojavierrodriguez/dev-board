import { EventEmitter } from 'node:events';

console.log('🧪 Iniciando prueba de Concurrencia Optimista (DEV-017)...');

const viteConfigModule = await import('../vite.config.ts');
const config = viteConfigModule.default;
const devBoardPlugin = (config.plugins || []).find(p => p && p.name === 'vite-plugin-dev-board-api');

if (!devBoardPlugin || typeof devBoardPlugin.configureServer !== 'function') {
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

// 1. Test GET /api/data to verify mtime presence
const dataRes = await dispatch('GET', '/api/data');
if (dataRes.status !== 200 || !Array.isArray(dataRes.body.items)) {
  throw new Error(`GET /api/data falló con status ${dataRes.status}`);
}

const item = dataRes.body.items[0];
if (!item) {
  throw new Error('No hay ítems en el backlog para probar.');
}

if (typeof item.mtime !== 'number' || item.mtime <= 0) {
  throw new Error(`El ítem ${item.code} no tiene mtime válido: ${item.mtime}`);
}
console.log(`✅ [1/4] Ítems incluyen mtime para optimistic locking: ${item.code} (mtime: ${item.mtime})`);

// 2. Test PUT /api/items/:id con expectedMtime desactualizado -> debe retornar 409 Conflict
const staleMtime = item.mtime - 50000;
const conflictRes = await dispatch('PUT', `/api/items/${item.code}`, {
  title: `${item.title} (Intento conflictivo)`,
  expectedMtime: staleMtime
});

if (conflictRes.status !== 409 || conflictRes.body.error !== 'conflict') {
  throw new Error(`Se esperaba 409 Conflict ante edición con mtime desactualizado, se obtuvo: ${conflictRes.status} ${JSON.stringify(conflictRes.body)}`);
}
console.log(`✅ [2/4] Detección de colisión exitosa: HTTP 409 Conflict recibido (${conflictRes.body.message})`);

// 3. Test PUT /api/items/:id con expectedMtime correcto -> debe guardar (200 OK)
const successRes = await dispatch('PUT', `/api/items/${item.code}`, {
  title: item.title,
  expectedMtime: item.mtime
});

if (successRes.status !== 200 || !successRes.body.ok) {
  throw new Error(`Se esperaba 200 OK ante expectedMtime sincronizado, se obtuvo: ${successRes.status}`);
}
console.log(`✅ [3/4] Guardado exitoso con expectedMtime sincronizado (HTTP 200 OK)`);

// 4. Test PUT /api/items/:id con force: true -> ignora conflicto y sobreescribe
const forceRes = await dispatch('PUT', `/api/items/${item.code}`, {
  title: item.title,
  expectedMtime: staleMtime,
  force: true
});

if (forceRes.status !== 200 || !forceRes.body.ok) {
  throw new Error(`Se esperaba 200 OK con force: true, se obtuvo: ${forceRes.status}`);
}
console.log(`✅ [4/4] Sobreescritura forzada permitida con force: true (HTTP 200 OK)`);

console.log('🎉 DEV-017 (Optimistic Locking & Concurrency) completamente validado!');
process.exit(0);
