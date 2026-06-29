namespace HappyShoppingClone.API.Models;

public class Payment
{
    public string? Id { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty; // COD, WhatsApp, PhonePe, CreditCard, NetBanking, UPI
    public string PaymentStatus { get; set; } = "Pending"; // Pending, Processing, Completed, Failed, Refunded
    public decimal Amount { get; set; }
    public string TransactionId { get; set; } = string.Empty;
    public string PaymentGateway { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
    public string FailureReason { get; set; } = string.Empty;
    public PaymentDetails Details { get; set; } = new();
}

public class PaymentDetails
{
    public string CardNumber { get; set; } = string.Empty;
    public string CardHolderName { get; set; } = string.Empty;
    public string CardExpiry { get; set; } = string.Empty;
    public string BankName { get; set; } = string.Empty;
    public string UpiId { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

public class CheckoutRequest
{
    public string UserId { get; set; } = string.Empty;
    public Address ShippingAddress { get; set; } = new();
    public Address BillingAddress { get; set; } = new();
    public string PaymentMethod { get; set; } = string.Empty;
    public PaymentDetails PaymentDetails { get; set; } = new();
    public string CouponCode { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}

public class CheckoutResponse
{
    public bool Success { get; set; }
    public string OrderId { get; set; } = string.Empty;
    public string PaymentId { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public string RedirectUrl { get; set; } = string.Empty;
}
