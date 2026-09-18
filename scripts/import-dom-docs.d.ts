export function runMigration(
  docsDir?: string,
  targetFile?: string | null,
  projectMeta?: any
): {
  projects: any[];
  items: any[];
  releases: any[];
  lastUpdated: string;
};
