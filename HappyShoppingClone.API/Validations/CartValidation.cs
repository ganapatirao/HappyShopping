namespace HappyShoppingClone.API.Validations;

public static class CartValidation
{
    public static bool IsValidQuantity(int quantity)
    {
        return quantity > 0 && quantity <= 100;
    }

    public static object GetValidationRules()
    {
        return new
        {
            quantity = new
            {
                required = true,
                min = 1,
                max = 100,
                message = "Quantity must be between 1 and 100"
            }
        };
    }
}
