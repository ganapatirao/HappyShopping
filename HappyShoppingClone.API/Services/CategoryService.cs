using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Services;

public class CategoryService
{
    private readonly MongoDbContext _context;

    public CategoryService(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllCategories()
    {
        return await _context.Categories.Find(_ => true).ToListAsync();
    }

    public async Task<Category?> GetCategoryById(string id)
    {
        return await _context.Categories.Find(c => c.Id == id).FirstOrDefaultAsync();
    }

    public async Task<List<Category>> GetFeaturedCategories()
    {
        return await _context.Categories.Find(c => c.IsFeatured == true).ToListAsync();
    }

    public async Task<Category> CreateCategory(Category category)
    {
        category.Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString();
        category.CreatedAt = DateTime.UtcNow;
        category.UpdatedAt = DateTime.UtcNow;
        await _context.Categories.InsertOneAsync(category);
        return category;
    }

    public async Task<Category?> UpdateCategory(string id, Category category)
    {
        category.UpdatedAt = DateTime.UtcNow;
        var result = await _context.Categories.ReplaceOneAsync(c => c.Id == id, category);
        if (result.ModifiedCount > 0)
        {
            return category;
        }
        return null;
    }

    public async Task<bool> DeleteCategory(string id)
    {
        var result = await _context.Categories.DeleteOneAsync(c => c.Id == id);
        return result.DeletedCount > 0;
    }
}
