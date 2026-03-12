# Contributing to CommanDeck

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

### Prerequisites

- **Rust** (latest stable) — [rustup.rs](https://rustup.rs)
- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **pnpm** — `npm install -g pnpm`
- **Tauri v2 prerequisites** — [tauri.app/start/prerequisites](https://v2.tauri.app/start/prerequisites/)

### Getting Started

```bash
git clone https://github.com/Priyans-hu/commandeck.git
cd commandeck
pnpm install
pnpm tauri dev
```

## Branch Naming

Use prefixed branch names:

- `feat/short-description` — new features
- `fix/short-description` — bug fixes
- `chore/short-description` — maintenance, refactoring, tooling

## Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Make your changes in small, focused commits.
3. Ensure the project builds without errors (`pnpm tauri build`).
4. Open a PR against `main` with a clear title and description.
5. Address any review feedback.

## Code Style

### Rust (src-tauri)

- Follow standard Rust conventions (`cargo fmt`, `cargo clippy`).
- Use `Result` types for error handling — avoid `unwrap()` in production code.
- Document public functions with `///` doc comments.

### TypeScript (src)

- Use TypeScript strict mode.
- Prefer functional components with hooks.
- Use Zustand for state management — avoid prop drilling.
- Format with Prettier, lint with ESLint.

## Reporting Issues

Open an issue on GitHub with steps to reproduce, expected behavior, and actual behavior.
