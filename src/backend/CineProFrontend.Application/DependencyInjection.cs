using Microsoft.Extensions.DependencyInjection;

namespace CineProFrontend.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        var assembly = typeof(DependencyInjection).Assembly;

        var handlerTypes = assembly.GetTypes()
            .Where(t =>
                t.IsClass &&
                !t.IsAbstract &&
                t.Name.EndsWith("Handler") &&
                t.Namespace != null &&
                t.Namespace.StartsWith("CineProFrontend.Application.Features")
            );

        foreach (var type in handlerTypes)
        {
            services.AddScoped(type);
        }
        
        var serviceTypes = assembly.GetTypes()
            .Where(t =>
                t.IsClass &&
                !t.IsAbstract &&
                t.Namespace != null &&
                t.Namespace.StartsWith("CineProFrontend.Application.Services")
            );

        foreach (var type in serviceTypes)
        {
            var serviceInterface = type.GetInterfaces()
                .FirstOrDefault(i => i.Name == $"I{type.Name}");

            if (serviceInterface != null)
            {
                services.AddScoped(serviceInterface, type);
            }
            else
            {
                services.AddScoped(type);
            }
        }
        
        return services;
    }

}