import { ShoppingCart, Edit, Eye, Package, Menu, MapPin, CheckCircle, Clock, Phone, Box, Truck, XCircle, X, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { orderAPI, userAPI } from '../../services/api';

const OrdersSection = ({ orders, onOrderUpdate, showToast }) => {
  const [customerDetailsMap, setCustomerDetailsMap] = useState({});

  const normalizedOrders = Array.isArray(orders) ? orders.map(order => order) : [];

  const safeOrders = normalizedOrders;
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNote, setUpdateNote] = useState('');
  const [updatePaymentStatus, setUpdatePaymentStatus] = useState('');
  const [updatePaymentMethod, setUpdatePaymentMethod] = useState('');
  const [updateTrackingNumber, setUpdateTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);

  const stats = {
    total: normalizedOrders.length,
    pending: normalizedOrders.filter(o => (o.Status || o.status) === 'Pending' || (o.Status || o.status) === 'Confirmed').length,
    delivered: normalizedOrders.filter(o => (o.Status || o.status) === 'Delivered').length,
    totalRevenue: normalizedOrders.reduce((sum, order) => sum + (order.TotalAmount || order.totalAmount || 0), 0)
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Delivered':
        return 'from-green-500 to-emerald-500';
      case 'Shipped':
        return 'from-blue-500 to-cyan-500';
      case 'Confirmed':
      case 'Pending':
        return 'from-yellow-500 to-orange-500';
      case 'Cancelled':
        return 'from-red-500 to-pink-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Delivered':
        return <CheckCircle size={16} />;
      case 'Shipped':
        return <Truck size={16} />;
      case 'Confirmed':
      case 'Pending':
        return <Clock size={16} />;
      case 'Cancelled':
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.Status || order.status || '');
    setUpdateNote('');
    setShowOrderModal(true);
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.Status || order.status);
    setUpdateNote('');
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = async (order = null, status = null, note = null) => {
    try {
      setLoading(true);
      const targetOrder = order || selectedOrder;
      const targetStatus = status || updateStatus;
      const targetNote = note || updateNote;
      const orderId = targetOrder.Id || targetOrder._id || targetOrder.id;
      
      const response = await orderAPI.updateStatus(orderId, {
        Status: targetStatus,
        Note: targetNote
      });

      if (response.data.success) {
        if (onOrderUpdate) {
          onOrderUpdate();
        }
        setUpdateStatus('');
        setUpdateNote('');
        showToast('Order status updated successfully!', 'success');
      } else {
        showToast('Failed to update order status. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast('Error updating order status. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async () => {
    try {
      setLoading(true);
      const orderId = selectedOrder.Id || selectedOrder._id || selectedOrder.id;
      const response = await orderAPI.updatePayment(orderId, {
        PaymentStatus: updatePaymentStatus,
        PaymentMethod: updatePaymentMethod
      });

      if (response.data.success) {
        if (onOrderUpdate) {
          onOrderUpdate();
        }
        setShowPaymentModal(false);
        showToast('Payment information updated successfully!', 'success');
      } else {
        showToast('Failed to update payment. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      showToast('Error updating payment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackingUpdate = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.updateTracking(selectedOrder.Id, {
        TrackingNumber: updateTrackingNumber
      });
      
      if (response.data.success) {
        if (onOrderUpdate) {
          onOrderUpdate();
        }
        setShowTrackingModal(false);
        showToast('Tracking number updated successfully!', 'success');
      } else {
        showToast('Failed to update tracking. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error updating tracking. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.delete(selectedOrder.Id);
      
      if (response.data.success) {
        if (onOrderUpdate) {
          onOrderUpdate();
        }
        setShowDeleteModal(false);
        showToast('Order deleted successfully!', 'success');
      } else {
        showToast('Failed to delete order. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error deleting order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer details when order is selected
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (selectedOrder && (selectedOrder.UserId || selectedOrder.userId)) {
        try {
          const response = await userAPI.getById(selectedOrder.UserId || selectedOrder.userId);
          if (response.data.success) {
            setCustomerDetails(response.data.user);
          }
        } catch (error) {
          // Failed to fetch customer details
        }
      }
    };

    if (showOrderModal && selectedOrder) {
      fetchCustomerDetails();
    }
  }, [showOrderModal, selectedOrder]);

  // Fetch customer details for all orders
  useEffect(() => {
    const fetchAllCustomerDetails = async () => {
      const customerMap = {};
      for (const order of normalizedOrders) {
        const userId = order.UserId || order.userId;
        if (userId && !customerMap[userId]) {
          try {
            const userRes = await userAPI.getById(userId);
            if (userRes.data.success) {
              customerMap[userId] = userRes.data.user;
            }
          } catch (error) {
            // Silently handle error
          }
        }
      }
      setCustomerDetailsMap(customerMap);
    };

    if (normalizedOrders.length > 0) {
      fetchAllCustomerDetails();
    }
  }, [normalizedOrders]);

  return (
    <>
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-2 sm:p-3 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs font-medium">Total</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold mt-0.5 sm:mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <ShoppingCart size={14} sm:size={16} md:size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-2 sm:p-3 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs font-medium">Pending</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold mt-0.5 sm:mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <Clock size={14} sm:size={16} md:size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-2 sm:p-3 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs font-medium">Delivered</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold mt-0.5 sm:mt-1">{stats.delivered}</p>
            </div>
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <CheckCircle size={14} sm:size={16} md:size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-2 sm:p-3 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs font-medium">Revenue</p>
              <p className="text-base sm:text-lg lg:text-2xl font-bold mt-0.5 sm:mt-1">₹{(stats.totalRevenue / 1000).toFixed(1)}k</p>
            </div>
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
              <span className="text-white text-base sm:text-lg md:text-xl font-bold">₹</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 sm:p-3 rounded-xl shadow-lg">
            <ShoppingCart size={20} sm:size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Orders Management</h2>
            <p className="text-gray-500 text-xs sm:text-sm hidden sm:block">Manage all customer orders</p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm hidden sm:table-cell">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Customer Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm hidden md:table-cell">Phone Number</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {normalizedOrders.length > 0 && normalizedOrders.map(order => {
                const userId = order.UserId || order.userId;
                const customer = customerDetailsMap[userId];
                return (
                  <tr key={order.Id} className="border-b border-gray-100">
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="font-semibold text-gray-800 text-xs sm:text-sm">#{(order.Id || order._id)?.substring(0, 8)}...</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-600 font-medium">
                        {customer?.FullName || customer?.fullName || order.ShippingAddress?.FullName || order.ShippingAddress?.fullName || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {customer?.PhoneNumber || customer?.phoneNumber || customer?.Phone || customer?.phone || order.ShippingAddress?.PhoneNumber || order.ShippingAddress?.phoneNumber || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-gray-800 text-sm">₹{(order.TotalAmount || order.totalAmount)?.toLocaleString() || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.Status || order.status || 'Pending'}
                        onChange={(e) => {
                          handleStatusUpdate(order, e.target.value, '');
                        }}
                        className={`text-xs sm:text-sm font-medium capitalize px-2 py-1 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                          (order.Status || order.status) === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300 focus:border-green-500 focus:ring-green-500' :
                          (order.Status || order.status) === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500' :
                          (order.Status || order.status) === 'Confirmed' ? 'bg-blue-100 text-blue-700 border-blue-300 focus:border-blue-500 focus:ring-blue-500' :
                          (order.Status || order.status) === 'Shipped' ? 'bg-purple-100 text-purple-700 border-purple-300 focus:border-purple-500 focus:ring-purple-500' :
                          (order.Status || order.status) === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-300 focus:border-red-500 focus:ring-red-500' :
                          'bg-gray-100 text-gray-700 border-gray-300 focus:border-gray-500 focus:ring-gray-500'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setUpdatePaymentStatus(order.PaymentStatus || order.paymentStatus || 'Pending');
                            setUpdatePaymentMethod(order.PaymentMethod || order.paymentMethod || 'COD');
                            setShowPaymentModal(true);
                          }}
                          className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"
                          title="Update Payment"
                        >
                          <CreditCard size={14} />
                        </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {normalizedOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={40} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers make purchases</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 sm:p-4 border border-green-100 gap-2">
          <p className="text-xs sm:text-sm text-gray-600 font-medium">
            Showing <span className="text-green-600 font-bold">{normalizedOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <span>Total Revenue:</span>
            <span className="text-green-600 font-bold">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold">Order Details</h2>
                  <p className="text-green-100 text-sm sm:text-base">Order #{selectedOrder.Id || selectedOrder._id || selectedOrder.id || 'N/A'}</p>
                </div>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} sm:size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Header - Status & Date */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-gradient-to-r from-gray-200 to-gray-300">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl shadow-sm ${
                    (selectedOrder.Status || selectedOrder.status) === 'Delivered' ? 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-600' :
                    (selectedOrder.Status || selectedOrder.status) === 'Pending' ? 'bg-gradient-to-br from-yellow-100 to-amber-100 text-yellow-600' :
                    (selectedOrder.Status || selectedOrder.status) === 'Confirmed' ? 'bg-gradient-to-br from-blue-100 to-cyan-100 text-blue-600' :
                    (selectedOrder.Status || selectedOrder.status) === 'Shipped' ? 'bg-gradient-to-br from-purple-100 to-pink-100 text-purple-600' :
                    (selectedOrder.Status || selectedOrder.status) === 'Cancelled' ? 'bg-gradient-to-br from-red-100 to-rose-100 text-red-600' :
                    'bg-gradient-to-br from-gray-100 to-slate-100 text-gray-600'
                  }`}>
                    {getStatusIcon(selectedOrder.Status || selectedOrder.status)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order Status</p>
                    <p className="text-base font-bold text-gray-900">{selectedOrder.Status || selectedOrder.status || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right bg-gradient-to-r from-gray-50 to-slate-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Order Date</p>
                  <p className="text-sm font-bold text-gray-900">{selectedOrder.OrderDate || selectedOrder.orderDate ? new Date(selectedOrder.OrderDate || selectedOrder.orderDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              {/* Quick Info Bar */}
              <div className="flex items-center gap-6 text-sm bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1.5 rounded-lg">
                    <Box size={14} className="text-blue-600" />
                  </div>
                  <span className="text-gray-600">Items:</span>
                  <span className="font-bold text-gray-900">{(selectedOrder.Items || selectedOrder.items)?.length || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 p-1.5 rounded-lg">
                    <CreditCard size={14} className="text-purple-600" />
                  </div>
                  <span className="text-gray-600">Payment:</span>
                  <span className="font-bold text-gray-900">{selectedOrder.PaymentMethod || selectedOrder.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 p-1.5 rounded-lg">
                    <CheckCircle size={14} className="text-green-600" />
                  </div>
                  <span className="text-gray-600">Status:</span>
                  <span className="font-bold text-gray-900">{selectedOrder.PaymentStatus || selectedOrder.paymentStatus || 'N/A'}</span>
                </div>
              </div>

              {/* Customer Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-to-br from-blue-100 to-cyan-100 p-1.5 rounded-lg">
                    <Menu size={14} className="text-blue-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Customer Details</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-semibold text-gray-900">{customerDetails?.FullName || customerDetails?.fullName || 'N/A'}</p>
                  </div>
                  <div className="bg-green-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="font-semibold text-gray-900">{customerDetails?.PhoneNumber || customerDetails?.phoneNumber || customerDetails?.Phone || customerDetails?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-1.5 rounded-lg">
                    <MapPin size={14} className="text-orange-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Shipping Address</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-3 rounded-lg border border-orange-100 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">{(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.FullName || (selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.fullName || 'N/A'}</p>
                  <p>{(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.PhoneNumber || (selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.phoneNumber || 'N/A'}</p>
                  <p>{(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.AddressLine1 || (selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.addressLine1 || 'N/A'}</p>
                  <p>{(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.City || (selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.city || 'N/A'}, {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.State || (selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.state || 'N/A'} - {(selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.PinCode || (selectedOrder.ShippingAddress || selectedOrder.shippingAddress)?.pinCode || 'N/A'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-1.5 rounded-lg">
                    <Box size={14} className="text-purple-600" />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Order Items ({(selectedOrder.Items || selectedOrder.items)?.length || 0})</p>
                </div>
                <div className="space-y-2">
                  {(selectedOrder.Items || selectedOrder.items)?.map((item, index) => (
                    <div key={`${item.ProductId || item.productId}-${item.VariantId || item.variantId || index}`} className="flex items-center gap-3 p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                      {item.ImageUrl && (
                        <img src={item.ImageUrl} alt={item.ProductName} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{item.ProductName || item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.Quantity || item.quantity} × ₹{item.Price || item.price}</p>
                      </div>
                      <p className="text-sm font-bold text-gray-900">₹{((item.Price || item.price) * (item.Quantity || item.quantity)).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Section */}
              <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-lg p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                      <span className="text-white text-xl font-bold">₹</span>
                    </div>
                    <span className="text-sm font-bold text-white uppercase tracking-wide">Total Amount</span>
                  </div>
                  <span className="text-2xl font-bold text-white">₹{((selectedOrder.FinalAmount || selectedOrder.finalAmount) || (selectedOrder.TotalAmount || selectedOrder.totalAmount) || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Status History */}
              {(selectedOrder.StatusHistory || selectedOrder.statusHistory) && (
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-gradient-to-br from-teal-100 to-cyan-100 p-1.5 rounded-lg">
                      <Clock size={14} className="text-teal-600" />
                    </div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Status History</p>
                  </div>
                  <div className="space-y-2">
                    {(selectedOrder.StatusHistory || selectedOrder.statusHistory).map((history, index) => (
                      <div key={`${history.Status || history.status}-${history.Timestamp || history.timestamp}-${index}`} className="flex items-center gap-3 p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-2 rounded-full">
                          <CheckCircle size={14} className="text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{history.Status || history.status}</p>
                          {history.Note && <p className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded mt-1 inline-block">{history.Note}</p>}
                        </div>
                        <p className="text-xs text-gray-400">{history.Timestamp || history.timestamp ? new Date(history.Timestamp || history.timestamp).toLocaleString() : 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Update Modal */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Update Payment</h2>
                  <p className="text-purple-100">Order #{selectedOrder.Id || selectedOrder._id || selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Status</label>
                <select 
                  value={updatePaymentStatus}
                  onChange={(e) => setUpdatePaymentStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select 
                  value={updatePaymentMethod}
                  onChange={(e) => setUpdatePaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                >
                  <option value="COD">Cash on Delivery</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Net Banking">Net Banking</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePaymentUpdate}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default OrdersSection;
