import { X, Plus, Edit, Users } from 'lucide-react';

const VendorModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingVendor, 
  vendorForm, 
  setVendorForm, 
  validationErrors,
  validateField,
  defaultValidationRules,
  showToast
}) => {
  if (!show) return null;

  const handleBlur = (field, value, rules) => {
    validateField(field, value, rules);
    // Show validation error as toast if there's an error
    if (validationErrors[field]) {
      showToast(validationErrors[field], 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md max-h-[95vh] sm:max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 mx-0 sm:mx-0 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100">
        {/* Header with enhanced gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-5 md:p-6 rounded-t-2xl shadow-lg relative overflow-hidden sticky top-0 z-20">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 sm:p-2.5 md:p-3 rounded-xl backdrop-blur-sm ring-2 ring-white/30 shadow-lg">
                <Users size={18} sm:size={20} md:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white tracking-tight">
                  {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
                </h3>
                <p className="text-purple-100 text-[10px] sm:text-xs md:text-sm font-medium">
                  {editingVendor ? 'Update vendor details' : 'Create a new vendor'}
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
          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Company Name
            </label>
            <input
              type="text"
              value={vendorForm.companyName}
              onChange={(e) => setVendorForm({ ...vendorForm, companyName: e.target.value })}
              onBlur={() => handleBlur('companyName', vendorForm.companyName, { required: true, minLength: 2, maxLength: 200 })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${validationErrors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white hover:border-purple-300'}`}
              placeholder="Company name"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Display Name
            </label>
            <input
              type="text"
              value={vendorForm.displayName}
              onChange={(e) => setVendorForm({ ...vendorForm, displayName: e.target.value })}
              onBlur={() => handleBlur('displayName', vendorForm.displayName, { required: true, minLength: 2, maxLength: 100 })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${validationErrors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white hover:border-purple-300'}`}
              placeholder="Display name"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Email
            </label>
            <input
              type="email"
              value={vendorForm.email}
              onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
              onBlur={() => handleBlur('email', vendorForm.email, { required: true, pattern: defaultValidationRules.email })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white hover:border-purple-300'}`}
              placeholder="Email address"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Password {editingVendor && <span className="text-[10px] sm:text-xs font-normal text-gray-500">(leave blank to keep existing)</span>}
            </label>
            <input
              type="password"
              value={vendorForm.password}
              onChange={(e) => setVendorForm({ ...vendorForm, password: e.target.value })}
              onBlur={() => handleBlur('password', vendorForm.password, { required: !editingVendor, minLength: 6 })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white hover:border-purple-300'}`}
              placeholder={editingVendor ? "Leave blank to keep current password" : "Password"}
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Phone Number
            </label>
            <input
              type="tel"
              value={vendorForm.phoneNumber}
              onChange={(e) => setVendorForm({ ...vendorForm, phoneNumber: e.target.value })}
              onBlur={() => handleBlur('phoneNumber', vendorForm.phoneNumber, { required: true, pattern: defaultValidationRules.phone })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${validationErrors.phoneNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white hover:border-purple-300'}`}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Business Type
            </label>
            <input
              type="text"
              value={vendorForm.businessType}
              onChange={(e) => setVendorForm({ ...vendorForm, businessType: e.target.value })}
              onBlur={() => handleBlur('businessType', vendorForm.businessType, { required: true })}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all shadow-sm text-sm sm:text-base ${validationErrors.businessType ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20 bg-red-50/30' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 bg-white hover:border-purple-300'}`}
              placeholder="Business type (e.g., Clothing, Electronics)"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              GST Number
            </label>
            <input
              type="text"
              value={vendorForm.gstNumber}
              onChange={(e) => setVendorForm({ ...vendorForm, gstNumber: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm text-sm sm:text-base bg-white hover:border-purple-300"
              placeholder="GST number"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              PAN Number
            </label>
            <input
              type="text"
              value={vendorForm.panNumber}
              onChange={(e) => setVendorForm({ ...vendorForm, panNumber: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm text-sm sm:text-base bg-white hover:border-purple-300"
              placeholder="PAN number"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-700">
              <span className="w-1.5 h-4 sm:h-5 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full shadow-md"></span>
              Description
            </label>
            <textarea
              value={vendorForm.description}
              onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 pl-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none shadow-sm text-sm sm:text-base bg-white hover:border-purple-300"
              rows={3}
              placeholder="Business description"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-2">
            <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300 active:scale-95">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={vendorForm.isActive}
                  onChange={(e) => setVendorForm({ ...vendorForm, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Active</span>
                <p className="text-[10px] sm:text-xs text-gray-500">Visible to users</p>
              </div>
            </label>
            <label className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-all border-2 border-transparent hover:border-blue-300 active:scale-95">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={vendorForm.isVerified}
                  onChange={(e) => setVendorForm({ ...vendorForm, isVerified: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 sm:w-11 h-5 sm:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 sm:after:h-5 after:w-4 sm:after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">Verified</span>
                <p className="text-[10px] sm:text-xs text-gray-500">Trusted vendor</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-purple-50/30 rounded-b-2xl sticky bottom-0 z-10">
          <button
            onClick={onClose}
            className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
          >
            <X size={14} sm:size={16} md:size={18} />
            <span className="hidden sm:inline">Cancel</span>
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-2.5 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:shadow-purple-500/30 flex items-center justify-center gap-1.5 sm:gap-2 transform hover:scale-[1.02] active:scale-95 ring-2 ring-purple-500/20 hover:ring-purple-500/50 text-sm sm:text-base"
          >
            {editingVendor ? <Edit size={14} sm:size={16} md:size={18} /> : <Plus size={14} sm:size={16} md:size={18} />}
            <span className="hidden sm:inline">{editingVendor ? 'Update' : 'Create'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorModal;
