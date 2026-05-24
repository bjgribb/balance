using api.Application.Abstractions;
using api.Domain.Entities;
using api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api.Infrastructure.Repositories;

public class FixedExpenseRepository(ApplicationDbContext dbContext) : IFixedExpenseRepository
{
    public async Task<List<FixedExpense>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.FixedExpenses
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<FixedExpense?> GetByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.FixedExpenses
            .FirstOrDefaultAsync(x => x.UserId == userId && x.Id == id, cancellationToken);
    }

    public async Task AddAsync(FixedExpense fixedExpense, CancellationToken cancellationToken = default)
    {
        await dbContext.FixedExpenses.AddAsync(fixedExpense, cancellationToken);
    }

    public Task DeleteAsync(FixedExpense fixedExpense, CancellationToken cancellationToken = default)
    {
        dbContext.FixedExpenses.Remove(fixedExpense);
        return Task.CompletedTask;
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}