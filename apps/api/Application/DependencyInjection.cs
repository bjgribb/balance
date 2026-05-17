using api.Application.Todos;
using Microsoft.Extensions.DependencyInjection;

namespace api.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ITodoService, TodoService>();
        return services;
    }
}
