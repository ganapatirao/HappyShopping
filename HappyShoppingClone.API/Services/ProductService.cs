using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Services;

public class ProductService
{
    private readonly MongoDbContext _context;

    public ProductService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllProducts()
    {
        return await _context.Products.Find(_ => true).ToListAsync();
    }

    public async Task<Product?> GetProductById(string id)
    {
        return await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Product>> GetProductsByCategory(string category)
    {
        return await _context.Products.Find(_ => true).ToListAsync();
    }

    public async Task<List<Product>> GetProductsByVendor(string vendorId)
    {
        return await _context.Products.Find(p => p.VendorId == vendorId).ToListAsync();
    }

    public async Task<List<Product>> SearchProducts(string query)
    {
        var filter = Builders<Product>.Filter.Or(
            Builders<Product>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.Regex(p => p.Description, new MongoDB.Bson.BsonRegularExpression(query, "i"))
        );
        return await _context.Products.Find(filter).ToListAsync();
    }

    public async Task<Product> CreateProduct(Product product)
    {
        product.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.Products.InsertOneAsync(product);
        return product;
    }

    public async Task<Product?> UpdateProduct(string id, Product product)
    {
        product.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Products.ReplaceOneAsync(p => p.Id == id, product);
        if (result.ModifiedCount > 0)
        {
            return product;
        }
        return null;
    }

    public async Task<bool> DeleteProduct(string id)
    {
        var result = await _context.Products.DeleteOneAsync(p => p.Id == id);
        return result.DeletedCount > 0;
    }
}
