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

## 📐 Methodology: Agentic Team Playbook

DevBoard is engineered from the ground up to operationalize the [**Agentic Team Playbook**](docs/AGENTIC_PLAYBOOK.md), a rigorous engineering framework for teams pairing with AI agents (Antigravity, Cursor, Claude Code, GitHub Copilot).

It replaces chaotic "vibe coding" with strict, transparent engineering guardrails:
- **Phase 1: Context & Grounding** — No agent touches code without anchoring to an atomic task in `backlog/tasks/`.
- **Phase 2: Plan Guard** — Explicit architecture and step-by-step implementation plans before execution.
- **Phase 3: Atomic Incremental Execution** — Live checkbox tracking (`- [x]`) and strict scope isolation.
- **Phase 4: Automated Verification Gates** — Pre-commit hooks (`.githooks/pre-commit`) prevent desynchronization between code and backlog.
- **Phase 5: Release Hub & Traceability** — Historical versioning, automated changelog compilation, and zero merge conflicts.

👉 Read the full methodology in [**docs/AGENTIC_PLAYBOOK.md**](docs/AGENTIC_PLAYBOOK.md).

---

## 🚀 Quick Start (Choose Your Workflow)

No complex setups or servers required. Pick the scenario that matches what you want to do:

### 1. Use the AI Agent MCP Server in any project (Zero-Install)
You **don't need to clone this repository**. Just add this to your IDE's MCP configuration (`.cursor/mcp.json`, Claude Desktop, or Antigravity):

```json
{
  "mcpServers": {
    "devboard": {
      "command": "npx",
      "args": ["-y", "devboard-mcp", "--repo", "."]
    }
  }
}
```
*Your AI agent (Cursor, Claude Code, Antigravity) will automatically detect `backlog/tasks/` in your repository and manage tasks through 9 dedicated tools.*

### 2. Run the Visual Kanban Cockpit in your browser
Clone this repository and launch the local dashboard:
```bash
git clone https://github.com/pablojavierrodriguez/dev-board.git
cd dev-board
npm install
npm run dev
```
*Open `http://localhost:4100`. Pre-commit verification hooks configure automatically via `npm install`.*

### 3. Local Developer Link (`npm link`)
If you cloned the repo and want `devboard` and `devboard-mcp` available in terminal across any directory on your machine:
```bash
npm link
```
*Now you can run `devboard` (launches web UI) or `devboard-mcp` from any directory (also accepts `dev-board` / `dev-board-mcp`).*

---

## 🤖 Standalone MCP Server Tools (9 Tools)

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

## 🛠️ Verification & Backlog Integrity Commands

DevBoard includes built-in safeguards to guarantee zero desynchronization between source code, acceptance criteria, and documentation:

```bash
# Verify integrity between code, criteria checkboxes, and task states
npm run backlog:check

# Auto-reconcile completed tasks and update the consolidated BACKLOG.md
npm run backlog:sync

# Static UX & Performance audit (zero CLS, layout shifts, touch targets)
npm run audit:ux

# Production TypeScript, Vite bundle and standalone binaries packaging
npm run build
```

---

## ✨ Features Overview (v0.3.0)

- **🎨 Linear & Raycast Aesthetic**: Sleek glassmorphism, refined dark color palette, daylight mode toggle, and zero CLS layout stability.
- **🔄 Dual Agile Methodologies (Kanban vs Scrumban)**: 
  - **Kanban**: Continuous value delivery across all items without artificial batching.
  - **Scrumban**: Targeted Sprint Board focused on active **Sprint Goals** with live progress tracking (`%` completed, items in progress, goal fulfillment indicator).
- **🎛️ Dynamic Column Modes**:
  - **Modo Simple (3 columnas)**: Optimized for speed and clarity (*Draft*, *Doing*, *Done*).
  - **Modo Ampliado (5 columnas)**: Complete quality lifecycle (*Draft*, *Doing*, *Review*, *Ready*, *Done*).
  - **Discovery Column (Ideas)**: Dedicated toggleable pipeline for discovery items with zero layout shifts.
- **⚙️ Dedicated Project Settings (`SettingsView`)**: Persistent project configuration saved to `.devboard/config.json` (methodology, column definitions, WIP limits, default views, and theme preferences).
- **🎯 Sprint & Backlog Prioritization Hub**: Dense table view with collapsible sprint groups, progress bars, inline priority/status editing, and natural sorting.
- **🚀 Sovereign Release Management**: Track versions in preparation (*unreleased*) vs deployed to production (*released*) with automated changelog compilation.
- **🛡️ Plan Guard**: Ensures items transitioning to `doing` have documented acceptance criteria, technical plans, or specifications before code is written.
- **📂 Cross-Platform File Explorer**: Visual folder browser (`FolderPickerModal`) for macOS, Linux, and Windows with automatic repository detection.
- **🤖 Standalone MCP Bridge**: 9 dedicated MCP tools for AI agents (Antigravity, Cursor, Claude Code) with token-efficient filters and atomic updates.

---

## 🐶 Dogfooding ("Git Building Git")

DevBoard uses DevBoard to manage its own development. 

This repository itself contains a [`backlog/tasks/`](backlog/tasks/) folder managed in `backlog-md` mode, tracking real features, UX polish, and releases across **64+ tasks** (`DEV-001` through `DEV-066`).

---

## 🚀 Quick Start

### Option A: Zero-Install Instant Launch (Recommended)

Run inside any repository folder:

```bash
npx devboard
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
- `1` - `5`: Switch tabs (`1`: Kanban/Tablero, `2`: Sprint & Priorización, `3`: Releases, `4`: Archivo, `5`: Configuración)
- `Esc`: Close modals
- `⌘+Enter`: Save item / form

---

## 🤝 Ecosystem & Interoperability

DevBoard champions open, sovereign developer workflows without proprietary lock-in. Its distributed Markdown storage engine adopts the decentralized task file convention (`backlog/tasks/*.md`) popularized by projects like [MrLesk/Backlog.md](https://github.com/MrLesk/Backlog.md).

This design allows engineering teams to freely combine terminal CLIs with DevBoard's visual cockpit and MCP agent bridges on the exact same codebase, fostering a collaborative and interoperable file-based ecosystem.

---

## 📄 License

MIT © 2026 DevBoard Contributors
