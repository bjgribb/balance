using api.Application.PaySchedules.Contracts;

namespace api.Application.PaySchedules;

public interface IPayScheduleService
{
    Task<PayScheduleResponse?> GetAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<(PayScheduleResponse? Response, bool Conflict)> CreateAsync(
        Guid userId,
        CreatePayScheduleRequest request,
        CancellationToken cancellationToken = default);
    Task<PayScheduleResponse?> UpdateAsync(
        Guid userId,
        UpdatePayScheduleRequest request,
        CancellationToken cancellationToken = default);
}
