export interface UpdateCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  url?: string;
  fromCache?: boolean;
  disabled?: boolean;
}

export function semverGreaterThan(target: string, current: string): boolean;
export function getUpdateCachePath(): string;
export function readUpdateCache(): any;
export function writeUpdateCache(data: any): void;
export function isUpdateCheckDisabled(): boolean;
export function formatUpdateBanner(currentVersion: string, latestVersion: string): string;
export function getCachedUpdateInfo(currentVersion: string): UpdateCheckResult | null;
export function checkForUpdates(
  currentVersion: string,
  options?: { force?: boolean; timeoutMs?: number }
): Promise<UpdateCheckResult>;
