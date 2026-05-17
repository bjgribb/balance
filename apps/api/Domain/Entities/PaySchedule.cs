using api.Domain.Enums;

namespace api.Domain.Entities;

public class PaySchedule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public PayFrequency Frequency { get; set; }
    public DateOnly AnchorPayDate { get; set; }
    public decimal EstimatedPayAmount { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ApplicationUser User { get; set; } = null!;
}
