using api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace api.Infrastructure.Persistence.Configurations;

public class ApplicationUserConfiguration : IEntityTypeConfiguration<ApplicationUser>
{
    public void Configure(EntityTypeBuilder<ApplicationUser> builder)
    {
        builder.Property(x => x.CreatedAtUtc)
            .IsRequired();

        // Identity creates a non-unique EmailIndex on NormalizedEmail by default.
        // This adds an explicit unique index for DB-level enforcement.
        builder.HasIndex(x => x.NormalizedEmail)
            .IsUnique();
    }
}
