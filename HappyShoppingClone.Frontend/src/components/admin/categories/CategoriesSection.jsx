import { Folder, Search, Grid3X3, Edit2, Trash2, Star, Eye, EyeOff, Plus, Sparkles, TrendingUp, Package } from 'lucide-react';

const CategoriesSection = ({ 
  categories, 
  categoryFilter, 
  setCategoryFilter, 
  handleOpenCategoryModal, 
  handleDeleteCategory 
}) => {
  const activeCount = categories.filter(c => c.isActive).length;
  const featuredCount = categories.filter(c => c.isFeatured).length;
  
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 md:p-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 w-full xl:w-auto">
            <div className="bg-slate-100 p-3 sm:p-4 rounded-xl">
              <Grid3X3 size={24} sm:size={28} className="text-slate-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800">
                Categories Management
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm md:text-base mt-1.5">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenCategoryModal(null)}
            className="w-full xl:w-auto bg-slate-800 hover:bg-slate-900 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} sm:size={20} />
            <span className="text-sm sm:text-base">Add Category</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3 md:gap-4 mb-5 sm:mb-7">
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-violet-100 p-2.5 sm:p-2.5 rounded-lg">
                <Folder size={16} sm:size={18} md:size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800">{categories.length}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-emerald-100 p-2.5 sm:p-2.5 rounded-lg">
                <Eye size={16} sm:size={18} md:size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800">{activeCount}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-amber-100 p-2.5 sm:p-2.5 rounded-lg">
                <Star size={16} sm:size={18} md:size={20} className="text-amber-600" fill="currentColor" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800">{featuredCount}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500">Featured</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex bg-white border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-slate-100 p-2.5 sm:p-2.5 rounded-lg">
                <Package size={16} sm:size={18} md:size={20} className="text-slate-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-800">{categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500">Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} sm:size={18} />
            <input
              type="text"
              placeholder="Search categories by name..."
              value={categoryFilter.search}
              onChange={(e) => setCategoryFilter({ ...categoryFilter, search: e.target.value })}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all text-sm sm:text-sm md:text-base bg-white"
            />
          </div>
          <div className="relative">
            <select 
              value={categoryFilter.status}
              onChange={(e) => setCategoryFilter({ ...categoryFilter, status: e.target.value })}
              className="w-full sm:w-auto px-4 sm:px-4 py-2.5 sm:py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 transition-all text-sm sm:text-sm md:text-base bg-white cursor-pointer appearance-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        {categories
          .filter(cat => {
            const matchesSearch = cat.displayName?.toLowerCase().includes(categoryFilter.search.toLowerCase()) || 
                                cat.name?.toLowerCase().includes(categoryFilter.search.toLowerCase());
            const matchesStatus = categoryFilter.status === '' || 
                                (categoryFilter.status === 'active' && cat.isActive) ||
                                (categoryFilter.status === 'inactive' && !cat.isActive) ||
                                (categoryFilter.status === 'featured' && cat.isFeatured);
            return matchesSearch && matchesStatus;
          })
          .map((category) => (
          <div 
            key={category.id} 
            className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Category Image/Icon Header */}
            <div className="relative h-32 sm:h-36 bg-slate-100 flex items-center justify-center overflow-hidden">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.displayName || category.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-5xl sm:text-6xl text-slate-400">{category.icon || '📦'}</span>
              )}
              {/* Status Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5">
                {category.isFeatured && (
                  <div className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <Star size={10} fill="currentColor" />
                    Featured
                  </div>
                )}
                <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${category.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'}`}>
                  {category.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                  {category.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              {/* Display Order Badge */}
              <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                #{category.displayOrder || 0}
              </div>
            </div>

            {/* Category Details */}
            <div className="p-3 sm:p-3 bg-white">
              <div className="mb-2">
                <h3 className="font-semibold text-slate-800 text-sm sm:text-sm mb-1 line-clamp-1">
                  {category.displayName || category.name}
                </h3>
                <p className="text-slate-500 text-xs sm:text-[10px] line-clamp-2 min-h-[2rem]">
                  {category.description || 'No description available'}
                </p>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-3 text-xs sm:text-[10px] bg-slate-50 rounded-lg p-2">
                <div className="flex items-center gap-1 text-slate-600">
                  <Package size={12} />
                  <span>{category.productCount || 0} products</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <span className="text-slate-500">ID:</span>
                  <span className="text-slate-600 font-mono text-xs">{category.name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5">
                <button 
                  onClick={() => handleOpenCategoryModal(category)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteCategory(category)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center">
            <div className="bg-slate-100 p-6 sm:p-8 rounded-full mb-6">
              <Folder size={48} sm:size={56} className="text-slate-400" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-700 mb-2">
              No Categories Found
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base mb-5 sm:mb-6 max-w-md px-4">
              {categoryFilter.search || categoryFilter.status 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by creating your first category'}
            </p>
            <button
              onClick={() => handleOpenCategoryModal(null)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={18} sm:size={20} />
              <span className="text-sm sm:text-base">Add Your First Category</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesSection;
