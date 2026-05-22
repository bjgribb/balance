using api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Infrastructure.Persistence.Configurations;

public class PayScheduleConfiguration : IEntityTypeConfiguration<PaySchedule>
{
    public void Configure(EntityTypeBuilder<PaySchedule> builder)
    {
        builder.ToTable("pay_schedules", t =>
        {
            t.HasCheckConstraint("ck_pay_schedules_estimated_pay_amount_positive", "estimated_pay_amount > 0");
        });

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Frequency)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.AnchorPayDate)
            .IsRequired();

        builder.Property(x => x.EstimatedPayAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        builder.HasOne(x => x.User)
            .WithOne(x => x.PaySchedule)
            .HasForeignKey<PaySchedule>(x => x.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // Unique index enforces the one-to-one relationship at the DB level.
        builder.HasIndex(x => x.UserId)
            .IsUnique();
    }
}
