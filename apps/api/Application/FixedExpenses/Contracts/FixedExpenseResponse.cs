using api.Domain.Enums;

namespace api.Application.FixedExpenses.Contracts;

public record FixedExpenseResponse(
    Guid Id,
    string Name,
    decimal Amount,
    bool IsActive,
    DateOnly AnchorDate,
    RecurrenceUnit RecurrenceUnit,
    int RecurrenceInterval,
    DateOnly? SkipUntilDate,
    DateOnly? NextDueDate,
    DateTime CreatedAtUtc);