using api.Domain.Entities;

namespace api.Application.Abstractions;

public interface ITokenService
{
    string GenerateAccessToken(ApplicationUser user);
    string GenerateRefreshToken();
}
