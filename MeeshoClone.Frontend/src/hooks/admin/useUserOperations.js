import { useState } from 'react';
import { userAPI } from '../../services/api';

export const useUserOperations = (loadDashboardData) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'Normal',
    isActive: true
  });

  const handleOpenUserModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: '',
        role: user.role,
        isActive: user.isActive
      });
    } else {
      setEditingUser(null);
      setUserForm({
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        role: 'Normal',
        isActive: true
      });
    }
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'Normal',
      isActive: true
    });
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, userForm);
        alert('User updated successfully!');
      } else {
        await userAPI.create(userForm);
        alert('User created successfully!');
      }
      handleCloseUserModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
    }
  };

  const handleDeleteUser = (user) => {
    return {
      type: 'user',
      id: user.id,
      name: user.fullName || user.email
    };
  };

  return {
    showUserModal,
    editingUser,
    userForm,
    setUserForm,
    handleOpenUserModal,
    handleCloseUserModal,
    handleSaveUser,
    handleDeleteUser
  };
};
