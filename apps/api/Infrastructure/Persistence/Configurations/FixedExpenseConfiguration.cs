using api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Infrastructure.Persistence.Configurations;

public class FixedExpenseConfiguration : IEntityTypeConfiguration<FixedExpense>
{
    public void Configure(EntityTypeBuilder<FixedExpense> builder)
    {
        builder.ToTable("fixed_expenses", t =>
        {
            t.HasCheckConstraint("ck_fixed_expenses_amount_positive", "amount > 0");
            t.HasCheckConstraint(
                "ck_fixed_expenses_recurrence_interval_positive",
                "recurrence_interval > 0");
            t.HasCheckConstraint(
                "ck_fixed_expenses_recurrence_unit_valid",
                "recurrence_unit IN ('Day', 'Week', 'Month')");
            t.HasCheckConstraint(
                "ck_fixed_expenses_skip_until_after_anchor",
                "skip_until_date IS NULL OR skip_until_date >= anchor_date");
        });

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.Property(x => x.AnchorDate)
            .IsRequired();

        builder.Property(x => x.RecurrenceUnit)
            .HasConversion<string>()
            .HasMaxLength(10)
            .IsRequired();

        builder.Property(x => x.RecurrenceInterval)
            .IsRequired();

        builder.Property(x => x.SkipUntilDate)
            .IsRequired(false);

        builder.HasOne(x => x.User)
            .WithMany(x => x.FixedExpenses)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => x.UserId);

        builder.HasIndex(x => new { x.UserId, x.IsActive });
    }
}
