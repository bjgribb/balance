using System.ComponentModel.DataAnnotations;

namespace api.Application.Todos.Contracts;

public class CreateTodoRequest
{
    [Required]
    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Description { get; set; }
}
