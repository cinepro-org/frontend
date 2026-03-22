using CineProFrontend.Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace CineProFrontend.Infrastructure.Data;

public class AppDbInitializer(
    AppIdentityDbContext appDbContext,
    ILogger<AppDbInitializer> logger,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole<Guid>> roleManager)
{
    public async Task RunAsync()
    {
        try
        {
            if (await appDbContext.Database.EnsureCreatedAsync())
            {
                logger.LogInformation("Database created. Seeding initial data...");
                await InitializeDatabaseAsync();
            }
            else
            {
                logger.LogInformation("Database already exists. Skipping seeding.");
            }

            logger.LogInformation("Successfully connected to the database.");
        }
        catch (Exception e)
        {
            logger.LogCritical(e, "Failed to connect to the database. Please check your connection string.");
            throw;
        }
    }

    private async Task InitializeDatabaseAsync()
    {
        // Roles
        if (!await roleManager.RoleExistsAsync("Administrator"))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>("Administrator"));
        }
        if (!await roleManager.RoleExistsAsync("User"))
        {
            await roleManager.CreateAsync(new IdentityRole<Guid>("User"));
        }

        // Admin user
        var adminUser = await userManager.FindByNameAsync("admin");
        if (adminUser == null)
        {
            var defaultAdmin = new ApplicationUser
            {
                UserName = "admin",
            };

            var result = await userManager.CreateAsync(defaultAdmin, "Admin123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(defaultAdmin, "Administrator");
                logger.LogWarning("Default admin user created (username: admin)");
            }
            else
            {
                logger.LogError("Failed to create default admin: {Errors}",
                    string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        
        await appDbContext.SaveChangesAsync();
    }
}