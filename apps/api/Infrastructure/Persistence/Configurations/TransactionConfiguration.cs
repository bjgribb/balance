using api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.OccurredAt)
            .IsRequired();

        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        // Primary cascade path: deleting a PayPeriod removes its Transactions.
        builder.HasOne(x => x.PayPeriod)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.PayPeriodId)
            .OnDelete(DeleteBehavior.Cascade);

        // NoAction on UserId avoids a multiple-cascade-path conflict.
        // User deletion cascades via User → PayPeriod → Transaction.
        builder.HasOne(x => x.User)
            .WithMany(x => x.Transactions)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasIndex(x => new { x.UserId, x.OccurredAt });
        builder.HasIndex(x => x.PayPeriodId);
    }
}
