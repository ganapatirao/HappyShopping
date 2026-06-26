import { FolderOpen } from 'lucide-react';

const SubCategoriesSection = ({ 
  subCategories, 
  subCategoryFilter, 
  setSubCategoryFilter, 
  handleOpenSubCategoryModal, 
  handleDeleteSubCategory, 
  categories 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <FolderOpen size={20} sm:size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">SubCategories Management</h2>
              <p className="text-indigo-100 text-xs sm:text-sm">Manage product subcategories</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Search subcategories..."
            value={subCategoryFilter.search}
            onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, search: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <select 
            value={subCategoryFilter.categoryId}
            onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, categoryId: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.displayName || cat.name}</option>
            ))}
          </select>
          <select 
            value={subCategoryFilter.status}
            onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, status: e.target.value })}
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
        {subCategories
          .filter(subCat => {
            const matchesSearch = subCat.displayName?.toLowerCase().includes(subCategoryFilter.search.toLowerCase()) || 
                                subCat.name?.toLowerCase().includes(subCategoryFilter.search.toLowerCase());
            const matchesCategory = subCategoryFilter.categoryId === '' || subCat.categoryId === subCategoryFilter.categoryId;
            const matchesStatus = subCategoryFilter.status === '' || 
                                (subCategoryFilter.status === 'active' && subCat.isActive) ||
                                (subCategoryFilter.status === 'inactive' && !subCat.isActive) ||
                                (subCategoryFilter.status === 'featured' && subCat.isFeatured);
            return matchesSearch && matchesCategory && matchesStatus;
          })
          .map((subCategory) => (
          <div key={subCategory.id} className="border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{subCategory.displayName || subCategory.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600">{categories.find(c => c.id === subCategory.categoryId)?.displayName || 'Unknown Category'}</p>
              </div>
              {subCategory.isFeatured && (
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleOpenSubCategoryModal(subCategory)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteSubCategory(subCategory)}
                className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {subCategories.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No subcategories found. Click "Add SubCategory" to create one.
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoriesSection;
