import fs from 'node:fs';
import path from 'node:path';
import { getDevBoardHomeDir } from './registryConfig.js';

const CACHE_FILE_NAME = 'update-cache.json';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const GITHUB_REPO = 'pablojavierrodriguez/dev-board';

/**
 * Compares two semver strings (e.g., '0.6.0' > '0.5.0' -> true).
 */
export function semverGreaterThan(target, current) {
  if (!target || !current) return false;
  const cleanT = target.replace(/^v/, '').trim().split('.').map(n => parseInt(n, 10) || 0);
  const cleanC = current.replace(/^v/, '').trim().split('.').map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    const partT = cleanT[i] || 0;
    const partC = cleanC[i] || 0;
    if (partT > partC) return true;
    if (partT < partC) return false;
  }
  return false;
}

/**
 * Returns the path to the update cache file.
 */
export function getUpdateCachePath() {
  if (process.env.DEVBOARD_UPDATE_CACHE_PATH) {
    return path.resolve(process.env.DEVBOARD_UPDATE_CACHE_PATH);
  }
  return path.join(getDevBoardHomeDir(), CACHE_FILE_NAME);
}

/**
 * Reads cached update information.
 */
export function readUpdateCache() {
  try {
    const cachePath = getUpdateCachePath();
    if (!fs.existsSync(cachePath)) return null;
    const content = fs.readFileSync(cachePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Writes update cache to disk safely.
 */
export function writeUpdateCache(data) {
  const cachePath = getUpdateCachePath();
  try {
    const dir = path.dirname(cachePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(cachePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore cache write errors
  }
}

/**
 * Check if update check should be skipped.
 */
export function isUpdateCheckDisabled() {
  const env = process.env.DEVBOARD_NO_UPDATE_CHECK;
  return env === '1' || env === 'true';
}

/**
 * Formats a terminal banner notifying about an available update.
 */
export function formatUpdateBanner(currentVersion, latestVersion) {
  const cleanCurrent = currentVersion.replace(/^v/, '');
  const cleanLatest = latestVersion.replace(/^v/, '');
  const versionLine = `  ✨ ¡Nueva versión disponible!  v${cleanCurrent} → v${cleanLatest}`;
  
  return [
    '┌────────────────────────────────────────────────────────────┐',
    `│${versionLine.padEnd(60)}│`,
    '│                                                            │',
    '│  Instrucciones para actualizar:                            │',
    '│  • Con git: cd <repo> && git pull && npm run build         │',
    '│  • Con npm: npm i -g dev-board@latest                      │',
    '└────────────────────────────────────────────────────────────┘'
  ].join('\n');
}

/**
 * Synchronous check of cache for instant, zero-latency notification.
 */
export function getCachedUpdateInfo(currentVersion) {
  if (isUpdateCheckDisabled()) return null;
  const cached = readUpdateCache();
  if (cached && cached.hasUpdate && cached.latestVersion) {
    if (semverGreaterThan(cached.latestVersion, currentVersion)) {
      return {
        hasUpdate: true,
        currentVersion,
        latestVersion: cached.latestVersion,
        url: cached.url || `https://github.com/${GITHUB_REPO}/releases/latest`
      };
    }
  }
  return null;
}

/**
 * Checks for updates against GitHub Releases.
 * Non-blocking, cached for 24h, silentiable via DEVBOARD_NO_UPDATE_CHECK=1.
 */
export async function checkForUpdates(currentVersion, { force = false, timeoutMs = 2000 } = {}) {
  if (isUpdateCheckDisabled()) {
    return { hasUpdate: false, currentVersion, latestVersion: currentVersion, disabled: true };
  }

  const cached = readUpdateCache();
  const now = Date.now();

  if (!force && cached && cached.lastCheck && (now - cached.lastCheck < CACHE_TTL_MS)) {
    const hasUpdate = semverGreaterThan(cached.latestVersion, currentVersion);
    return {
      hasUpdate,
      currentVersion,
      latestVersion: cached.latestVersion || currentVersion,
      url: cached.url || `https://github.com/${GITHUB_REPO}/releases/latest`,
      fromCache: true
    };
  }

  // Fetch from GitHub Releases API
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DevBoard-CLI',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const rawTag = data.tag_name || data.name || '';
      const latestVersion = rawTag.replace(/^v/, '').trim();
      const hasUpdate = semverGreaterThan(latestVersion, currentVersion);
      const url = data.html_url || `https://github.com/${GITHUB_REPO}/releases/latest`;

      const cacheData = {
        lastCheck: now,
        currentVersion,
        latestVersion,
        hasUpdate,
        url
      };
      writeUpdateCache(cacheData);

      return {
        hasUpdate,
        currentVersion,
        latestVersion,
        url,
        fromCache: false
      };
    } else {
      // On non-200 (rate limited or private), extend lastCheck to avoid repeating
      if (cached) {
        writeUpdateCache({ ...cached, lastCheck: now });
      } else {
        writeUpdateCache({ lastCheck: now, currentVersion, latestVersion: currentVersion, hasUpdate: false });
      }
    }
  } catch {
    // Network error, timeout, or sandbox restriction: extend lastCheck to avoid rapid retries
    if (cached) {
      writeUpdateCache({ ...cached, lastCheck: now });
    } else {
      writeUpdateCache({ lastCheck: now, currentVersion, latestVersion: currentVersion, hasUpdate: false });
    }
  }

  return {
    hasUpdate: cached ? semverGreaterThan(cached.latestVersion, currentVersion) : false,
    currentVersion,
    latestVersion: cached?.latestVersion || currentVersion,
    fromCache: true
  };
}
