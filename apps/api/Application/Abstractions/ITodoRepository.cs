using api.Domain.Entities;

namespace api.Application.Abstractions;

public interface ITodoRepository
{
    Task<List<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(TodoItem todo, CancellationToken cancellationToken = default);
    Task DeleteAsync(TodoItem todo, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
