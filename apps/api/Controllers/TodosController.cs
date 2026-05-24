using api.Application.Todos;
using api.Application.Todos.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TodosController(ITodoService todoService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TodoResponse>>> GetAll(CancellationToken cancellationToken)
    {
        List<TodoResponse> todos = await todoService.GetAllAsync(cancellationToken);
        return Ok(todos);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TodoResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        TodoResponse? todo = await todoService.GetByIdAsync(id, cancellationToken);
        return todo is null ? NotFound() : Ok(todo);
    }

    [HttpPost]
    public async Task<ActionResult<TodoResponse>> Create([FromBody] CreateTodoRequest request, CancellationToken cancellationToken)
    {
        TodoResponse todo = await todoService.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = todo.Id }, todo);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TodoResponse>> Update(Guid id, [FromBody] UpdateTodoRequest request, CancellationToken cancellationToken)
    {
        TodoResponse? todo = await todoService.UpdateAsync(id, request, cancellationToken);
        return todo is null ? NotFound() : Ok(todo);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await todoService.DeleteAsync(id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}