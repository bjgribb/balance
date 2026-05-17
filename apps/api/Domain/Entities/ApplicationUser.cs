using Microsoft.AspNetCore.Identity;

namespace api.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public PaySchedule? PaySchedule { get; set; }
    public ICollection<PayPeriod> PayPeriods { get; set; } = [];
    public ICollection<FixedExpense> FixedExpenses { get; set; } = [];
    public ICollection<Transaction> Transactions { get; set; } = [];
    public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
}
