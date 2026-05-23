---
description: Guidelines for maintaining the Angular web app in this repository
applyTo: web/**/*.{ts,html,scss,css,json,js}
---

# Angular Web App Development Instructions

## Purpose

- Keep changes aligned with the existing Angular architecture and tooling in this repository.
- Explain implementation decisions briefly when making non-obvious changes.
- For touched code, apply required rules in this document first; preserve surrounding local patterns for unrelated code unless the user asks for migration.
- For new files, apply all current Angular stack conventions in this document.

## Current Stack (Required)

- Angular 21 with standalone components and lazy-loaded route components.
- TypeScript in strict mode and ESLint + Prettier for code quality.
- Angular Material is available and used in the app shell.
- Use signals and computed state where local reactive state is needed.

## Component and Template Conventions

- Keep component logic in `.ts`, template markup in `.html`, and styles in `.scss`.
- Keep templates limited to property bindings, event bindings, and control flow. Move data transformation, validation, and domain calculations into the component class or a dedicated service.
- Required for all components: use control flow syntax (`@if`, `@for`, `@switch`) with `track` in `@for`; set `changeDetection: ChangeDetectionStrategy.OnPush` for new components and only omit it for imperative non-signal, non-async-pipe state updates with an explanatory comment.
- Required for all components: mark Angular-initialized members (for example `input()`, `output()`, and queries) as `readonly`, and use `protected` for members consumed only by templates.
- Preferred for new components: use `input()` / `output()` APIs and `[class]` / `[style]` bindings instead of `NgClass` / `NgStyle`.

## State and Services

- Use signals for local component state and `computed()` for derived state.
- Keep state updates explicit with `set()` and `update()`.
- Design services with a single responsibility and use `inject()` for dependencies.
- Default services to `@Injectable({ providedIn: 'root' })` unless a narrower scope is required.

## Angular Style Guide Alignment

- Prefer feature-based folder structure over type-based folders.
- Keep one primary concept per file when practical.
- Use hyphenated file names and keep component `.ts`, `.html`, `.scss`, and `.spec.ts` names aligned.
- Keep Angular-specific class members (injected dependencies, inputs, outputs, queries) grouped before methods.

## Routing and Data Access

- Follow existing route patterns in `web/src/app/app.routes.ts`.
- Prefer lazy loading for feature pages.
- Keep API access and auth/session behavior consistent with existing auth services and interceptors.
- Handle HTTP errors in services with `catchError` and expose error state through a dedicated signal (for example `errorMessage = signal<string | null>(null)`). Do not swallow errors silently.

## Accessibility and UX

- Ensure keyboard accessibility and visible focus states.
- Meet WCAG AA contrast and semantic markup expectations.
- Add ARIA attributes only when native semantics are insufficient.
- Accessibility changes must pass AXE checks in addition to WCAG AA requirements.

## Validation and Quality

- Run lint and format on all changed frontend files before finalizing any edit that adds or modifies more than one function, component member, or template block.
- Add or update unit tests when behavior changes. Use Angular TestBed with the repo test runner (Vitest) and cover changed public methods, affected template bindings, and new signal state transitions.
- Limit changes to the files and behaviors mentioned in the user request. Do not rename, reorganize, or restructure code outside the direct scope unless the user explicitly uses the word "refactor" or "reorganize".

## Response Style for Users

- Describe what changed and why, with emphasis on Angular-specific decisions.
- Mention impacted files and notable tradeoffs.
