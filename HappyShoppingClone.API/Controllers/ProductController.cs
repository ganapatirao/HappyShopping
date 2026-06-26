using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly MongoDbContext _context;

    public ProductController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult> CreateProduct([FromBody] Product product)
    {
        product.Id = null;
        product.CreatedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.Products.InsertOneAsync(product);
        return Ok(new { success = true, product });
    }

    [HttpGet]
    public async Task<ActionResult> GetAllProducts()
    {
        var products = await _context.Products.Find(_ => true).ToListAsync();
        return Ok(new { success = true, products });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetProductById(string id)
    {
        var product = await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (product == null)
        {
            return NotFound(new { success = false, error = "Product not found" });
        }
        return Ok(new { success = true, product });
    }

    [HttpGet("vendor/{vendorId}")]
    public async Task<ActionResult> GetProductsByVendor(string vendorId)
    {
        var products = await _context.Products.Find(p => p.VendorId == vendorId).ToListAsync();
        return Ok(new { success = true, products });
    }

    [HttpGet("category/{category}")]
    public async Task<ActionResult> GetProductsByCategory(string category)
    {
        var products = await _context.Products.Find(p => p.Category == category).ToListAsync();
        return Ok(new { success = true, products });
    }

    [HttpGet("search")]
    public async Task<ActionResult> SearchProducts([FromQuery] string query)
    {
        var filter = Builders<Product>.Filter.Or(
            Builders<Product>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.Regex(p => p.Description, new MongoDB.Bson.BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.AnyEq(p => p.Tags, query)
        );
        var products = await _context.Products.Find(filter).Limit(10).ToListAsync();
        return Ok(new { success = true, products });
    }

    [HttpGet("search/all")]
    public async Task<ActionResult> SearchAll([FromQuery] string query)
    {
        var results = new Dictionary<string, object>();
        
        // Search products
        var productFilter = Builders<Product>.Filter.Or(
            Builders<Product>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.Regex(p => p.Description, new MongoDB.Bson.BsonRegularExpression(query, "i")),
            Builders<Product>.Filter.AnyEq(p => p.Tags, query)
        );
        var products = await _context.Products.Find(productFilter).Limit(5).ToListAsync();
        results["products"] = products.Select(p => new { 
            p.Id, 
            p.Name, 
            p.Category, 
            p.SubCategory, 
            p.Price, 
            p.ImageBase64 
        });

        // Search categories
        var categoryFilter = Builders<Category>.Filter.Regex(c => c.Name, new MongoDB.Bson.BsonRegularExpression(query, "i"));
        var categories = await _context.Categories.Find(categoryFilter).Limit(5).ToListAsync();
        results["categories"] = categories.Select(c => new { c.Id, c.Name, c.Icon });

        // Search subcategories
        var subCategoryFilter = Builders<SubCategory>.Filter.Regex(sc => sc.Name, new MongoDB.Bson.BsonRegularExpression(query, "i"));
        var subCategories = await _context.SubCategories.Find(subCategoryFilter).Limit(5).ToListAsync();
        results["subCategories"] = subCategories.Select(sc => new { sc.Id, sc.Name, sc.CategoryId });

        return Ok(new { success = true, results });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateProduct(string id, [FromBody] Product product)
    {
        product.Id = id;
        product.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Products.ReplaceOneAsync(p => p.Id == id, product);
        if (result.MatchedCount == 0)
        {
            return NotFound(new { success = false, error = "Product not found" });
        }
        return Ok(new { success = true, product });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteProduct(string id)
    {
        var result = await _context.Products.DeleteOneAsync(p => p.Id == id);
        if (result.DeletedCount == 0)
        {
            return NotFound(new { success = false, error = "Product not found" });
        }
        return Ok(new { success = true, message = "Product deleted successfully" });
    }

    [HttpPost("{id}/featured")]
    public async Task<ActionResult> ToggleFeatured(string id, [FromBody] ToggleFeaturedRequest request)
    {
        var product = await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (product == null)
        {
            return NotFound(new { success = false, error = "Product not found" });
        }

        product.IsFeatured = request.IsFeatured;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.Products.ReplaceOneAsync(p => p.Id == id, product);

        return Ok(new { success = true, product });
    }
}

public class ToggleFeaturedRequest
{
    public bool IsFeatured { get; set; }
}
