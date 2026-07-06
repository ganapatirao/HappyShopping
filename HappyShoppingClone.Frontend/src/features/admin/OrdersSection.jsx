import { ShoppingCart, Edit, Eye, Search, Filter, Package, DollarSign, Calendar, User, MapPin, CheckCircle, Clock, XCircle, Truck, ArrowRight, X, Phone, Mail, CreditCard, Box, Trash2, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { orderAPI, userAPI } from '../../services/api';

const OrdersSection = ({ orders, onOrderUpdate, showToast }) => {
  const [filter, setFilter] = useState({ search: '', status: '' });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  
  const normalizedOrders = Array.isArray(orders) ? orders.map(order => ({
    ...order,
    Id: order.Id || order._id,
    UserId: order.UserId || order.userId,
    Status: order.Status || order.status,
    TotalAmount: order.TotalAmount || order.totalAmount,
    DiscountAmount: order.DiscountAmount || order.discountAmount,
    FinalAmount: order.FinalAmount || order.finalAmount,
    PaymentStatus: order.PaymentStatus || order.paymentStatus,
    PaymentMethod: order.PaymentMethod || order.paymentMethod,
    OrderDate: order.OrderDate || order.orderDate,
    EstimatedDeliveryDate: order.EstimatedDeliveryDate || order.estimatedDeliveryDate,
    DeliveryDate: order.DeliveryDate || order.deliveryDate,
    TrackingNumber: order.TrackingNumber || order.trackingNumber,
    Items: order.Items || order.items,
    ShippingAddress: order.ShippingAddress || order.shippingAddress,
    StatusHistory: order.StatusHistory || order.statusHistory,
    IsPremierOrder: order.IsPremierOrder || order.isPremierOrder,
    PremierDiscount: order.PremierDiscount || order.premierDiscount
  })) : [];

  const safeOrders = normalizedOrders.filter(order => {
    const matchesSearch = !filter.search || 
      order.Id?.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.UserId?.toLowerCase().includes(filter.search.toLowerCase()) ||
      order.ShippingAddress?.City?.toLowerCase().includes(filter.search.toLowerCase());
    const matchesStatus = !filter.status || order.Status === filter.status;
    return matchesSearch && matchesStatus;
  });
  
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

  const stats = {
    total: safeOrders.length,
    pending: safeOrders.filter(o => o.Status === 'Pending' || o.Status === 'Confirmed').length,
    shipped: safeOrders.filter(o => o.Status === 'Shipped').length,
    delivered: safeOrders.filter(o => o.Status === 'Delivered').length,
    cancelled: safeOrders.filter(o => o.Status === 'Cancelled').length,
    totalRevenue: safeOrders.reduce((sum, order) => sum + (order.TotalAmount || 0), 0)
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
    setShowOrderModal(true);
  };

  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setUpdateStatus(order.Status);
    setUpdateNote('');
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.updateStatus(selectedOrder.Id, {
        Status: updateStatus,
        Note: updateNote
      });
      
      if (response.data.success) {
        if (onOrderUpdate) {
          onOrderUpdate();
        }
        setShowUpdateModal(false);
        showToast('Order status updated successfully!', 'success');
      } else {
        showToast('Failed to update order status. Please try again.', 'error');
      }
    } catch (error) {
      showToast('Error updating order status. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpdate = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.updatePayment(selectedOrder.Id, {
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
      if (selectedOrder && selectedOrder.UserId) {
        try {
          const response = await userAPI.getById(selectedOrder.UserId);
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Total Orders</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <ShoppingCart size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs sm:text-sm font-medium">Pending</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Shipped</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.shipped}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <Truck size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-xs sm:text-sm font-medium">Delivered</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.delivered}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <CheckCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-xs sm:text-sm font-medium">Cancelled</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.cancelled}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <XCircle size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Revenue</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">₹{(stats.totalRevenue / 1000).toFixed(1)}k</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-3 rounded-xl shadow-lg">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Orders Management</h2>
              <p className="text-gray-500 text-sm">Manage all customer orders</p>
            </div>
          </div>
          <div className="flex gap-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search orders..."
                value={filter.search}
                onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                className="w-full lg:w-64 pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="p-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilterPanel && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-4 border border-green-100">
            <div className="flex flex-col lg:flex-row gap-3">
              <select 
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all bg-white"
              >
                <option value="">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => setFilter({ search: '', status: '' })}
                className="px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Order ID</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Customer</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Items</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Location</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {safeOrders.length > 0 && safeOrders.map(order => (
                <tr key={order.Id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800">#{order.Id?.substring(0, 8)}...</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User size={14} />
                      <span>{order.UserId?.substring(0, 8)}...</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{order.Items?.length || 0} items</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-gray-800">₹{order.TotalAmount?.toLocaleString() || 0}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(order.Status).split(' ')[1]}`}></div>
                      <span className="text-sm font-medium capitalize">{order.Status || 'Pending'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">{new Date(order.OrderDate).toLocaleDateString()}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span className="truncate max-w-32">{order.ShippingAddress?.City || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleUpdateOrder(order)}
                        className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors"
                        title="Update Status"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setUpdatePaymentStatus(order.PaymentStatus);
                          setUpdatePaymentMethod(order.PaymentMethod);
                          setShowPaymentModal(true);
                        }}
                        className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors"
                        title="Update Payment"
                      >
                        <CreditCard size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setUpdateTrackingNumber(order.TrackingNumber || '');
                          setShowTrackingModal(true);
                        }}
                        className="p-1.5 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-lg transition-colors"
                        title="Update Tracking"
                      >
                        <Truck size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {safeOrders.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={40} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-500">Orders will appear here when customers make purchases</p>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-6 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-sm text-gray-600 font-medium">
            Showing <span className="text-green-600 font-bold">{safeOrders.length}</span> orders
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Total Revenue:</span>
            <span className="text-green-600 font-bold">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white sticky top-0">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-green-100">Order #{selectedOrder.Id}</p>
                </div>
                <button 
                  onClick={() => setShowOrderModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  {getStatusIcon(selectedOrder.Status)}
                  <div>
                    <p className="text-sm text-gray-600">Current Status</p>
                    <p className="text-lg font-bold text-gray-800">{selectedOrder.Status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-lg font-bold text-gray-800">{new Date(selectedOrder.OrderDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Truck size={20} className="text-green-600" />
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-semibold text-gray-800">{new Date(selectedOrder.EstimatedDeliveryDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Actual Delivery</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.DeliveryDate ? new Date(selectedOrder.DeliveryDate).toLocaleDateString() : 'Not delivered yet'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tracking Number</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.TrackingNumber || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <User size={20} className="text-green-600" />
                  Customer Information
                </h3>
                {customerDetails ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-semibold text-gray-800">{customerDetails.FullName || customerDetails.fullName || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-semibold text-gray-800">{customerDetails.Email || customerDetails.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">{customerDetails.PhoneNumber || customerDetails.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="font-semibold text-gray-800">{customerDetails.OrderCount || customerDetails.orderCount || 0}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    <span className="text-gray-700">User ID: {selectedOrder.UserId}</span>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <MapPin size={20} className="text-green-600" />
                  Shipping Address
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p className="font-semibold">{selectedOrder.ShippingAddress?.FullName || 'N/A'}</p>
                  <p>{selectedOrder.ShippingAddress?.PhoneNumber || 'N/A'}</p>
                  <p>{selectedOrder.ShippingAddress?.AddressLine1 || 'N/A'}</p>
                  {selectedOrder.ShippingAddress?.AddressLine2 && <p>{selectedOrder.ShippingAddress.AddressLine2}</p>}
                  <p>{selectedOrder.ShippingAddress?.City || 'N/A'}, {selectedOrder.ShippingAddress?.State || 'N/A'}</p>
                  <p>{selectedOrder.ShippingAddress?.PinCode || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Type: {selectedOrder.ShippingAddress?.AddressType || 'N/A'}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Box size={20} className="text-green-600" />
                  Order Items ({selectedOrder.Items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.Items?.map((item, index) => (
                    <div key={`${item.ProductId}-${item.VariantId || index}`} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start gap-4">
                        {item.ImageUrl && (
                          <img src={item.ImageUrl} alt={item.ProductName} className="w-16 h-16 object-cover rounded-lg" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.ProductName}</h4>
                          <p className="text-sm text-gray-600">Product ID: {item.ProductId}</p>
                          <p className="text-sm text-gray-600">Variant ID: {item.VariantId || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Qty: {item.Quantity} × ₹{item.Price}</p>
                          {item.Discount > 0 && (
                            <p className="text-sm text-green-600">Discount: ₹{item.Discount}</p>
                          )}
                          <div className="flex gap-2 mt-1">
                            {item.Color && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Color: {item.Color}</span>}
                            {item.Size && <span className="text-xs bg-gray-200 px-2 py-1 rounded">Size: {item.Size}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">₹{(item.Price * item.Quantity).toLocaleString()}</p>
                          {item.Discount > 0 && (
                            <p className="text-sm text-green-600 line-through">₹{((item.Price + item.Discount) * item.Quantity).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <CreditCard size={20} className="text-green-600" />
                  Payment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.PaymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.PaymentStatus || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-800">₹{selectedOrder.TotalAmount?.toLocaleString() || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-semibold text-green-600">-₹{selectedOrder.DiscountAmount?.toLocaleString() || 0}</span>
                  </div>
                  {selectedOrder.IsPremierOrder && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Premier Discount</span>
                      <span className="font-semibold text-green-600">-₹{selectedOrder.PremierDiscount?.toLocaleString() || 0}</span>
                    </div>
                  )}
                  <div className="border-t border-green-200 pt-2 flex justify-between">
                    <span className="font-bold text-gray-800">Total</span>
                    <span className="font-bold text-xl text-green-600">₹{selectedOrder.FinalAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>
                {selectedOrder.IsPremierOrder && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                      <RefreshCw size={14} />
                      Premier Order
                    </span>
                  </div>
                )}
              </div>

              {/* Order Metadata */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-green-600" />
                  Order Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.Id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.UserId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-800">{new Date(selectedOrder.OrderDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Type</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.IsPremierOrder ? 'Premier Order' : 'Regular Order'}</p>
                  </div>
                </div>
              </div>

              {/* Status History */}
              {selectedOrder.StatusHistory && selectedOrder.StatusHistory.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Clock size={20} className="text-green-600" />
                    Status History
                  </h3>
                  <div className="space-y-2">
                    {selectedOrder.StatusHistory.map((history, index) => (
                      <div key={`${history.Status}-${history.Timestamp}-${index}`} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-gray-200">
                        <div className="bg-green-100 p-2 rounded-full">
                          {getStatusIcon(history.Status)}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{history.Status}</p>
                          <p className="text-sm text-gray-600">{history.Note}</p>
                          <p className="text-xs text-gray-500">{new Date(history.Timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Update Order Status</h2>
                  <p className="text-green-100">Order #{selectedOrder.Id}</p>
                </div>
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">New Status</label>
                <select 
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Note (Optional)</label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                  placeholder="Add a note about this status change..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusUpdate}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all"
              >
                Update Status
              </button>
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
                  <p className="text-purple-100">Order #{selectedOrder.Id}</p>
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
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
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

      {/* Tracking Number Modal */}
      {showTrackingModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Update Tracking</h2>
                  <p className="text-orange-100">Order #{selectedOrder.Id}</p>
                </div>
                <button 
                  onClick={() => setShowTrackingModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tracking Number</label>
                <input
                  type="text"
                  value={updateTrackingNumber}
                  onChange={(e) => setUpdateTrackingNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                  placeholder="Enter tracking number..."
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleTrackingUpdate}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Tracking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Order Modal */}
      {showDeleteModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Delete Order</h2>
                  <p className="text-red-100">Order #{selectedOrder.Id}</p>
                </div>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <p className="text-red-800 font-semibold">Warning</p>
                <p className="text-red-600 text-sm mt-1">This action cannot be undone. Are you sure you want to delete this order?</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600"><strong>Order ID:</strong> {selectedOrder.Id}</p>
                <p className="text-sm text-gray-600"><strong>Amount:</strong> ₹{selectedOrder.FinalAmount?.toLocaleString() || 0}</p>
                <p className="text-sm text-gray-600"><strong>Status:</strong> {selectedOrder.Status}</p>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteOrder}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;
