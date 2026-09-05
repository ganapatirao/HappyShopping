import { Package, Users, ShoppingCart, Folder, Menu, TrendingUp } from 'lucide-react';

const OverviewStats = ({ dashboardStats, onNavigate, recentOrders, customerDetailsMap }) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div
          onClick={() => onNavigate && onNavigate('products')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-white/20 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <Package size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{dashboardStats.totalProducts}</h3>
          <p className="text-white/80 text-xs sm:text-sm md:text-base">Total Products</p>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('vendors')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white cursor-pointer hover:from-purple-600 hover:to-purple-700 transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-white/20 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <Users size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{dashboardStats.totalVendors}</h3>
          <p className="text-white/80 text-xs sm:text-sm md:text-base">Total Vendors</p>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('orders')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white cursor-pointer hover:from-green-600 hover:to-green-700 transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-white/20 p-1.5 sm:p-2 md:p-3 rounded-lg">
              <ShoppingCart size={20} className="text-white" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">{dashboardStats.totalOrders}</h3>
          <p className="text-white/80 text-xs sm:text-sm md:text-base">Total Orders</p>
        </div>

        <div
          onClick={() => onNavigate && onNavigate('orders')}
          className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-3 sm:p-4 md:p-6 text-white cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all hover:scale-105"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
            <div className="bg-white/20 p-1.5 sm:p-2 md:p-3 rounded-lg text-2xl font-bold">
              ₹
            </div>
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">₹{(dashboardStats.totalRevenue || 0).toLocaleString()}</h3>
          <p className="text-white/80 text-xs sm:text-sm md:text-base">Total Revenue</p>
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders && recentOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Recent Orders</h2>
            <button
              onClick={() => onNavigate && onNavigate('orders')}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-600">Order ID</th>
                  <th className="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-600">Customer Name</th>
                  <th className="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-600">Phone Number</th>
                  <th className="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-600">Amount</th>
                  <th className="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-2 px-3 text-xs sm:text-sm font-semibold text-gray-600 hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 5).map((order) => {
                  const userId = order.UserId || order.userId;
                  const customer = customerDetailsMap?.[userId];
                  return (
                    <tr key={order.Id || order._id || order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-3 text-xs sm:text-sm font-medium text-gray-800">
                        #{(order.Id || order._id || order.id)?.substring(0, 8)}...
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm text-gray-600">
                        {customer?.FullName || customer?.fullName || order.ShippingAddress?.FullName || order.ShippingAddress?.fullName || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm text-gray-600">
                        {customer?.PhoneNumber || customer?.phoneNumber || customer?.Phone || customer?.phone || order.ShippingAddress?.PhoneNumber || order.ShippingAddress?.phoneNumber || 'N/A'}
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm font-semibold text-gray-800">
                        ₹{(order.TotalAmount || order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (order.Status || order.status) === 'Delivered' ? 'bg-green-100 text-green-700' :
                          (order.Status || order.status) === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          (order.Status || order.status) === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          (order.Status || order.status) === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.Status || order.status || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                        {order.OrderDate || order.orderDate ? new Date(order.OrderDate || order.orderDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewStats;
