namespace HappyShoppingClone.API.Models;

public class Cart
{
    public string? Id { get; set; }
    public string UserId { get; set; } = string.Empty;
    public List<CartItem> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public decimal DeliveryCharge { get; set; } = 0;
    public decimal TotalAmount { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class CartItem
{
    public string ProductId { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;
    public string ProductImage { get; set; } = string.Empty;
    public string VariantId { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string ColorCode { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public decimal DiscountPercentage { get; set; }
    public int Stock { get; set; }
}
