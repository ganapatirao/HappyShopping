import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, MapPin, Phone, User } from 'lucide-react';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, removeFromCart, updateQuantity, clearCart, loadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, shipping, payment, success
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    addressType: 'Home'
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    addressType: 'Home'
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadCart(user.id);
      // Pre-fill user data
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      }));
    }
  }, [isAuthenticated, user]);

  const handleQuantityChange = async (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cart.id}/item/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, quantity: newQuantity })
      });
      const data = await response.json();
      if (data.success) {
        setCart(data.cart);
        setCartCount(data.cart.items?.length || 0);
      }
    } catch (error) {
      console.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId, variantId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${cart.id}/item/${productId}/${variantId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        setCart(data.cart);
        setCartCount(data.cart.items?.length || 0);
      }
    } catch (error) {
      console.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await fetch(`${API_BASE_URL}/cart/${cart.id}`, { method: 'DELETE' });
        setCart(null);
        setCartCount(0);
      } catch (error) {
        console.error('Failed to clear cart');
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCheckoutStep('shipping');
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const checkoutRequest = {
        userId: user.id,
        shippingAddress: shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails
      };

      const response = await fetch(`${API_BASE_URL}/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutRequest)
      });

      const data = await response.json();
      if (data.success) {
        setCheckoutStep('success');
      } else {
        alert('Failed to place order: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-purple-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Please Login to View Cart</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access your cart</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-purple-600 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-4">Add some products to your cart to get started</p>
          <button
            onClick={() => window.location.href = '/shopping'}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-4">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard size={48} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">Thank you for your purchase. Your order will be delivered soon.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
            <h3 className="font-bold text-gray-800 mb-4">Order Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-semibold">#ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold">{paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount:</span>
                <span className="font-bold text-purple-600">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-semibold">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Order Confirmation:</strong> A confirmation email has been sent to your registered email address with all the order details.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setCheckoutStep('cart');
                clearCart();
                navigate('/shopping');
              }}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/user-dashboard')}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'payment') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Method</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Options */}
            <div className="space-y-6">
              {/* Cash on Delivery / WhatsApp */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Easy Payment Options</h2>
                <div className="space-y-3">
                  <label 
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'COD' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentDetails({});
                      }}
                      className="text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Cash on Delivery</p>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                    <div className="text-2xl">💵</div>
                  </label>
                  
                  <label 
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'WhatsApp' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="WhatsApp"
                      checked={paymentMethod === 'WhatsApp'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentDetails({ phoneNumber: shippingAddress.phoneNumber });
                      }}
                      className="text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">WhatsApp Payment</p>
                      <p className="text-sm text-gray-600">Pay via WhatsApp for quick checkout</p>
                    </div>
                    <div className="text-2xl">💬</div>
                  </label>
                </div>
              </div>

              {/* Online Payment */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Online Payment</h2>
                <div className="space-y-3">
                  <label 
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'PhonePe' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PhonePe"
                      checked={paymentMethod === 'PhonePe'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentDetails({ upiId: '' });
                      }}
                      className="text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">PhonePe</p>
                      <p className="text-sm text-gray-600">Pay using PhonePe UPI</p>
                    </div>
                    <div className="text-2xl">📱</div>
                  </label>
                  
                  <label 
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'CreditCard' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CreditCard"
                      checked={paymentMethod === 'CreditCard'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentDetails({ cardNumber: '', cardHolderName: '', cardExpiry: '' });
                      }}
                      className="text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Credit / Debit Card</p>
                      <p className="text-sm text-gray-600">All major cards accepted</p>
                    </div>
                    <div className="text-2xl">💳</div>
                  </label>
                  
                  <label 
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'NetBanking' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NetBanking"
                      checked={paymentMethod === 'NetBanking'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentDetails({ bankName: '' });
                      }}
                      className="text-purple-600"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Net Banking</p>
                      <p className="text-sm text-gray-600">Pay using your bank account</p>
                    </div>
                    <div className="text-2xl">🏦</div>
                  </label>
                </div>
              </div>

              {/* Payment Details Form */}
              {paymentMethod === 'PhonePe' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">PhonePe Details</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">UPI ID</label>
                    <input
                      type="text"
                      value={paymentDetails.upiId || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="yourname@upi"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'CreditCard' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Card Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        value={paymentDetails.cardHolderName || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardHolderName: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Name on card"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={paymentDetails.cardExpiry || ''}
                        onChange={(e) => setPaymentDetails({...paymentDetails, cardExpiry: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Net Banking Details</h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bank</label>
                    <select
                      value={paymentDetails.bankName || ''}
                      onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select your bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{cart?.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {cart?.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">-₹{cart.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="font-semibold text-green-600">{cart?.deliveryCharge > 0 ? `₹${cart.deliveryCharge.toLocaleString()}` : 'FREE'}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-2xl text-purple-600">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>
                
                {/* Shipping Address Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-600">{shippingAddress.fullName}</p>
                  <p className="text-sm text-gray-600">{shippingAddress.phoneNumber}</p>
                  <p className="text-sm text-gray-600">{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p className="text-sm text-gray-600">{shippingAddress.addressLine2}</p>}
                  <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pinCode}</p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setCheckoutStep('shipping')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!paymentMethod || loading}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={20} />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'shipping') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Checkout</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Forms */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-purple-600" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) => setShippingAddress({...shippingAddress, phoneNumber: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({...shippingAddress, addressLine1: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="House no, Street, Area"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => setShippingAddress({...shippingAddress, addressLine2: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Landmark, etc."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="State"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">PIN Code</label>
                    <input
                      type="text"
                      value={shippingAddress.pinCode}
                      onChange={(e) => setShippingAddress({...shippingAddress, pinCode: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="PIN Code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address Type</label>
                    <div className="flex gap-4">
                      {['Home', 'Office', 'Other'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            value={type}
                            checked={shippingAddress.addressType === type}
                            onChange={(e) => setShippingAddress({...shippingAddress, addressType: e.target.value})}
                            className="text-purple-600"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <MapPin size={20} className="text-purple-600" />
                    Billing Address
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="text-purple-600"
                    />
                    <span className="text-sm text-gray-600">Same as shipping</span>
                  </label>
                </div>
                {!sameAsShipping && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={billingAddress.fullName}
                        onChange={(e) => setBillingAddress({...billingAddress, fullName: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={billingAddress.phoneNumber}
                        onChange={(e) => setBillingAddress({...billingAddress, phoneNumber: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={billingAddress.addressLine1}
                        onChange={(e) => setBillingAddress({...billingAddress, addressLine1: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="House no, Street, Area"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">PIN Code</label>
                        <input
                          type="text"
                          value={billingAddress.pinCode}
                          onChange={(e) => setBillingAddress({...billingAddress, pinCode: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          placeholder="PIN Code"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {cart?.items?.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 pb-3 border-b">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{item.productName}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} | {item.color} {item.size && `| ${item.size}`}</p>
                        <p className="text-purple-600 font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{cart?.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {cart?.discountAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-green-600">-₹{cart.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="font-semibold text-green-600">{cart?.deliveryCharge > 0 ? `₹${cart.deliveryCharge.toLocaleString()}` : 'FREE'}</span>
                  </div>
                </div>
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-2xl text-purple-600">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setCheckoutStep('payment')}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Shopping Cart ({cartCount} items)</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cart?.items?.map((item, index) => (
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                    {item.productImage ? (
                      <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={32} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{item.productName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {item.color && (
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: item.colorCode || item.color }}
                          />
                          <span className="text-sm text-gray-600">{item.color}</span>
                        </div>
                      )}
                      {item.size && (
                        <span className="text-sm text-gray-600">| Size: {item.size}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-purple-600 font-bold">₹{item.price?.toLocaleString()}</span>
                      {item.originalPrice > item.price && (
                        <>
                          <span className="text-gray-500 line-through text-sm">₹{item.originalPrice?.toLocaleString()}</span>
                          <span className="text-green-600 text-sm font-semibold">{item.discountPercentage}% off</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.productId, item.variantId)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-gray-600 font-semibold">Subtotal: ₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{cart?.subtotal?.toLocaleString() || 0}</span>
                </div>
                {cart?.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-green-600">-₹{cart.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charges</span>
                  <span className="font-semibold text-green-600">{cart?.deliveryCharge > 0 ? `₹${cart.deliveryCharge.toLocaleString()}` : 'FREE'}</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="font-bold text-2xl text-purple-600">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                </div>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                Proceed to Checkout
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
