using System.Text.RegularExpressions;

namespace HappyShoppingClone.API.Validations;

public static class PaymentValidation
{
    public static bool IsValidCardNumber(string cardNumber)
    {
        if (string.IsNullOrWhiteSpace(cardNumber))
            return false;
        
        var cleaned = cardNumber.Replace(" ", "").Replace("-", "");
        return Regex.IsMatch(cleaned, @"^\d{16}$");
    }

    public static bool IsValidCVV(string cvv)
    {
        if (string.IsNullOrWhiteSpace(cvv))
            return false;
        
        return Regex.IsMatch(cvv, @"^\d{3,4}$");
    }

    public static bool IsValidExpiryDate(string expiryDate)
    {
        if (string.IsNullOrWhiteSpace(expiryDate))
            return false;
        
        return Regex.IsMatch(expiryDate, @"^(0[1-9]|1[0-2])\/\d{2}$");
    }

    public static object GetValidationRules()
    {
        return new
        {
            cardNumber = new
            {
                required = true,
                pattern = @"^\d{16}$",
                message = "Card number must be 16 digits"
            },
            cvv = new
            {
                required = true,
                pattern = @"^\d{3,4}$",
                message = "CVV must be 3 or 4 digits"
            },
            expiryDate = new
            {
                required = true,
                pattern = @"^(0[1-9]|1[0-2])\/\d{2}$",
                message = "Expiry date must be in MM/YY format"
            }
        };
    }
}
