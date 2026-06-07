using System.Text;

namespace api.Infrastructure.Persistence;

public static class PostgresConnectionString
{
    public static string Normalize(string connectionString)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return connectionString;
        }

        if (!connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            && !connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            return connectionString;
        }

        if (!Uri.TryCreate(connectionString, UriKind.Absolute, out var uri))
        {
            return connectionString;
        }

        var userInfoParts = uri.UserInfo.Split(':', 2, StringSplitOptions.None);
        var username = userInfoParts.Length > 0 ? Uri.UnescapeDataString(userInfoParts[0]) : string.Empty;
        var password = userInfoParts.Length > 1 ? Uri.UnescapeDataString(userInfoParts[1]) : string.Empty;
        var database = uri.AbsolutePath.Trim('/');

        var builder = new StringBuilder();
        builder.Append("Host=").Append(uri.Host);
        builder.Append(";Port=").Append(uri.IsDefaultPort ? 5432 : uri.Port);
        builder.Append(";Database=").Append(string.IsNullOrWhiteSpace(database) ? "postgres" : database);

        if (!string.IsNullOrWhiteSpace(username))
        {
            builder.Append(";Username=").Append(username);
        }

        if (!string.IsNullOrWhiteSpace(password))
        {
            builder.Append(";Password=").Append(password);
        }

        foreach (var pair in uri.Query.TrimStart('?').Split('&', StringSplitOptions.RemoveEmptyEntries))
        {
            var kv = pair.Split('=', 2, StringSplitOptions.None);
            var rawKey = Uri.UnescapeDataString(kv[0]);
            if (string.IsNullOrWhiteSpace(rawKey))
            {
                continue;
            }

            var value = kv.Length > 1 ? Uri.UnescapeDataString(kv[1]) : string.Empty;
            var key = rawKey.Equals("sslmode", StringComparison.OrdinalIgnoreCase)
                ? "SSL Mode"
                : rawKey;

            builder.Append(';').Append(key).Append('=').Append(value);
        }

        return builder.ToString();
    }
}