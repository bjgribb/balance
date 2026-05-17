# API Architecture

This API uses a lightweight Clean Architecture style that keeps boundaries clear without adding unnecessary complexity.

## Folder layout

- `Controllers/`: HTTP entry points only.
- `Application/`: use-case logic, contracts, and service interfaces.
- `Domain/`: core entities and business behavior.
- `Infrastructure/`: EF Core, repositories, and framework integrations.

## Dependency direction

- `Controllers -> Application`
- `Application -> Domain`
- `Infrastructure -> Application + Domain`

`Program.cs` wires all layers through `AddApplication()` and `AddInfrastructure()`.

## Adding a new feature

1. Add entity/value objects to `Domain/` if needed.
2. Add contracts and service interface/implementation in `Application/<Feature>/`.
3. Add repository implementation or external integration in `Infrastructure/`.
4. Add a controller endpoint in `Controllers/` that calls the application service.

## Current sample feature

`Todos` is implemented end-to-end as a reference slice:

- Contracts: `Application/Todos/Contracts/`
- Service: `Application/Todos/TodoService.cs`
- Repository: `Infrastructure/Repositories/TodoRepository.cs`
- API: `Controllers/TodosController.cs`