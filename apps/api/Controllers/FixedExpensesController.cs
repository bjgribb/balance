using api.Application.Abstractions;
using api.Application.FixedExpenses;
using api.Application.FixedExpenses.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/fixed-expenses")]
[Authorize]
public class FixedExpensesController(
    IFixedExpenseService fixedExpenseService,
    ICurrentUserAccessor currentUserAccessor) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FixedExpenseResponse>>> GetAll(CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        List<FixedExpenseResponse> expenses = await fixedExpenseService.GetAllAsync(userId, cancellationToken);
        return Ok(expenses);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<FixedExpenseResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        FixedExpenseResponse? expense = await fixedExpenseService.GetByIdAsync(userId, id, cancellationToken);
        return expense is null ? NotFound() : Ok(expense);
    }

    [HttpPost]
    public async Task<ActionResult<FixedExpenseResponse>> Create(
        [FromBody] CreateFixedExpenseRequest request,
        CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        FixedExpenseResponse expense = await fixedExpenseService.CreateAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<FixedExpenseResponse>> Update(
        Guid id,
        [FromBody] UpdateFixedExpenseRequest request,
        CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        FixedExpenseResponse? expense = await fixedExpenseService.UpdateAsync(userId, id, request, cancellationToken);
        return expense is null ? NotFound() : Ok(expense);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        bool deleted = await fixedExpenseService.DeleteAsync(userId, id, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}