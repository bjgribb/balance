using api.Domain.Enums;

namespace api.Domain.Entities;

public class FixedExpense
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public int DueDayOfMonth { get; set; }

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public DateOnly? AnchorDate { get; set; }

    public RecurrenceUnit? RecurrenceUnit { get; set; }

    public int? RecurrenceInterval { get; set; }

    public DateOnly? SkipUntilDate { get; set; }

    public ApplicationUser User { get; set; } = null!;
}
