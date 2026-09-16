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

## 🤖 Native MCP Server & Agent Skills

DevBoard includes a native **Model Context Protocol (MCP)** server over `stdio` ([`scripts/mcp-server.ts`](scripts/mcp-server.ts)) and an agent skill ([`.agents/skills/devboard/SKILL.md`](.agents/skills/devboard/SKILL.md)).

AI agents (Cursor, Claude Code, Antigravity) can inspect, create, plan, and update backlog tasks autonomously without human copy-pasting.

### MCP Configuration

Add DevBoard to your IDE or agent's `mcp_config.json`:

```json
{
  "mcpServers": {
    "devboard": {
      "command": "node",
      "args": [
        "--experimental-strip-types",
        "/absolute/path/to/dev-board/scripts/mcp-server.ts"
      ]
    }
  }
}
```

Or run via npm:
```bash
npm run mcp
```

### Available MCP Tools

| Tool | Purpose |
| :--- | :--- |
| `devboard_list_projects` | Lists registered projects and their storage engines (`backlog-md` or `json`). |
| `devboard_list_tasks` | Queries backlog tasks with optional filters (`status`, `priority`, `milestone`). |
| `devboard_get_task` | Fetches full task specifications, acceptance criteria, and technical plans. |
| `devboard_create_task` | Adds a new task directly into the repository in the project's native storage format. |
| `devboard_update_task` | Updates status (`draft`, `doing`, `review`, `ready`, `done`), criteria checkboxes, or technical plans. |
| `devboard_export_backlog` | Generates or refreshes the consolidated `BACKLOG.md` report. |

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

### 1. Clone & Install

```bash
git clone https://github.com/pablojavierrodriguez/dev-board.git
cd dev-board
npm install
```

### 2. Start DevBoard

```bash
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
