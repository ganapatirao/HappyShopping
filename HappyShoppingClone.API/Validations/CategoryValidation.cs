namespace HappyShoppingClone.API.Validations;

public static class CategoryValidation
{
    public static bool IsValidBase64Image(string base64String)
    {
        if (string.IsNullOrWhiteSpace(base64String))
            return true;

        try
        {
            if (!base64String.StartsWith("data:image/", System.StringComparison.OrdinalIgnoreCase))
                return false;

            var parts = base64String.Split(',');
            if (parts.Length < 2)
                return false;

            var base64Data = parts[1];
            var bytes = System.Convert.FromBase64String(base64Data);
            return bytes.Length > 10;
        }
        catch
        {
            return false;
        }
    }

    public static bool IsValidCategoryName(string name)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length < 2 || name.Length > 50)
            return false;
        
        return System.Text.RegularExpressions.Regex.IsMatch(name, @"^[a-z0-9-]+$");
    }

    public static object GetValidationRules()
    {
        return new
        {
            name = new
            {
                required = true,
                minLength = 2,
                maxLength = 50,
                pattern = @"^[a-z0-9-]+$",
                message = "Category name must be 2-50 characters, lowercase letters, numbers, and hyphens only"
            },
            displayName = new
            {
                required = true,
                minLength = 2,
                maxLength = 100,
                message = "Display name must be 2-100 characters"
            },
            image = new
            {
                required = false,
                message = "Image must be a valid base64 encoded image"
            }
        };
    }
}
