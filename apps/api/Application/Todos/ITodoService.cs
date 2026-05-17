using api.Application.Todos.Contracts;

namespace api.Application.Todos;

public interface ITodoService
{
    Task<List<TodoResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TodoResponse?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TodoResponse> CreateAsync(CreateTodoRequest request, CancellationToken cancellationToken = default);
    Task<TodoResponse?> UpdateAsync(Guid id, UpdateTodoRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
