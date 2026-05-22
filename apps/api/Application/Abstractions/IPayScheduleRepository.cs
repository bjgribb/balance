using api.Domain.Entities;

namespace api.Application.Abstractions;

public interface IPayScheduleRepository
{
    Task<PaySchedule?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task AddAsync(PaySchedule paySchedule, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
