using CineProFrontend.Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace CineProFrontend.Infrastructure;

public static class DependencyInjection
{
    public static void AddInfrastructure(this IServiceCollection services,
        string connectionString)
    {
        services.AddDbContext<AppIdentityDbContext>(options =>
            options.UseInMemoryDatabase(connectionString));

        services.AddIdentityCore<ApplicationUser>()
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<AppIdentityDbContext>()
            .AddDefaultTokenProviders();
    }
}
