import { X, Plus, Edit, Folder } from 'lucide-react';

const CategoryModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingCategory, 
  categoryForm, 
  setCategoryForm, 
  validationErrors,
  validateField,
  handleImageDrop,
  handleImageUpload,
  handleRemoveImage 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Folder size={20} sm:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h3>
                <p className="text-purple-100 text-xs sm:text-sm">
                  {editingCategory ? 'Update category details' : 'Create a new category'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <X size={18} sm:size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Category Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                onBlur={() => validateField('name', categoryForm.name, { required: true, minLength: 2, maxLength: 50 })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="e.g., fashion"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📝</span>
            </div>
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Display Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Display Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={categoryForm.displayName}
                onChange={(e) => setCategoryForm({ ...categoryForm, displayName: e.target.value })}
                onBlur={() => validateField('displayName', categoryForm.displayName, { required: true, minLength: 2, maxLength: 100 })}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                placeholder="e.g., Fashion"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✨</span>
            </div>
            {validationErrors.displayName && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.displayName}</p>
            )}
          </div>

          {/* Icon Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Icon (Emoji)
            </label>
            <div className="relative">
              <input
                type="text"
                value={categoryForm.icon}
                onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="e.g., 👗"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🎨</span>
            </div>
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Category Image
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleImageDrop(e, 'category')}
            >
              {categoryForm.imageBase64 ? (
                <div className="relative">
                  <img
                    src={categoryForm.imageBase64}
                    alt="Category preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(e, 'category')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <span className="text-4xl mb-2 block">📷</span>
                  <p className="text-gray-600 mb-2">Drag & drop an image here</p>
                  <p className="text-gray-400 text-sm">or click to select a file</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'category')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Description
            </label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              onBlur={() => validateField('description', categoryForm.description, { maxLength: 500 })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${validationErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
              rows={3}
              placeholder="Category description"
            />
            {validationErrors.description && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Display Order Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
              Display Order
            </label>
            <div className="relative">
              <input
                type="number"
                value={categoryForm.displayOrder}
                onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                placeholder="0"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔢</span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 pt-2">
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={categoryForm.isFeatured}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Featured</span>
                <p className="text-xs text-gray-500">Show on homepage</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-700">Active</span>
                <p className="text-xs text-gray-500">Visible to users</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {editingCategory ? <Edit size={18} /> : <Plus size={18} />}
            {editingCategory ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
