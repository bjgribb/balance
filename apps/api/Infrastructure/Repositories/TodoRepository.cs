using api.Application.Abstractions;
using api.Domain.Entities;
using api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api.Infrastructure.Repositories;

public class TodoRepository(ApplicationDbContext dbContext) : ITodoRepository
{
    public async Task<List<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Todos
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Todos
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(TodoItem todo, CancellationToken cancellationToken = default)
    {
        await dbContext.Todos.AddAsync(todo, cancellationToken);
    }

    public Task DeleteAsync(TodoItem todo, CancellationToken cancellationToken = default)
    {
        dbContext.Todos.Remove(todo);
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
