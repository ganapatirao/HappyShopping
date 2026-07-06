import { Plus, Edit, Trash2, Building, Search, Filter, MapPin, Phone, Mail, Star, TrendingUp, DollarSign, Shield, Eye } from 'lucide-react';
import { useState } from 'react';
import VendorDetailSection from './VendorDetailSection';

const VendorsSection = ({ 
  vendors, 
  vendorFilter, 
  setVendorFilter, 
  handleOpenVendorModal, 
  handleDeleteVendor,
  onEditVendor,
  onRefresh,
  showToast
}) => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.companyName?.toLowerCase().includes(vendorFilter.search.toLowerCase()) || 
                        vendor.displayName?.toLowerCase().includes(vendorFilter.search.toLowerCase()) ||
                        vendor.email?.toLowerCase().includes(vendorFilter.search.toLowerCase());
    const matchesStatus = vendorFilter.status === '' || 
                        (vendorFilter.status === 'active' && vendor.isActive) ||
                        (vendorFilter.status === 'inactive' && !vendor.isActive) ||
                        (vendorFilter.status === 'verified' && vendor.isVerified);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vendors.length,
    active: vendors.filter(v => v.isActive).length,
    verified: vendors.filter(v => v.isVerified).length,
    totalProducts: vendors.reduce((sum, v) => sum + (v.productCount || 0), 0)
  };

  const handleViewDetails = (vendor) => {
    // Normalize vendor data to handle object properties
    const normalizedVendor = {
      ...vendor,
      address: typeof vendor.address === 'object' ? vendor.address : null,
      businessAddress: typeof vendor.businessAddress === 'object' ? vendor.businessAddress : null
    };
    setSelectedVendor(normalizedVendor);
    setShowDetailView(true);
  };

  const handleBack = () => {
    setShowDetailView(false);
    setSelectedVendor(null);
  };

  const handleEdit = (vendor) => {
    setShowDetailView(false);
    onEditVendor(vendor);
  };

  if (showDetailView && selectedVendor) {
    return (
      <VendorDetailSection 
        vendor={selectedVendor} 
        onBack={handleBack} 
        onEdit={handleEdit}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm font-medium">Total Vendors</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <Building size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm font-medium">Active</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.active}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <Shield size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm font-medium">Verified</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.verified}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <Star size={20} />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-xl p-4 lg:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm font-medium">Products</p>
              <p className="text-xl lg:text-2xl font-bold mt-1">{stats.totalProducts}</p>
            </div>
            <div className="bg-white/20 p-2 lg:p-3 rounded-xl">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-xl shadow-lg">
              <Building size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Vendors</h2>
              <p className="text-gray-500 text-sm">Manage vendors and suppliers</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenVendorModal()}
            className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 sm:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            <span>Add Vendor</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search vendors..."
                value={vendorFilter.search}
                onChange={(e) => setVendorFilter({ ...vendorFilter, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <select 
              value={vendorFilter.status}
              onChange={(e) => setVendorFilter({ ...vendorFilter, status: e.target.value })}
              className="px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
            </select>
          </div>
        </div>
        
        {/* Vendors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVendors.map((vendor, index) => (
            <div key={vendor.id || vendor._id || vendor.Id || index} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg truncate">{vendor.companyName}</h3>
                    <p className="text-orange-100 text-sm mt-1 truncate">{vendor.displayName || 'N/A'}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${
                      vendor.isActive 
                        ? 'bg-green-400 text-green-900' 
                        : 'bg-red-400 text-red-900'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {vendor.isVerified && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-blue-400 text-blue-900">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Body */}
              <div className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="truncate">{vendor.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="truncate">{vendor.phoneNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-orange-500 flex-shrink-0" />
                  <span className="truncate">
                    {typeof vendor.businessAddress === 'object' && vendor.businessAddress !== null 
                      ? `${vendor.businessAddress.city || vendor.businessAddress.City || 'N/A'}, ${vendor.businessAddress.state || vendor.businessAddress.State || 'N/A'}`
                      : (vendor.businessAddress || 'N/A')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp size={14} className="text-orange-500 flex-shrink-0" />
                  <span>{vendor.totalProducts || 0} Products</span>
                </div>
              </div>
              
              {/* Footer */}
              <div className="px-4 pb-4 pt-2 border-t border-gray-200">
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewDetails(vendor)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors font-medium text-xs"
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => handleOpenVendorModal(vendor)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium text-xs"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteVendor(vendor)}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors font-medium text-xs"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredVendors.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building size={40} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No vendors found</h3>
            <p className="text-gray-500">Click "Add Vendor" to create your first vendor</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsSection;
