using CineProFrontend.Infrastructure.Authentication;

namespace CineProFrontend.Application.Features.User.SignIn;

public class SignInAsyncHandler
{
    public static async Task<string?> Handle(string username, string password, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();
/*
        var user = await _userManager.FindByNameAsync(username);
        if (user == null)
            return null;

        var result = await _signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true);
        if (!result.Succeeded)
            return null;

        // Generate JWT token
        var secret = _config["Jwt:IssuerSigningKey"] ?? "super_secret_key_123";
        var issuer = _config["Jwt:ValidIssuer"] ?? "CineProFrontend";
        var audience = _config["Jwt:ValidAudience"] ?? "CineProFrontendAudience";

        var token = JwtHelper.GenerateToken(user, issuer, audience, secret, TimeSpan.FromHours(1));
*/
        return "token token yes yes";

    }

}