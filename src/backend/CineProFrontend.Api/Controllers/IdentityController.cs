using CineProFrontend.Application.Services.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CineProFrontend.Api.Controllers;

[ApiController]
[Produces("application/json")]
[Route("/auth")]
public class IdentityController(IIdentityService userService) : ControllerBase
{
    // ReSharper disable once ReplaceWithPrimaryConstructorParameter
    private readonly IIdentityService _userService = userService;

    [HttpGet("user/{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id, CancellationToken ct)
    {
        var user = await _userService.GetUserByIdAsync(id, ct);
        return Ok(user);
    }
    
    [HttpGet]
    [Route("users")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = _userService.GetAllUsersAsync(ct);
        return Ok(users);
    }

}