namespace api.Domain.Entities;

public class TodoItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsCompleted { get; private set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; private set; }

    public void SetCompletion(bool isCompleted)
    {
        IsCompleted = isCompleted;
        CompletedAtUtc = isCompleted ? DateTime.UtcNow : null;
    }
}
