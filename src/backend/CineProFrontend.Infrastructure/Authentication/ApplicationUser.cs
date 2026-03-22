using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace CineProFrontend.Infrastructure.Authentication;

public class ApplicationUser : IdentityUser<Guid>
{
    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; } = null;
}
