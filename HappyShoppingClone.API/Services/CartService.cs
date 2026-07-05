using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Services;

public class CartService
{
    private readonly MongoDbContext _context;

    public CartService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetCartByUserId(string userId)
    {
        return await _context.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();
    }

    public async Task<Cart> CreateCart(Cart cart)
    {
        cart.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.Carts.InsertOneAsync(cart);
        return cart;
    }

    public async Task<Cart?> AddItemToCart(string userId, CartItem item)
    {
        var cart = await GetCartByUserId(userId);
        if (cart == null)
        {
            cart = new Cart
            {
                UserId = userId,
                Items = new List<CartItem> { item }
            };
            return await CreateCart(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == item.ProductId && i.VariantId == item.VariantId);
        if (existingItem != null)
        {
            existingItem.Quantity += item.Quantity;
        }
        else
        {
            cart.Items.Add(item);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        return cart;
    }

    public async Task<Cart?> UpdateCartItem(string userId, string productId, string variantId, int quantity)
    {
        var cart = await GetCartByUserId(userId);
        if (cart != null)
        {
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId && i.VariantId == variantId);
            if (item != null)
            {
                item.Quantity = quantity;
                cart.UpdatedAt = DateTime.UtcNow;
                await _context.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
                return cart;
            }
        }
        return null;
    }

    public async Task<Cart?> RemoveCartItem(string userId, string productId, string variantId)
    {
        var cart = await GetCartByUserId(userId);
        if (cart != null)
        {
            var item = cart.Items.FirstOrDefault(i => i.ProductId == productId && i.VariantId == variantId);
            if (item != null)
            {
                cart.Items.Remove(item);
                cart.UpdatedAt = DateTime.UtcNow;
                await _context.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
                return cart;
            }
        }
        return null;
    }

    public async Task<bool> ClearCart(string userId)
    {
        var result = await _context.Carts.DeleteOneAsync(c => c.UserId == userId);
        return result.DeletedCount > 0;
    }
}
