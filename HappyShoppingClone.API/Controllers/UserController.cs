using Microsoft.AspNetCore.Mvc;
using HappyShoppingClone.API.Data;
using HappyShoppingClone.API.Models;
using MongoDB.Driver;
using System.Text.RegularExpressions;
using System.Security.Cryptography;
using System.Text;

namespace HappyShoppingClone.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly MongoDbContext _context;

        public UserController(MongoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var users = await _context.Users.Find(_ => true).ToListAsync();
                return Ok(new { success = true, users });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }
                return Ok(new { success = true, user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] User user)
        {
            try
            {
                // Check if email already exists
                var existingUserByEmail = await _context.Users.Find(u => u.Email.ToLower() == user.Email.ToLower()).FirstOrDefaultAsync();
                if (existingUserByEmail != null)
                {
                    return BadRequest(new { success = false, error = "A user with this email already exists." });
                }

                // Check if phone number already exists
                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    var existingUserByPhone = await _context.Users.Find(u => u.PhoneNumber == user.PhoneNumber).FirstOrDefaultAsync();
                    if (existingUserByPhone != null)
                    {
                        return BadRequest(new { success = false, error = "A user with this phone number already exists." });
                    }
                }

                user.Id = Guid.NewGuid().ToString();
                user.CreatedAt = DateTime.UtcNow;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.Users.InsertOneAsync(user);
                return Ok(new { success = true, user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] User user)
        {
            try
            {
                var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (existingUser == null)
                {
                    return NotFound(new { success = false, error = "User not found" });
                }

                // Check if email already exists for another user
                var existingUserByEmail = await _context.Users.Find(u => u.Email.ToLower() == user.Email.ToLower() && u.Id != id).FirstOrDefaultAsync();
                if (existingUserByEmail != null)
                {
                    return BadRequest(new { success = false, error = "A user with this email already exists." });
                }

                // Check if phone number already exists for another user
                if (!string.IsNullOrEmpty(user.PhoneNumber))
                {
                    var existingUserByPhone = await _context.Users.Find(u => u.PhoneNumber == user.PhoneNumber && u.Id != id).FirstOrDefaultAsync();
                    if (existingUserByPhone != null)
                    {
                        return BadRequest(new { success = false, error = "A user with this phone number already exists." });
                    }
                }

                user.Id = id;
                user.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, user);
                return Ok(new { success = true, user });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = ex.Message });
            }
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(string id, [FromBody] dynamic request)
        {
            try
            {
                var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (existingUser == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var newRole = request.GetProperty("role").GetString();
                existingUser.Role = newRole;
                existingUser.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, existingUser);
                return Ok(new { success = true, user = existingUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-active")]
        public async Task<IActionResult> ToggleActive(string id)
        {
            try
            {
                var existingUser = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (existingUser == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                existingUser.IsActive = !existingUser.IsActive;
                existingUser.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, existingUser);
                return Ok(new { success = true, user = existingUser });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var result = await _context.Users.DeleteOneAsync(u => u.Id == id);
                if (result.DeletedCount == 0)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }
                return Ok(new { success = true, message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{userId}/addresses/validate")]
        public async Task<IActionResult> ValidateAddress(string userId, [FromBody] dynamic addressData)
        {
            try
            {
                var errors = new Dictionary<string, string>();

                // Validate fullName
                var fullName = addressData.GetProperty("fullName").GetString();
                if (string.IsNullOrWhiteSpace(fullName))
                {
                    errors["fullName"] = "Full name is required";
                }
                else if (fullName.Length < 2)
                {
                    errors["fullName"] = "Full name must be at least 2 characters";
                }
                else if (fullName.Length > 100)
                {
                    errors["fullName"] = "Full name must not exceed 100 characters";
                }
                else if (!Regex.IsMatch(fullName, @"^[a-zA-Z\s]+$"))
                {
                    errors["fullName"] = "Full name can only contain letters and spaces";
                }

                // Validate phone
                var phone = addressData.GetProperty("phone").GetString();
                if (string.IsNullOrWhiteSpace(phone))
                {
                    errors["phone"] = "Phone number is required";
                }
                else if (!Regex.IsMatch(Regex.Replace(phone, @"\D", ""), @"^[0-9]{10}$"))
                {
                    errors["phone"] = "Phone number must be 10 digits";
                }

                // Validate addressLine1
                var addressLine1 = addressData.GetProperty("addressLine1").GetString();
                if (string.IsNullOrWhiteSpace(addressLine1))
                {
                    errors["addressLine1"] = "Address line 1 is required";
                }
                else if (addressLine1.Length < 5)
                {
                    errors["addressLine1"] = "Address line 1 must be at least 5 characters";
                }
                else if (addressLine1.Length > 200)
                {
                    errors["addressLine1"] = "Address line 1 must not exceed 200 characters";
                }

                // Validate addressLine2
                var addressLine2 = addressData.GetProperty("addressLine2").GetString();
                if (!string.IsNullOrEmpty(addressLine2) && addressLine2.Length > 200)
                {
                    errors["addressLine2"] = "Address line 2 must not exceed 200 characters";
                }

                // Validate city
                var city = addressData.GetProperty("city").GetString();
                if (string.IsNullOrWhiteSpace(city))
                {
                    errors["city"] = "City is required";
                }
                else if (city.Length < 2)
                {
                    errors["city"] = "City must be at least 2 characters";
                }
                else if (city.Length > 100)
                {
                    errors["city"] = "City must not exceed 100 characters";
                }
                else if (!Regex.IsMatch(city, @"^[a-zA-Z\s]+$"))
                {
                    errors["city"] = "City can only contain letters and spaces";
                }

                // Validate state
                var state = addressData.GetProperty("state").GetString();
                if (string.IsNullOrWhiteSpace(state))
                {
                    errors["state"] = "State is required";
                }
                else if (state.Length < 2)
                {
                    errors["state"] = "State must be at least 2 characters";
                }
                else if (state.Length > 100)
                {
                    errors["state"] = "State must not exceed 100 characters";
                }

                // Validate zipCode
                var zipCode = addressData.GetProperty("zipCode").GetString();
                if (string.IsNullOrWhiteSpace(zipCode))
                {
                    errors["zipCode"] = "Zip code is required";
                }
                else if (!Regex.IsMatch(zipCode, @"^[0-9]{6}$"))
                {
                    errors["zipCode"] = "Zip code must be 6 digits";
                }

                // Validate country
                var country = addressData.GetProperty("country").GetString();
                if (string.IsNullOrWhiteSpace(country))
                {
                    errors["country"] = "Country is required";
                }
                else if (country.Length < 2)
                {
                    errors["country"] = "Country must be at least 2 characters";
                }
                else if (country.Length > 100)
                {
                    errors["country"] = "Country must not exceed 100 characters";
                }

                return Ok(new { success = errors.Count == 0, errors });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{userId}/payment-methods/validate")]
        public async Task<IActionResult> ValidatePaymentMethod(string userId, [FromBody] dynamic paymentData)
        {
            try
            {
                var errors = new Dictionary<string, string>();

                // Validate cardNumber
                var cardNumber = paymentData.GetProperty("cardNumber").GetString();
                var cleanCardNumber = Regex.Replace(cardNumber, @"\D", "");
                if (string.IsNullOrWhiteSpace(cardNumber))
                {
                    errors["cardNumber"] = "Card number is required";
                }
                else if (!Regex.IsMatch(cleanCardNumber, @"^[0-9]{16}$"))
                {
                    errors["cardNumber"] = "Card number must be 16 digits";
                }

                // Validate cardHolder
                var cardHolder = paymentData.GetProperty("cardHolder").GetString();
                if (string.IsNullOrWhiteSpace(cardHolder))
                {
                    errors["cardHolder"] = "Card holder name is required";
                }
                else if (cardHolder.Length < 2)
                {
                    errors["cardHolder"] = "Card holder name must be at least 2 characters";
                }
                else if (cardHolder.Length > 100)
                {
                    errors["cardHolder"] = "Card holder name must not exceed 100 characters";
                }
                else if (!Regex.IsMatch(cardHolder, @"^[a-zA-Z\s]+$"))
                {
                    errors["cardHolder"] = "Card holder name can only contain letters and spaces";
                }

                // Validate expiryMonth
                var expiryMonth = paymentData.GetProperty("expiryMonth").GetString();
                if (string.IsNullOrWhiteSpace(expiryMonth))
                {
                    errors["expiryMonth"] = "Expiry month is required";
                }
                else if (!Regex.IsMatch(expiryMonth, @"^(0[1-9]|1[0-2])$"))
                {
                    errors["expiryMonth"] = "Expiry month must be between 01 and 12";
                }

                // Validate expiryYear
                var expiryYear = paymentData.GetProperty("expiryYear").GetString();
                if (string.IsNullOrWhiteSpace(expiryYear))
                {
                    errors["expiryYear"] = "Expiry year is required";
                }
                else if (!Regex.IsMatch(expiryYear, @"^[0-9]{4}$"))
                {
                    errors["expiryYear"] = "Expiry year must be 4 digits";
                }
                else
                {
                    var currentYear = DateTime.UtcNow.Year;
                    var year = int.Parse(expiryYear);
                    if (year < currentYear)
                    {
                        errors["expiryYear"] = "Expiry year cannot be in the past";
                    }
                }

                // Validate cvv
                var cvv = paymentData.GetProperty("cvv").GetString();
                if (string.IsNullOrWhiteSpace(cvv))
                {
                    errors["cvv"] = "CVV is required";
                }
                else if (!Regex.IsMatch(cvv, @"^[0-9]{3,4}$"))
                {
                    errors["cvv"] = "CVV must be 3 or 4 digits";
                }

                return Ok(new { success = errors.Count == 0, errors });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("{id}/change-password")]
        public async Task<IActionResult> ChangePassword(string id, [FromBody] dynamic request)
        {
            try
            {
                var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var currentPassword = request.GetProperty("currentPassword").GetString();
                var newPassword = request.GetProperty("newPassword").GetString();

                // Validate current password using hash verification
                if (!VerifyPassword(currentPassword, user.Password))
                {
                    return BadRequest(new { success = false, message = "Current password is incorrect" });
                }

                // Validate new password
                if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 8)
                {
                    return BadRequest(new { success = false, message = "New password must be at least 8 characters" });
                }

                // Update password with hash
                user.Password = HashPassword(newPassword);
                user.UpdatedAt = DateTime.UtcNow;
                await _context.Users.ReplaceOneAsync(u => u.Id == id, user);

                return Ok(new { success = true, message = "Password changed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(bytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            var computedHash = HashPassword(password);
            return computedHash == hash;
        }

        [HttpPut("{id}/preferences")]
        public async Task<IActionResult> UpdatePreferences(string id, [FromBody] dynamic request)
        {
            try
            {
                var user = await _context.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
                if (user == null)
                {
                    return NotFound(new { success = false, message = "User not found" });
                }

                var emailNotifications = request.GetProperty("emailNotifications").GetBoolean();
                var smsNotifications = request.GetProperty("smsNotifications").GetBoolean();
                var twoFactorAuth = request.GetProperty("twoFactorAuth").GetBoolean();

                user.EmailNotifications = emailNotifications;
                user.SmsNotifications = smsNotifications;
                user.TwoFactorAuth = twoFactorAuth;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.Users.ReplaceOneAsync(u => u.Id == id, user);

                return Ok(new { success = true, message = "Preferences saved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}
