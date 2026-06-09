using System.Text;
using api.Application;
using api.Infrastructure;
using api.Infrastructure.Auth;
using api.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
var webClientCorsPolicy = "WebClient";

string? defaultConnectionFromEnv =
    Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrWhiteSpace(defaultConnectionFromEnv))
{
    builder.Configuration["ConnectionStrings:DefaultConnection"] =
        PostgresConnectionString.Normalize(defaultConnectionFromEnv);
}

string? resolvedConnectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(resolvedConnectionString))
{
    throw new InvalidOperationException(
        "Missing required connection string. Set ConnectionStrings__DefaultConnection or DATABASE_URL.");
}

string port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

var configuredCorsOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>()
    ?.Where(origin => !string.IsNullOrWhiteSpace(origin))
    .Select(origin => origin.Trim().TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

var envCorsOrigins = (Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS") ?? string.Empty)
    .Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries)
    .Select(origin => origin.TrimEnd('/'))
    .Distinct(StringComparer.OrdinalIgnoreCase)
    .ToArray();

var allowedCorsOrigins = envCorsOrigins.Length > 0
    ? envCorsOrigins
    : configuredCorsOrigins;

if (allowedCorsOrigins is null || allowedCorsOrigins.Length == 0)
{
    throw new InvalidOperationException(
        "Missing allowed CORS origins. Set CORS_ALLOWED_ORIGINS or Cors:AllowedOrigins.");
}

builder.Services.AddControllers();
builder.Services.AddHealthChecks();
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options =>
{
    options.AddPolicy(webClientCorsPolicy, policy =>
    {
        policy.WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

JwtSettings jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()!;
if (string.IsNullOrWhiteSpace(jwtSettings.SecretKey)
    || string.IsNullOrWhiteSpace(jwtSettings.Issuer)
    || string.IsNullOrWhiteSpace(jwtSettings.Audience))
{
    throw new InvalidOperationException(
        "Missing required JWT configuration. Ensure Jwt__SecretKey, Jwt__Issuer, and Jwt__Audience are set.");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
            ClockSkew = TimeSpan.Zero,
        };
    });

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

WebApplication app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseCors(webClientCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapHealthChecks("/health");
app.MapControllers();

app.Run();
