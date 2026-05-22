using System.ComponentModel.DataAnnotations;
using api.Domain.Enums;

namespace api.Application.PaySchedules.Contracts;

public class CreatePayScheduleRequest : IValidatableObject
{
    [Required]
    public PayFrequency? Frequency { get; set; }

    [Required]
    public DateOnly? AnchorPayDate { get; set; }

    [Required]
    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal? EstimatedPayAmount { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Frequency.HasValue && !Enum.IsDefined(Frequency.Value))
        {
            yield return new ValidationResult(
                "Frequency must be one of: Weekly, BiWeekly, SemiMonthly, Monthly.",
                [nameof(Frequency)]);
        }
    }
}
