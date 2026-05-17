using api.Application.Auth.Contracts;

namespace api.Application.Auth;

public interface IAuthService
{
    Task<(AuthResponse? Response, string[] Errors)> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponse?> RefreshAsync(string refreshToken, CancellationToken cancellationToken = default);
}
