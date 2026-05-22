using api.Application.Abstractions;
using api.Application.PaySchedules.Contracts;
using api.Domain.Entities;

namespace api.Application.PaySchedules;

public class PayScheduleService(IPayScheduleRepository repository) : IPayScheduleService
{
    public async Task<PayScheduleResponse?> GetAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var paySchedule = await repository.GetByUserIdAsync(userId, cancellationToken);
        return paySchedule is null ? null : Map(paySchedule);
    }

    public async Task<(PayScheduleResponse? Response, bool Conflict)> CreateAsync(
        Guid userId,
        CreatePayScheduleRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await repository.GetByUserIdAsync(userId, cancellationToken);
        if (existing is not null)
        {
            return (null, true);
        }

        var paySchedule = new PaySchedule
        {
            UserId = userId,
            Frequency = request.Frequency!.Value,
            AnchorPayDate = request.AnchorPayDate!.Value,
            EstimatedPayAmount = request.EstimatedPayAmount!.Value,
        };

        await repository.AddAsync(paySchedule, cancellationToken);
        await repository.SaveChangesAsync(cancellationToken);

        return (Map(paySchedule), false);
    }

    public async Task<PayScheduleResponse?> UpdateAsync(
        Guid userId,
        UpdatePayScheduleRequest request,
        CancellationToken cancellationToken = default)
    {
        var paySchedule = await repository.GetByUserIdAsync(userId, cancellationToken);
        if (paySchedule is null)
        {
            return null;
        }

        paySchedule.Frequency = request.Frequency!.Value;
        paySchedule.AnchorPayDate = request.AnchorPayDate!.Value;
        paySchedule.EstimatedPayAmount = request.EstimatedPayAmount!.Value;

        await repository.SaveChangesAsync(cancellationToken);

        return Map(paySchedule);
    }

    private static PayScheduleResponse Map(PaySchedule paySchedule)
    {
        return new PayScheduleResponse(
            paySchedule.Id,
            paySchedule.Frequency,
            paySchedule.AnchorPayDate,
            paySchedule.EstimatedPayAmount,
            paySchedule.CreatedAtUtc);
    }
}
