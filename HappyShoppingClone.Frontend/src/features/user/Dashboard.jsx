import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Heart, User, Settings, Package, LogOut, Truck, CreditCard, MapPin, Edit, Plus, X, Bell, Shield, Globe, Eye, Filter, ChevronDown, Calendar, DollarSign, Mail, Phone } from 'lucide-react';
import Toast from '../shared/common/Toast';
import { API_BASE_URL } from '../../services/api';
import { useCart } from '../../context/CartContext';

const UserDashboard = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });
  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    phoneNumber: ''
  });
  const [dashboardStats, setDashboardStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    totalItemsPurchased: 0,
    membershipStatus: 'Normal'
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [spendingStats, setSpendingStats] = useState({
    weekly: 0,
    monthly: 0,
    yearly: 0
  });
  const [dateFilter, setDateFilter] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [addressErrors, setAddressErrors] = useState({});
  const [paymentErrors, setPaymentErrors] = useState({});
  const [settingsErrors, setSettingsErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    twoFactorAuth: false
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user && isAuthenticated) {
      // Load user settings from API
      const loadSettings = async () => {
        try {
          
          const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          if (data.success && data.user) {
            setSettingsForm({
              fullName: data.user.fullName || '',
              phoneNumber: data.user.phoneNumber || ''
            });
            setPreferences({
              emailNotifications: data.user.emailNotifications ?? true,
              smsNotifications: data.user.smsNotifications ?? true,
              twoFactorAuth: data.user.twoFactorAuth ?? false
            });
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      };
      loadSettings();

      // Load wishlist from MongoDB
      const loadWishlist = async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/user/${user.id}/wishlist`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          console.log('Wishlist API response:', data);
          if (data.success) {
            console.log('Setting wishlist:', data.wishlist);
            setWishlist(data.wishlist || []);
          } else {
            console.error('Wishlist API error:', data.message);
          }
        } catch (error) {
          console.error('Error loading wishlist:', error);
        }
      };
      loadWishlist();
    }
  }, [user, isAuthenticated]);

  // Load saved addresses from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedAddresses = localStorage.getItem(`savedAddresses_${user.id}`);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
      // Load wishlist from user data
      if (user.wishlist) {
        setWishlist(user.wishlist);
      }
      // Load orders from backend
      fetchOrders();
      // Load payment methods from localStorage
      const storedPaymentMethods = localStorage.getItem(`paymentMethods_${user.id}`);
      if (storedPaymentMethods) {
        setPaymentMethods(JSON.parse(storedPaymentMethods));
      }
      // Load settings form with user data
      setSettingsForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/order/user/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const calculateDashboardStats = () => {
    if (!orders || orders.length === 0) {
      setDashboardStats({
        totalOrders: 0,
        totalSpent: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        averageOrderValue: 0,
        totalItemsPurchased: 0,
        membershipStatus: user?.isPremier ? 'Premier' : 'Normal'
      });
      setSpendingStats({ weekly: 0, monthly: 0, yearly: 0 });
      return;
    }

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const totalItemsPurchased = orders.reduce((sum, order) => {
      return sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0);
    }, 0);

    // Calculate spending for different time periods
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const weeklySpending = orders
      .filter(o => new Date(o.orderDate) >= oneWeekAgo)
      .reduce((sum, order) => sum + (order.finalAmount || 0), 0);

    const monthlySpending = orders
      .filter(o => new Date(o.orderDate) >= oneMonthAgo)
      .reduce((sum, order) => sum + (order.finalAmount || 0), 0);

    const yearlySpending = orders
      .filter(o => new Date(o.orderDate) >= oneYearAgo)
      .reduce((sum, order) => sum + (order.finalAmount || 0), 0);

    // Generate recent activity from orders
    const activities = orders.slice(0, 5).map(order => ({
      action: `Order #${order.id?.substring(0, 8).toUpperCase()} ${order.status.toLowerCase()}`,
      date: getTimeAgo(new Date(order.orderDate)),
      status: order.status
    }));

    setDashboardStats({
      totalOrders,
      totalSpent,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      averageOrderValue,
      totalItemsPurchased,
      membershipStatus: user?.isPremier ? 'Premier' : 'Normal'
    });
    setSpendingStats({
      weekly: weeklySpending,
      monthly: monthlySpending,
      yearly: yearlySpending
    });
    setRecentActivity(activities);
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'week', seconds: 604800 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 }
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  useEffect(() => {
    calculateDashboardStats();
  }, [orders, user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setShowOrderDetails(false);
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Apply status filter
    if (orderFilter !== 'all') {
      filtered = filtered.filter(order => {
        const status = order.status?.toLowerCase();
        return status === orderFilter.toLowerCase();
      });
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateFilter) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '6months':
          startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
          break;
        case '1year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        filtered = filtered.filter(order => new Date(order.orderDate) >= startDate);
      }
    }

    return filtered;
  };

  const calculateFilteredSpending = () => {
    const filtered = getFilteredOrders();
    const totalSpent = filtered.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
    return totalSpent;
  };

  const calculateOrderAnalytics = () => {
    const filtered = getFilteredOrders();
    
    if (filtered.length === 0) {
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        totalItems: 0,
        statusBreakdown: {},
        monthlyTrend: [],
        topCategories: []
      };
    }

    const totalOrders = filtered.length;
    const totalSpent = filtered.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
    const averageOrderValue = totalSpent / totalOrders;
    const totalItems = filtered.reduce((sum, order) => 
      sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0);

    // Status breakdown
    const statusBreakdown = {
      Pending: filtered.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
      Confirmed: filtered.filter(o => o.status === 'Confirmed').length,
      Shipped: filtered.filter(o => o.status === 'Shipped').length,
      Delivered: filtered.filter(o => o.status === 'Delivered').length,
      Cancelled: filtered.filter(o => o.status === 'Cancelled').length
    };

    // Monthly trend (last 6 months)
    const monthlyTrend = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthOrders = filtered.filter(o => {
        const orderDate = new Date(o.orderDate);
        return orderDate >= monthStart && orderDate <= monthEnd;
      });
      
      const monthSpending = monthOrders.reduce((sum, order) => sum + (order.finalAmount || 0), 0);
      
      monthlyTrend.push({
        month: monthStart.toLocaleString('default', { month: 'short', year: 'numeric' }),
        orders: monthOrders.length,
        spending: monthSpending
      });
    }

    return {
      totalOrders,
      totalSpent,
      averageOrderValue,
      totalItems,
      statusBreakdown,
      monthlyTrend
    };
  };

  const orderFilters = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length },
    { id: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'Confirmed').length },
    { id: 'shipped', label: 'Shipped', count: orders.filter(o => o.status === 'Shipped').length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'Cancelled').length },
  ];

  const dateFilterOptions = [
    { id: 'all', label: 'All Time' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: '3months', label: 'Last 3 Months' },
    { id: '6months', label: 'Last 6 Months' },
    { id: '1year', label: 'Last 1 Year' },
  ];

  useEffect(() => {
    const filtered = getFilteredOrders();
    setFilteredOrders(filtered);
  }, [orders, orderFilter, dateFilter]);

  const fetchWishlistProducts = async () => {
    console.log('fetchWishlistProducts called, wishlist:', wishlist);
    if (wishlist.length === 0) {
      setWishlistProducts([]);
      return;
    }
    
    setLoadingWishlist(true);
    try {
      const productPromises = wishlist.map(productId => 
        fetch(`${API_BASE_URL}/product/${productId}`)
          .then(res => {
            console.log(`Product ${productId} response:`, res.status);
            return res.json();
          })
          .then(data => {
            console.log('Product data for', productId, ':', data);
            // Handle API response structure: { success: true, product: {...} }
            const product = data.product || data;
            // Normalize ID property from backend (Id) to frontend (id)
            if (product && product.Id && !product.id) {
              product.id = product.Id;
            }
            return product;
          })
          .catch(err => {
            console.error(`Error fetching product ${productId}:`, err);
            return null;
          })
      );
      const products = await Promise.all(productPromises);
      console.log('Fetched products:', products);
      const validProducts = products.filter(p => p !== null);
      console.log('Setting wishlistProducts:', validProducts);
      setWishlistProducts(validProducts);
    } catch (error) {
      console.error('Error fetching wishlist products:', error);
    } finally {
      setLoadingWishlist(false);
    }
  };

  useEffect(() => {
    fetchWishlistProducts();
  }, [wishlist]);

  const handleOpenAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm(address);
    } else {
      setEditingAddress(null);
      setAddressForm({
        fullName: user?.fullName || '',
        phone: user?.phoneNumber || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      });
    }
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setAddressErrors({});
  };

  const handleSaveAddress = async () => {
    if (!await validateAddressForm()) {
      return;
    }
    
    let updatedAddresses;
    if (editingAddress) {
      updatedAddresses = addresses.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a);
    } else {
      updatedAddresses = [...addresses, { ...addressForm, id: Date.now().toString() }];
    }
    setAddresses(updatedAddresses);
    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
    handleCloseAddressModal();
    setAddressErrors({});
    showToast(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
  };

  const handleDeleteAddress = (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(a => a.id !== id);
      setAddresses(updatedAddresses);
      localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
      showToast('Address deleted successfully!');
    }
  };

  const handleSetDefaultAddress = (addressId) => {
    const updatedAddresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === addressId
    }));
    setAddresses(updatedAddresses);
    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
    showToast('Default address updated successfully!');
  };

  const validateAddressField = async (field, value) => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/addresses/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addressForm, [field]: value })
      });
      const result = await response.json();
      
      if (result.success) {
        const errors = { ...addressErrors };
        delete errors[field];
        setAddressErrors(errors);
        return true;
      } else {
        const errors = { ...addressErrors };
        if (result.errors && result.errors[field]) {
          errors[field] = result.errors[field];
        } else {
          delete errors[field];
        }
        setAddressErrors(errors);
        return !errors[field];
      }
    } catch (error) {
      console.error('Server validation error:', error);
      return false;
    }
  };

  const validateAddressForm = async () => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/addresses/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      });
      const result = await response.json();
      
      if (result.success) {
        setAddressErrors({});
        return true;
      } else {
        setAddressErrors(result.errors || {});
        return false;
      }
    } catch (error) {
      console.error('Server validation error:', error);
      return false;
    }
  };

  const validatePaymentField = async (field, value) => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/payment-methods/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...paymentForm, [field]: value })
      });
      const result = await response.json();
      
      if (result.success) {
        const errors = { ...paymentErrors };
        delete errors[field];
        setPaymentErrors(errors);
        return true;
      } else {
        const errors = { ...paymentErrors };
        if (result.errors && result.errors[field]) {
          errors[field] = result.errors[field];
        } else {
          delete errors[field];
        }
        setPaymentErrors(errors);
        return !errors[field];
      }
    } catch (error) {
      console.error('Server validation error:', error);
      return false;
    }
  };

  const validatePaymentForm = async () => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/payment-methods/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentForm)
      });
      const result = await response.json();
      
      if (result.success) {
        setPaymentErrors({});
        return true;
      } else {
        setPaymentErrors(result.errors || {});
        return false;
      }
    } catch (error) {
      console.error('Server validation error:', error);
      return false;
    }
  };

  const validateSettingsField = (field, value) => {
    const errors = { ...settingsErrors };
    delete errors[field];
    
    if (field === 'fullName') {
      if (!value || value.trim() === '') {
        errors.fullName = 'Full name is required';
      } else if (value.length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      } else if (value.length > 100) {
        errors.fullName = 'Full name must not exceed 100 characters';
      }
    }
    
    if (field === 'phoneNumber') {
      if (!value || value.trim() === '') {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^\d{10}$/.test(value)) {
        errors.phoneNumber = 'Phone number must be 10 digits';
      }
    }
    
    setSettingsErrors(errors);
    return !errors[field];
  };

  const validateSettingsForm = () => {
    const errors = {};
    
    if (!settingsForm.fullName || settingsForm.fullName.trim() === '') {
      errors.fullName = 'Full name is required';
    } else if (settingsForm.fullName.length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (settingsForm.fullName.length > 100) {
      errors.fullName = 'Full name must not exceed 100 characters';
    }
    
    if (!settingsForm.phoneNumber || settingsForm.phoneNumber.trim() === '') {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(settingsForm.phoneNumber)) {
      errors.phoneNumber = 'Phone number must be 10 digits';
    }
    
    setSettingsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = async () => {
    const errors = {};
    
    if (!passwordForm.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentForm({
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false
    });
    setPaymentErrors({});
  };

  const handleSetDefaultPayment = (paymentId) => {
    const updatedMethods = paymentMethods.map(m => ({
      ...m,
      isDefault: m.id === paymentId
    }));
    setPaymentMethods(updatedMethods);
    localStorage.setItem(`savedPaymentMethods_${user.id}`, JSON.stringify(updatedMethods));
    showToast('Default payment method updated successfully!');
  };

  const handleDeletePayment = (paymentId) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      const updatedMethods = paymentMethods.filter(m => m.id !== paymentId);
      setPaymentMethods(updatedMethods);
      localStorage.setItem(`savedPaymentMethods_${user.id}`, JSON.stringify(updatedMethods));
      showToast('Payment method deleted successfully!');
    }
  };

  const handleSavePayment = async () => {
    if (!await validatePaymentForm()) {
      return;
    }
    
    const updatedPaymentMethods = [...paymentMethods, { ...paymentForm, id: Date.now().toString(), last4: paymentForm.cardNumber.slice(-4) }];
    setPaymentMethods(updatedPaymentMethods);
    localStorage.setItem(`paymentMethods_${user.id}`, JSON.stringify(updatedPaymentMethods));
    handleClosePaymentModal();
    setPaymentErrors({});
    showToast('Payment method added successfully!');
  };

  const handleSaveSettings = async () => {
    if (!validateSettingsForm()) {
      return;
    }
    
    try {
      
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: settingsForm.fullName,
          phoneNumber: settingsForm.phoneNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Settings updated successfully!');
        // Update user context if needed
      } else {
        showToast('Failed to update settings', 'error');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast('Failed to update settings', 'error');
    }
  };

  const handlePasswordChange = async () => {
    if (!await validatePasswordForm()) {
      return;
    }
    
    try {
      
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await response.json();
      if (data.success) {
        showToast('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordErrors({});
      } else {
        showToast(data.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Failed to change password', 'error');
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSavePreferences = async () => {
    try {
      
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });
      const data = await response.json();
      if (data.success) {
        showToast('Preferences saved successfully!');
      } else {
        showToast('Failed to save preferences', 'error');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showToast('Failed to save preferences', 'error');
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      const data = await response.json();
      if (data.success) {
        const updatedWishlist = [...wishlist, productId];
        setWishlist(updatedWishlist);
        showToast('Added to wishlist!');
      } else {
        showToast('Failed to add to wishlist', 'error');
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Failed to add to wishlist', 'error');
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${user.id}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success) {
        const updatedWishlist = wishlist.filter(id => id !== productId);
        setWishlist(updatedWishlist);
        showToast('Removed from wishlist!');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showToast('Failed to remove from wishlist', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Use CartContext's addToCart for dynamic cart count sync
      const result = await addToCart(product, 1);
      if (result.success) {
        showToast('Added to cart successfully!');
      } else {
        showToast('Failed to add to cart', 'error');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 md:py-6 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <User size={20} />}
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Account</h1>
                <p className="text-purple-200 text-xs sm:text-sm">Welcome back, {user?.fullName || 'User'}!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/shopping')}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-medium"
              >
                <ShoppingBag size={16} />
                <span>Shop Now</span>
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-medium"
              >
                <Package size={16} />
                <span>Cart</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-white text-purple-600 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
              >
                <LogOut size={14} sm:size={16} md:size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 pt-16">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
              <div className="relative bg-white rounded-xl shadow-lg p-4 m-2 max-w-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{user?.fullName || 'User'}</h3>
                    <p className="text-xs text-gray-600">{user?.email || ''}</p>
                  </div>
                </div>
                <nav className="space-y-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: User },
                    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                    { id: 'wishlist', label: 'Wishlist', icon: Heart },
                    { id: 'addresses', label: 'Addresses', icon: Truck },
                    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                    { id: 'settings', label: 'Settings', icon: Settings },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  ))}
                  <div className="pt-4 border-t mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Quick Navigation</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          navigate('/shopping');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                      >
                        <ShoppingBag size={18} />
                        <span className="font-medium text-sm">Shop Now</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/cart');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                      >
                        <Package size={18} />
                        <span className="font-medium text-sm">Cart</span>
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                      >
                        <LogOut size={18} />
                        <span className="font-medium text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-24">
              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{user?.fullName || 'User'}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{user?.email || ''}</p>
                  {user?.isPremier && (
                    <span className="inline-block mt-1 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      ⭐ Premier Member
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'addresses', label: 'Addresses', icon: Truck },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} sm:size={18} md:size={20} />
                    <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>
                  </button>
                ))}
                <div className="pt-4 border-t mt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Quick Navigation</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate('/shopping')}
                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                    >
                      <ShoppingBag size={16} sm:size={18} md:size={20} />
                      <span className="font-medium text-xs sm:text-sm md:text-base">Shop Now</span>
                    </button>
                    <button
                      onClick={() => navigate('/cart')}
                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                    >
                      <Package size={16} sm:size={18} md:size={20} />
                      <span className="font-medium text-xs sm:text-sm md:text-base">Cart</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                    >
                      <LogOut size={16} sm:size={18} md:size={20} />
                      <span className="font-medium text-xs sm:text-sm md:text-base">Logout</span>
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-blue-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <ShoppingBag size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Total Orders</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{dashboardStats.totalOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 md:p-6 border border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-green-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <Package size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Total Spent</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">₹{dashboardStats.totalSpent.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 md:p-6 border border-red-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-red-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <Heart size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Wishlist</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{wishlist.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 sm:p-4 md:p-6 border border-yellow-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-yellow-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <User size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Membership</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{dashboardStats.membershipStatus}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 sm:p-4 md:p-6 border border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-purple-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <Package size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Items Purchased</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{dashboardStats.totalItemsPurchased}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-3 sm:p-4 md:p-6 border border-cyan-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-cyan-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <ShoppingBag size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Avg Order Value</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">₹{Math.round(dashboardStats.averageOrderValue).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 sm:p-4 md:p-6 border border-orange-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-orange-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <Truck size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Pending Orders</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{dashboardStats.pendingOrders}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 sm:p-4 md:p-6 border border-emerald-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-emerald-600 p-1.5 sm:p-2 md:p-3 rounded-lg shadow-md">
                        <Shield size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Delivered Orders</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{dashboardStats.deliveredOrders}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-purple-600" />
                    Recent Activity
                  </h2>
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm sm:text-base">No recent activity</p>
                    </div>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg gap-2 hover:from-gray-100 hover:to-gray-200 transition-colors">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">{activity.action}</p>
                            <p className="text-xs sm:text-sm text-gray-600">{activity.date}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit shadow-sm ${
                            activity.status === 'Processing' || activity.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                            activity.status === 'Delivered' ? 'bg-green-100 text-green-700 border border-green-300' :
                            activity.status === 'Cancelled' ? 'bg-red-100 text-red-700 border border-red-300' :
                            activity.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 border border-blue-300' :
                            activity.status === 'Shipped' ? 'bg-purple-100 text-purple-700 border border-purple-300' :
                            'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                {/* Header with Filters */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Orders</h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Filter size={16} className="text-gray-500" />
                      <select
                        value={orderFilter}
                        onChange={(e) => setOrderFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white cursor-pointer"
                      >
                        <option value="all">All Orders ({orders.length})</option>
                        <option value="pending">Pending ({orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length})</option>
                        <option value="confirmed">Confirmed ({orders.filter(o => o.status === 'Confirmed').length})</option>
                        <option value="shipped">Shipped ({orders.filter(o => o.status === 'Shipped').length})</option>
                        <option value="delivered">Delivered ({orders.filter(o => o.status === 'Delivered').length})</option>
                        <option value="cancelled">Cancelled ({orders.filter(o => o.status === 'Cancelled').length})</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-500" />
                      <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white cursor-pointer"
                      >
                        {dateFilterOptions.map((option) => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <ShoppingBag size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Total Orders</p>
                        <p className="text-lg font-bold text-gray-800">{filteredOrders.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 p-2 rounded-lg shadow-md">
                        <DollarSign size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Total Spent</p>
                        <p className="text-lg font-bold text-gray-800">₹{calculateFilteredSpending().toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 p-2 rounded-lg shadow-md">
                        <Package size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Total Items</p>
                        <p className="text-lg font-bold text-gray-800">
                          {filteredOrders.reduce((sum, order) => sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border border-pink-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-600 p-2 rounded-lg shadow-md">
                        <ShoppingBag size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Avg Order Value</p>
                        <p className="text-lg font-bold text-gray-800">₹{filteredOrders.length > 0 ? Math.round(calculateFilteredSpending() / filteredOrders.length).toLocaleString() : 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-gray-200 overflow-x-auto">
                  {orderFilters.map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setOrderFilter(filter.id)}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                        orderFilter === filter.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Orders List */}
                {orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <ShoppingBag size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No orders yet</p>
                    <a href="/shopping" className="text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block text-sm sm:text-base">
                      Start Shopping
                    </a>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <p className="text-sm sm:text-base">No orders found for this filter</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all hover:border-purple-300">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-4 border-b border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg">
                              <ShoppingBag size={16} className="text-purple-600" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm sm:text-base">Order #{order.id?.substring(0, 8).toUpperCase()}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Calendar size={12} />
                                <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm border ${
                              order.status === 'Pending' || order.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                              order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                              order.status === 'Shipped' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                              order.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                              'bg-gray-100 text-gray-700 border-gray-300'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => handleOpenOrderDetails(order)}
                              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-md"
                              title="View Details"
                            >
                              <Eye size={14} sm:size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          {order.items?.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm bg-white p-3 rounded-lg border border-gray-100">
                              <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag size={20} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800 text-xs sm:text-sm line-clamp-1">{item.productName}</p>
                                <p className="text-xs text-gray-600">Qty: {item.quantity} | {item.color} {item.size && `| ${item.size}`}</p>
                              </div>
                              <p className="font-bold text-purple-600 text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <p className="text-xs text-gray-600 text-center">+{order.items.length - 2} more items</p>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <DollarSign size={14} />
                            <span>Total</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-lg sm:text-xl text-gray-900">₹{order.finalAmount?.toLocaleString() || 0}</span>
                            <button
                              onClick={() => handleOpenOrderDetails(order)}
                              className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-semibold"
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Wishlist</h2>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600"><span className="font-bold text-purple-600">{wishlist.length}</span> items</p>
                  </div>
                </div>
                {loadingWishlist ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-sm sm:text-base">Loading wishlist...</p>
                  </div>
                ) : wishlist.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <Heart size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Your wishlist is empty</p>
                    <a href="/shopping" className="text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block text-sm sm:text-base">
                      Explore Products
                    </a>
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <p className="text-sm sm:text-base">No products found in wishlist</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-xl transition-all hover:border-purple-300">
                        <div className="relative mb-3">
                          <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={32} className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 mb-2">{product.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg sm:text-xl font-bold text-purple-600">₹{product.price?.toLocaleString()}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                          )}
                        </div>
                        {product.discountPercentage > 0 && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-semibold">
                            {product.discountPercentage}% OFF
                          </span>
                        )}
                        <div className="flex gap-2 mt-3">
                          <a href={`/product/${product.id}`} className="flex-1 text-center px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md">
                            View Details
                          </a>
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs sm:text-sm font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Saved Addresses</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your delivery addresses</p>
                  </div>
                  <button 
                    onClick={() => handleOpenAddressModal()}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1 w-full sm:w-auto justify-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    <Plus size={14} sm:size={16} />
                    Add Address
                  </button>
                </div>

                {/* Address Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <MapPin size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-800">{addresses.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-600 p-2 rounded-lg shadow-md">
                        <MapPin size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Default</p>
                        <p className="text-lg font-bold text-gray-800">{addresses.filter(a => a.isDefault).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-600 p-2 rounded-lg shadow-md">
                        <Globe size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Countries</p>
                        <p className="text-lg font-bold text-gray-800">{[...new Set(addresses.map(a => a.country))].length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 border border-pink-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-pink-600 p-2 rounded-lg shadow-md">
                        <Package size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Cities</p>
                        <p className="text-lg font-bold text-gray-800">{[...new Set(addresses.map(a => a.city))].length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <MapPin size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No saved addresses</p>
                    <button 
                      onClick={() => handleOpenAddressModal()}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                    >
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className={`bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 hover:shadow-xl transition-all border-2 ${
                        address.isDefault ? 'border-purple-300 shadow-md' : 'border-gray-200 hover:border-purple-300'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${address.isDefault ? 'bg-purple-600' : 'bg-purple-100'}`}>
                              <MapPin size={14} sm:size={16} className={address.isDefault ? 'text-white' : 'text-purple-600'} />
                            </div>
                            {address.isDefault && (
                              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">Default</span>
                            )}
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <button 
                              onClick={() => handleOpenAddressModal(address)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} sm:size={16} className="text-blue-600" />
                            </button>
                            {!address.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultAddress(address.id)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Set as Default"
                              >
                                <Shield size={14} sm:size={16} className="text-green-600" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <X size={14} sm:size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-gray-800 text-xs sm:text-sm md:text-base">{address.fullName}</p>
                          <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                            <span className="font-semibold">Phone:</span> {address.phone}
                          </p>
                          <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                            <p className="text-gray-700 text-xs sm:text-sm">{address.addressLine1}</p>
                            {address.addressLine2 && <p className="text-gray-700 text-xs sm:text-sm">{address.addressLine2}</p>}
                            <p className="text-gray-600 text-xs sm:text-sm mt-1">{address.city}, {address.state} {address.zipCode}</p>
                            <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                              <Globe size={12} />
                              {address.country}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Payment Methods</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage your saved cards</p>
                  </div>
                  <button 
                    onClick={handleOpenPaymentModal}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1 w-full sm:w-auto justify-center hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    <Plus size={14} sm:size={16} />
                    Add Card
                  </button>
                </div>

                {/* Payment Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                        <CreditCard size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Total</p>
                        <p className="text-lg font-bold text-gray-800">{paymentMethods.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-green-600 p-2 rounded-lg shadow-md">
                        <Shield size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Default</p>
                        <p className="text-lg font-bold text-gray-800">{paymentMethods.filter(m => m.isDefault).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-3 border border-purple-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-purple-600 p-2 rounded-lg shadow-md">
                        <Calendar size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Expiring Soon</p>
                        <p className="text-lg font-bold text-gray-800">{paymentMethods.filter(m => {
                          const currentDate = new Date();
                          const expiryDate = new Date(`${m.expiryYear}-${m.expiryMonth}-01`);
                          const monthsUntilExpiry = (expiryDate.getFullYear() - currentDate.getFullYear()) * 12 + (expiryDate.getMonth() - currentDate.getMonth());
                          return monthsUntilExpiry > 0 && monthsUntilExpiry <= 3;
                        }).length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-3 border border-pink-200">
                    <div className="flex items-center gap-2">
                      <div className="bg-pink-600 p-2 rounded-lg shadow-md">
                        <Globe size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Card Types</p>
                        <p className="text-lg font-bold text-gray-800">{[...new Set(paymentMethods.map(m => m.cardType || 'Visa'))].length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <CreditCard size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No payment methods saved</p>
                    <button 
                      onClick={handleOpenPaymentModal}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-sm hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                    >
                      Add Your First Card
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className={`bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 hover:shadow-xl transition-all border-2 ${
                        method.isDefault ? 'border-purple-300 shadow-md' : 'border-gray-200 hover:border-purple-300'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${method.isDefault ? 'bg-purple-600' : 'bg-purple-100'}`}>
                              <CreditCard size={14} sm:size={16} className={method.isDefault ? 'text-white' : 'text-purple-600'} />
                            </div>
                            {method.isDefault && (
                              <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-sm">Default</span>
                            )}
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            {!method.isDefault && (
                              <button 
                                onClick={() => handleSetDefaultPayment(method.id)}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Set as Default"
                              >
                                <Shield size={14} sm:size={16} className="text-green-600" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeletePayment(method.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <X size={14} sm:size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg">
                                  <CreditCard size={14} className="text-white" />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">{method.cardType || 'Visa'}</span>
                              </div>
                              <span className="text-xs text-gray-500">•••• {method.last4}</span>
                            </div>
                            <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                              <User size={12} />
                              {method.cardHolder}
                            </p>
                            <p className="text-gray-600 text-xs sm:text-sm flex items-center gap-1">
                              <Calendar size={12} />
                              Expires: {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 rounded-2xl shadow-2xl p-6 sm:p-8 text-white animate-in fade-in duration-500">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-4 border-white/30 hover:scale-110 transition-transform duration-300">
                      <User size={32} sm:size={40} className="text-white" />
                    </div>
                    <div className="text-center sm:text-left">
                      <h2 className="text-2xl sm:text-3xl font-bold mb-1">{user?.fullName || 'User'}</h2>
                      <p className="text-purple-100 text-sm sm:text-base">{user?.email || 'user@example.com'}</p>
                      <div className="flex items-center gap-2 mt-2 justify-center sm:justify-start">
                        {user?.isPremier && (
                          <span className="bg-yellow-400 text-black text-xs px-3 py-1 rounded-full font-bold shadow-md animate-pulse">
                            ⭐ Premier Member
                          </span>
                        )}
                        <span className="bg-white/20 backdrop-blur-sm text-xs px-3 py-1 rounded-full font-semibold">
                          Member Since {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-2 border-blue-200 hover:shadow-xl hover:border-blue-300 hover:scale-105 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <ShoppingBag size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Total Orders</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">{orders.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-2 border-green-200 hover:shadow-xl hover:border-green-300 hover:scale-105 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <MapPin size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Addresses</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">{addresses.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-2 border-purple-200 hover:shadow-xl hover:border-purple-300 hover:scale-105 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <CreditCard size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Payment Methods</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">{paymentMethods.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 border-2 border-pink-200 hover:shadow-xl hover:border-pink-300 hover:scale-105 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                        <Heart size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 font-medium">Wishlist</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">{wishlist.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Information Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-purple-200 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 animate-in slide-in-from-bottom duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                      <User size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Profile Information</h3>
                      <p className="text-sm text-gray-600">Update your personal details</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <User size={16} className="text-purple-600" />
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={settingsForm.fullName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, fullName: e.target.value })}
                          onBlur={() => validateSettingsField('fullName', settingsForm.fullName)}
                          onKeyDown={(e) => e.key === 'Tab' && validateSettingsField('fullName', settingsForm.fullName)}
                          maxLength={100}
                          className={`w-full pl-4 pr-4 py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base bg-white transition-all duration-300 ${settingsErrors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-400'}`}
                          placeholder="Enter your full name"
                        />
                      </div>
                      {settingsErrors.fullName && (
                        <div className="flex items-center gap-2 mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-3 animate-in fade-in duration-300">
                          <X size={16} className="text-red-600 flex-shrink-0" />
                          <p className="text-red-600 text-sm font-medium">{settingsErrors.fullName}</p>
                        </div>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Mail size={16} className="text-purple-600" />
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full pl-4 pr-4 py-3 rounded-xl border-2 bg-gray-100 text-gray-600 cursor-not-allowed transition-all duration-300"
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <Shield size={14} className="text-gray-400" />
                        Email cannot be changed for security reasons
                      </p>
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Phone size={16} className="text-purple-600" />
                        Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={settingsForm.phoneNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                          onBlur={() => validateSettingsField('phoneNumber', settingsForm.phoneNumber)}
                          onKeyDown={(e) => e.key === 'Tab' && validateSettingsField('phoneNumber', settingsForm.phoneNumber)}
                          maxLength={10}
                          className={`w-full pl-4 pr-4 py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base bg-white transition-all duration-300 ${settingsErrors.phoneNumber ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 hover:border-purple-400'}`}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      {settingsErrors.phoneNumber && (
                        <div className="flex items-center gap-2 mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-3 animate-in fade-in duration-300">
                          <X size={16} className="text-red-600 flex-shrink-0" />
                          <p className="text-red-600 text-sm font-medium">{settingsErrors.phoneNumber}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <button
                      onClick={handleSaveSettings}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl transform duration-300"
                    >
                      <Shield size={20} />
                      Save Profile Changes
                    </button>
                  </div>
                </div>

                {/* Password Change Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-red-200 hover:shadow-2xl hover:border-red-300 transition-all duration-300 animate-in slide-in-from-bottom duration-500 delay-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-xl shadow-lg">
                      <Shield size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Change Password</h3>
                      <p className="text-sm text-gray-600">Update your password for better security</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-red-600" />
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className={`w-full pl-4 pr-4 py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base bg-white transition-all duration-300 ${passwordErrors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 hover:border-red-400'}`}
                          placeholder="Enter your current password"
                        />
                      </div>
                      {passwordErrors.currentPassword && (
                        <div className="flex items-center gap-2 mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-3 animate-in fade-in duration-300">
                          <X size={16} className="text-red-600 flex-shrink-0" />
                          <p className="text-red-600 text-sm font-medium">{passwordErrors.currentPassword}</p>
                        </div>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-red-600" />
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className={`w-full pl-4 pr-4 py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base bg-white transition-all duration-300 ${passwordErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 hover:border-red-400'}`}
                          placeholder="Enter new password (min 8 characters)"
                        />
                      </div>
                      {passwordErrors.newPassword && (
                        <div className="flex items-center gap-2 mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-3 animate-in fade-in duration-300">
                          <X size={16} className="text-red-600 flex-shrink-0" />
                          <p className="text-red-600 text-sm font-medium">{passwordErrors.newPassword}</p>
                        </div>
                      )}
                    </div>
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-red-600" />
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className={`w-full pl-4 pr-4 py-3 rounded-xl border-2 focus:outline-none text-sm sm:text-base bg-white transition-all duration-300 ${passwordErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-100 hover:border-red-400'}`}
                          placeholder="Confirm your new password"
                        />
                      </div>
                      {passwordErrors.confirmPassword && (
                        <div className="flex items-center gap-2 mt-2 bg-red-50 border-2 border-red-200 rounded-xl p-3 animate-in fade-in duration-300">
                          <X size={16} className="text-red-600 flex-shrink-0" />
                          <p className="text-red-600 text-sm font-medium">{passwordErrors.confirmPassword}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <button
                      onClick={handlePasswordChange}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-red-700 hover:to-orange-700 transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl transform duration-300"
                    >
                      <Shield size={20} />
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border-2 border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all duration-300 animate-in slide-in-from-bottom duration-500 delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-gradient-to-br from-gray-500 to-gray-600 p-3 rounded-xl shadow-lg">
                      <Settings size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Preferences</h3>
                      <p className="text-sm text-gray-600">Customize your notification settings</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Mail size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">Email Notifications</p>
                          <p className="text-xs sm:text-sm text-gray-600">Receive order updates and promotional emails</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferences.emailNotifications}
                          onChange={() => handlePreferenceChange('emailNotifications')}
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Phone size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">SMS Notifications</p>
                          <p className="text-xs sm:text-sm text-gray-600">Get order updates via SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferences.smsNotifications}
                          onChange={() => handlePreferenceChange('smsNotifications')}
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg group-hover:scale-110 transition-transform">
                          <Shield size={20} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">Two-Factor Authentication</p>
                          <p className="text-xs sm:text-sm text-gray-600">Add extra security to your account</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={preferences.twoFactorAuth}
                          onChange={() => handlePreferenceChange('twoFactorAuth')}
                        />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600"></div>
                      </label>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t-2 border-gray-200">
                    <button
                      onClick={handleSavePreferences}
                      className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold text-sm sm:text-base hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl transform duration-300"
                    >
                      <Settings size={20} />
                      Save Preferences
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-0 sm:mx-0">
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
                          <MapPin size={16} sm:size={20} md:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                            {editingAddress ? 'Edit Address' : 'Add Address'}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {editingAddress ? 'Update saved address' : 'Add new delivery address'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseAddressModal}
                        className="bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm transition-all flex-shrink-0"
                      >
                        <X size={16} sm:size={18} md:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        onBlur={() => validateAddressField('fullName', addressForm.fullName)}
                        onMouseOut={() => validateAddressField('fullName', addressForm.fullName)}
                        onKeyDown={(e) => e.key === 'Tab' && validateAddressField('fullName', addressForm.fullName)}
                        maxLength={100}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.fullName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                      />
                      {addressErrors.fullName && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.fullName}</p>
                      </div>
                    )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        onBlur={() => validateAddressField('phone', addressForm.phone)}
                        onMouseOut={() => validateAddressField('phone', addressForm.phone)}
                        onKeyDown={(e) => e.key === 'Tab' && validateAddressField('phone', addressForm.phone)}
                        maxLength={10}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                      />
                      {addressErrors.phone && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.phone}</p>
                      </div>
                    )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        onBlur={() => validateAddressField('addressLine1', addressForm.addressLine1)}
                        onMouseOut={() => validateAddressField('addressLine1', addressForm.addressLine1)}
                        onKeyDown={(e) => e.key === 'Tab' && validateAddressField('addressLine1', addressForm.addressLine1)}
                        maxLength={200}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.addressLine1 ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        placeholder="Street address, apartment, etc."
                      />
                      {addressErrors.addressLine1 && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.addressLine1}</p>
                      </div>
                    )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={addressForm.addressLine2}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                        onBlur={() => validateAddressField('addressLine2', addressForm.addressLine2)}
                        onMouseOut={() => validateAddressField('addressLine2', addressForm.addressLine2)}
                        onKeyDown={(e) => e.key === 'Tab' && validateAddressField('addressLine2', addressForm.addressLine2)}
                        maxLength={200}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.addressLine2 ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                      {addressErrors.addressLine2 && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.addressLine2}</p>
                      </div>
                    )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          onBlur={() => validateAddressField('city', addressForm.city)}
                          onMouseOut={() => validateAddressField('city', addressForm.city)}
                          onKeyDown={(e) => e.key === 'Tab' && validateAddressField('city', addressForm.city)}
                          maxLength={100}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.city ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        />
                        {addressErrors.city && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.city}</p>
                      </div>
                    )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          onBlur={() => validateAddressField('state', addressForm.state)}
                          onMouseOut={() => validateAddressField('state', addressForm.state)}
                          onKeyDown={(e) => e.key === 'Tab' && validateAddressField('state', addressForm.state)}
                          maxLength={100}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.state ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        />
                        {addressErrors.state && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.state}</p>
                      </div>
                    )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          onBlur={() => validateAddressField('zipCode', addressForm.zipCode)}
                          onMouseOut={() => validateAddressField('zipCode', addressForm.zipCode)}
                          onKeyDown={(e) => e.key === 'Tab' && validateAddressField('zipCode', addressForm.zipCode)}
                          maxLength={6}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.zipCode ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        />
                        {addressErrors.zipCode && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.zipCode}</p>
                      </div>
                    )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          onBlur={() => validateAddressField('country', addressForm.country)}
                          onMouseOut={() => validateAddressField('country', addressForm.country)}
                          onKeyDown={(e) => e.key === 'Tab' && validateAddressField('country', addressForm.country)}
                          maxLength={100}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${addressErrors.country ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        />
                        {addressErrors.country && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{addressErrors.country}</p>
                      </div>
                    )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="defaultAddress"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="defaultAddress" className="text-xs sm:text-sm font-medium text-gray-700">Set as default address</label>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 border-t flex gap-2 sm:gap-3">
                    <button
                      onClick={handleCloseAddressModal}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-xs sm:text-sm"
                    >
                      {editingAddress ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-0 sm:mx-0">
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
                          <CreditCard size={16} sm:size={20} md:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Add Payment Method</h3>
                          <p className="text-purple-100 text-xs sm:text-sm">Add new credit or debit card</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleClosePaymentModal}
                        className="bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm transition-all flex-shrink-0"
                      >
                        <X size={16} sm:size={18} md:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                        onBlur={() => validatePaymentField('cardNumber', paymentForm.cardNumber)}
                        onMouseOut={() => validatePaymentField('cardNumber', paymentForm.cardNumber)}
                        onKeyDown={(e) => e.key === 'Tab' && validatePaymentField('cardNumber', paymentForm.cardNumber)}
                        maxLength={19}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${paymentErrors.cardNumber ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        placeholder="1234 5678 9012 3456"
                      />
                      {paymentErrors.cardNumber && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{paymentErrors.cardNumber}</p>
                      </div>
                    )}
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={paymentForm.cardHolder}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                        onBlur={() => validatePaymentField('cardHolder', paymentForm.cardHolder)}
                        onMouseOut={() => validatePaymentField('cardHolder', paymentForm.cardHolder)}
                        onKeyDown={(e) => e.key === 'Tab' && validatePaymentField('cardHolder', paymentForm.cardHolder)}
                        maxLength={100}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${paymentErrors.cardHolder ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        placeholder="John Doe"
                      />
                      {paymentErrors.cardHolder && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{paymentErrors.cardHolder}</p>
                      </div>
                    )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Expiry Month</label>
                        <select
                          value={paymentForm.expiryMonth}
                          onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                          onBlur={() => validatePaymentField('expiryMonth', paymentForm.expiryMonth)}
                          onMouseOut={() => validatePaymentField('expiryMonth', paymentForm.expiryMonth)}
                          onKeyDown={(e) => e.key === 'Tab' && validatePaymentField('expiryMonth', paymentForm.expiryMonth)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${paymentErrors.expiryMonth ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        >
                          <option value="">MM</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
                          ))}
                        </select>
                        {paymentErrors.expiryMonth && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{paymentErrors.expiryMonth}</p>
                      </div>
                    )}
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Expiry Year</label>
                        <select
                          value={paymentForm.expiryYear}
                          onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                          onBlur={() => validatePaymentField('expiryYear', paymentForm.expiryYear)}
                          onMouseOut={() => validatePaymentField('expiryYear', paymentForm.expiryYear)}
                          onKeyDown={(e) => e.key === 'Tab' && validatePaymentField('expiryYear', paymentForm.expiryYear)}
                          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${paymentErrors.expiryYear ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        >
                          <option value="">YY</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={2025 + i} value={String(2025 + i)}>{2025 + i}</option>
                          ))}
                        </select>
                        {paymentErrors.expiryYear && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{paymentErrors.expiryYear}</p>
                      </div>
                    )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                        onBlur={() => validatePaymentField('cvv', paymentForm.cvv)}
                        onMouseOut={() => validatePaymentField('cvv', paymentForm.cvv)}
                        onKeyDown={(e) => e.key === 'Tab' && validatePaymentField('cvv', paymentForm.cvv)}
                        maxLength={4}
                        className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 border rounded-lg focus:outline-none text-sm ${paymentErrors.cvv ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-purple-500'}`}
                        placeholder="123"
                      />
                      {paymentErrors.cvv && (
                      <div className="flex items-center gap-2 mt-1 bg-red-50 border border-red-200 rounded-lg p-2">
                        <X size={14} className="text-red-600 flex-shrink-0" />
                        <p className="text-red-600 text-xs font-medium">{paymentErrors.cvv}</p>
                      </div>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="defaultPayment"
                        checked={paymentForm.isDefault}
                        onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="defaultPayment" className="text-xs sm:text-sm font-medium text-gray-700">Set as default payment method</label>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 border-t flex gap-2 sm:gap-3">
                    <button
                      onClick={handleClosePaymentModal}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePayment}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-xs sm:text-sm"
                    >
                      Add Card
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Order Details Modal */}
            {showOrderDetails && selectedOrder && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-0 sm:mx-0">
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl sticky top-0 z-10">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
                          <ShoppingBag size={16} sm:size={20} md:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                            Order #{selectedOrder.id?.substring(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {new Date(selectedOrder.orderDate).toLocaleDateString()} at {new Date(selectedOrder.orderDate).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseOrderDetails}
                        className="bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm transition-all flex-shrink-0"
                      >
                        <X size={16} sm:size={18} md:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                    {/* Order Status */}
                    <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base">Order Status</h4>
                        <span className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold shadow-sm border ${
                          selectedOrder.status === 'Pending' || selectedOrder.status === 'Processing' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                          selectedOrder.status === 'Confirmed' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                          selectedOrder.status === 'Shipped' ? 'bg-purple-100 text-purple-700 border-purple-300' :
                          selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-700 border-green-300' :
                          selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-300' :
                          'bg-gray-100 text-gray-700 border-gray-300'
                        }`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className={`p-3 rounded-lg ${selectedOrder.status === 'Pending' || selectedOrder.status === 'Processing' ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                          <p className="text-xs text-gray-600">Pending</p>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedOrder.status === 'Confirmed' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <p className="text-xs text-gray-600">Confirmed</p>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedOrder.status === 'Shipped' ? 'bg-purple-100' : 'bg-gray-100'}`}>
                          <p className="text-xs text-gray-600">Shipped</p>
                        </div>
                        <div className={`p-3 rounded-lg ${selectedOrder.status === 'Delivered' ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <p className="text-xs text-gray-600">Delivered</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-3 flex items-center gap-2">
                        <Package size={18} className="text-purple-600" />
                        Order Items ({selectedOrder.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item, index) => (
                          <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag size={24} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2">{item.productName}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                  Qty: {item.quantity} | Color: {item.color} {item.size && `| Size: ${item.size}`}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Price: ₹{item.price?.toLocaleString()}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-purple-600 text-sm sm:text-base">₹{(item.price * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                      <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-3 flex items-center gap-2">
                        <DollarSign size={18} className="text-purple-600" />
                        Order Summary
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold text-gray-800">₹{(selectedOrder.finalAmount || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-semibold text-green-600">FREE</span>
                        </div>
                        <div className="border-t border-gray-300 pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-800 text-base">Total</span>
                            <span className="font-bold text-purple-600 text-lg">₹{(selectedOrder.finalAmount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    {selectedOrder.shippingAddress && (
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-3 flex items-center gap-2">
                          <MapPin size={18} className="text-blue-600" />
                          Shipping Address
                        </h4>
                        <div className="text-sm text-gray-700">
                          <p className="font-semibold">{selectedOrder.shippingAddress.fullName}</p>
                          <p>{selectedOrder.shippingAddress.phone}</p>
                          <p>{selectedOrder.shippingAddress.addressLine1}</p>
                          {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                          <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                          <p>{selectedOrder.shippingAddress.country}</p>
                        </div>
                      </div>
                    )}

                    {/* Payment Method */}
                    {selectedOrder.paymentMethod && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-3 flex items-center gap-2">
                          <CreditCard size={18} className="text-green-600" />
                          Payment Method
                        </h4>
                        <div className="text-sm text-gray-700">
                          <p className="font-semibold">Cash on Delivery / WhatsApp</p>
                          <p className="text-xs text-gray-600 mt-1">Pay upon delivery via WhatsApp</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4 md:p-6 border-t bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={handleCloseOrderDetails}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-sm sm:text-base"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  );
};

export default UserDashboard;

