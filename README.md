# CommanDeck

**Your unified command center for engineering work.**

CommanDeck is a native desktop application that aggregates your engineering workflow tools into a single, fast interface. Built with Tauri v2 and React, it brings your tickets, pull requests, messages, and AI coding sessions together so you never lose context switching between browser tabs.

---

## Features

- **\u25B6 Linear Tickets** -- View, triage, and update Linear tickets without leaving the app
- **\u25B6 GitHub PR Review** -- Inline diff viewer with approve, comment, and merge actions
- **\u25B6 AI Task Dispatch** -- Assign tickets to Claude Code sessions and track progress
- **\u25B6 Unified Inbox** -- PRs, tickets, and mentions in one chronological feed
- **\u25B6 Native Notifications** -- OS-level alerts for reviews, mentions, and session completions
- **\u25B6 Team and IC Views** -- Manager dashboards alongside individual contributor focus mode

## Screenshots

> Coming soon.

## Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Frontend    | React 19, TypeScript, Tailwind v4 |
| State       | Zustand                           |
| Backend     | Rust (Tauri v2)                   |
| Database    | SQLite (local)                    |
| Integrations| GitHub API, Linear GraphQL, Slack |
| AI          | Claude Code CLI + MCP servers     |

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) >= 20
- [pnpm](https://pnpm.io/) >= 9
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- Tauri v2 system dependencies ([see guide](https://v2.tauri.app/start/prerequisites/))

### Setup

```bash
git clone https://github.com/Priyans-hu/commandeck.git
cd commandeck
pnpm install
```

### Development

```bash
pnpm tauri dev
```

### Build

```bash
pnpm tauri build
```

## Architecture

CommanDeck follows an orchestrator pattern with clear separation between the React frontend and the Rust backend.

```
React UI  <-->  Tauri IPC  <-->  Rust Commands
                                    |
                          +---------+---------+
                          |         |         |
                      Sync Engine  Task     Notification
                                 Dispatcher   Engine
```

- **Sync Engine** -- Fetches data from GitHub, Linear, and Slack APIs on intervals
- **Task Dispatcher** -- Manages Claude Code session lifecycle
- **Notification Engine** -- Routes alerts to the OS notification system
- **SQLite** -- Local cache for tickets, PRs, sessions, and user settings

For detailed architecture documentation, see `docs/`.

## Roadmap

### v1.0 -- MVP
- Linear ticket viewer and status updates
- GitHub PR review with inline diffs
- Unified inbox feed
- Local SQLite caching
- Native desktop notifications

### v1.5 -- Team Features
- Team dashboard with workload overview
- AI task dispatch (Claude Code integration)
- Session tracking with logs
- Customizable notification rules

### v2.0 -- Expanded Integrations
- Jira support
- Slack messaging integration
- Multi-AI agent support
- Plugin system for custom integrations

## License

[MIT](LICENSE) -- Copyright 2025 Priyanshu
