using CineProFrontend.Domain;
using CineProFrontend.Domain.Users;
using Microsoft.AspNetCore.Identity;

namespace CineProFrontend.Application.Services.Identity;

public interface IIdentityService
{
    // Login
    Task<List<User>> GetAllUsersAsync(CancellationToken ct);
    Task<User> GetUserByIdAsync(Guid userId, CancellationToken ct);
    Task<string?> SignInAsync(string username, string password, CancellationToken ct);
}