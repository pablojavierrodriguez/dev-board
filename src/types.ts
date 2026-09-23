export type StandardItemType = "bug" | "feature" | "tech_debt" | "ux" | "epic" | "initiative";
export type ItemType = StandardItemType | (string & {});

export interface CustomItemTypeConfig {
  key: string;
  label: string;
  color: string;
  badge?: string;
  dotColor?: string;
  iconName?: string;
  description?: string;
}
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

export type ActiveTab = 'kanban' | 'sprint' | 'release' | 'archive' | 'settings';

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
  docsPath?: string;
  hasDocs?: boolean;
  createdAt: string;
  error?: string;
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
  sprint?: string; // e.g. "Sprint 1", "Sprint 2"
  release?: string; // e.g. "0.3.0", "v1.0.0"
  targetSprint?: string; // Backward compatibility
  targetRelease?: string; // Backward compatibility
  milestone?: string;
  // DEV-048: Hierarchical and horizontal relations
  parentId?: string; // Strict 1-to-N parent (Epic, Story, Container)
  blocks?: string[]; // IDs/codes of tasks blocked by this task
  blockedBy?: string[]; // IDs/codes of tasks blocking this task
  relatedTo?: string[]; // IDs/codes of related tasks
  dependencies?: string[]; // Functional dependencies (alias or complement to blockedBy)
  // DEV-056: Multi-version releases & Jira-style sprints model
  sprints?: string[]; // All assigned sprints (active + historical closed sprints)
  releases?: string[]; // Multi-version releases
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
  // DEV-049: Soft delete / Trash fields
  isDeleted?: boolean;
  deletedAt?: string;
  previousStatus?: ItemStatus; // Status before soft-delete, for restore
}

export type ReleaseStatus = 'unreleased' | 'released';

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
  status?: ReleaseStatus;
  targetDate?: string;
  scopeNotes?: string;
}

export type SprintStatus = 'planned' | 'active' | 'completed';

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  durationWeeks?: number;
  status: SprintStatus;
  createdAt: string;
  completedAt?: string;
}

export interface BoardData {
  projects: Project[];
  activeProjectId?: string;
  singleProject?: boolean;
  items: BacklogItem[];
  releases: Release[];
  sprints?: Sprint[];
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
  wipLimit?: number; // Optional Work-In-Progress limit (DEV-009)
}

export interface KanbanSettings {
  columns?: ColumnConfig[];
  simplifiedColumns?: ColumnConfig[];
  expandedColumns?: ColumnConfig[];
  showIdeasByDefault?: boolean;
  showDoneHistoryByDefault?: boolean;
  doneHistoryLimit?: number;
  wipLimits?: Record<string, number>; // colId -> maxItems
}

export type ProjectMethodology = 'kanban' | 'scrum' | 'scrumban';

export interface DevBoardConfig {
  theme?: 'dark' | 'light' | 'system';
  density?: 'comfortable' | 'compact';
  methodology?: ProjectMethodology;
  defaultView?: 'kanban' | 'sprint' | 'release' | 'settings';
  enabledTabs?: {
    kanban?: boolean;
    sprint?: boolean;
    release?: boolean;
  };
  kanban?: KanbanSettings;
  rankingEnabled?: boolean;
  autoSave?: boolean;
  customItemTypes?: CustomItemTypeConfig[];
  version?: string;
}

export interface FilterState {
  search: string;
  type: ItemType | "all";
  types?: ItemType[];
  priority: Priority | "all";
  priorities?: Priority[];
  statuses?: ItemStatus[];
  includeIdeas?: boolean;
  includePreviousDone?: boolean;
  includeDismissedCancelled?: boolean;
  module: string | "all";
  modules?: string[];
  sprint: string | "all";
  sprints?: string[];
  release?: string | "all";
  releases?: string[];
}
