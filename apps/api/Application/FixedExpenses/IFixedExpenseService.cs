using api.Application.FixedExpenses.Contracts;

namespace api.Application.FixedExpenses;

public interface IFixedExpenseService
{
    Task<List<FixedExpenseResponse>> GetAllAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<FixedExpenseResponse?> GetByIdAsync(Guid userId, Guid id, CancellationToken cancellationToken = default);
    Task<FixedExpenseResponse> CreateAsync(
        Guid userId,
        CreateFixedExpenseRequest request,
        CancellationToken cancellationToken = default);
    Task<FixedExpenseResponse?> UpdateAsync(
        Guid userId,
        Guid id,
        UpdateFixedExpenseRequest request,
        CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid userId, Guid id, CancellationToken cancellationToken = default);
}