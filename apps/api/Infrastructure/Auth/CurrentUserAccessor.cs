using System.Security.Claims;
using api.Application.Abstractions;
using Microsoft.AspNetCore.Http;

namespace api.Infrastructure.Auth;

public class CurrentUserAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUserAccessor
{
    public bool TryGetUserId(out Guid userId)
    {
        var user = httpContextAccessor.HttpContext?.User;
        var id = user?.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user?.FindFirstValue("sub");

        return Guid.TryParse(id, out userId);
    }
}
