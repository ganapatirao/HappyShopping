using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentController : ControllerBase
{
    private readonly MongoDbContext _context;

    public PaymentController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost("checkout")]
    public async Task<ActionResult> ProcessCheckout([FromBody] CheckoutRequest request)
    {
        // Get user's cart
        var cart = await _context.Carts.Find(c => c.UserId == request.UserId).FirstOrDefaultAsync();
        if (cart == null || cart.Items.Count == 0)
        {
            return BadRequest(new { success = false, error = "Cart is empty" });
        }

        // Create order
        var order = new Order
        {
            UserId = request.UserId,
            Items = cart.Items.Select(item => new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                ImageUrl = item.ProductImage,
                VariantId = item.VariantId,
                Color = item.Color,
                Size = item.Size,
                Quantity = item.Quantity,
                Price = item.Price,
                Discount = item.OriginalPrice - item.Price
            }).ToList(),
            TotalAmount = cart.Subtotal,
            DiscountAmount = cart.DiscountAmount,
            FinalAmount = cart.TotalAmount,
            ShippingAddress = request.ShippingAddress,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = "Pending",
            Status = "Pending"
        };

        await _context.Orders.InsertOneAsync(order);

        // Create payment record
        var payment = new Payment
        {
            OrderId = order.Id,
            UserId = request.UserId,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = "Pending",
            Amount = order.FinalAmount,
            Details = request.PaymentDetails
        };

        if (request.PaymentMethod == "COD" || request.PaymentMethod == "WhatsApp")
        {
            payment.PaymentStatus = "Pending";
            payment.TransactionId = "COD-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        }
        else
        {
            payment.PaymentStatus = "Processing";
            payment.TransactionId = "TXN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        }

        await _context.Payments.InsertOneAsync(payment);

        // Clear cart
        await _context.Carts.DeleteOneAsync(c => c.UserId == request.UserId);

        return Ok(new CheckoutResponse
        {
            Success = true,
            OrderId = order.Id,
            PaymentId = payment.Id,
            Message = "Order placed successfully",
            TotalAmount = order.FinalAmount
        });
    }

    [HttpGet("order/{orderId}")]
    public async Task<ActionResult> GetPaymentByOrder(string orderId)
    {
        var payment = await _context.Payments.Find(p => p.OrderId == orderId).FirstOrDefaultAsync();
        if (payment == null)
        {
            return NotFound(new { success = false, error = "Payment not found" });
        }
        return Ok(new { success = true, payment });
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult> GetPaymentsByUser(string userId)
    {
        var payments = await _context.Payments.Find(p => p.UserId == userId)
            .SortByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(new { success = true, payments });
    }

    [HttpPut("{id}/status")]
    public async Task<ActionResult> UpdatePaymentStatus(string id, [FromBody] UpdatePaymentStatusRequest request)
    {
        var payment = await _context.Payments.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (payment == null)
        {
            return NotFound(new { success = false, error = "Payment not found" });
        }

        payment.PaymentStatus = request.PaymentStatus;
        if (request.PaymentStatus == "Completed")
        {
            payment.CompletedAt = DateTime.UtcNow;
        }
        if (request.PaymentStatus == "Failed")
        {
            payment.FailureReason = request.FailureReason ?? "Payment failed";
        }

        await _context.Payments.ReplaceOneAsync(p => p.Id == id, payment);

        // Update order payment status
        var order = await _context.Orders.Find(o => o.Id == payment.OrderId).FirstOrDefaultAsync();
        if (order != null)
        {
            order.PaymentStatus = request.PaymentStatus;
            if (request.PaymentStatus == "Completed")
            {
                order.Status = "Confirmed";
            }
            await _context.Orders.ReplaceOneAsync(o => o.Id == order.Id, order);
        }

        return Ok(new { success = true, payment });
    }

    [HttpPost("{id}/refund")]
    public async Task<ActionResult> RefundPayment(string id, [FromBody] RefundRequest request)
    {
        var payment = await _context.Payments.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (payment == null)
        {
            return NotFound(new { success = false, error = "Payment not found" });
        }

        if (payment.PaymentStatus != "Completed")
        {
            return BadRequest(new { success = false, error = "Can only refund completed payments" });
        }

        payment.PaymentStatus = "Refunded";
        await _context.Payments.ReplaceOneAsync(p => p.Id == id, payment);

        // Update order status
        var order = await _context.Orders.Find(o => o.Id == payment.OrderId).FirstOrDefaultAsync();
        if (order != null)
        {
            order.Status = "Refunded";
            await _context.Orders.ReplaceOneAsync(o => o.Id == order.Id, order);
        }

        return Ok(new { success = true, message = "Payment refunded successfully" });
    }
}

public class RefundRequest
{
    public string Reason { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
}
