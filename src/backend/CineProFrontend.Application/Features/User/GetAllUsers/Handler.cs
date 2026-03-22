using CineProFrontend.Infrastructure.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace CineProFrontend.Application.Features.User.GetAllUsers;

public class GetAllUsersHandler(UserManager<ApplicationUser> userManager)
{
    public async Task<List<ApplicationUser>> Handle(CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        // UserManager.Users returns IQueryable<ApplicationUser>
        return await userManager.Users
            .Where(u => !u.IsDeleted)
            .ToListAsync(ct);
    }
}