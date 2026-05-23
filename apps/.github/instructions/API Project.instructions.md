---
description: Guidelines for maintaining the ASP.NET Core API in this repository
applyTo: api/**/*.{cs,json}
---

# ASP.NET Core API Development Instructions

## Purpose

- Help users implement and evolve this API using existing project architecture and conventions.
- Use educational guidance: provide concise explanations why a change is made, not only what to write. You can keep your explanations concise but aim to build understanding of the codebase and design choices.
- Optimize for consistency with the current codebase over introducing new patterns.

## Current Architecture (Required)

- This API uses controller-based endpoints, not Minimal APIs.
- Keep the existing layering and dependency direction:
  - Controllers -> Application
  - Application -> Domain
  - Infrastructure -> Application + Domain
- Keep business logic out of controllers.
- Keep controllers thin: input/output handling, auth attributes, status codes, and service calls only.

## Project Conventions

- Follow the existing feature organization in Application and Contracts folders.
- Use dependency injection via AddApplication and AddInfrastructure extension methods.
- Preserve existing naming and route style unless explicitly asked to change it.
- Use async methods with CancellationToken support throughout request flows.

## API Design and Behavior

- Build resource-oriented routes and use correct HTTP verbs.
- Return consistent status codes:
  - 200 for successful reads/updates
  - 201 for creates (with location when applicable)
  - 204 for successful deletes with no body
  - 400 for validation/request issues
  - 401 for authentication failures
  - 403 for authorization failures
  - 404 for missing resources
  - 409 for conflicts
- Use typed request and response contracts for endpoint boundaries.

## Authentication and Authorization

- Use JWT bearer authentication consistent with existing setup.
- Keep authorization explicit with attributes and policies where needed.
- Ensure user-context access patterns remain consistent with current abstractions.

## Validation and Error Handling

- Use model validation and explicit request validation.
- Keep error response structures consistent across controllers.
- Use ProblemDetails style responses for standardized errors on new and updated endpoints.
- Do not leak internal exception details in API responses.

## Data Access and EF Core

- Default data store is PostgreSQL via EF Core and Npgsql.
- Keep persistence concerns in Infrastructure repositories.
- Avoid moving data access into controllers or Application service contracts that bypass abstractions.
- Use efficient query patterns and avoid unnecessary tracking for read-only paths.

## Migrations and Schema Changes

- When schema changes are needed, generate EF Core migrations instead of hand-editing generated files.
- Do not manually edit migration designer or model snapshot files unless explicitly requested.
- Keep migration names descriptive and scoped to the change.

## OpenAPI and Documentation

- Keep Swagger/OpenAPI support working for development.
- Document new endpoints with clear request/response expectations and auth requirements.
- When adding or changing endpoints, explain consumer impact and compatibility concerns.

## Testing Guidance

- Encourage unit tests for application services and integration tests for API endpoints.
- When tests are added, follow current project conventions and keep test scope clear.
- Highlight missing test coverage for behavior changes and edge cases.

## Change Strategy

- Use incremental changes that match existing patterns over broad refactors.
- Do not introduce new architectural styles unless the user explicitly requests them.
- If multiple valid approaches exist, present the default repo-consistent option first and list alternatives briefly.

## Response Style for Users

- Explain implementation decisions in plain language.
- Provide concise, practical examples aligned with this codebase.
- When making edits, mention affected layers and why each change belongs there.
