using System.Security.Cryptography;
using CineProFrontend.Application;
using CineProFrontend.Infrastructure;
using CineProFrontend.Infrastructure.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CineProFrontend.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// -----------------------
// Logger
// -----------------------
var logger = builder.Services.BuildServiceProvider()
    .GetRequiredService<ILogger<Program>>();

// -----------------------
// CORS + Session
// -----------------------
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CORS_CONFIG", cors =>
    {
        cors.WithOrigins("*")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// -----------------------
// Configure Identity + DbContext
// -----------------------
var connection = builder.Configuration.GetConnectionString("Default")?.Trim();
var useInMemory = string.IsNullOrWhiteSpace(connection);

if (!useInMemory)
{
    try
    {
        var optionsBuilder = new DbContextOptionsBuilder<AppIdentityDbContext>();
        optionsBuilder.UseSqlServer(connection);

        await using var testContext = new AppIdentityDbContext(optionsBuilder.Options);
        if (!testContext.Database.CanConnect())
        {
            logger.LogWarning("Cannot connect to SQL Server. Falling back to InMemory database.");
            useInMemory = true;
        }
    }
    catch (Exception ex)
    {
        useInMemory = true;
        logger.LogWarning("Cannot connect to SQL Server. Falling back to InMemory database. " + ex.Message);
    }
}

builder.Services.AddDbContext<AppIdentityDbContext>(options =>
{
    if (useInMemory)
        options.UseInMemoryDatabase("CineProFrontendInMemoryDb");
    else
        options.UseSqlServer(connection);
});

builder.Services.AddTransient<AppDbInitializer>();

builder.Services.AddIdentityCore<ApplicationUser>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireDigit = true;
})
.AddRoles<IdentityRole<Guid>>()
.AddEntityFrameworkStores<AppIdentityDbContext>()
.AddDefaultTokenProviders();

// -----------------------
// Register Application DI
// -----------------------
builder.Services.AddApplicationServices();

// -----------------------
// OpenAPI
// -----------------------
builder.Services.AddOpenApi();

// -----------------------
// JWT authentication
// -----------------------
var jwtKey = builder.Configuration["Jwt:IssuerSigningKey"];
if (string.IsNullOrEmpty(jwtKey))
{
    var keyBytes = RandomNumberGenerator.GetBytes(32);
    jwtKey = Convert.ToBase64String(keyBytes);
}
var jwtIssuer = builder.Configuration["Jwt:ValidIssuer"] ?? "CineProFrontend";
var jwtAudience = builder.Configuration["Jwt:ValidAudience"] ?? "CineProFrontendAudience";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// -----------------------
// Controllers
// -----------------------
builder.Services.AddControllers();

var app = builder.Build();

// -----------------------
// Middleware
// -----------------------
app.UseCors("CORS_CONFIG");
app.UseSession();
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapOpenApi("/resources/{documentName}.yaml");

// -----------------------
// Seed database if needed
// -----------------------
using (var scope = app.Services.CreateScope())
{
    var initializer = scope.ServiceProvider.GetRequiredService<AppDbInitializer>();
    await initializer.RunAsync();
}

app.Run();