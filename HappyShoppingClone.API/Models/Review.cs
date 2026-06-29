namespace HappyShoppingClone.API.Models;

public class Review
{
    public string? Id { get; set; }
    public string ProductId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string UserAvatar { get; set; } = string.Empty;
    public int Rating { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public List<string> Images { get; set; } = new();
    public int HelpfulCount { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsVerifiedPurchase { get; set; } = false;
    public string VariantId { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public bool IsApproved { get; set; } = true;
    public List<ReviewReply> Replies { get; set; } = new();
}

public class ReviewReply
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
