import { Plus, Edit, Trash2, Search, Package, X, Filter } from 'lucide-react';

const ProductsSection = ({ 
  products, 
  productFilter, 
  setProductFilter, 
  handleOpenProductModal, 
  handleDeleteProduct, 
  categories 
}) => {
  const filteredProducts = products.filter(product => {
    const searchTerm = productFilter.search.toLowerCase();
    const matchesSearch = !searchTerm || 
      product.name?.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm) ||
      product.brand?.toLowerCase().includes(searchTerm);
    
    const category = categories.find(c => c.id === product.categoryId);
    const categoryName = category?.name || category?.displayName || '';
    
    // Multiple category support
    const selectedCategories = productFilter.category ? productFilter.category.split(',') : [];
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(categoryName);
    
    // Multiple status support
    const selectedStatuses = productFilter.status ? productFilter.status.split(',') : [];
    const matchesStatus = selectedStatuses.length === 0 ||
      (selectedStatuses.includes('active') && product.isActive) ||
      (selectedStatuses.includes('inactive') && !product.isActive) ||
      (selectedStatuses.includes('featured') && product.isFeatured) ||
      (selectedStatuses.includes('trending') && product.isTrending);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const clearFilters = () => {
    setProductFilter({ search: '', category: '', status: '' });
  };

  const hasActiveFilters = productFilter.search || productFilter.category || productFilter.status;

  const toggleCategory = (categoryName) => {
    const selectedCategories = productFilter.category ? productFilter.category.split(',') : [];
    const newCategories = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName];
    setProductFilter({ ...productFilter, category: newCategories.join(',') });
  };

  const toggleStatus = (statusValue) => {
    const selectedStatuses = productFilter.status ? productFilter.status.split(',') : [];
    const newStatuses = selectedStatuses.includes(statusValue)
      ? selectedStatuses.filter(s => s !== statusValue)
      : [...selectedStatuses, statusValue];
    setProductFilter({ ...productFilter, status: newStatuses.join(',') });
  };

  const statusOptions = [
    { label: 'Active', value: 'active', color: 'green' },
    { label: 'Inactive', value: 'inactive', color: 'gray' },
    { label: 'Featured', value: 'featured', color: 'blue' },
    { label: 'Trending', value: 'trending', color: 'orange' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/10">
              <Package size={18} sm:size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Products</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">{filteredProducts.length} of {products.length} products</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenProductModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 sm:p-5 border-b border-gray-100 bg-gradient-to-b from-gray-50/50 to-white">
        {/* Search */}
        <div className="relative mb-3 sm:mb-4">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} sm:size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={productFilter.search}
            onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
          />
          {productFilter.search && (
            <button 
              onClick={() => setProductFilter({ ...productFilter, search: '' })}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} sm:size={18} />
            </button>
          )}
        </div>

        {/* Selected Status Chips */}
        {productFilter.status && (
          <div className="flex flex-wrap gap-2 mb-3">
            {productFilter.status.split(',').map(status => {
              const option = statusOptions.find(opt => opt.value === status);
              return option ? (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ${
                    option.color === 'green' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 ring-2 ring-green-500/30' :
                    option.color === 'gray' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 ring-2 ring-gray-500/30' :
                    option.color === 'blue' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 ring-2 ring-blue-500/30' :
                    'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 ring-2 ring-orange-500/30'
                  }`}
                >
                  {option.label}
                  <button
                    onClick={() => toggleStatus(status)}
                    className="hover:opacity-80"
                  >
                    <X size={12} />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Selected Category Chips */}
        {productFilter.category && (
          <div className="flex flex-wrap gap-2 mb-3">
            {productFilter.category.split(',').map(catName => (
              <span
                key={catName}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 shadow-sm ring-2 ring-indigo-500/30"
              >
                {catName}
                <button
                  onClick={() => toggleCategory(catName)}
                  className="hover:opacity-80"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category and Status Dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Category Multi-select Dropdown */}
          <div className="flex-1 relative">
            <select 
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  toggleCategory(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md appearance-none cursor-pointer"
            >
              <option value="">+ Add Category</option>
              {categories.filter(cat => !productFilter.category || !productFilter.category.split(',').includes(cat.name)).map(cat => (
                <option key={cat.id} value={cat.name}>{cat.displayName || cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Status Multi-select Dropdown */}
          <div className="flex-1 sm:flex-none relative">
            <select 
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  toggleStatus(e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md appearance-none cursor-pointer"
            >
              <option value="">+ Add Status</option>
              {statusOptions.filter(opt => !productFilter.status || !productFilter.status.split(',').includes(opt.value)).map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      </div>
      
      {/* Products Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-[500px] sm:min-w-full">
          <thead className="bg-gradient-to-b from-slate-50 via-blue-50/40 to-indigo-50/30 border-b-2 border-gray-100">
            <tr>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[80px] sm:min-w-[120px] border-r border-gray-100/50">Product</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[60px] sm:min-w-[80px] border-r border-gray-100/50">Price</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[60px] sm:min-w-[80px] border-r border-gray-100/50">Stock</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[80px] sm:min-w-[100px] border-r border-gray-100/50">Category</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[70px] sm:min-w-[100px] border-r border-gray-100/50">Status</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[80px] sm:min-w-[100px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {filteredProducts.map(product => {
              const category = categories.find(c => c.id === product.categoryId);
              const categoryName = category?.displayName || category?.name || 'Unknown';
              return (
                <tr key={product.id} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group border-b border-gray-50 last:border-b-0">
                  <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[80px] sm:min-w-[120px] border-r border-gray-100/50 text-right">
                    <div className="flex items-center justify-end">
                      <div className="min-w-0 flex-1 text-right">
                        <p className="font-semibold text-gray-900 text-[11px] sm:text-sm truncate leading-tight">{product.name}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block truncate leading-tight">{categoryName}</p>
                      </div>
                      <div className="relative flex-shrink-0 ml-1 sm:ml-2">
                        <img
                          src={product.imageBase64?.[0] || product.imageUrls?.[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-3.5 h-3.5 sm:w-6 sm:h-6 object-cover rounded-lg shadow-md ring-2 ring-gray-100 group-hover:ring-blue-400 group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[60px] sm:min-w-[80px] border-r border-gray-100/50 text-right">
                    <p className="font-bold text-gray-900 text-[11px] sm:text-base">₹{product.price?.toLocaleString()}</p>
                  </td>
                  <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[60px] sm:min-w-[80px] border-r border-gray-100/50 text-right">
                    <div className="flex items-center gap-1 sm:gap-2 justify-end">
                      <span className="text-[11px] sm:text-sm font-bold text-gray-700">{product.stock}</span>
                      <span className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full shadow-md ${
                        product.stock > 10 ? 'bg-green-500 shadow-green-500/50' : product.stock > 0 ? 'bg-yellow-500 shadow-yellow-500/50' : 'bg-red-500 shadow-red-500/50'
                      }`} />
                    </div>
                  </td>
                  <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[80px] sm:min-w-[100px] border-r border-gray-100/50 text-right">
                    <span className="inline-flex items-center px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-sm font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-md">
                      {categoryName}
                    </span>
                  </td>
                  <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[70px] sm:min-w-[100px] border-r border-gray-100/50 text-right">
                    <div className="flex items-center gap-0.5 sm:gap-1.5 justify-end">
                      {product.isFeatured && (
                        <span className="text-blue-500 text-[10px] sm:text-base" title="Featured">
                          ★
                        </span>
                      )}
                      {product.isTrending && (
                        <span className="text-orange-500 text-[10px] sm:text-base" title="Trending">
                          🔥
                        </span>
                      )}
                      <span className={`inline-flex items-center px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold shadow-md ${
                        product.isActive 
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
                      }`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[80px] sm:min-w-[100px] text-right">
                    <div className="flex gap-0.5 sm:gap-1 justify-end">
                      <button
                        onClick={() => handleOpenProductModal(product)}
                        className="p-1 sm:p-2 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-500 hover:to-indigo-600 hover:text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/30 ring-1 ring-blue-200 hover:ring-blue-500"
                        title="Edit"
                      >
                        <Edit size={9} sm:size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product)}
                        className="p-1 sm:p-2 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 hover:from-red-500 hover:to-rose-600 hover:text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-red-500/30 ring-1 ring-red-200 hover:ring-red-500"
                        title="Delete"
                      >
                        <Trash2 size={9} sm:size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-blue-500/10">
              <Package size={32} sm:size={48} className="text-blue-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              {hasActiveFilters ? 'No products match your filters' : 'No products found'}
            </h3>
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first product to get started'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <X size={16} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
