using HappyShoppingClone.API.Models;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDb");
        
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("MongoDB connection string 'MongoDb' is not configured in appsettings.json");
        }
        
        try
        {
            var client = new MongoClient(connectionString);
            _database = client.GetDatabase("HappyShoppingClone");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to connect to MongoDB: {ex.Message}", ex);
        }
    }

    // User Collections
    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    public IMongoCollection<Vendor> Vendors => _database.GetCollection<Vendor>("Vendors");
    
    // Product Collections
    public IMongoCollection<Product> Products => _database.GetCollection<Product>("Products");
    public IMongoCollection<Company> Companies => _database.GetCollection<Company>("Companies");
    public IMongoCollection<Category> Categories => _database.GetCollection<Category>("Categories");
    public IMongoCollection<SubCategory> SubCategories => _database.GetCollection<SubCategory>("SubCategories");
    
    // Order Collections
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>("Orders");
    public IMongoCollection<Cart> Carts => _database.GetCollection<Cart>("Carts");
    public IMongoCollection<Payment> Payments => _database.GetCollection<Payment>("Payments");
    
    // Review Collections
    public IMongoCollection<Review> Reviews => _database.GetCollection<Review>("Reviews");
    
    // Configuration Collections
    public IMongoCollection<SiteConfiguration> SiteConfigurations => _database.GetCollection<SiteConfiguration>("SiteConfigurations");
}
