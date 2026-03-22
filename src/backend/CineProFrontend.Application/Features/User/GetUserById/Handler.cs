using CineProFrontend.Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;

namespace CineProFrontend.Application.Features.User.GetUserById;

// ReSharper disable once ClassNeverInstantiated.Global
public class GetUserByIdHandler(UserManager<ApplicationUser> userManager)
{
    public async Task<GetUserByIdResponse> Handle(GetUserByIdQuery query, CancellationToken ct)
    {
        // Respect the cancellation token at the start
        ct.ThrowIfCancellationRequested();

        var user = await userManager.FindByIdAsync(query.UserId.ToString());

        // Optional: check cancellation again
        ct.ThrowIfCancellationRequested();

        if (user is null)
            throw new InvalidOperationException("User not found.");

        return new GetUserByIdResponse(user.Id, user.UserName!);
    }
}