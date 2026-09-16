# DevBoard ⚡

> **A local-first, blazing-fast, Linear-style Kanban, Sprint Backlog & Release Hub for developers and AI pair programmers.**

DevBoard is a self-contained web workspace designed to eliminate the friction of managing issues, technical debt, sprint backlogs, and release notes in static Markdown files.

Built with **React 18**, **Vite**, **TypeScript**, and **Tailwind CSS**.

---

## 💡 Why DevBoard?

### The Problem
When managing multiple codebases simultaneously, task tracking often starts as static Markdown files (`BACKLOG.md`, `TODO.md`, `NOTES.md`). Over time, these become unstructured, write-only graveyards: difficult to prioritize across sprints, impossible to filter interactively, and painful to reconcile when assembling release notes.

Cloud project management tools (Jira, Trello, Asana) swing to the other extreme: sluggish loading times, heavy enterprise bloat, and the uncomfortable requirement of hosting private architecture, technical debt, and internal security flaws on third-party servers.

### Why DevBoard over Jira, Trello, or Asana?

| Factor | Cloud PM Tools (Jira, Trello, Asana) | DevBoard ⚡ |
| :--- | :--- | :--- |
| **Data Privacy** | Cloud hosted. Roadmaps and vulnerabilities live on remote servers. | **100% Sovereign & Local-First**. 0 data leaks. Stored inside `<repo>/.devboard/`. |
| **Git Alignment** | Disconnected from code; requires manual syncing or webhooks. | **Versioned with your code**. Commit task states alongside code changes. |
| **Speed & Weight** | Heavy bundles, multi-second loading, constant spinner states. | **Sub-200ms instant startup**. Zero bloat, runs locally on a single port. |
| **Workflow Focus** | Cluttered with corporate features, forms, and notification noise. | **Laser-focused on developer flows**: Ideas → Sprint → Plan → Release. |
| **AI Pair Programming** | Generic notes with no context bridge for coding agents. | **Native AI Bridge**: Built-in Plan Guard & 1-click prompt generator for AI agents. |

---

## 🧭 Vision

DevBoard is designed to become the **universal, zero-friction developer cockpit**:

- **Zero-Install CLI**: Run on-demand in any repository via `npx dev-board` without persistent daemon overhead.
- **Git-Native Team Sync**: Collaborate by pushing `.devboard/backlog.json` through standard Git pull requests—no proprietary cloud lock-in.
- **Autonomous Agent Symbiosis**: A seamless bridge connecting human engineering intent and sprint planning with AI agent execution (Antigravity, Cursor, Claude Code, Copilot).

---

## ✨ Features

- **🎨 Linear & Raycast Aesthetic**: Sleek dark mode by default, accompanied by a clean daylight mode (Theme Switcher).
- **🛡️ Zero-Leak, Sovereign Persistence**: Backlogs reside directly inside each project repository (`<repoPath>/.devboard/backlog.json`). DevBoard never centralizes or leaks your private code or tasks into its own repository.
- **⚡ Dual Kanban Perspectives**:
  - **Simple (4 Columns)**: `Ideas`, `Backlog`, `In Progress`, `Done`.
  - **Ampliada (6 Columns)**: `Ideas`, `Backlog`, `In Progress`, `Testing/QA`, `Finish (Ready for deploy)`, `Done`.
  - Hidden states (`dismissed`, `cancelled`) managed outside the board with one-click restore.
- **🎯 Sprint & Prioritization Hub**: Dense, high-visibility table view with collapsible sprint blocks, progress bars, and inline priority/status editing.
- **🚀 Automated Release Assembler**: Package finished items into versioned releases and auto-generate formatted Markdown changelogs in seconds.
- **🤖 AI Agent Bridge & Plan Guard**: Validates that items moving to `In Progress` have technical specs or acceptance criteria, and generates ready-to-run prompts formatted for AI coding agents (Antigravity, Claude, ChatGPT) with 1-click clipboard copying.
- **⚡ Zero Backend Hassle**: Runs entirely on a single port (`http://localhost:4100`) via Vite development middleware. No Docker, no external databases.

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

## 📁 How Multi-Project Persistence Works

DevBoard uses a **Repository-Centric Persistence Model**:

```
/Users/you/code/
├── dev-board/             <-- DevBoard UI & Local Server (Clean Open-Source Repo)
│   ├── data/
│   │   ├── demo-backlog.json       <-- Sample tour project
│   │   └── projects-registry.json  <-- Local list of linked folders (Git ignored)
│
├── my-project-alpha/      <-- Your Real Project
│   └── .devboard/
│       └── backlog.json   <-- Stored & versioned inside Project Alpha's Git
│
└── my-mobile-app/         <-- Another Project
    └── .devboard/
        └── backlog.json   <-- Stored & versioned inside Mobile App's Git
```

When you add a project in DevBoard, provide its local folder path. DevBoard reads and writes directly to `<repoPath>/.devboard/backlog.json`. 

If you unlink or delete a project from DevBoard, your repository files remain completely intact in your project, and no data is left behind in DevBoard.

---

## ⌨️ Keyboard Shortcuts

- `N`: Create new backlog item
- `⌘K` / `Ctrl+K`: Focus instant search bar
- `1` - `4`: Switch between tabs (Kanban, Sprint, Releases, Archive)
- `Esc`: Close modals
- `⌘+Enter`: Save item / form

---

## 📄 License

MIT © 2026 DevBoard Contributors
