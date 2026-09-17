export type ItemType = "bug" | "feature" | "tech_debt" | "ux";
export type Priority = "p0" | "p1" | "p2" | "p3";
export type ItemStatus =
  | "draft"
  | "doing"
  | "review"
  | "ready"
  | "done"
  | "dismissed"
  | "cancelled"
  // Legacy aliases for backward compatibility
  | "ideas"
  | "backlog"
  | "in_progress"
  | "testing_qa"
  | "finish";

export type ViewMode = "simplificada" | "ampliada";

export type StorageType = "json" | "markdown";

export interface Project {
  id: string; // "dom", "project-2"
  name: string; // "DOM (Personal Finances)"
  codePrefix: string; // "DOM"
  repoPath?: string; // "/Users/adrisol/Pablo/code/m3"
  description?: string;
  isDemo?: boolean;
  storageType?: StorageType;
  backlogDir?: string;
  createdAt: string;
}

export interface AcceptanceCriterion {
  index: number;
  text: string;
  checked: boolean;
}

export interface BacklogItem {
  id: string;
  code: string; // "DOM-BUG-001", "BACK-355", etc.
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
  milestone?: string;
  sourceDoc?: string;
  acceptanceCriteriaList?: AcceptanceCriterion[];
  implementationPlan?: string;
  assignees?: string[];
  labels?: string[];
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  releasedAt?: string;
  mtime?: number; // File modification timestamp (ms) for optimistic concurrency locking
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
