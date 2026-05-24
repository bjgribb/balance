using api.Application.Abstractions;
using api.Application.PaySchedules;
using api.Application.PaySchedules.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/pay-schedule")]
[Authorize]
public class PayScheduleController(
    IPayScheduleService payScheduleService,
    ICurrentUserAccessor currentUserAccessor) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PayScheduleResponse>> Get(CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        PayScheduleResponse? response = await payScheduleService.GetAsync(userId, cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<PayScheduleResponse>> Create(
        [FromBody] CreatePayScheduleRequest request,
        CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        (PayScheduleResponse? response, bool conflict) = await payScheduleService.CreateAsync(userId, request, cancellationToken);
        if (conflict)
        {
            return Conflict(new { errors = new[] { "A pay schedule already exists for this account." } });
        }

        return CreatedAtAction(nameof(Get), response);
    }

    [HttpPut]
    public async Task<ActionResult<PayScheduleResponse>> Update(
        [FromBody] UpdatePayScheduleRequest request,
        CancellationToken cancellationToken)
    {
        if (!currentUserAccessor.TryGetUserId(out Guid userId))
        {
            return Unauthorized();
        }

        PayScheduleResponse? response = await payScheduleService.UpdateAsync(userId, request, cancellationToken);
        return response is null ? NotFound() : Ok(response);
    }
}
