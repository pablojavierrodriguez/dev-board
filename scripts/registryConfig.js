import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_PKG_ROOT = path.resolve(__dirname, '..');

/**
 * Returns the base user directory for DevBoard configuration and state.
 * Respects DEVBOARD_HOME, XDG_CONFIG_HOME, and falls back to ~/.devboard.
 */
export function getDevBoardHomeDir() {
  if (process.env.DEVBOARD_HOME) {
    return path.resolve(process.env.DEVBOARD_HOME);
  }
  if (process.env.XDG_CONFIG_HOME) {
    return path.join(process.env.XDG_CONFIG_HOME, 'devboard');
  }
  return path.join(os.homedir(), '.devboard');
}

/**
 * Returns the resolved path to registry.json.
 */
export function getRegistryPath(pkgRoot = DEFAULT_PKG_ROOT) {
  if (process.env.DEVBOARD_REGISTRY_PATH) {
    return path.resolve(process.env.DEVBOARD_REGISTRY_PATH);
  }
  return path.join(getDevBoardHomeDir(), 'registry.json');
}

/**
 * Returns the legacy registry path in the package root (for migration only).
 */
export function getLegacyRegistryPath(pkgRoot = DEFAULT_PKG_ROOT) {
  if (!pkgRoot) return null;
  return path.join(pkgRoot, 'data/projects-registry.json');
}

/**
 * Loads the project registry.
 * If user registry (~/.devboard/registry.json) exists and has projects, reads it.
 * If not, checks for legacy registry in pkgRoot/data/projects-registry.json,
 * automatically migrating existing projects into user registry.
 */
export function loadRegistryFile(pkgRoot = DEFAULT_PKG_ROOT) {
  const primaryPath = getRegistryPath(pkgRoot);
  const legacyPath = getLegacyRegistryPath(pkgRoot);

  try {
    if (primaryPath && fs.existsSync(primaryPath)) {
      const content = fs.readFileSync(primaryPath, 'utf8');
      const data = JSON.parse(content);
      if (data && Array.isArray(data.projects) && data.projects.length > 0) {
        return data;
      }
    }
  } catch {
    // Permission or read error on primaryPath, fallback to legacy
  }

  // Fallback and transparent migration from legacy PKG_ROOT/data/projects-registry.json
  if (legacyPath) {
    try {
      if (fs.existsSync(legacyPath)) {
        const data = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
        if (data && Array.isArray(data.projects)) {
          // Attempt transparent migration to user directory if writable
          try {
            saveRegistryFile(data, pkgRoot);
          } catch {}
          return data;
        }
      }
    } catch {
      // Ignore legacy corrupt file
    }
  }

  return { activeProjectId: '', projects: [] };
}

/**
 * Persists the project registry to ~/.devboard/registry.json (or XDG path).
 * Falls back to legacy path if home directory is not writable.
 */
export function saveRegistryFile(registry, pkgRoot = DEFAULT_PKG_ROOT) {
  const targetPath = getRegistryPath(pkgRoot);
  const legacyPath = getLegacyRegistryPath(pkgRoot);
  let saved = false;

  try {
    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(registry, null, 2), 'utf8');
    saved = true;
  } catch {
    // Ignore and fallback if target path cannot be written
  }

  if (!saved && legacyPath) {
    try {
      const legacyDir = path.dirname(legacyPath);
      if (!fs.existsSync(legacyDir)) {
        fs.mkdirSync(legacyDir, { recursive: true });
      }
      fs.writeFileSync(legacyPath, JSON.stringify(registry, null, 2), 'utf8');
    } catch {}
  }
}
