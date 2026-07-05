using System.Text.RegularExpressions;

namespace HappyShoppingClone.API.Validations;

public static class UserValidation
{
    public static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;
        
        return Regex.IsMatch(email, @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$");
    }

    public static bool IsValidPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return false;
        
        return Regex.IsMatch(password, @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$");
    }

    public static bool IsValidPhoneNumber(string phoneNumber)
    {
        if (string.IsNullOrWhiteSpace(phoneNumber))
            return false;
        
        return Regex.IsMatch(phoneNumber, @"^[6-9]\d{9}$");
    }

    public static class ValidationRules
    {
        public static object GetUserValidationRules()
        {
            return new
            {
                email = new
                {
                    required = true,
                    pattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
                    minLength = 5,
                    maxLength = 100,
                    message = "Please enter a valid email address"
                },
                password = new
                {
                    required = true,
                    minLength = 8,
                    maxLength = 50,
                    pattern = @"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$",
                    message = "Password must be at least 8 characters with uppercase, lowercase, number, and special character"
                },
                phoneNumber = new
                {
                    required = true,
                    pattern = @"^[6-9]\d{9}$",
                    message = "Phone number must be 10 digits starting with 6, 7, 8, or 9"
                }
            };
        }
    }
}
