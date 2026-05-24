using api.Domain.Entities;

namespace api.Application.Abstractions;

public interface IFixedExpenseRepository
{
    Task<List<FixedExpense>> GetAllByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<FixedExpense?> GetByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(FixedExpense fixedExpense, CancellationToken cancellationToken = default);
    Task DeleteAsync(FixedExpense fixedExpense, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}