using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly MongoDbContext _context;

    public CartController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult> GetUserCart(string userId)
    {
        var cart = await _context.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();
        if (cart == null)
        {
            return Ok(new { success = true, cart = new Cart { UserId = userId, Items = new List<CartItem>(), TotalAmount = 0 } });
        }
        return Ok(new { success = true, cart });
    }

    [HttpPost]
    public async Task<ActionResult> AddToCart([FromBody] Cart cart)
    {
        var existingCart = await _context.Carts.Find(c => c.UserId == cart.UserId).FirstOrDefaultAsync();
        
        if (existingCart == null)
        {
            cart.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
            cart.Subtotal = cart.Items.Sum(i => i.Price * i.Quantity);
            cart.TotalAmount = cart.Subtotal - cart.DiscountAmount + cart.DeliveryCharge;
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.InsertOneAsync(cart);
            return Ok(new { success = true, cart });
        }
        else
        {
            // Merge items - check for same product AND variant
            foreach (var newItem in cart.Items)
            {
                var existingItem = existingCart.Items.FirstOrDefault(i => 
                    i.ProductId == newItem.ProductId && i.VariantId == newItem.VariantId);
                if (existingItem != null)
                {
                    existingItem.Quantity += newItem.Quantity;
                }
                else
                {
                    existingCart.Items.Add(newItem);
                }
            }
            
            // Recalculate totals
            existingCart.Subtotal = existingCart.Items.Sum(i => i.Price * i.Quantity);
            existingCart.TotalAmount = existingCart.Subtotal - existingCart.DiscountAmount + existingCart.DeliveryCharge;
            existingCart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.ReplaceOneAsync(c => c.Id == existingCart.Id, existingCart);
            return Ok(new { success = true, cart = existingCart });
        }
    }

    [HttpPut("{cartId}")]
    public async Task<ActionResult> UpdateCart(string cartId, [FromBody] Cart cart)
    {
        var existingCart = await _context.Carts.Find(c => c.Id == cartId).FirstOrDefaultAsync();
        if (existingCart == null)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }

        cart.Id = cartId;
        cart.UserId = existingCart.UserId;
        cart.UpdatedAt = DateTime.UtcNow;
        cart.Subtotal = cart.Items.Sum(i => i.Price * i.Quantity);
        cart.TotalAmount = cart.Subtotal - cart.DiscountAmount + cart.DeliveryCharge;
        
        await _context.Carts.ReplaceOneAsync(c => c.Id == cartId, cart);
        return Ok(new { success = true, cart });
    }

    [HttpPut("{cartId}/item/{itemId}")]
    public async Task<ActionResult> UpdateCartItem(string cartId, string itemId, [FromBody] UpdateCartItemRequest request)
    {
        var cart = await _context.Carts.Find(c => c.Id == cartId).FirstOrDefaultAsync();
        if (cart == null)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }

        var item = cart.Items.FirstOrDefault(i => i.ProductId == itemId && i.VariantId == request.VariantId);
        if (item != null)
        {
            item.Quantity = request.Quantity;
            cart.Subtotal = cart.Items.Sum(i => i.Price * i.Quantity);
            cart.TotalAmount = cart.Subtotal - cart.DiscountAmount + cart.DeliveryCharge;
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.ReplaceOneAsync(c => c.Id == cartId, cart);
        }

        return Ok(new { success = true, cart });
    }

    [HttpDelete("{cartId}/item/{itemId}/{variantId}")]
    public async Task<ActionResult> RemoveFromCart(string cartId, string itemId, string variantId)
    {
        var cart = await _context.Carts.Find(c => c.Id == cartId).FirstOrDefaultAsync();
        if (cart == null)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }

        var item = cart.Items.FirstOrDefault(i => i.ProductId == itemId && i.VariantId == variantId);
        if (item != null)
        {
            cart.Items.Remove(item);
            cart.Subtotal = cart.Items.Sum(i => i.Price * i.Quantity);
            cart.TotalAmount = cart.Subtotal - cart.DiscountAmount + cart.DeliveryCharge;
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.Carts.ReplaceOneAsync(c => c.Id == cartId, cart);
        }

        return Ok(new { success = true, cart });
    }

    [HttpDelete("{cartId}")]
    public async Task<ActionResult> ClearCart(string cartId)
    {
        var result = await _context.Carts.DeleteOneAsync(c => c.Id == cartId);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "Cart not found" });
        }
        return Ok(new { success = true, message = "Cart cleared successfully" });
    }
}

public class UpdateCartItemRequest
{
    public string VariantId { get; set; } = string.Empty;
    public int Quantity { get; set; }
}
