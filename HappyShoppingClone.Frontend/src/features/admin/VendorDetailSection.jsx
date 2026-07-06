import { Building, Package, TrendingUp, DollarSign, Star, MapPin, Phone, Mail, Calendar, ArrowLeft, Edit, Box, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { vendorAPI, productAPI, orderAPI } from '../../services/api';

const VendorDetailSection = ({ vendor, onBack, onEdit, onRefresh }) => {
  const [vendorDetails, setVendorDetails] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isReady, setIsReady] = useState(false);

  // Helper function to safely render address
  const renderAddress = (address) => {
    if (!address) return 'N/A';
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.addressLine1 || address.AddressLine1) parts.push(address.addressLine1 || address.AddressLine1);
      if (address.addressLine2 || address.AddressLine2) parts.push(address.addressLine2 || address.AddressLine2);
      if (address.city || address.City) parts.push(address.city || address.City);
      if (address.state || address.State) parts.push(address.state || address.State);
      if (address.pinCode || address.PinCode) parts.push(address.pinCode || address.PinCode);
      return parts.length > 0 ? parts.join(', ') : 'N/A';
    }
    return 'N/A';
  };

  // Helper function to convert address object to string
  const addressToString = (address) => {
    return renderAddress(address);
  };

  useEffect(() => {
    if (vendor) {
      loadVendorDetails();
    } else {
      setLoading(false);
      setIsReady(true);
    }
  }, [vendor]);

  const loadVendorDetails = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll().catch(() => ({ data: { success: false, products: [] } })),
        orderAPI.getAll().catch(() => ({ data: { success: false, orders: [] } }))
      ]);

      const allProducts = productsRes.data.success ? productsRes.data.products : [];
      const allOrders = ordersRes.data.success ? ordersRes.data.orders : [];

      // Filter products by vendor
      const vendorProducts = allProducts.filter(p => p.vendorId === vendor.id || p.VendorId === vendor.id);
      
      // Filter orders by vendor products
      const vendorOrders = allOrders.filter(order => 
        order.Items?.some(item => vendorProducts.some(p => p.id === item.ProductId || p.Id === item.ProductId))
      );

      setVendorProducts(vendorProducts);
      setVendorOrders(vendorOrders);
      
      // Normalize vendor data to handle object properties - explicitly copy only string properties
      const normalizedVendor = {
        id: vendor.id || vendor._id,
        companyName: vendor.companyName || vendor.CompanyName || '',
        displayName: vendor.displayName || vendor.DisplayName || '',
        email: vendor.email || vendor.Email || '',
        phone: vendor.phone || vendor.PhoneNumber || '',
        description: vendor.description || vendor.Description || '',
        businessType: vendor.businessType || vendor.BusinessType || '',
        gstNumber: vendor.gstNumber || vendor.GSTNumber || '',
        panNumber: vendor.panNumber || vendor.PANNumber || '',
        isActive: vendor.isActive !== undefined ? vendor.isActive : (vendor.IsActive !== undefined ? vendor.IsActive : true),
        isVerified: vendor.isVerified !== undefined ? vendor.isVerified : (vendor.IsVerified !== undefined ? vendor.IsVerified : false),
        rating: vendor.rating || vendor.Rating || 0,
        totalProducts: vendor.totalProducts || vendor.TotalProducts || 0,
        totalSales: vendor.totalSales || vendor.TotalSales || 0,
        totalRevenue: vendor.totalRevenue || vendor.TotalRevenue || 0,
        address: typeof vendor.address === 'object' ? addressToString(vendor.address) : (vendor.address || null),
        businessAddress: typeof vendor.businessAddress === 'object' ? addressToString(vendor.businessAddress) : (vendor.businessAddress || null),
        name: vendor.name || vendor.contactPerson || '',
        logo: typeof vendor.logo === 'object' ? null : (vendor.logo || ''),
        coverImage: typeof vendor.coverImage === 'object' ? null : (vendor.coverImage || '')
      };
      setVendorDetails(normalizedVendor);
      setIsReady(true);
    } catch (error) {
      console.error('Error loading vendor details:', error);
      setIsReady(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !vendorDetails || !isReady) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const stats = {
    totalProducts: vendorProducts.length,
    totalOrders: vendorOrders.length,
    totalRevenue: vendorOrders.reduce((sum, order) => sum + (order.TotalAmount || order.totalAmount || 0), 0),
    averageRating: vendorDetails.rating || vendorDetails.Rating || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">{vendorDetails.companyName || vendorDetails.CompanyName}</h2>
          <p className="text-gray-500">Vendor Details & Analytics</p>
        </div>
        <button
          onClick={() => onEdit(vendorDetails)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-700 hover:to-red-700 transition-all"
        >
          <Edit size={18} />
          Edit Vendor
        </button>
      </div>

      {/* Vendor Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex items-start gap-6">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 w-24 h-24 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg flex-shrink-0">
            {vendorDetails.companyName?.charAt(0) || vendorDetails.CompanyName?.charAt(0) || 'V'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-bold text-gray-800">{vendorDetails.companyName || vendorDetails.CompanyName}</h3>
            <p className="text-gray-500 mt-1">{vendorDetails.businessType || vendorDetails.BusinessType}</p>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} className="flex-shrink-0" />
                <span className="break-all">{vendorDetails.email || vendorDetails.Email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="flex-shrink-0" />
                <span>{vendorDetails.phone || vendorDetails.PhoneNumber}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${vendorDetails.isActive || vendorDetails.IsActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
              {vendorDetails.isActive || vendorDetails.IsActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-4 py-2 rounded-full text-xs font-semibold ${vendorDetails.isVerified || vendorDetails.IsVerified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
              {vendorDetails.isVerified || vendorDetails.IsVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Products</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Package size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Box size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <DollarSign size={24} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Rating</p>
              <p className="text-3xl font-bold mt-1">{stats.averageRating.toFixed(1)}</p>
            </div>
            <div className="bg-white/20 p-3 rounded-xl">
              <Star size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'products'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Products ({vendorProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Orders ({vendorOrders.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Contact Person</p>
                    <p className="font-semibold text-gray-800">{vendorDetails.name || vendorDetails.contactPerson || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Business Type</p>
                    <p className="font-semibold text-gray-800">{vendorDetails.businessType || vendorDetails.BusinessType || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-semibold text-gray-800">{vendorDetails.gstNumber || vendorDetails.GSTNumber || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">PAN Number</p>
                    <p className="font-semibold text-gray-800">{vendorDetails.panNumber || vendorDetails.PANNumber || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Address</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-start gap-2">
                    <MapPin size={18} className="text-gray-500 mt-1" />
                    <p className="text-gray-800">{vendorDetails.address || vendorDetails.businessAddress || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Description</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-gray-800">{vendorDetails.description || vendorDetails.Description || 'No description provided'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {vendorProducts.length > 0 ? (
                vendorProducts.map(product => (
                  <div key={product.id || product.Id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{product.name || product.ProductName}</h4>
                        <p className="text-sm text-gray-500">₹{product.price || product.Price || 0}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          product.isActive || product.IsActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.isActive || product.IsActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No products found for this vendor</div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {vendorOrders.length > 0 ? (
                vendorOrders.map(order => (
                  <div key={order.id || order.Id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-800">Order #{order.id?.substring(0, 8) || order.Id?.substring(0, 8)}...</h4>
                        <p className="text-sm text-gray-500">{new Date(order.orderDate || order.OrderDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">₹{order.totalAmount || order.TotalAmount || 0}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {order.status || order.Status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">No orders found for this vendor</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDetailSection;
