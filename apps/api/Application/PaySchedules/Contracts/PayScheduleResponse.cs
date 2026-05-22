using api.Domain.Enums;

namespace api.Application.PaySchedules.Contracts;

public record PayScheduleResponse(
    Guid Id,
    PayFrequency Frequency,
    DateOnly AnchorPayDate,
    decimal EstimatedPayAmount,
    DateTime CreatedAtUtc);
