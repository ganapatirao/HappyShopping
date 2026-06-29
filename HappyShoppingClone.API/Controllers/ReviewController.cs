using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly MongoDbContext _context;

    public ReviewController(MongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("product/{productId}")]
    public async Task<ActionResult> GetReviewsByProduct(string productId)
    {
        var reviews = await _context.Reviews
            .Find(r => r.ProductId == productId && r.IsApproved)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();
        
        return Ok(new { success = true, reviews });
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult> GetReviewsByUser(string userId)
    {
        var reviews = await _context.Reviews
            .Find(r => r.UserId == userId)
            .SortByDescending(r => r.CreatedAt)
            .ToListAsync();
        
        return Ok(new { success = true, reviews });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetReviewById(string id)
    {
        var review = await _context.Reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review == null)
        {
            return NotFound(new { success = false, error = "Review not found" });
        }
        return Ok(new { success = true, review });
    }

    [HttpPost]
    public async Task<ActionResult> CreateReview([FromBody] Review review)
    {
        review.Id = Guid.NewGuid().ToString();
        review.CreatedAt = DateTime.UtcNow;
        review.IsApproved = true; // Auto-approve for now
        
        await _context.Reviews.InsertOneAsync(review);

        // Update product rating and review count
        var product = await _context.Products.Find(p => p.Id == review.ProductId).FirstOrDefaultAsync();
        if (product != null)
        {
            var allReviews = await _context.Reviews.Find(r => r.ProductId == review.ProductId && r.IsApproved).ToListAsync();
            product.ReviewCount = allReviews.Count;
            product.Rating = allReviews.Count > 0 ? (decimal)allReviews.Average(r => r.Rating) : 0;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
        }

        return Ok(new { success = true, review });
    }

    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateReview(string id, [FromBody] Review review)
    {
        var existingReview = await _context.Reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (existingReview == null)
        {
            return NotFound(new { success = false, error = "Review not found" });
        }

        review.Id = id;
        review.CreatedAt = existingReview.CreatedAt;
        review.UserId = existingReview.UserId;
        
        await _context.Reviews.ReplaceOneAsync(r => r.Id == id, review);

        // Update product rating
        var product = await _context.Products.Find(p => p.Id == review.ProductId).FirstOrDefaultAsync();
        if (product != null)
        {
            var allReviews = await _context.Reviews.Find(r => r.ProductId == review.ProductId && r.IsApproved).ToListAsync();
            product.ReviewCount = allReviews.Count;
            product.Rating = allReviews.Count > 0 ? (decimal)allReviews.Average(r => r.Rating) : 0;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
        }

        return Ok(new { success = true, review });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteReview(string id)
    {
        var review = await _context.Reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review == null)
        {
            return NotFound(new { success = false, error = "Review not found" });
        }

        var productId = review.ProductId;
        await _context.Reviews.DeleteOneAsync(r => r.Id == id);

        // Update product rating
        var product = await _context.Products.Find(p => p.Id == productId).FirstOrDefaultAsync();
        if (product != null)
        {
            var allReviews = await _context.Reviews.Find(r => r.ProductId == productId && r.IsApproved).ToListAsync();
            product.ReviewCount = allReviews.Count;
            product.Rating = allReviews.Count > 0 ? (decimal)allReviews.Average(r => r.Rating) : 0;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
        }

        return Ok(new { success = true, message = "Review deleted successfully" });
    }

    [HttpPost("{id}/helpful")]
    public async Task<ActionResult> MarkHelpful(string id)
    {
        var review = await _context.Reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review == null)
        {
            return NotFound(new { success = false, error = "Review not found" });
        }

        review.HelpfulCount++;
        await _context.Reviews.ReplaceOneAsync(r => r.Id == id, review);

        return Ok(new { success = true, review });
    }

    [HttpPost("{id}/reply")]
    public async Task<ActionResult> AddReply(string id, [FromBody] ReviewReply reply)
    {
        var review = await _context.Reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review == null)
        {
            return NotFound(new { success = false, error = "Review not found" });
        }

        reply.Id = Guid.NewGuid().ToString();
        reply.CreatedAt = DateTime.UtcNow;
        review.Replies.Add(reply);
        
        await _context.Reviews.ReplaceOneAsync(r => r.Id == id, review);

        return Ok(new { success = true, review });
    }

    [HttpPut("{id}/approve")]
    public async Task<ActionResult> ApproveReview(string id, [FromBody] ApproveReviewRequest request)
    {
        var review = await _context.Reviews.Find(r => r.Id == id).FirstOrDefaultAsync();
        if (review == null)
        {
            return NotFound(new { success = false, error = "Review not found" });
        }

        review.IsApproved = request.IsApproved;
        await _context.Reviews.ReplaceOneAsync(r => r.Id == id, review);

        // Update product rating
        var product = await _context.Products.Find(p => p.Id == review.ProductId).FirstOrDefaultAsync();
        if (product != null)
        {
            var allReviews = await _context.Reviews.Find(r => r.ProductId == review.ProductId && r.IsApproved).ToListAsync();
            product.ReviewCount = allReviews.Count;
            product.Rating = allReviews.Count > 0 ? (decimal)allReviews.Average(r => r.Rating) : 0;
            product.UpdatedAt = DateTime.UtcNow;
            await _context.Products.ReplaceOneAsync(p => p.Id == product.Id, product);
        }

        return Ok(new { success = true, review });
    }

    [HttpGet("product/{productId}/summary")]
    public async Task<ActionResult> GetReviewSummary(string productId)
    {
        var reviews = await _context.Reviews.Find(r => r.ProductId == productId && r.IsApproved).ToListAsync();
        
        var summary = new
        {
            AverageRating = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0,
            TotalReviews = reviews.Count,
            RatingDistribution = new
            {
                FiveStar = reviews.Count(r => r.Rating == 5),
                FourStar = reviews.Count(r => r.Rating == 4),
                ThreeStar = reviews.Count(r => r.Rating == 3),
                TwoStar = reviews.Count(r => r.Rating == 2),
                OneStar = reviews.Count(r => r.Rating == 1)
            },
            VerifiedPurchaseCount = reviews.Count(r => r.IsVerifiedPurchase)
        };

        return Ok(new { success = true, summary });
    }
}

public class ApproveReviewRequest
{
    public bool IsApproved { get; set; }
}
