using CineProFrontend.Application.Features.User.GetAllUsers;
using CineProFrontend.Application.Features.User.GetUserById;
using CineProFrontend.Application.Features.User.SignIn;
using CineProFrontend.Domain.Users;

namespace CineProFrontend.Application.Services.Identity;

public class IdentityService(GetUserByIdHandler getUserByIdHandler, GetAllUsersHandler getAllUsersHandler) : IIdentityService
{
    public async Task<List<User>> GetAllUsersAsync(CancellationToken ct)
    {
        // Call your handler to get ApplicationUser list
        var appUsers = await getAllUsersHandler.Handle(ct);

        // Map each ApplicationUser to Domain.User
        var domainUsers = appUsers
            .Select(u => new User(u.Id, u.UserName!))
            .ToList();

        return domainUsers;
    }


    public async Task<User> GetUserByIdAsync(Guid userId, CancellationToken ct)
    {
        var result = await getUserByIdHandler.Handle(
            new GetUserByIdQuery(userId),
            ct
        );
        
        return new User(result.Id, result.DisplayName);
    }

    public async Task<string?> SignInAsync(string username, string password, CancellationToken ct)
    {
        var result = await SignInAsyncHandler.Handle(
            username,
            password,
            ct
        );

        return result;
    }
}