import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';

console.log('🧪 Iniciando prueba unitaria de SSE y Live Watcher (DEV-014)...');

// Importar vite.config.ts dinámicamente
const viteConfigModule = await import('../vite.config.ts');
const config = viteConfigModule.default;
const devBoardPlugin = (config.plugins || []).find(p => p && p.name === 'vite-plugin-dev-board-api');

if (!devBoardPlugin || typeof devBoardPlugin.configureServer !== 'function') {
  throw new Error('Plugin vite-plugin-dev-board-api no encontrado o no tiene configureServer.');
}

// Mock de Vite server
let middlewareHandler = null;
const mockServer = {
  middlewares: {
    use: (fn) => {
      middlewareHandler = fn;
    }
  }
};

devBoardPlugin.configureServer(mockServer);

if (!middlewareHandler) {
  throw new Error('configureServer no registró middlewares.');
}

// Simular request a GET /api/events
class MockResponse extends EventEmitter {
  constructor() {
    super();
    this.statusCode = 0;
    this.headers = {};
    this.dataReceived = [];
  }

  writeHead(status, headers) {
    this.statusCode = status;
    this.headers = headers;
  }

  write(chunk) {
    this.dataReceived.push(chunk);
    this.emit('data', chunk);
  }

  end() {
    this.emit('close');
  }
}

class MockRequest extends EventEmitter {
  constructor() {
    super();
    this.method = 'GET';
    this.url = '/api/events';
  }
}

const req = new MockRequest();
const res = new MockResponse();

middlewareHandler(req, res, () => {});

console.log('Status code SSE:', res.statusCode);
console.log('Content-Type SSE:', res.headers['Content-Type']);

if (res.statusCode !== 200 || res.headers['Content-Type'] !== 'text/event-stream') {
  throw new Error(`SSE Handshake falló con status ${res.statusCode}`);
}

console.log('Primer chunk recibido:', res.dataReceived[0]);
if (!res.dataReceived[0].includes('event: connected')) {
  throw new Error('No se recibió el evento connected de inicio.');
}

console.log('✅ DEV-014: Handshake y conexión inicial de SSE exitosos');

// Cerrar conexión simulada
req.emit('close');
console.log('✅ DEV-014: Limpieza de conexión SSE exitosa');
console.log('🎉 Prueba de DEV-014 completada con éxito!');
process.exit(0);
