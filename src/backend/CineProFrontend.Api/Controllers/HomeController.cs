using Microsoft.AspNetCore.Mvc;

namespace CineProFrontend.Api.Controllers;

public class HomeController : ControllerBase
{
    [HttpGet("/")]
    public async Task<IActionResult> HomeRoute(CancellationToken ct)
    {
        return Ok(new { status = "ok", message = "CinePro Frontend Backend Service running.... Very Very Very Very early acces Beta" });
    }
}