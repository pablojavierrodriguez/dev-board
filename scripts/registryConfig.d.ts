export function getDevBoardHomeDir(): string;
export function getRegistryPath(pkgRoot?: string): string;
export function getLegacyRegistryPath(pkgRoot?: string): string | null;
export function loadRegistryFile(pkgRoot?: string): { activeProjectId: string; projects: any[] };
export function saveRegistryFile(registry: { activeProjectId: string; projects: any[] }, pkgRoot?: string): void;
