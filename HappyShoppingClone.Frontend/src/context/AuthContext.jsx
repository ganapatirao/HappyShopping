import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedUser = localStorage.getItem('user');
      const storedTokenExpiry = localStorage.getItem('tokenExpiry');
      
      if (storedUser && storedTokenExpiry) {
        const tokenExpiry = new Date(storedTokenExpiry);
        const now = new Date();
        
        // Check if token is expired
        if (now > tokenExpiry) {
          // Token expired, clear localStorage
          localStorage.removeItem('user');
          localStorage.removeItem('tokenExpiry');
          localStorage.removeItem('sessionToken');
          setUser(null);
        } else {
          // Token valid, restore user session
          setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (user, sessionToken, tokenExpiry) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('sessionToken', sessionToken);
    localStorage.setItem('tokenExpiry', tokenExpiry);
  };

  const register = (user, sessionToken, tokenExpiry) => {
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('sessionToken', sessionToken);
    localStorage.setItem('tokenExpiry', tokenExpiry);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('tokenExpiry');
  };

  const upgradeToPremier = async () => {
    try {
      const response = await authAPI.upgradeToPremier({ userId: user.id });
      if (response.data.success) {
        const updatedUser = { ...user, isPremier: true, premierExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    upgradeToPremier,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isPremier: user?.isPremier || false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
