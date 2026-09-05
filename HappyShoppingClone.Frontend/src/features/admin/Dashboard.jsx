import { useState, useEffect, useRef } from 'react';

import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../services/api';

import { useNavigate } from 'react-router-dom';

import { productAPI, vendorAPI, orderAPI, siteConfigAPI, categoryAPI, subCategoryAPI, userAPI } from '../../services/api';

import {

  LayoutDashboard,

  Package,

  Users,

  ShoppingCart,

  Settings,

  TrendingUp,

  DollarSign,

  Plus,

  Edit,

  Trash2,

  Menu,

  X,

  CheckCircle,

  XCircle,

  Database,

  Folder,

  FolderOpen,

  Shield,

  Power,

  Eye,

  Camera,

  CreditCard,

  MapPin,

  Building,

  FileText,

  MessageCircle,

  Star,

  ShoppingBag,

  User

} from 'lucide-react';



import OverviewStats from './OverviewStats';

import ProductsSection from './ProductsSection';

import CategoriesSection from './categories/CategoriesSection';

import SubCategoriesSection from './subcategories/SubCategoriesSection';

import VendorsSection from './VendorsSection';

import OrdersSection from './OrdersSection';

import UsersSection from './users/UsersSection';

import SiteConfiguration from './site-config/SiteConfiguration';

import SettingsSection from './SettingsSection';

import ProductModal from './ProductModal';

import CategoryModal from './categories/CategoryModal';

import SubCategoryModal from './subcategories/SubCategoryModal';

import VendorModal from './VendorModal';

import UserModal from './users/UserModal';

import DeleteConfirmationModal from '../shared/common/DeleteConfirmationModal';

import ReviewsSection from './ReviewsSection';

import Toast from '../shared/common/Toast';



const AdminDashboard = () => {

  const { user, isAdmin, logout } = useAuth();

  const navigate = useNavigate();

  const userModalRef = useRef(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({

    totalProducts: 0,

    totalVendors: 0,

    totalUsers: 0,

    totalOrders: 0,

    totalRevenue: 0

  });

  const [products, setProducts] = useState([]);

  const [vendors, setVendors] = useState([]);

  const [categories, setCategories] = useState([]);

  const [subCategories, setSubCategories] = useState([]);

  const [orders, setOrders] = useState([]);

  const [users, setUsers] = useState([]);

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [customerDetailsMap, setCustomerDetailsMap] = useState({});

  

  // Filter states

  const [categoryFilter, setCategoryFilter] = useState({ search: '', status: '' });

  const [subCategoryFilter, setSubCategoryFilter] = useState({ search: '', categoryId: '', status: '' });

  const [productFilter, setProductFilter] = useState({ search: '', category: '', status: '' });

  const [vendorFilter, setVendorFilter] = useState({ search: '', status: '' });

  const [orderFilter, setOrderFilter] = useState({ search: '', status: '' });

  const [userFilter, setUserFilter] = useState({ search: '', role: '', status: '' });

  

  // Validation rules

  const defaultValidationRules = {

    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    phone: /^[0-9]{10}$/,

    required: {

      message: 'This field is required'

    },

    minLength: (min) => ({

      message: `Minimum length is ${min} characters`

    }),

    maxLength: (max) => ({

      message: `Maximum length is ${max} characters`

    })

  };

  

  const [validationErrors, setValidationErrors] = useState({});

  

  // Validation rules from backend

  const [backendValidationRules, setBackendValidationRules] = useState({});

  const [categoryValidationRules, setCategoryValidationRules] = useState({});

  const [subCategoryValidationRules, setSubCategoryValidationRules] = useState({});

  

  // Modal states

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);

  const [showVendorModal, setShowVendorModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);

  const [editingVendor, setEditingVendor] = useState(null);

  

  // Form states

  const [categoryForm, setCategoryForm] = useState({

    name: '',

    displayName: '',

    icon: '',

    image: '',

    description: '',

    isFeatured: false,

    displayOrder: 0,

    isActive: true,

  });

  const [subCategoryForm, setSubCategoryForm] = useState({

    name: '',

    displayName: '',

    categoryId: '',

    icon: '',

    image: '',

    description: '',

    isFeatured: false,

    displayOrder: 0,

    isActive: true,

  });

  

  const [productForm, setProductForm] = useState({

    name: '',

    description: '',

    price: '',

    originalPrice: '',

    categoryId: '',

    subCategoryId: '',

    vendorId: '',

    stock: '',

    imageBase64: [],

    isActive: true,

    isFeatured: false,

    isTrending: false,

    // Enhanced product fields
    highlights: [],
    newHighlight: '',
    deliveryInfo: {
      freeDelivery: true,
      deliveryDays: 5,
      deliveryType: 'Standard',
      deliveryAreas: 'All India',
      returnDays: 7,
      freeReturn: true,
      cashOnDeliveryAvailable: true
    },
    offers: [],
    newOffer: {
      title: '',
      description: '',
      promoCode: '',
      validUntil: ''
    },
    specifications: [],
    newSpec: {
      key: '',
      value: ''
    },
    brand: '',
    manufacturer: '',
    countryOfOrigin: '',
    warranty: ''

  });



  const [vendorForm, setVendorForm] = useState({
    companyName: '',
    displayName: '',
    email: '',
    password: '',
    phoneNumber: '',
    logo: '',
    coverImage: '',
    description: '',
    businessType: '',
    gstNumber: '',
    panNumber: '',
    businessAddress: {},
    isVerified: false,
    isActive: true,
  });

  

  // Load validation rules from backend

  const loadValidationRules = async () => {

    try {

      const response = await validationRulesAPI.getAll();

      if (response.data.success) {

        const rules = {};

        response.data.validationRules.forEach(rule => {

          rules[rule.entity] = rule.fields;

        });

        setBackendValidationRules(rules);

      }

    } catch (error) {


    }

  };

  

  // Validation function

  const validateField = (fieldName, value, rules) => {

    const errors = { ...validationErrors };

    let error = '';

    

    if (rules.required && !value) {

      error = defaultValidationRules.required.message;

    } else if (rules.pattern && value && !rules.pattern.test(value)) {

      error = rules.pattern.message || defaultValidationRules[rules.patternType]?.message;

    } else if (rules.minLength && value && value.length < rules.minLength) {

      error = defaultValidationRules.minLength(rules.minLength).message;

    } else if (rules.maxLength && value && value.length > rules.maxLength) {

      error = defaultValidationRules.maxLength(rules.maxLength).message;

    }

    

    if (error) {

      errors[fieldName] = error;

    } else {

      delete errors[fieldName];

    }

    

    setValidationErrors(errors);

    return !error;

  };

  const onFieldValidate = (fieldName, error) => {
    const errors = { ...validationErrors };
    if (error) {
      errors[fieldName] = error;
    } else {
      delete errors[fieldName];
    }
    setValidationErrors(errors);
  };

  const fetchCategoryValidationRules = async () => {
    try {
      const response = await categoryAPI.getValidationRules();
      if (response.data.success) {
        setCategoryValidationRules(response.data.rules);
      }
    } catch (error) {
    }
  };

  const fetchSubCategoryValidationRules = async () => {
    try {
      const response = await subCategoryAPI.getValidationRules();
      if (response.data.success) {
        setSubCategoryValidationRules(response.data.rules);
      }
    } catch (error) {
    }
  };

  const fetchMaxDisplayOrder = async () => {
    try {
      const response = await categoryAPI.getMaxDisplayOrder();
      if (response.data.success) {
        return response.data.maxDisplayOrder;
      }
    } catch (error) {
    }
    return 0;
  };

  useEffect(() => {
    fetchCategoryValidationRules();
    fetchSubCategoryValidationRules();
  }, []);

  

  // Validate entire form

  const validateForm = (form, rules) => {

    let isValid = true;

    const errors = {};

    

    Object.keys(rules).forEach(fieldName => {

      const fieldRules = rules[fieldName];

      const value = form[fieldName];

      let error = '';

      

      if (fieldRules.required && !value) {

        error = defaultValidationRules.required.message;

      } else if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {

        error = fieldRules.message || 'Invalid format';

      } else if (fieldRules.minLength && value && value.length < fieldRules.minLength) {

        error = `Minimum length is ${fieldRules.minLength} characters`;

      } else if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {

        error = `Maximum length is ${fieldRules.maxLength} characters`;

      }

      

      if (error) {

        errors[fieldName] = error;

        isValid = false;

      }

    });

    

    setValidationErrors(errors);

    return isValid;

  };

  

  const [config, setConfig] = useState({
    site: {
      name: 'HappyShopping Clone',
      description: 'Your one-stop shop for everything you need',
      heroImageBase64: '',
      slideshowImages: [],
      enableSlideshow: false,
      basicInfoOrder: 1,
      heroImageOrder: 2,
      slideshowOrder: 3
    },
    header: {
      logoBase64: '',
      logoText: 'HappyShopping',
      backgroundColor: '#EC4899',
      backgroundColorEnd: '#8B5CF6',
      textColor: '#FFFFFF',
      showSearchIcon: false,
      showLoginIcon: false,
      customIcons: [],
      logoBrandingOrder: 1,
      searchSettingsOrder: 2,
      customIconsOrder: 4
    },
    footer: {
      companyName: 'HappyShopping Clone',
      companyDescription: 'Your trusted e-commerce platform',
      socialLinks: [],
      companyInfoOrder: 1,
      businessLinks: [],
      businessLinksOrder: 2,
      contactFields: [],
      contactUsOrder: 3,
      copyrightText: '© 2024 HappyShopping Clone. All rights reserved.',
      copyrightLinks: [],
      copyrightSectionOrder: 4,
      backgroundColor: '#1F2937',
      backgroundColorEnd: '#111827',
      textColor: '#FFFFFF'
    }
  });



  const [dashboardStats, setDashboardStats] = useState({

    totalProducts: 0,

    totalCategories: 0,

    totalSubCategories: 0,

    totalVendors: 0,

    totalOrders: 0,

    totalUsers: 0,

    totalRevenue: 0,

    activeProducts: 0,

    featuredProducts: 0,

    activeVendors: 0,

    verifiedVendors: 0,

    pendingOrders: 0,

    completedOrders: 0,

    recentOrders: [],

    topProducts: [],

  });



  useEffect(() => {

    if (!isAdmin) {

      return;

    }

    loadDashboardData();

    loadValidationRules();

  }, [isAdmin]);



  const loadDashboardData = async () => {

    try {

      setLoading(true);


      const [productsRes, vendorsRes, configRes, categoriesRes, subCategoriesRes] = await Promise.all([

        productAPI.getAll(),

        vendorAPI.getAll(),

        siteConfigAPI.getConfiguration(),

        categoryAPI.getAll(),

        subCategoryAPI.getAll()

      ]);

      // Load orders separately to handle errors gracefully
      let ordersData;
      try {
        ordersData = await orderAPI.getAll();
      } catch (orderError) {
        ordersData = { data: { success: false, orders: [] } };
      }

      // Try to load users separately to handle 404 gracefully

      let usersRes;

      try {

        usersRes = await userAPI.getAll();

      } catch (userError) {

        usersRes = { data: { success: false, users: [] } };

      }

      



      

      if (productsRes.data.success) {

        setProducts(productsRes.data.products);

        const products = productsRes.data.products;

        const activeProducts = products.filter(p => p.isActive).length;

        const featuredProducts = products.filter(p => p.isFeatured).length;

        setDashboardStats(prev => ({

          ...prev,

          totalProducts: products.length,

          activeProducts,

          featuredProducts,

        }));

      }

      

      if (vendorsRes.data.success) {
        const normalizedVendors = vendorsRes.data.vendors.map(vendor => ({
          ...vendor,
          id: vendor.id || vendor._id || vendor.Id
        }));
        setVendors(normalizedVendors);
        
        const vendors = normalizedVendors;
        const activeVendors = vendors.filter(v => v.isActive).length;
        const verifiedVendors = vendors.filter(v => v.isVerified).length;
        setDashboardStats(prev => ({
          ...prev,
          totalVendors: vendors.length,
          activeVendors,
          verifiedVendors,
        }));
      }



      if (configRes.data.success) {

        setConfig(configRes.data.configuration);

      }

      

      if (categoriesRes.data.success) {


        setCategories(categoriesRes.data.categories);

        setDashboardStats(prev => ({

          ...prev,

          totalCategories: categoriesRes.data.categories.length,

        }));

      } else {

      }

      

      if (subCategoriesRes.data.success) {


        setSubCategories(subCategoriesRes.data.subCategories);

        setDashboardStats(prev => ({

          ...prev,

          totalSubCategories: subCategoriesRes.data.subCategories.length,

        }));

      } else {

      }



      if (ordersData.data.success) {

        setOrders(ordersData.data.orders);

        const orders = ordersData.data.orders;

        const pendingOrders = orders.filter(o => o.Status === 'Pending' || o.Status === 'Confirmed').length;

        const completedOrders = orders.filter(o => o.Status === 'Delivered').length;

        const totalRevenue = orders.reduce((sum, order) => sum + (order.TotalAmount || order.totalAmount || 0), 0);

        setDashboardStats(prev => ({

          ...prev,

          totalOrders: orders.length,

          pendingOrders,

          completedOrders,

          totalRevenue,

        }));

        // Fetch customer details for each order
        const customerMap = {};
        for (const order of orders) {
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

      }



      if (usersRes.data.success) {

        setUsers(usersRes.data.users);

        setDashboardStats(prev => ({

          ...prev,

          totalUsers: usersRes.data.users.length,

        }));

      }

    } catch (error) {

    } finally {

      setLoading(false);

    }

  };



  const handleSaveConfiguration = async () => {

    try {

      const response = await siteConfigAPI.updateConfiguration(config);

      if (response.data.success) {

        setToast({
          show: true,
          message: 'Configuration saved successfully!',
          type: 'success'
        });

      }

    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to save configuration',
        type: 'error'
      });

    }

  };



  // Category handlers

  const handleOpenCategoryModal = async (category = null) => {

    if (category) {

      setEditingCategory(category);

      setCategoryForm({

        name: category.name,

        displayName: category.displayName,

        icon: category.icon,

        image: category.image,

        description: category.description,

        isFeatured: category.isFeatured,

        displayOrder: category.displayOrder,

        isActive: category.isActive,

      });

    } else {

      const maxDisplayOrder = await fetchMaxDisplayOrder();

      setEditingCategory(null);

      setCategoryForm({

        name: '',

        displayName: '',

        icon: '',

        image: '',

        description: '',

        isFeatured: false,

        displayOrder: maxDisplayOrder,

        isActive: true,

      });

    }

    setShowCategoryModal(true);

  };



  const handleCloseCategoryModal = () => {

    setShowCategoryModal(false);

    setEditingCategory(null);

    setCategoryForm({

      name: '',

      displayName: '',

      icon: '',

      image: '',

      description: '',

      isFeatured: false,

      displayOrder: 0,

      isActive: true,

    });

    setValidationErrors({});

  };



  const handleSaveCategory = async () => {
    // Validate image/icon exclusivity
    if (categoryForm.image && categoryForm.icon) {
      setValidationErrors({ image: 'Only one of Image or Icon can be set, not both' });
      setToast({
        show: true,
        message: 'Only one of Image or Icon can be set, not both',
        type: 'error'
      });
      return;
    }


    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, categoryForm);
        // Update dependent subcategories when category name changes
        if (categoryForm.name !== editingCategory.name) {
          await updateSubcategoriesOnCategoryChange(editingCategory.id, categoryForm.name);
        }
      } else {
        await categoryAPI.create(categoryForm);
      }
      setToast({
        show: true,
        message: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
        type: 'success'
      });
      handleCloseCategoryModal();
      loadDashboardData();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        const errorMap = {};
        
        // Handle both array and object errors
        if (Array.isArray(backendErrors)) {
          backendErrors.forEach(err => {
            if (err.toLowerCase().includes('name')) errorMap.name = err;
            else if (err.toLowerCase().includes('display')) errorMap.displayName = err;
            else if (err.toLowerCase().includes('icon')) errorMap.icon = err;
            else if (err.toLowerCase().includes('image')) errorMap.image = err;
            else if (err.toLowerCase().includes('description')) errorMap.description = err;
            else errorMap.general = err;
          });
        } else {
          // Handle object errors
          Object.keys(backendErrors).forEach(key => {
            const field = key.charAt(0).toLowerCase() + key.slice(1);
            errorMap[field] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
          });
        }
        setValidationErrors(errorMap);
      }
      setToast({
        show: true,
        message: 'Error saving category: ' + (error.response?.data?.errors?.[0] || error.message),
        type: 'error'
      });
    }
  };



  const updateSubcategoriesOnCategoryChange = async (categoryId, newCategoryName) => {

    try {

      const subCategoriesRes = await subCategoryAPI.getByCategory(categoryId);

      if (subCategoriesRes.data.success && subCategoriesRes.data.subcategories) {

        for (const subCategory of subCategoriesRes.data.subcategories) {

          await subCategoryAPI.update(subCategory.id, {

            ...subCategory,

            categoryName: newCategoryName

          });

        }

      }

    } catch (error) {

    }

  };



  const handleDeleteUser = (user) => {

    setDeleteTarget({

      type: 'user',

      id: user._id || user.Id || user.id,

      name: user.fullName || user.email

    });

    setShowDeleteModal(true);

  };



  const handleDeleteCategory = (category) => {

    setDeleteTarget({

      type: 'category',

      id: category.id,

      name: category.displayName || category.name

    });

    setShowDeleteModal(true);

  };



  const handleConfirmDelete = async () => {

    try {

      if (deleteTarget.type === 'category') {

        await categoryAPI.delete(deleteTarget.id);

      } else if (deleteTarget.type === 'subcategory') {

        await subCategoryAPI.delete(deleteTarget.id);

      } else if (deleteTarget.type === 'product') {

        await productAPI.delete(deleteTarget.id);

      } else if (deleteTarget.type === 'vendor') {

        await vendorAPI.delete(deleteTarget.id);

      } else if (deleteTarget.type === 'user') {

        await userAPI.delete(deleteTarget.id);

      } else if (deleteTarget.type === 'review') {

        await handleConfirmDeleteReview();
        return;
      }

      setToast({
        show: true,
        message: `${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted successfully!`,
        type: 'success'
      });

      loadDashboardData();

    } catch (error) {

      const errorMessage = error.response?.data?.error || error.response?.data?.message || `Error deleting ${deleteTarget.type}`;
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });

    }

    setShowDeleteModal(false);

    setDeleteTarget({ type: '', id: '', name: '' });

  };



  const handleCloseDeleteModal = () => {

    setShowDeleteModal(false);

    setDeleteTarget({ type: '', id: '', name: '' });

  };



  // SubCategory handlers

  const handleOpenSubCategoryModal = async (subCategory = null) => {
    try {
      if (subCategory) {
        setEditingSubCategory(subCategory);
        setSubCategoryForm({
          name: subCategory.name,
          displayName: subCategory.displayName,
          categoryId: subCategory.categoryId,
          icon: subCategory.icon || '',
          image: subCategory.image,
          description: subCategory.description,
          isFeatured: subCategory.isFeatured,
          displayOrder: subCategory.displayOrder,
          isActive: subCategory.isActive,
        });
      } else {
        setEditingSubCategory(null);
        try {
          const maxDisplayOrder = await subCategoryAPI.getMaxDisplayOrder();
          const nextDisplayOrder = maxDisplayOrder.data.success ? maxDisplayOrder.data.maxDisplayOrder : 0;
          setSubCategoryForm({
            name: '',
            displayName: '',
            categoryId: '',
            image: '',
            description: '',
            isFeatured: false,
            displayOrder: nextDisplayOrder,
            isActive: true,
          });
        } catch (error) {
          setSubCategoryForm({
            name: '',
            displayName: '',
            categoryId: '',
            image: '',
            description: '',
            isFeatured: false,
            displayOrder: 0,
            isActive: true,
          });
        }
      }
      setShowSubCategoryModal(true);
    } catch (error) {
    }
  };



  const handleCloseSubCategoryModal = () => {

    setShowSubCategoryModal(false);

    setEditingSubCategory(null);

    setSubCategoryForm({

      name: '',

      displayName: '',

      categoryId: '',

      icon: '',

      image: '',

      description: '',

      isFeatured: false,

      displayOrder: 0,

      isActive: true,

    });

    setValidationErrors({});

  };



  const handleSaveSubCategory = async () => {
    // Validate image/icon exclusivity
    if (subCategoryForm.image && subCategoryForm.icon) {
      setValidationErrors({ image: 'Only one of Image or Icon can be set, not both' });
      setToast({
        show: true,
        message: 'Only one of Image or Icon can be set, not both',
        type: 'error'
      });
      return;
    }

    try {
      if (editingSubCategory) {
        await subCategoryAPI.update(editingSubCategory.id, subCategoryForm);
        // Update dependent products when subcategory name changes
        if (subCategoryForm.name !== editingSubCategory.name) {
          await updateProductsOnSubcategoryChange(editingSubCategory.id, subCategoryForm.name);
        }
      } else {
        await subCategoryAPI.create(subCategoryForm);
      }
      setToast({
        show: true,
        message: editingSubCategory ? 'SubCategory updated successfully!' : 'SubCategory created successfully!',
        type: 'success'
      });
      handleCloseSubCategoryModal();
      loadDashboardData();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        const errorMap = {};
        
        // Handle both array and object errors
        if (Array.isArray(backendErrors)) {
          backendErrors.forEach(err => {
            if (err.toLowerCase().includes('name')) errorMap.name = err;
            else if (err.toLowerCase().includes('display')) errorMap.displayName = err;
            else if (err.toLowerCase().includes('category')) errorMap.categoryId = err;
            else if (err.toLowerCase().includes('icon')) errorMap.icon = err;
            else if (err.toLowerCase().includes('image')) errorMap.image = err;
            else if (err.toLowerCase().includes('description')) errorMap.description = err;
            else if (err.toLowerCase().includes('order')) errorMap.displayOrder = err;
          });
        } else {
          // Handle object errors
          Object.keys(backendErrors).forEach(key => {
            errorMap[key] = backendErrors[key];
          });
        }
        
        setValidationErrors(errorMap);
        setToast({
          show: true,
          message: 'Validation failed. Please check the form for errors.',
          type: 'error'
        });
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Unknown error';
        setToast({
          show: true,
          message: 'Error saving subcategory: ' + errorMessage,
          type: 'error'
        });
      }
    }
  };



  const updateProductsOnSubcategoryChange = async (subCategoryId, newSubCategoryName) => {

    try {

      const productsRes = await productAPI.getAll();

      if (productsRes.data.success && productsRes.data.products) {

        const productsToUpdate = productsRes.data.products.filter(

          p => p.subCategory === editingSubCategory.name

        );

        for (const product of productsToUpdate) {

          await productAPI.update(product.id, {

            ...product,

            subCategory: newSubCategoryName

          });

        }

      }

    } catch (error) {

    }

  };



  const handleDeleteSubCategory = (subCategory) => {

    setDeleteTarget({

      type: 'subcategory',

      id: subCategory.id,

      name: subCategory.displayName || subCategory.name

    });

    setShowDeleteModal(true);

  };

  // Review handlers
  const handleApproveReview = async (reviewId, isApproved) => {
    try {
      const response = await reviewAPI.approve(reviewId, { isApproved });
      const data = response.data;
      if (data.success) {
        setReviews(reviews.map(r => r.id === reviewId ? { ...r, isApproved } : r));
        setToast({
          show: true,
          message: isApproved ? 'Review approved successfully!' : 'Review unapproved',
          type: 'success'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to update review status',
        type: 'error'
      });
    }
  };

  const handleDeleteReview = async (review) => {
    setDeleteTarget({
      type: 'review',
      id: review.id,
      name: `Review by ${review.userName}`
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteReview = async () => {
    try {
      const response = await reviewAPI.delete(deleteTarget.id);
      if (response.data.success) {
        setReviews(reviews.filter(r => r.id !== deleteTarget.id));
        setToast({
          show: true,
          message: 'Review deleted successfully!',
          type: 'success'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to delete review',
        type: 'error'
      });
    }
    setShowDeleteModal(false);
    setDeleteTarget({ type: '', id: '', name: '' });
  };



  // Product handlers

  const handleOpenProductModal = (product = null) => {

    if (product) {

      setEditingProduct(product);

      setProductForm({

        name: product.name,

        description: product.description,

        price: product.price,

        originalPrice: product.originalPrice,

        categoryId: product.categoryId || '',

        subCategoryId: product.subCategoryId || '',

        vendorId: product.vendorId || product.vendorId || '',

        stock: product.stock,

        isActive: product.isActive,

        isFeatured: product.isFeatured,

        isTrending: product.isTrending,

        imageBase64: product.imageBase64 || product.imageUrls || [],

        // Enhanced product fields
        highlights: product.highlights || [],
        newHighlight: '',
        deliveryInfo: product.deliveryInfo || {
          freeDelivery: true,
          deliveryDays: 5,
          deliveryType: 'Standard',
          deliveryAreas: 'All India',
          returnDays: 7,
          freeReturn: true,
          cashOnDeliveryAvailable: true
        },
        offers: product.offers || [],
        newOffer: {
          title: '',
          description: '',
          promoCode: '',
          validUntil: ''
        },
        specifications: product.specifications || [],
        newSpec: {
          key: '',
          value: ''
        },
        brand: product.brand || '',
        manufacturer: product.manufacturer || '',
        countryOfOrigin: product.countryOfOrigin || '',
        warranty: product.warranty || ''

      });

    } else {

      setEditingProduct(null);

      setProductForm({

        name: '',

        description: '',

        price: '',

        originalPrice: '',

        categoryId: '',

        subCategoryId: '',

        stock: '',

        imageBase64: [],

        isActive: true,

        isFeatured: false,

        isTrending: false,

        // Enhanced product fields
        highlights: [],
        newHighlight: '',
        deliveryInfo: {
          freeDelivery: true,
          deliveryDays: 5,
          deliveryType: 'Standard',
          deliveryAreas: 'All India',
          returnDays: 7,
          freeReturn: true,
          cashOnDeliveryAvailable: true
        },
        offers: [],
        newOffer: {
          title: '',
          description: '',
          promoCode: '',
          validUntil: ''
        },
        specifications: [],
        newSpec: {
          key: '',
          value: ''
        },
        brand: '',
        manufacturer: '',
        countryOfOrigin: '',
        warranty: ''

      });

    }

    setShowProductModal(true);

  };



  const handleCloseProductModal = () => {

    setShowProductModal(false);

    setEditingProduct(null);

    setProductForm({

      name: '',

      description: '',

      price: '',

      originalPrice: '',

      categoryId: '',

      subCategoryId: '',

      vendorId: '',

      stock: '',

      imageBase64: [],

      isActive: true,

      isFeatured: false,

      isTrending: false,

    });

    setValidationErrors({});

  };



  const handleSaveProduct = async () => {

    try {

      const productData = {

        ...productForm,

        price: parseFloat(productForm.price),

        originalPrice: parseFloat(productForm.originalPrice),

        stock: parseInt(productForm.stock),

        vendorId: productForm.vendorId,

        companyId: 'admin',

        discountPercentage: productForm.originalPrice 

          ? Math.round(((parseFloat(productForm.originalPrice) - parseFloat(productForm.price)) / parseFloat(productForm.originalPrice)) * 100)

          : 0,

        imageBase64: productForm.imageBase64,

        // Enhanced product fields
        highlights: productForm.highlights,
        deliveryInfo: productForm.deliveryInfo,
        offers: productForm.offers,
        specifications: productForm.specifications,
        brand: productForm.brand,
        manufacturer: productForm.manufacturer,
        countryOfOrigin: productForm.countryOfOrigin,
        warranty: productForm.warranty

      };

      

      if (editingProduct) {

        await productAPI.update(editingProduct.id, productData);

      } else {

        await productAPI.create(productData);

      }

      setToast({
        show: true,
        message: editingProduct ? 'Product updated successfully!' : 'Product created successfully!',
        type: 'success'
      });

      handleCloseProductModal();

      loadDashboardData();

    } catch (error) {
      // Handle backend validation errors
      let errorMessage = 'Error saving product';
      if (error.response && error.response.data) {
        if (error.response.data.errors) {
          // Handle array of errors
          const errors = Array.isArray(error.response.data.errors) 
            ? error.response.data.errors 
            : Object.values(error.response.data.errors);
          errorMessage = Array.isArray(errors) ? errors.join(', ') : errors;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });

    }

  };



  const handleDeleteProduct = (product) => {

    setDeleteTarget({

      type: 'product',

      id: product.id,

      name: product.name

    });

    setShowDeleteModal(true);

  };



  // Vendor handlers

  const handleOpenVendorModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm({
        companyName: vendor.companyName || vendor.businessName || '',
        displayName: vendor.displayName || vendor.contactPerson || '',
        email: vendor.email || '',
        password: vendor.password || '',
        phoneNumber: vendor.phoneNumber || vendor.phone || '',
        logo: vendor.logo || '',
        coverImage: vendor.coverImage || '',
        description: vendor.description || '',
        businessType: vendor.businessType || '',
        gstNumber: vendor.gstNumber || '',
        panNumber: vendor.panNumber || '',
        businessAddress: vendor.businessAddress || vendor.address || {},
        isVerified: vendor.isVerified !== undefined ? vendor.isVerified : false,
        isActive: vendor.isActive !== undefined ? vendor.isActive : true,
      });
    } else {
      setEditingVendor(null);
      setVendorForm({
        companyName: '',
        displayName: '',
        email: '',
        password: '',
        phoneNumber: '',
        logo: '',
        coverImage: '',
        description: '',
        businessType: '',
        gstNumber: '',
        panNumber: '',
        businessAddress: {},
        isVerified: false,
        isActive: true,
      });
    }
    setShowVendorModal(true);
  };



  const handleCloseVendorModal = () => {

    setShowVendorModal(false);

    setEditingVendor(null);

    setVendorForm({

      companyName: '',
      displayName: '',
      email: '',
      password: '',
      phoneNumber: '',
      logo: '',
      coverImage: '',
      description: '',
      businessType: '',
      gstNumber: '',
      panNumber: '',
      businessAddress: {},
      isVerified: false,
      isActive: true,

    });

    setValidationErrors({});

  };



  const handleSaveVendor = async () => {
    // Validate form before submission
    const vendorRules = {
      companyName: { required: true, minLength: 2, maxLength: 200 },
      displayName: { required: true, minLength: 2, maxLength: 100 },
      email: { required: true, pattern: defaultValidationRules.email },
      password: editingVendor ? { minLength: 6 } : { required: true, minLength: 6 },
      phoneNumber: { required: true, pattern: defaultValidationRules.phone },
      businessType: { required: true },
      description: { maxLength: 1000 }
    };
    
    if (!validateForm(vendorForm, vendorRules)) {
      setToast({
        show: true,
        message: 'Please fix the validation errors before saving',
        type: 'error'
      });
      return;
    }
    
    try {
      if (editingVendor) {
        const vendorId = editingVendor.id || editingVendor._id;
        if (!vendorId) {
          setToast({
            show: true,
            message: 'Error: Vendor ID is missing. Cannot update vendor.',
            type: 'error'
          });
          return;
        }
        // Don't send password on update unless it's changed
        const updateData = { ...vendorForm };
        if (!updateData.password) {
          delete updateData.password;
        }
        await vendorAPI.update(vendorId, updateData);
        setToast({
          show: true,
          message: 'Vendor updated successfully!',
          type: 'success'
        });
      } else {
        const response = await vendorAPI.register(vendorForm);
        if (response.data.success && response.data.vendor) {
          // Normalize the returned vendor data
          const newVendor = {
            ...response.data.vendor,
            id: response.data.vendor.id || response.data.vendor._id || response.data.vendor.Id
          };
          setToast({
            show: true,
            message: 'Vendor created successfully!',
            type: 'success'
          });
        } else {
          throw new Error('Vendor creation failed');
        }
      }
      handleCloseVendorModal();
      loadDashboardData();
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error saving vendor';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    }
  };



  const handleDeleteVendor = (vendor) => {
    const vendorId = vendor.id || vendor._id || vendor.Id;
    if (!vendorId) {
      setToast({
        show: true,
        message: 'Error: Vendor ID is missing. Cannot delete vendor.',
        type: 'error'
      });
      return;
    }
    setDeleteTarget({
      type: 'vendor',
      id: vendorId,
      name: vendor.companyName || vendor.businessName || vendor.name
    });
    setShowDeleteModal(true);
  };



  // Image upload handlers

  const handleImageUpload = (e, formType) => {

    const files = e.target.files;

    if (files && files.length > 0) {

      if (formType === 'product') {

        for (const file of files) {

          convertToBase64(file, formType);

        }

      } else {

        const file = files[0];

        convertToBase64(file, formType);

      }

    }

  };



  const handleImageDrop = (e, formType) => {

    e.preventDefault();

    const files = e.dataTransfer.files;

    if (files && files.length > 0) {

      if (formType === 'product') {

        for (const file of files) {

          convertToBase64(file, formType);

        }

      } else {

        const file = files[0];

        convertToBase64(file, formType);

      }

    }

  };



  const convertToBase64 = (file, formType) => {

    const reader = new FileReader();

    reader.onload = () => {

      const base64 = reader.result;

      if (formType === 'category') {

        setCategoryForm({ ...categoryForm, image: base64 });

      } else if (formType === 'subcategory') {

        setSubCategoryForm({ ...subCategoryForm, image: base64 });

      } else if (formType === 'product') {

        setProductForm(prev => ({

          ...prev,

          imageBase64: [...prev.imageBase64, base64]

        }));

      }

    };

    reader.readAsDataURL(file);

  };



  const handleRemoveImage = (e, formType, index = null) => {

    e.preventDefault();

    e.stopPropagation();

    if (formType === 'category') {

      setCategoryForm({ ...categoryForm, image: '' });

    } else if (formType === 'subcategory') {

      setSubCategoryForm({ ...subCategoryForm, image: '' });

    } else if (formType === 'product' && index !== null) {

      setProductForm(prev => ({

        ...prev,

        imageBase64: prev.imageBase64.filter((_, i) => i !== index)

      }));

    }

  };



  if (!isAdmin) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>

          <p className="text-gray-600">You don't have permission to access this page</p>

        </div>

      </div>

    );

  }



  const tabs = [

    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, section: 'management' },

    { id: 'products', label: 'Products', icon: Package, section: 'management' },

    { id: 'categories', label: 'Categories', icon: Folder, section: 'management' },

    { id: 'subcategories', label: 'SubCategories', icon: FolderOpen, section: 'management' },

    { id: 'vendors', label: 'Vendors', icon: Menu, section: 'management' },

    { id: 'orders', label: 'Order Management', icon: ShoppingCart, section: 'management' },

    { id: 'users', label: 'Users', icon: Menu, section: 'management' },

    { id: 'configuration', label: 'Site Configuration', icon: Settings, section: 'configuration' },

  ];



  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">

      {/* Header */}

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 md:py-6 sticky top-[4rem] z-40">

        <div className="container mx-auto px-3 sm:px-4">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2 sm:gap-3">

              <button

                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"

              >

                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}

              </button>

              <div>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Admin Dashboard</h1>

                <p className="opacity-90 text-xs sm:text-sm md:text-base">Welcome back, {user?.fullName}</p>

              </div>

            </div>

            <div className="flex items-center gap-2 sm:gap-3">

              <button

                onClick={() => navigate('/shopping')}

                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-medium"

              >

                <ShoppingBag size={16} />

                <span>View Store</span>

              </button>

              <button

                onClick={() => navigate('/dashboard')}

                className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-medium"

              >

                <Menu size={16} />

                <span>User Dashboard</span>

              </button>

              <button

                onClick={logout}

                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-sm font-medium"

              >

                <Power size={16} />

                <span className="hidden sm:inline">Logout</span>

              </button>

            </div>

          </div>

        </div>

      </div>



      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 sm:gap-6">

          {/* Mobile Sidebar */}

          {mobileMenuOpen && (

            <div className="lg:hidden fixed inset-0 z-50 pt-16">

              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>

              <div className="relative bg-white rounded-xl shadow-lg p-4 m-2 max-w-sm max-h-[80vh] overflow-y-auto">

                <nav className="space-y-4">

                  {/* Management Section */}

                  <div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Management</h3>

                    <div className="space-y-2">

                      {tabs.filter(tab => tab.section === 'management').map(tab => (

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

                    </div>

                  </div>



                  {/* Configuration Section */}

                  <div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Configuration</h3>

                    <div className="space-y-2">

                      {tabs.filter(tab => tab.section === 'configuration').map(tab => (

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

                    </div>

                  </div>

                  {/* Quick Navigation Section */}
                  <div>
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
                        <span className="font-medium text-sm">View Store</span>
                      </button>
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-700"
                      >
                        <Menu size={18} />
                        <span className="font-medium text-sm">User Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-red-50 text-red-600"
                      >
                        <Power size={18} />
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

            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 sticky top-[8rem] max-h-[calc(100vh-10rem)] overflow-y-auto">

              <nav className="space-y-4 sm:space-y-6">

                {/* Management Section */}

                <div>

                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Management</h3>

                  <div className="space-y-2">

                    {tabs.filter(tab => tab.section === 'management').map(tab => (

                      <button

                        key={tab.id}

                        onClick={() => setActiveTab(tab.id)}

                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${

                          activeTab === tab.id

                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                            : 'hover:bg-gray-100 text-gray-700'

                        }`}

                      >

                        <tab.icon size={16} sm:size={18} md:size={20} />

                        <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>

                      </button>

                    ))}

                  </div>

                </div>



                {/* Configuration Section */}

                <div>

                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Configuration</h3>

                  <div className="space-y-2">

                    {tabs.filter(tab => tab.section === 'configuration').map(tab => (

                      <button

                        key={tab.id}

                        onClick={() => setActiveTab(tab.id)}

                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${

                          activeTab === tab.id

                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                            : 'hover:bg-gray-100 text-gray-700'

                        }`}

                      >

                        <tab.icon size={16} sm:size={18} md:size={20} />

                        <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>

                      </button>

                    ))}

                  </div>

                </div>

              </nav>

            </div>

          </aside>



          {/* Main Content */}

          <main className="flex-1">

            {activeTab === 'overview' && (

              <OverviewStats dashboardStats={dashboardStats} onNavigate={setActiveTab} recentOrders={orders} customerDetailsMap={customerDetailsMap} />

            )}



            {activeTab === 'products' && (

              <ProductsSection products={products} productFilter={productFilter} setProductFilter={setProductFilter} categories={categories} handleOpenProductModal={handleOpenProductModal} handleDeleteProduct={handleDeleteProduct} />

            )}



            {activeTab === 'categories' && (

              <CategoriesSection categories={categories} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} handleOpenCategoryModal={handleOpenCategoryModal} handleDeleteCategory={handleDeleteCategory} showToast={(message, type) => setToast({ show: true, message, type })} />

            )}



            {activeTab === 'subcategories' && (

              <SubCategoriesSection subCategories={subCategories} subCategoryFilter={subCategoryFilter} setSubCategoryFilter={setSubCategoryFilter} categories={categories} handleOpenSubCategoryModal={handleOpenSubCategoryModal} handleDeleteSubCategory={handleDeleteSubCategory} showToast={(message, type) => setToast({ show: true, message, type })} />

            )}



            {activeTab === 'configuration' && (

              <SiteConfiguration config={config} setConfig={setConfig} handleSaveConfiguration={handleSaveConfiguration} />

            )}



            {/* Category Modal */}

            <CategoryModal
              show={showCategoryModal}
              onClose={handleCloseCategoryModal}
              onSave={handleSaveCategory}
              editingCategory={editingCategory}
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              handleImageDrop={handleImageDrop}
              handleImageUpload={handleImageUpload}
              handleRemoveImage={handleRemoveImage}
              validationErrors={validationErrors}
              categoryValidationRules={categoryValidationRules}
              onFieldValidate={onFieldValidate}
            />


            {/* SubCategory Modal */}

            <SubCategoryModal

              show={showSubCategoryModal}

              onClose={handleCloseSubCategoryModal}

              onSave={handleSaveSubCategory}

              editingSubCategory={editingSubCategory}

              subCategoryForm={subCategoryForm}

              setSubCategoryForm={setSubCategoryForm}

              categories={categories}

              handleImageDrop={handleImageDrop}

              handleImageUpload={handleImageUpload}

              handleRemoveImage={handleRemoveImage}

              validationErrors={validationErrors}

              subCategoryValidationRules={subCategoryValidationRules}

              onFieldValidate={onFieldValidate}

            />



            {/* Product Modal */}

            <ProductModal
              show={showProductModal}
              onClose={handleCloseProductModal}
              onSave={handleSaveProduct}
              editingProduct={editingProduct}
              productForm={productForm}
              setProductForm={setProductForm}
              categories={categories}
              subCategories={subCategories}
              vendors={vendors}
              handleImageDrop={handleImageDrop}
              convertToBase64={convertToBase64}
              handleRemoveImage={handleRemoveImage}
              showToast={(message, type) => setToast({ show: true, message, type })}
            />



            {/* Delete Confirmation Modal */}

            <DeleteConfirmationModal

              show={showDeleteModal}

              onClose={handleCloseDeleteModal}

              onConfirm={handleConfirmDelete}

              deleteTarget={deleteTarget}

            />

            {/* Toast Notification */}
            <Toast
              show={toast.show}
              onClose={() => setToast({ ...toast, show: false })}
              message={toast.message}
              type={toast.type}
            />



            {/* Vendor Modal */}

            {/* User Modal */}

            <UserModal

              ref={userModalRef}

              onSuccess={loadDashboardData}

              showToast={(message, type) => setToast({ show: true, message, type })}

            />



            <VendorModal

              show={showVendorModal}

              onClose={handleCloseVendorModal}

              onSave={handleSaveVendor}

              editingVendor={editingVendor}

              vendorForm={vendorForm}

              setVendorForm={setVendorForm}

              validationErrors={validationErrors}

              validateField={validateField}

              defaultValidationRules={defaultValidationRules}

              showToast={(message, type) => setToast({ show: true, message, type })}

            />



            {activeTab === 'vendors' && (

              <VendorsSection 
                vendors={vendors} 
                vendorFilter={vendorFilter} 
                setVendorFilter={setVendorFilter} 
                handleOpenVendorModal={handleOpenVendorModal} 
                handleDeleteVendor={handleDeleteVendor}
                onEditVendor={handleOpenVendorModal}
                onRefresh={loadDashboardData}
                showToast={(message, type) => setToast({ show: true, message, type })}
              />

            )}



            {activeTab === 'orders' && (
              <OrdersSection orders={orders || []} onOrderUpdate={loadDashboardData} showToast={(message, type) => setToast({ show: true, message, type })} />
            )}



            {activeTab === 'users' && (

              <UsersSection

                users={users}

                userFilter={userFilter}

                setUserFilter={setUserFilter}

                userModalRef={userModalRef}

                onDeleteUser={handleDeleteUser}

              />

            )}



          </main>

        </div>

      </div>

    </div>

  );

};



export default AdminDashboard;

