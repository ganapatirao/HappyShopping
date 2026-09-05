import { Plus, Edit, Trash2, Search, Package, X, Building, Mail, Phone, MapPin, Star, Shield } from 'lucide-react';
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
    const searchTerm = vendorFilter.search.toLowerCase();
    const matchesSearch = !searchTerm || 
      vendor.companyName?.toLowerCase().includes(searchTerm) ||
      vendor.displayName?.toLowerCase().includes(searchTerm) ||
      vendor.email?.toLowerCase().includes(searchTerm);
    
    const selectedStatuses = vendorFilter.status ? vendorFilter.status.split(',') : [];
    const matchesStatus = selectedStatuses.length === 0 ||
      (selectedStatuses.includes('active') && vendor.isActive) ||
      (selectedStatuses.includes('inactive') && !vendor.isActive) ||
      (selectedStatuses.includes('verified') && vendor.isVerified);
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (vendor) => {
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

  const clearFilters = () => {
    setVendorFilter({ search: '', status: '' });
  };

  const hasActiveFilters = vendorFilter.search || vendorFilter.status;

  const toggleStatus = (statusValue) => {
    const selectedStatuses = vendorFilter.status ? vendorFilter.status.split(',') : [];
    const newStatuses = selectedStatuses.includes(statusValue)
      ? selectedStatuses.filter(s => s !== statusValue)
      : [...selectedStatuses, statusValue];
    setVendorFilter({ ...vendorFilter, status: newStatuses.join(',') });
  };

  const statusOptions = [
    { label: 'Active', value: 'active', color: 'green' },
    { label: 'Inactive', value: 'inactive', color: 'gray' },
    { label: 'Verified', value: 'verified', color: 'blue' }
  ];

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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100/80 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-white via-blue-50/30 to-indigo-50/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl shadow-xl shadow-blue-500/30 ring-2 ring-blue-500/10">
              <Building size={18} sm:size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Vendors</h2>
              <p className="text-xs sm:text-sm text-gray-500 font-medium">{filteredVendors.length} of {vendors.length} vendors</p>
            </div>
          </div>
          <button 
            onClick={() => handleOpenVendorModal()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Add Vendor
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
            placeholder="Search vendors..."
            value={vendorFilter.search}
            onChange={(e) => setVendorFilter({ ...vendorFilter, search: e.target.value })}
            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-sm shadow-sm hover:shadow-md"
          />
          {vendorFilter.search && (
            <button 
              onClick={() => setVendorFilter({ ...vendorFilter, search: '' })}
              className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} sm:size={18} />
            </button>
          )}
        </div>

        {/* Selected Status Chips */}
        {vendorFilter.status && (
          <div className="flex flex-wrap gap-2 mb-3">
            {vendorFilter.status.split(',').map(status => {
              const option = statusOptions.find(opt => opt.value === status);
              return option ? (
                <span
                  key={status}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm ${
                    option.color === 'green' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700 ring-2 ring-green-500/30' :
                    option.color === 'gray' ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 ring-2 ring-gray-500/30' :
                    'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 ring-2 ring-blue-500/30'
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

        {/* Status Multi-select Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
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
              {statusOptions.filter(opt => !vendorFilter.status || !vendorFilter.status.split(',').includes(opt.value)).map(option => (
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
      
      {/* Vendors Table */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <table className="w-full min-w-[500px] sm:min-w-full">
          <thead className="bg-gradient-to-b from-slate-50 via-blue-50/40 to-indigo-50/30 border-b-2 border-gray-100">
            <tr>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[80px] sm:min-w-[120px] border-r border-gray-100/50">Vendor</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[100px] sm:min-w-[150px] border-r border-gray-100/50">Email</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[100px] sm:min-w-[120px] border-r border-gray-100/50">Phone</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[100px] sm:min-w-[150px] border-r border-gray-100/50">Location</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[70px] sm:min-w-[100px] border-r border-gray-100/50">Status</th>
              <th className="text-right py-1 sm:py-2.5 px-1 sm:px-2.5 font-bold text-gray-700 text-[10px] sm:text-xs uppercase tracking-wider min-w-[100px] sm:min-w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/60">
            {filteredVendors.map((vendor, index) => (
              <tr key={vendor.id || vendor._id || vendor.Id || index} className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-300 group border-b border-gray-50 last:border-b-0">
                <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[80px] sm:min-w-[120px] border-r border-gray-100/50 text-right">
                  <div className="flex items-center justify-end">
                    <div className="min-w-0 flex-1 text-right">
                      <p className="font-semibold text-gray-900 text-[11px] sm:text-sm truncate leading-tight">{vendor.companyName}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block truncate leading-tight">{vendor.displayName || 'N/A'}</p>
                    </div>
                    <div className="relative flex-shrink-0 ml-1 sm:ml-2">
                      <div className="w-3.5 h-3.5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg shadow-md ring-2 ring-gray-100 group-hover:ring-blue-400 group-hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                        <Building size={8} sm:size={12} className="text-white" />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[100px] sm:min-w-[150px] border-r border-gray-100/50 text-right">
                  <div className="flex items-center gap-1 sm:gap-2 justify-end">
                    <span className="text-[11px] sm:text-sm text-gray-600 truncate">{vendor.email || 'N/A'}</span>
                    <Mail size={10} sm:size={12} className="text-gray-400" />
                  </div>
                </td>
                <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[100px] sm:min-w-[120px] border-r border-gray-100/50 text-right">
                  <div className="flex items-center gap-1 sm:gap-2 justify-end">
                    <span className="text-[11px] sm:text-sm text-gray-600 truncate">{vendor.phoneNumber || 'N/A'}</span>
                    <Phone size={10} sm:size={12} className="text-gray-400" />
                  </div>
                </td>
                <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[100px] sm:min-w-[150px] border-r border-gray-100/50 text-right">
                  <div className="flex items-center gap-1 sm:gap-2 justify-end">
                    <span className="text-[11px] sm:text-sm text-gray-600 truncate">
                      {typeof vendor.businessAddress === 'object' && vendor.businessAddress !== null 
                        ? `${vendor.businessAddress.city || vendor.businessAddress.City || 'N/A'}`
                        : (vendor.businessAddress || 'N/A')}
                    </span>
                    <MapPin size={10} sm:size={12} className="text-gray-400" />
                  </div>
                </td>
                <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[70px] sm:min-w-[100px] border-r border-gray-100/50 text-right">
                  <div className="flex items-center gap-0.5 sm:gap-1.5 justify-end">
                    {vendor.isVerified && (
                      <span className="text-blue-500 text-[10px] sm:text-base" title="Verified">
                        ★
                      </span>
                    )}
                    <span className={`inline-flex items-center px-1 sm:px-1.5 py-0.5 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold shadow-md ${
                      vendor.isActive 
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-700' 
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600'
                    }`}>
                      {vendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="py-1 sm:py-2.5 px-1 sm:px-2.5 min-w-[100px] sm:min-w-[120px] text-right">
                  <div className="flex gap-0.5 sm:gap-1 justify-end">
                    <button
                      onClick={() => handleViewDetails(vendor)}
                      className="p-1 sm:p-2 bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-600 hover:from-emerald-500 hover:to-green-600 hover:text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-emerald-500/30 ring-1 ring-emerald-200 hover:ring-emerald-500"
                      title="View"
                    >
                      <Star size={9} sm:size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenVendorModal(vendor)}
                      className="p-1 sm:p-2 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-500 hover:to-indigo-600 hover:text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-blue-500/30 ring-1 ring-blue-200 hover:ring-blue-500"
                      title="Edit"
                    >
                      <Edit size={9} sm:size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteVendor(vendor)}
                      className="p-1 sm:p-2 bg-gradient-to-br from-red-50 to-rose-50 text-red-600 hover:from-red-500 hover:to-rose-600 hover:text-white rounded-lg sm:rounded-xl transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-red-500/30 ring-1 ring-red-200 hover:ring-red-500"
                      title="Delete"
                    >
                      <Trash2 size={9} sm:size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredVendors.length === 0 && (
          <div className="text-center py-12 sm:py-20">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl shadow-blue-500/10">
              <Building size={32} sm:size={48} className="text-blue-500" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              {hasActiveFilters ? 'No vendors match your filters' : 'No vendors found'}
            </h3>
            <p className="text-sm text-gray-500 mb-4 sm:mb-6">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Add your first vendor to get started'}
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

export default VendorsSection;
