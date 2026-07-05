using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Services;

public class OrderService
{
    private readonly MongoDbContext _context;

    public OrderService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Order>> GetAllOrders()
    {
        return await _context.Orders.Find(_ => true).ToListAsync();
    }

    public async Task<Order?> GetOrderById(string id)
    {
        return await _context.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Order>> GetOrdersByUser(string userId)
    {
        return await _context.Orders.Find(o => o.UserId == userId).ToListAsync();
    }

    public async Task<Order> CreateOrder(Order order)
    {
        order.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        order.OrderDate = DateTime.UtcNow;
        order.EstimatedDeliveryDate = DateTime.UtcNow.AddDays(7);
        order.Status = "Pending";
        
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = "Pending",
            Timestamp = DateTime.UtcNow,
            Note = "Order placed successfully"
        });

        await _context.Orders.InsertOneAsync(order);

        // Update user stats
        var user = await _context.Users.Find(u => u.Id == order.UserId).FirstOrDefaultAsync();
        if (user != null)
        {
            user.OrderCount++;
            user.TotalSpent += order.FinalAmount;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
        }

        return order;
    }

    public async Task<Order?> UpdateOrderStatus(string id, string status)
    {
        var order = await _context.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();
        if (order != null)
        {
            order.Status = status;
            order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = status,
                Timestamp = DateTime.UtcNow,
                Note = $"Status updated to {status}"
            });
            await _context.Orders.ReplaceOneAsync(o => o.Id == id, order);
            return order;
        }
        return null;
    }
}
