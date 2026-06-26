import { X, Users } from 'lucide-react';

const UserModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingUser, 
  userForm, 
  setUserForm 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
        <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Users size={20} sm:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingUser ? 'Edit User' : 'Add User'}
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  {editingUser ? 'Update user information' : 'Create new user account'}
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
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={userForm.fullName}
              onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={userForm.phoneNumber}
              onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Enter phone number"
            />
          </div>
          {!editingUser && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter password"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
            <select
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="Normal">Normal User</option>
              <option value="Admin">Admin</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="userActive"
              checked={userForm.isActive}
              onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="userActive" className="text-sm font-medium text-gray-700">Active</label>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
          >
            {editingUser ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
