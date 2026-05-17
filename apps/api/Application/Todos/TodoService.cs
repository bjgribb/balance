using api.Application.Abstractions;
using api.Application.Todos.Contracts;
using api.Domain.Entities;

namespace api.Application.Todos;

public class TodoService(ITodoRepository repository) : ITodoService
{
    public async Task<List<TodoResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var todos = await repository.GetAllAsync(cancellationToken);
        return todos.Select(Map).ToList();
    }

    public async Task<TodoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var todo = await repository.GetByIdAsync(id, cancellationToken);
        return todo is null ? null : Map(todo);
    }

    public async Task<TodoResponse> CreateAsync(CreateTodoRequest request, CancellationToken cancellationToken = default)
    {
        var todo = new TodoItem
        {
            Title = request.Title.Trim(),
            Description = request.Description?.Trim()
        };

        await repository.AddAsync(todo, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return Map(todo);
    }

    public async Task<TodoResponse?> UpdateAsync(Guid id, UpdateTodoRequest request, CancellationToken cancellationToken = default)
    {
        var todo = await repository.GetByIdAsync(id, cancellationToken);
        if (todo is null)
        {
            return null;
        }

        todo.Title = request.Title.Trim();
        todo.Description = request.Description?.Trim();
        todo.SetCompletion(request.IsCompleted);

        await repository.SaveChangesAsync(cancellationToken);
        return Map(todo);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var todo = await repository.GetByIdAsync(id, cancellationToken);
        if (todo is null)
        {
            return false;
        }

        await repository.DeleteAsync(todo, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static TodoResponse Map(TodoItem todo)
    {
        return new TodoResponse(
            todo.Id,
            todo.Title,
            todo.Description,
            todo.IsCompleted,
            todo.CreatedAtUtc,
            todo.CompletedAtUtc);
    }
}
