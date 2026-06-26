import { Folder } from 'lucide-react';

const CategoriesSection = ({ 
  categories, 
  categoryFilter, 
  setCategoryFilter, 
  handleOpenCategoryModal, 
  handleDeleteCategory 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <Folder size={20} sm:size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Categories Management</h2>
              <p className="text-blue-100 text-xs sm:text-sm">Manage product categories</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Search categories..."
            value={categoryFilter.search}
            onChange={(e) => setCategoryFilter({ ...categoryFilter, search: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <select 
            value={categoryFilter.status}
            onChange={(e) => setCategoryFilter({ ...categoryFilter, status: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-2 sm:gap-3 md:gap-4">
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
          <div key={category.id} className="border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">{category.icon || '📦'}</span>
                <div>
                  <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{category.displayName || category.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{category.productCount || 0} products</p>
                </div>
              </div>
              {category.isFeatured && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenCategoryModal(category)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteCategory(category)}
                className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No categories found. Click "Add Category" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesSection;
