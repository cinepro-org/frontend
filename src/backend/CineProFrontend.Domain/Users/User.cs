namespace CineProFrontend.Domain.Users;

public class User
{
    public Guid Id { get; private set; }
    public string DisplayName { get; private set; }

    private User()
    {
        DisplayName = string.Empty;
    }

    public User(Guid id, string displayName)
    {
        if (string.IsNullOrWhiteSpace(displayName))
            throw new ArgumentException("DisplayName required.");

        Id = id;
        DisplayName = displayName;
    }
}
