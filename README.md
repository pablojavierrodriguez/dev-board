# DevBoard ⚡

> **A sovereign, local-first, Linear-style Kanban, Sprint Hub & Release Cockpit for developers and AI pair programmers.**

[![Methodology: Agentic Team Playbook](https://img.shields.io/badge/Methodology-Agentic%20Team%20Playbook-purple.svg)](https://github.com/pablojavierrodriguez/agentic-team-playbook)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Protocol: 2024-11-05](https://img.shields.io/badge/MCP-Protocol%20Ready-6366f1.svg)](https://modelcontextprotocol.io/)

DevBoard is a self-contained developer cockpit designed to eliminate the friction of managing issues, technical debt, sprint backlogs, and releases directly alongside your code.

Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**. Designed to operationalize the [**Agentic Team Playbook**](https://github.com/pablojavierrodriguez/agentic-team-playbook) methodology.

---

## 💡 Why DevBoard?

### The Problem
When managing codebases, task tracking often begins as static Markdown files (`BACKLOG.md`, `TODO.md`). Over time, these become unstructured, write-only graveyards: difficult to prioritize across sprints, impossible to filter interactively, and painful to reconcile when assembling release changelogs.

Cloud project management tools (Jira, Trello, Asana) swing to the other extreme: sluggish loading times, heavy enterprise bloat, disconnected from code commits, and requiring private architecture, technical debt, and internal security flaws to live on third-party servers.

### Why DevBoard over Cloud PM Tools?

| Factor | Cloud PM Tools (Jira, Trello, Asana) | DevBoard ⚡ |
| :--- | :--- | :--- |
| **Data Privacy** | Cloud hosted. Roadmaps and vulnerabilities live on remote servers. | **100% Sovereign & Local-First**. Zero telemetry, zero leaks. Stored in your local repo. |
| **Git Alignment** | Disconnected from code; requires manual syncing or brittle webhooks. | **Versioned with your code**. Commit task states alongside pull requests and branches. |
| **Speed & Weight** | Heavy bundles, multi-second loading, constant spinner states. | **Sub-200ms instant startup**. Zero bloat, runs locally on a single port. |
| **Workflow Focus** | Cluttered with corporate forms, permissions, and notification noise. | **Laser-focused on developer flows**: Ideas → Sprint → Plan → Release. |
| **AI Pair Programming** | Generic text fields with no structured context bridge for coding agents. | **Native AI Bridge**: Built-in Plan Guard, stdio MCP Server & ready-to-run agent prompts. |

---

## 🗄️ Flexible Dual Storage Engine

DevBoard gives you explicit control over how each project is stored on disk, with **zero external dependencies**:

### 1. Distributed Markdown (`backlog-md` mode)
- **Format**: `backlog/tasks/<CODE> - <Title>.md` with clean YAML frontmatter and delimited sections (`<!-- AC:BEGIN -->`, `<!-- SECTION:PLAN:BEGIN -->`).
- **Why use it**: Ideal for teams or multi-agent workflows. Because each task is an independent file, concurrent Git branches and AI coding agents can create, update, and resolve tasks with **zero merge conflicts**.

### 2. Single-File JSON (`json` mode)
- **Format**: `.devboard/backlog.json`
- **Why use it**: Ideal when you prefer a compact, single-file footprint without creating individual task files in your repository.

### 🔄 1-Click Bidirectional Conversion
From the project settings in DevBoard, you can convert between storage engines anytime with zero data loss:
- **"Pasar a archivos .md individuales"**: Takes `.devboard/backlog.json` and splits it into `backlog/tasks/*.md`.
- **"Unificar en un solo archivo JSON"**: Takes `backlog/tasks/*.md` and compacts everything into `.devboard/backlog.json`.

### 💾 Export & Downloads
- **Documentation Report (`BACKLOG.md`)**: Exports a single, beautifully formatted Markdown summary of your active board or sprint for PRs, issues, or documentation.
- **Full Backup (`backlog.json`)**: Exports complete project data (tasks, acceptance criteria, technical plans, releases) for offline archive or migration.

---

---

## 🤖 Standalone MCP Server & AI Agent Skills

DevBoard includes an autonomous **Model Context Protocol (MCP)** server bundled for Node 18+ over `stdio` (`bin/devboard-mcp.js`) and an agent skill ([`.agents/skills/devboard/SKILL.md`](.agents/skills/devboard/SKILL.md)).

AI agents (Cursor, Claude Code, Antigravity) can inspect, create, plan, and update backlog tasks autonomously without human copy-pasting.

### Zero-Config MCP Setup

Add DevBoard to your IDE or agent's `mcp_config.json`:

```json
{
  "mcpServers": {
    "devboard": {
      "command": "npx",
      "args": ["devboard-mcp"]
    }
  }
}
```

Or pointing to an explicit repository path:
```json
{
  "mcpServers": {
    "devboard": {
      "command": "npx",
      "args": ["devboard-mcp", "--repo", "/path/to/my-repo"]
    }
  }
}
```

Or run via npm inside this workspace:
```bash
npm run mcp
```

### Available MCP Tools (9 Tools)

| Tool | Purpose | Key Parameters |
| :--- | :--- | :--- |
| `devboard_list_projects` | Lists registered projects and their storage engines (`backlog-md` or `json`). | None |
| `devboard_get_stats` | Consolidated backlog metrics (% done, open vs closed, grouped by task prefix). | `projectId` |
| `devboard_list_tasks` | Fast querying with token-efficient filters (`compact` 1-line format, `openOnly`, `prefix`). | `projectId`, `status`, `openOnly`, `prefix`, `taskIds`, `format`, `limit` |
| `devboard_bulk_update_tasks` | Mass batch update across dozens of tasks in 1 call (by prefix or ID list). | `projectId`, `taskIds`, `filterPrefix`, `updates` |
| `devboard_list_releases` | Inspects published releases, changelog notes, and associated tasks. | `projectId`, `version` |
| `devboard_get_task` | Fetches full task specifications, acceptance criteria, and technical plans. | `taskId` (e.g. `"DEV-001"`, `"TASK-010"`) |
| `devboard_create_task` | Adds a new task directly into the repository in the project's native storage format. | `title`, `description`, `type`, `priority`, `acceptanceCriteria` |
| `devboard_update_task` | Updates status (`draft`, `doing`, `review`, `ready`, `done`), toggles criteria checkboxes, or technical plans. | `taskId`, `status`, `toggleAcIndex`, `implementationPlan` |
| `devboard_export_backlog` | Generates or refreshes the consolidated `BACKLOG.md` report. | `projectId` |

---

## 🔒 Privacy & Git Strategies: Public vs. Private Repositories

DevBoard is **100% sovereign and local-first**: your data is never sent to external servers or telemetry systems. Because backlogs are stored directly on your local disk as files, you should choose the right Git strategy based on your repository visibility:

### ⚠️ Crucial Git Principle: Public Repositories
In public Git repositories (e.g., GitHub, GitLab), **ALL branches and commits pushed to the remote (`git push`) are visible to the world**, not just `main`. Committing confidential roadmaps to a `dev` or `feature` branch will still expose them publicly!

### Recommended Strategies

#### Strategy 1: "Backlog as Code" (Recommended for Private Repos or Public Open-Source)
- **Files**: Commit `backlog/tasks/*.md` (or `.devboard/backlog.json`) directly into Git.
- **Benefits**: Tasks, acceptance criteria, and plan updates travel in the same Pull Requests as the implementation code. Complete audit trail in Git history.
- **Use when**: The repository is private within your organization, OR the project is an open-source project with an intentionally public roadmap.

#### Strategy 2: Sovereign Local-Only Backlog via `.gitignore` (Recommended for Public Repos with Internal Roadmaps)
- **Configuration**: Add the backlog directory to your `.gitignore`:
  ```gitignore
  # Ignore internal DevBoard backlog in public repositories
  .devboard/
  backlog/
  ```
- **Benefits**: You and your local AI coding agents enjoy full DevBoard Kanban, Sprint Hub, and MCP tool capabilities locally, but no task details, internal business ideas, technical debt, or unreleased vulnerability disclosures are ever pushed to GitHub.
- **Use when**: You work on public or client-facing repositories where task tracking must remain strictly confidential.

#### Strategy 3: Dedicated Private Backlog Repository
- Keep the public repository completely clean of backlog files, and maintain a private repository (e.g., `my-project-backlog`) for tracking.
- Run DevBoard or point MCP to that directory:
  ```bash
  npx devboard-mcp --repo /path/to/private-backlog
  ```

---

## 📜 Historical Backlog Policy & Zero-Loss Traceability

In DevBoard, **no task, fix, or evolutionary decision should ever disappear without a Git audit trail**. The lifecycle follows strict non-destructive principles:

1. **Immutability of Resolved Tasks (`done` / `released`)**:
   - Completed tasks **are never deleted**. They remain permanently in `backlog/tasks/*.md` (or `.devboard/backlog.json`) as living documentation for future developers and AI agents.
   - When a milestone is closed, tasks are aggregated into versioned release notes (`docs/RELEASE_NOTES.md`), linking code commits directly to task IDs (`DEV-001`, `DEV-014`).

2. **Soft-Delete Archiving (`backlog/archive/`)**:
   - When a task is discarded, cancelled, or superseded, DevBoard **never performs a destructive disk deletion**.
   - Instead, the task is safely moved to `backlog/archive/<ID> - <Title>.md` with `status: dismissed`. When committed to Git, the historical rationale of why an approach was rejected is preserved forever without cluttering the active board.

3. **Strict Test Fixture Isolation**:
   - Automated test suites and regression scripts operate on isolated temporary fixture directories (`data/test-repo-*`), ensuring synthetic test items never contaminate or pollute the production backlog.

---

## ✨ Features Overview

- **🎨 Linear & Raycast Dark Aesthetic**: Sleek glassmorphism, refined dark color palette, and daylight mode toggle.
- **🛡️ Native In-App Confirmations**: Zero browser alert/confirm popups. Built-in keyboard accessible `ConfirmModal` (`Esc` to cancel, `Enter` to confirm).
- **📂 Cross-Platform File Explorer**: Visual folder browser (`FolderPickerModal`) for macOS, Linux, and Windows with automatic Git repository and Backlog.md directory detection.
- **⚡ Frictionless Status Taxonomy**: Clean agile statuses without spaces or underscores: `draft`, `doing`, `review`, `ready`, `done`.
- **🎯 Sprint & Prioritization Hub**: Dense table view with progress bars, collapsible groups, and inline status/priority editing.
- **🚀 Automated Release Assembler**: Package finished items into versioned releases with auto-generated Markdown changelogs.
- **🛡️ Plan Guard**: Ensures items transitioning to `doing` have documented acceptance criteria and technical implementation plans before code is written.

---

## 🐶 Dogfooding ("Git Building Git")

DevBoard uses DevBoard to manage its own development. 

This repository itself contains a [`backlog/tasks/`](backlog/tasks/) folder managed in `backlog-md` mode, tracking real features, UX polish, and releases (`DEV-001` through `DEV-005`).

---

## 🚀 Quick Start

### Option A: Zero-Install Instant Launch (Recommended)

Run inside any repository folder:

```bash
npx dev-board
```

DevBoard automatically detects the repository in your working directory, verifies storage engine (`backlog/tasks` or `.devboard`), and launches the Kanban UI in your default browser at `http://localhost:4100`.

### Option B: Clone & Run Locally

```bash
git clone https://github.com/pablojavierrodriguez/dev-board.git
cd dev-board
npm install
npm run dev
```

Open [http://localhost:4100](http://localhost:4100) in your browser.

---

## ⌨️ Keyboard Shortcuts

- `N`: Create new backlog item
- `⌘K` / `Ctrl+K`: Focus instant search bar
- `1` - `4`: Switch tabs (Kanban, Sprint, Releases, Archive)
- `Esc`: Close modals
- `⌘+Enter`: Save item / form

---

## 🤝 Ecosystem & Interoperability

DevBoard champions open, sovereign developer workflows without proprietary lock-in. Its distributed Markdown storage engine adopts the decentralized task file convention (`backlog/tasks/*.md`) popularized by projects like [MrLesk/Backlog.md](https://github.com/MrLesk/Backlog.md).

This design allows engineering teams to freely combine terminal CLIs with DevBoard's visual cockpit and MCP agent bridges on the exact same codebase, fostering a collaborative and interoperable file-based ecosystem.

---

## 📄 License

MIT © 2026 DevBoard Contributors
