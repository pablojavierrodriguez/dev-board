export type ItemType = "bug" | "feature" | "tech_debt" | "ux";
export type Priority = "p0" | "p1" | "p2" | "p3";
export type ItemStatus =
  | "ideas"
  | "backlog"
  | "in_progress"
  | "testing_qa"
  | "finish"
  | "done"
  | "dismissed"
  | "cancelled";

export type ViewMode = "simplificada" | "ampliada";

export interface Project {
  id: string; // "dom", "project-2"
  name: string; // "DOM (Personal Finances)"
  codePrefix: string; // "DOM"
  repoPath?: string; // "/Users/adrisol/Pablo/code/m3"
  description?: string;
  isDemo?: boolean;
  createdAt: string;
}

export interface BacklogItem {
  id: string;
  code: string; // "DOM-BUG-001", "BUG-C1", etc.
  projectId: string; // "dom"
  title: string;
  description: string;
  type: ItemType;
  priority: Priority;
  status: ItemStatus;
  module?: string;
  impactedFile?: string;
  risk?: string;
  fix?: string;
  targetSprint?: string;
  targetRelease?: string;
  sourceDoc?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  releasedAt?: string;
}

export interface Release {
  id: string;
  projectId: string;
  version: string; // "0.5.0", "0.6.0"
  date: string; // "2026-09-16"
  title: string;
  summary: string;
  itemCodes: string[];
  markdownContent: string;
  createdAt: string;
}

export interface BoardData {
  projects: Project[];
  items: BacklogItem[];
  releases: Release[];
  lastUpdated: string;
}

export interface ColumnConfig {
  id: string;
  title: string;
  subtitle?: string;
  color: string; // tailwind color class
  dotColor: string;
  statuses: ItemStatus[]; // Which statuses map into this column
  dropTargetStatus: ItemStatus; // Default status when dropped here
}

export interface FilterState {
  search: string;
  type: ItemType | "all";
  priority: Priority | "all";
  module: string | "all";
  sprint: string | "all";
}
