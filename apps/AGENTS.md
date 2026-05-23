# Agent Guide

This workspace contains two applications:

- API: ASP.NET Core 10 in `api/`
- Web: Angular 21 in `web/`

## First Steps

1. Detect which app is affected by the user request.
2. Read the closest app README before editing:
   - `api/README.md`
   - `web/README.md`
3. Follow app-specific instructions files in `.github/instructions/`.

## Build and Test Commands

Run commands from the app folder unless noted otherwise.

### API (`api/`)

- Restore/build: `dotnet build`
- Run API: `dotnet run`
- Apply EF migrations at runtime startup behavior depends on app code; prefer adding migrations explicitly when schema changes.

### Web (`web/`)

- Install deps: `npm install`
- Dev server: `npm run start`
- Build: `npm run build`
- Unit tests: `npm run test`
- Lint: `npm run lint`
- Format: `npm run format`

## Architecture Notes

- API follows layered boundaries documented in `api/README.md`.
- Web uses standalone/lazy-loaded Angular routes and signal-based state patterns.

## Instruction Files

- API rules: `.github/instructions/API Project.instructions.md`
- Web rules: `.github/instructions/Web Project.instructions.md`

Use these files as the primary source for coding behavior in each app area.
