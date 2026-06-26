import { Plus, Edit, Trash2, UserCheck, Shield, Power, Users } from 'lucide-react';

const UsersSection = ({ users, userFilter, setUserFilter, handleDeleteUser }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
              <UserCheck size={20} sm:size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">Users Management</h2>
              <p className="text-indigo-100 text-xs sm:text-sm">Manage platform users</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <input
            type="text"
            placeholder="Search users..."
            value={userFilter.search}
            onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <select 
            value={userFilter.role}
            onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Vendor">Vendor</option>
            <option value="Normal">Normal</option>
          </select>
          <select 
            value={userFilter.status}
            onChange={(e) => setUserFilter({ ...userFilter, status: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">User</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Email</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Role</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(user => {
                const matchesSearch = user.fullName?.toLowerCase().includes(userFilter.search.toLowerCase()) || 
                                    user.email?.toLowerCase().includes(userFilter.search.toLowerCase());
                const matchesRole = userFilter.role === '' || user.role === userFilter.role;
                const matchesStatus = userFilter.status === '' || 
                                    (userFilter.status === 'active' && user.isActive) ||
                                    (userFilter.status === 'inactive' && !user.isActive);
                return matchesSearch && matchesRole && matchesStatus;
              })
              .map(user => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{user.fullName}</p>
                      {user.isPremier && (
                        <span className="text-xs text-yellow-600">⭐ Premier</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <p className="text-gray-700 text-xs sm:text-sm md:text-base">{user.email}</p>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                    user.role === 'Vendor' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                    user.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-2 sm:py-3 px-2 sm:px-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} sm:size={18} className="text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No users found.
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">Showing {users.length} users</p>
    </div>
  );
};

export default UsersSection;
