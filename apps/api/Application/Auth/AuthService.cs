using api.Application.Abstractions;
using api.Application.Auth.Contracts;
using api.Domain.Entities;
using api.Infrastructure.Auth;
using api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace api.Application.Auth;

public class AuthService(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    ApplicationDbContext dbContext,
    IOptions<JwtSettings> jwtOptions) : IAuthService
{
    private readonly JwtSettings _jwt = jwtOptions.Value;

    public async Task<(AuthResponse? Response, string[] Errors)> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
        };

        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToArray();
            return (null, errors);
        }

        var response = await IssueTokensAsync(user, cancellationToken);
        return (response, []);
    }

    public async Task<AuthResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null) return null;

        var passwordValid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid) return null;

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthResponse?> RefreshAsync(
        string refreshToken,
        CancellationToken cancellationToken = default)
    {
        var stored = await dbContext.RefreshTokens
            .Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == refreshToken, cancellationToken);

        if (stored is null || stored.ExpiresAtUtc < DateTime.UtcNow)
            return null;

        dbContext.RefreshTokens.Remove(stored);

        var response = await IssueTokensAsync(stored.User, cancellationToken);
        return response;
    }

    private async Task<AuthResponse> IssueTokensAsync(
        ApplicationUser user,
        CancellationToken cancellationToken)
    {
        var accessToken = tokenService.GenerateAccessToken(user);
        var refreshTokenValue = tokenService.GenerateRefreshToken();

        var refreshToken = new RefreshToken
        {
            UserId = user.Id,
            Token = refreshTokenValue,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(_jwt.RefreshTokenExpirationDays),
        };

        dbContext.RefreshTokens.Add(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new AuthResponse(
            AccessToken: accessToken,
            AccessTokenExpiresAtUtc: DateTime.UtcNow.AddMinutes(_jwt.AccessTokenExpirationMinutes),
            RefreshToken: refreshTokenValue);
    }
}
