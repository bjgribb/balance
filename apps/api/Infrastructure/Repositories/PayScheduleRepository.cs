using api.Application.Abstractions;
using api.Domain.Entities;
using api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace api.Infrastructure.Repositories;

public class PayScheduleRepository(ApplicationDbContext dbContext) : IPayScheduleRepository
{
    public async Task<PaySchedule?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await dbContext.PaySchedules
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public async Task AddAsync(PaySchedule paySchedule, CancellationToken cancellationToken = default)
    {
        await dbContext.PaySchedules.AddAsync(paySchedule, cancellationToken);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
