using System.ComponentModel.DataAnnotations;
using api.Domain.Enums;

namespace api.Application.FixedExpenses.Contracts;

public class UpdateFixedExpenseRequest : IValidatableObject
{
    [Required]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal? Amount { get; set; }

    [Required]
    public DateOnly? AnchorDate { get; set; }

    [Required]
    public RecurrenceUnit? RecurrenceUnit { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int? RecurrenceInterval { get; set; }

    public bool IsActive { get; set; } = true;

    public DateOnly? SkipUntilDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (string.IsNullOrWhiteSpace(Name))
        {
            yield return new ValidationResult("Name cannot be empty.", [nameof(Name)]);
        }

        if (RecurrenceUnit.HasValue && !Enum.IsDefined(RecurrenceUnit.Value))
        {
            yield return new ValidationResult(
                "RecurrenceUnit must be one of: Day, Week, Month.",
                [nameof(RecurrenceUnit)]);
        }

        if (AnchorDate.HasValue && SkipUntilDate.HasValue && SkipUntilDate.Value < AnchorDate.Value)
        {
            yield return new ValidationResult(
                "SkipUntilDate cannot be earlier than AnchorDate.",
                [nameof(SkipUntilDate)]);
        }
    }
}