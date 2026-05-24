using api.Application.Todos;
using api.Application.FixedExpenses;
using api.Application.PaySchedules;
using Microsoft.Extensions.DependencyInjection;

namespace api.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ITodoService, TodoService>();
        services.AddScoped<IPayScheduleService, PayScheduleService>();
        services.AddScoped<IFixedExpenseService, FixedExpenseService>();
        return services;
    }
}

