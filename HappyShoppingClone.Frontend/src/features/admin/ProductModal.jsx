import { useState, useEffect } from 'react';
import { X, Plus, Edit, Package, AlertCircle, Truck, Gift, Tag, Info, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { productAPI } from '../../services/api';

const ProductModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingProduct, 
  productForm, 
  setProductForm, 
  categories,
  subCategories,
  vendors,
  handleImageDrop,
  convertToBase64,
  handleRemoveImage,
  showToast
}) => {
  const [validationRules, setValidationRules] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [rulesLoading, setRulesLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    delivery: false,
    offers: false,
    specifications: false,
    highlights: false,
    productDetails: false
  });

  useEffect(() => {
    if (show) {
      loadValidationRules();
      setValidationErrors({});
      setTouchedFields({});
    }
  }, [show]);

  const loadValidationRules = async () => {
    try {
      setRulesLoading(true);
      const response = await productAPI.getValidationRules();
      if (response.data.success && response.data.rules) {
        setValidationRules(response.data.rules);
      }
    } catch (error) {
    } finally {
      setRulesLoading(false);
    }
  };

  const validateField = (fieldName, value) => {
    if (!validationRules) return '';

    // Handle both camelCase and PascalCase field names
    const pascalFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    const rules = validationRules[fieldName] || validationRules[pascalFieldName];
    
    if (!rules) return '';

    // Handle backend rule structure (PascalCase with single ErrorMessage)
    const isRequired = rules.Required !== undefined ? rules.Required : rules.required;
    const errorMessage = rules.ErrorMessage || rules.errorMessage;
    
    if (isRequired && (!value || value === '')) {
      return errorMessage || `${fieldName} is required`;
    }

    const minLength = rules.MinLength !== undefined ? rules.MinLength : rules.minLength;
    const maxLength = rules.MaxLength !== undefined ? rules.MaxLength : rules.maxLength;
    
    if (minLength && value && value.length < minLength) {
      return errorMessage || `${fieldName} must be at least ${minLength} characters`;
    }

    if (maxLength && value && value.length > maxLength) {
      return errorMessage || `${fieldName} must not exceed ${maxLength} characters`;
    }

    const pattern = rules.Pattern !== undefined ? rules.Pattern : rules.pattern;
    if (pattern && value && !new RegExp(pattern).test(value)) {
      return errorMessage || `${fieldName} format is invalid`;
    }

    const minValue = rules.MinValue !== undefined ? rules.MinValue : rules.minValue;
    if (minValue && value && parseFloat(value) < minValue) {
      return errorMessage || `${fieldName} must be at least ${minValue}`;
    }

    const maxValue = rules.MaxValue !== undefined ? rules.MaxValue : rules.maxValue;
    if (maxValue && value && parseFloat(value) > maxValue) {
      return errorMessage || `${fieldName} must not exceed ${maxValue}`;
    }

    return '';
  };

  const handleFieldBlur = (fieldName, value) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldMouseOut = (fieldName, value) => {
    if (touchedFields[fieldName]) {
      const error = validateField(fieldName, value);
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setProductForm({ ...productForm, [fieldName]: value });
    if (touchedFields[fieldName]) {
      const error = validateField(fieldName, value);
      setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields based on server rules
    if (validationRules) {
      Object.keys(validationRules).forEach(fieldName => {
        const value = productForm[fieldName];
        const error = validateField(fieldName, value);
        if (error) errors[fieldName] = error;
      });
    }
    
    setValidationErrors(errors);
    setTouchedFields(validationRules ? Object.keys(validationRules).reduce((acc, field) => ({ ...acc, [field]: true }), {}) : {});
    
    // Show toast with validation errors if any
    if (Object.keys(errors).length > 0 && showToast) {
      const errorMessages = Object.values(errors).join(', ');
      showToast(`Validation errors: ${errorMessages}`, 'error');
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSaveClick = () => {
    if (validateForm()) {
      onSave();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-4xl max-h-[95vh] sm:max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 mx-0 sm:mx-0 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
        {/* Header with enhanced gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-5 md:p-6 rounded-t-2xl shadow-lg relative overflow-hidden sticky top-0 z-20">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 sm:p-2.5 md:p-3 rounded-xl backdrop-blur-sm ring-2 ring-white/30 shadow-lg">
                <Package size={18} sm:size={20} md:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {editingProduct ? 'Edit Product' : 'Add Product'}
                </h3>
                <p className="text-purple-100 text-[10px] sm:text-xs md:text-sm font-medium">
                  {editingProduct ? 'Update product details' : 'Create a new product'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 sm:p-2.5 md:p-3 rounded-xl backdrop-blur-sm transition-all ring-2 ring-white/30 hover:ring-white/50 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
            >
              <X size={16} sm:size={18} md:size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 md:space-y-5">
          {/* Product Name & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
                Product Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={() => handleFieldBlur('name', productForm.name)}
                  onMouseOut={() => handleFieldMouseOut('name', productForm.name)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${
                    validationErrors.name && touchedFields.name
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white group-hover:border-purple-300'
                  }`}
                  placeholder="Product name"
                />
                {validationErrors.name && touchedFields.name && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-pulse">
                    <AlertCircle size={14} sm:size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.name && touchedFields.name && (
                <div className="flex items-center gap-2 mt-1 sm:mt-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle size={12} sm:size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-red-700 font-medium">{validationErrors.name}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <select
                  value={productForm.categoryId}
                  onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                  onBlur={() => handleFieldBlur('categoryId', productForm.categoryId)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-10 sm:pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none bg-white shadow-sm cursor-pointer text-sm sm:text-base ${
                    validationErrors.categoryId && touchedFields.categoryId
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 group-hover:border-purple-300'
                  }`}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.displayName || category.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-500 transition-colors text-xs sm:text-sm">▼</span>
                {validationErrors.categoryId && touchedFields.categoryId && (
                  <div className="absolute right-7 sm:right-8 top-1/2 -translate-y-1/2 animate-pulse">
                    <AlertCircle size={14} sm:size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.categoryId && touchedFields.categoryId && (
                <div className="flex items-center gap-2 mt-1 sm:mt-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle size={12} sm:size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-red-700 font-medium">{validationErrors.categoryId}</span>
                </div>
              )}
            </div>
          </div>

          {/* SubCategory & Stock */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
                SubCategory <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <select
                  value={productForm.subCategoryId}
                  onChange={(e) => handleFieldChange('subCategoryId', e.target.value)}
                  onBlur={() => handleFieldBlur('subCategoryId', productForm.subCategoryId)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-10 sm:pl-12 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all appearance-none bg-white shadow-sm cursor-pointer text-sm sm:text-base ${
                    validationErrors.subCategoryId && touchedFields.subCategoryId
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 group-hover:border-purple-300'
                  }`}
                >
                  <option value="">Select a subcategory</option>
                  {subCategories
                    .filter(sc => !productForm.categoryId || sc.categoryId === productForm.categoryId)
                    .map((subCategory) => (
                      <option key={subCategory.id} value={subCategory.id}>
                        {subCategory.displayName || subCategory.name}
                      </option>
                    ))}
                </select>
                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-purple-500 transition-colors text-xs sm:text-sm">▼</span>
                {validationErrors.subCategoryId && touchedFields.subCategoryId && (
                  <div className="absolute right-7 sm:right-8 top-1/2 -translate-y-1/2 animate-pulse">
                    <AlertCircle size={14} sm:size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.subCategoryId && touchedFields.subCategoryId && (
                <div className="flex items-center gap-2 mt-1 sm:mt-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle size={12} sm:size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-red-700 font-medium">{validationErrors.subCategoryId}</span>
                </div>
              )}
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
                <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
                Stock <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => handleFieldChange('stock', e.target.value)}
                  onBlur={() => handleFieldBlur('stock', productForm.stock)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${
                    validationErrors.stock && touchedFields.stock
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white group-hover:border-purple-300'
                  }`}
                  placeholder="0"
                />
                {validationErrors.stock && touchedFields.stock && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-pulse">
                    <AlertCircle size={14} sm:size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.stock && touchedFields.stock && (
                <div className="flex items-center gap-2 mt-1 sm:mt-1.5 px-2 sm:px-3 py-1.5 sm:py-2 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-200">
                  <AlertCircle size={12} sm:size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-[10px] sm:text-xs text-red-700 font-medium">{validationErrors.stock}</span>
                </div>
              )}
            </div>
          </div>

          {/* Vendor */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Vendor <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={productForm.vendorId || ''}
                onChange={(e) => setProductForm({ ...productForm, vendorId: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none bg-white"
              >
                <option value="">Select a vendor</option>
                {vendors && vendors.map((vendor) => (
                  <option key={vendor.id || vendor._id || vendor.Id} value={vendor.id || vendor._id || vendor.Id}>
                    {vendor.companyName || vendor.displayName || vendor.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
            </div>
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => handleFieldChange('price', e.target.value)}
                  onBlur={() => handleFieldBlur('price', productForm.price)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.price && touchedFields.price
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="0"
                />
                {validationErrors.price && touchedFields.price && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.price && touchedFields.price && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.price}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                Original Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={productForm.originalPrice}
                  onChange={(e) => handleFieldChange('originalPrice', e.target.value)}
                  onBlur={() => handleFieldBlur('originalPrice', productForm.originalPrice)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    validationErrors.originalPrice && touchedFields.originalPrice
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="0"
                />
                {validationErrors.originalPrice && touchedFields.originalPrice && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <AlertCircle size={16} className="text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.originalPrice && touchedFields.originalPrice && (
                <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                  <span className="text-xs text-red-700 font-medium">{validationErrors.originalPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={productForm.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={() => handleFieldBlur('description', productForm.description)}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${
                validationErrors.description && touchedFields.description
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'
              }`}
              rows={4}
              placeholder="Product description"
            />
            {validationErrors.description && touchedFields.description && (
              <div className="flex items-center gap-2 mt-1.5 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
                <span className="text-xs text-red-700 font-medium">{validationErrors.description}</span>
              </div>
            )}
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Product Images
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleImageDrop(e, 'product')}
            >
              <div>
                <span className="text-4xl mb-2 block">📷</span>
                <p className="text-gray-600 mb-2">Drag & drop images here</p>
                <p className="text-gray-400 text-sm">or click to select files</p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  for (const file of e.target.files) {
                    convertToBase64(file, 'product');
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {productForm.imageBase64.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                {productForm.imageBase64.map((img, index) => (
                  <div key={index} className="relative">
                    <img
                      src={img}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(e, 'product', index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-2">
            <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300 active:scale-95">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Active</span>
                <p className="text-[10px] sm:text-xs text-gray-500">Visible to users</p>
              </div>
            </label>
            <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-300 active:scale-95">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500"></div>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Featured</span>
                <p className="text-[10px] sm:text-xs text-gray-500">Show on homepage</p>
              </div>
            </label>
            <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl cursor-pointer hover:from-orange-100 hover:to-amber-100 transition-all border-2 border-transparent hover:border-orange-300 active:scale-95">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={productForm.isTrending}
                  onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500"></div>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Trending</span>
                <p className="text-[10px] sm:text-xs text-gray-500">Popular items</p>
              </div>
            </label>
          </div>

          {/* Product Highlights Section */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => setExpandedSections({ ...expandedSections, highlights: !expandedSections.highlights })}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-1 sm:p-1.5 rounded-lg shadow-md">
                  <Zap className="text-white" size={14} sm:size={16} />
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Product Highlights</span>
              </div>
              {expandedSections.highlights ? <ChevronUp size={16} sm:size={18} className="text-orange-600" /> : <ChevronDown size={16} sm:size={18} className="text-orange-600" />}
            </button>
            {expandedSections.highlights && (
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Add Highlight</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={productForm.newHighlight || ''}
                      onChange={(e) => setProductForm({ ...productForm, newHighlight: e.target.value })}
                      className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      placeholder="Enter product highlight"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (productForm.newHighlight && productForm.newHighlight.trim()) {
                          setProductForm({
                            ...productForm,
                            highlights: [...(productForm.highlights || []), productForm.newHighlight.trim()],
                            newHighlight: ''
                          });
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                {productForm.highlights && productForm.highlights.length > 0 && (
                  <div className="space-y-2">
                    {productForm.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{highlight}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              highlights: productForm.highlights.filter((_, i) => i !== index)
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Delivery Information Section */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => setExpandedSections({ ...expandedSections, delivery: !expandedSections.delivery })}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-1 sm:p-1.5 rounded-lg shadow-md">
                  <Truck className="text-white" size={14} sm:size={16} />
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Delivery Information</span>
              </div>
              {expandedSections.delivery ? <ChevronUp size={16} sm:size={18} className="text-blue-600" /> : <ChevronDown size={16} sm:size={18} className="text-blue-600" />}
            </button>
            {expandedSections.delivery && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Free Delivery</label>
                  <select
                    value={productForm.deliveryInfo?.freeDelivery ? 'true' : 'false'}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, freeDelivery: e.target.value === 'true' }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Delivery Days</label>
                  <input
                    type="number"
                    value={productForm.deliveryInfo?.deliveryDays || 5}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, deliveryDays: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Delivery Type</label>
                  <select
                    value={productForm.deliveryInfo?.deliveryType || 'Standard'}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, deliveryType: e.target.value }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="Standard">Standard</option>
                    <option value="Express">Express</option>
                    <option value="Same Day">Same Day</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Delivery Areas</label>
                  <input
                    type="text"
                    value={productForm.deliveryInfo?.deliveryAreas || 'All India'}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, deliveryAreas: e.target.value }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Return Days</label>
                  <input
                    type="number"
                    value={productForm.deliveryInfo?.returnDays || 7}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, returnDays: parseInt(e.target.value) }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Free Return</label>
                  <select
                    value={productForm.deliveryInfo?.freeReturn ? 'true' : 'false'}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, freeReturn: e.target.value === 'true' }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Cash on Delivery</label>
                  <select
                    value={productForm.deliveryInfo?.cashOnDeliveryAvailable ? 'true' : 'false'}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      deliveryInfo: { ...productForm.deliveryInfo, cashOnDeliveryAvailable: e.target.value === 'true' }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Offers Section */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => setExpandedSections({ ...expandedSections, offers: !expandedSections.offers })}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-1 sm:p-1.5 rounded-lg shadow-md">
                  <Gift className="text-white" size={14} sm:size={16} />
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Product Offers</span>
              </div>
              {expandedSections.offers ? <ChevronUp size={16} sm:size={18} className="text-purple-600" /> : <ChevronDown size={16} sm:size={18} className="text-purple-600" />}
            </button>
            {expandedSections.offers && (
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Add New Offer</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={productForm.newOffer?.title || ''}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        newOffer: { ...productForm.newOffer, title: e.target.value }
                      })}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      placeholder="Offer title"
                    />
                    <input
                      type="text"
                      value={productForm.newOffer?.promoCode || ''}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        newOffer: { ...productForm.newOffer, promoCode: e.target.value }
                      })}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      placeholder="Promo code"
                    />
                  </div>
                  <textarea
                    value={productForm.newOffer?.description || ''}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      newOffer: { ...productForm.newOffer, description: e.target.value }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                    rows={2}
                    placeholder="Offer description"
                  />
                  <input
                    type="date"
                    value={productForm.newOffer?.validUntil || ''}
                    onChange={(e) => setProductForm({
                      ...productForm,
                      newOffer: { ...productForm.newOffer, validUntil: e.target.value }
                    })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (productForm.newOffer?.title && productForm.newOffer.title.trim()) {
                        setProductForm({
                          ...productForm,
                          offers: [...(productForm.offers || []), {
                            ...productForm.newOffer,
                            validUntil: productForm.newOffer.validUntil ? new Date(productForm.newOffer.validUntil).toISOString() : null
                          }],
                          newOffer: { title: '', description: '', promoCode: '', validUntil: '' }
                        });
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Add Offer
                  </button>
                </div>
                {productForm.offers && productForm.offers.length > 0 && (
                  <div className="space-y-2">
                    {productForm.offers.map((offer, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-gray-800">{offer.title}</p>
                            <p className="text-sm text-gray-600">{offer.description}</p>
                            {offer.promoCode && (
                              <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold">
                                {offer.promoCode}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setProductForm({
                                ...productForm,
                                offers: productForm.offers.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Specifications Section */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => setExpandedSections({ ...expandedSections, specifications: !expandedSections.specifications })}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 p-1 sm:p-1.5 rounded-lg shadow-md">
                  <Info className="text-white" size={14} sm:size={16} />
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Specifications</span>
              </div>
              {expandedSections.specifications ? <ChevronUp size={16} sm:size={18} className="text-cyan-600" /> : <ChevronDown size={16} sm:size={18} className="text-cyan-600" />}
            </button>
            {expandedSections.specifications && (
              <div className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Add Specification</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={productForm.newSpec?.key || ''}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        newSpec: { ...productForm.newSpec, key: e.target.value }
                      })}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      placeholder="Specification key"
                    />
                    <input
                      type="text"
                      value={productForm.newSpec?.value || ''}
                      onChange={(e) => setProductForm({
                        ...productForm,
                        newSpec: { ...productForm.newSpec, value: e.target.value }
                      })}
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                      placeholder="Specification value"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (productForm.newSpec?.key && productForm.newSpec.key.trim()) {
                        setProductForm({
                          ...productForm,
                          specifications: [...(productForm.specifications || []), productForm.newSpec],
                          newSpec: { key: '', value: '' }
                        });
                      }
                    }}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700"
                  >
                    <Plus size={18} className="inline mr-2" />
                    Add Specification
                  </button>
                </div>
                {productForm.specifications && productForm.specifications.length > 0 && (
                  <div className="space-y-2">
                    {productForm.specifications.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-800">{spec.key}:</span>
                          <span className="text-gray-600 ml-2">{spec.value}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setProductForm({
                              ...productForm,
                              specifications: productForm.specifications.filter((_, i) => i !== index)
                            });
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Details Section */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <button
              onClick={() => setExpandedSections({ ...expandedSections, productDetails: !expandedSections.productDetails })}
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-1 sm:p-1.5 rounded-lg shadow-md">
                  <Tag className="text-white" size={14} sm:size={16} />
                </div>
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Product Details</span>
              </div>
              {expandedSections.productDetails ? <ChevronUp size={16} sm:size={18} className="text-orange-600" /> : <ChevronDown size={16} sm:size={18} className="text-orange-600" />}
            </button>
            {expandedSections.productDetails && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand || ''}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    placeholder="Brand name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Manufacturer</label>
                  <input
                    type="text"
                    value={productForm.manufacturer || ''}
                    onChange={(e) => setProductForm({ ...productForm, manufacturer: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    placeholder="Manufacturer name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Country of Origin</label>
                  <input
                    type="text"
                    value={productForm.countryOfOrigin || ''}
                    onChange={(e) => setProductForm({ ...productForm, countryOfOrigin: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    placeholder="Country of origin"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Warranty</label>
                  <input
                    type="text"
                    value={productForm.warranty || ''}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
                    placeholder="Warranty information"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-b-2xl sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
          >
            <X size={14} sm:size={16} md:size={18} />
            <span className="hidden sm:inline">Cancel</span>
          </button>
          <button
            onClick={handleSaveClick}
            className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-1.5 sm:gap-2 transform hover:scale-[1.02] active:scale-95 ring-2 ring-purple-500/20 hover:ring-purple-500/50 text-sm sm:text-base"
          >
            {editingProduct ? <Edit size={14} sm:size={16} md:size={18} /> : <Plus size={14} sm:size={16} md:size={18} />}
            {editingProduct ? <span className="hidden sm:inline">Update</span> : <span className="hidden sm:inline">Create</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
