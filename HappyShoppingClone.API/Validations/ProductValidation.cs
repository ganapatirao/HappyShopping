namespace HappyShoppingClone.API.Validations;

public static class ProductValidation
{
    public static bool IsValidPrice(decimal price)
    {
        return price > 0;
    }

    public static bool IsValidStock(int stock)
    {
        return stock >= 0;
    }

    public static bool IsValidRating(decimal rating)
    {
        return rating >= 0 && rating <= 5;
    }

    public static object GetProductValidationRules()
    {
        return new
        {
            price = new
            {
                required = true,
                min = 0.01m,
                message = "Price must be greater than 0"
            },
            stock = new
            {
                required = true,
                min = 0,
                message = "Stock must be 0 or greater"
            },
            rating = new
            {
                required = false,
                min = 0,
                max = 5,
                message = "Rating must be between 0 and 5"
            }
        };
    }
}
