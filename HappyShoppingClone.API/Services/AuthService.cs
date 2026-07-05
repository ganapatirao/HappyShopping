using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using HappyShoppingClone.API.Validations;
using MongoDB.Driver;

namespace HappyShoppingClone.API.Services;

public class AuthService
{
    private readonly MongoDbContext _context;
    private readonly UserService _userService;

    public AuthService(MongoDbContext context, UserService userService)
    {
        _context = context;
        _userService = userService;
    }

    public async Task<User?> RegisterUser(RegisterRequest request)
    {
        var existingUser = await _userService.GetUserByEmail(request.Email);
        if (existingUser != null)
        {
            return null;
        }

        var newUser = new User
        {
            Id = MongoDB.Bson.ObjectId.GenerateNewId().ToString(),
            FullName = request.FullName,
            Email = request.Email.ToLower(),
            Password = _userService.HashPassword(request.Password),
            PhoneNumber = request.PhoneNumber,
            Role = request.Role ?? "Normal",
            IsPremier = false,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true,
            FailedLoginAttempts = 0,
            LockoutUntil = null
        };

        await _context.Users.InsertOneAsync(newUser);
        return newUser;
    }

    public async Task<User?> LoginUser(string email, string password)
    {
        var user = await _userService.GetUserByEmail(email);
        if (user == null)
        {
            return null;
        }

        if (!user.IsActive)
        {
            return null;
        }

        if (user.LockoutUntil.HasValue && user.LockoutUntil.Value > DateTime.UtcNow)
        {
            return null;
        }

        if (!_userService.VerifyPassword(password, user.Password))
        {
            user.FailedLoginAttempts++;
            if (user.FailedLoginAttempts >= 5)
            {
                user.LockoutUntil = DateTime.UtcNow.AddMinutes(30);
            }
            user.UpdatedAt = DateTime.UtcNow;
            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            await _context.Users.ReplaceOneAsync(filter, user);
            return null;
        }

        user.FailedLoginAttempts = 0;
        user.LockoutUntil = null;
        user.UpdatedAt = DateTime.UtcNow;
        var updateFilter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
        await _context.Users.ReplaceOneAsync(updateFilter, user);

        return user;
    }

    public async Task<User?> UpgradeToPremier(string userId)
    {
        var user = await _userService.GetUserById(userId);
        if (user != null && !user.IsPremier)
        {
            user.IsPremier = true;
            user.UpdatedAt = DateTime.UtcNow;
            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            await _context.Users.ReplaceOneAsync(filter, user);
            return user;
        }
        return null;
    }
}
