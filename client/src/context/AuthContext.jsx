import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getApiBaseUrl } from '../services/api';

const AuthContext = createContext();

const TOKEN_KEY = 'resumeroast_auth_token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (rawUser) => {
    if (!rawUser) return null;
    const id = rawUser._id || rawUser.id;
    return {
      _id: id,
      id,
      name: rawUser.name || rawUser.email?.split('@')[0] || 'User',
      email: rawUser.email || '',
      avatar: rawUser.avatar || '',
      college: rawUser.college || '',
      branch: rawUser.branch || '',
      graduationYear: rawUser.graduationYear || null,
      linkedin: rawUser.linkedin || '',
      github: rawUser.github || '',
      provider: rawUser.provider || 'local',
      token: rawUser.token || localStorage.getItem(TOKEN_KEY) || ''
    };
  };

  const checkAuth = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(formatUser(data));
    } catch (error) {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const cleanEmail = email ? email.toLowerCase().trim() : '';
      if (!cleanEmail || !password) {
        throw 'Please provide email and password';
      }

      const { data } = await api.post('/auth/login', {
        email: cleanEmail,
        password,
        rememberMe: Boolean(rememberMe)
      });

      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      const formatted = formatUser(data);
      setUser(formatted);
      return formatted;
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message || error?.message || 'Invalid email or password';
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const cleanEmail = email ? email.toLowerCase().trim() : '';
      const cleanName = name ? name.trim() : '';

      if (!cleanName || !cleanEmail || !password) {
        throw 'Please provide name, email, and password';
      }

      const { data } = await api.post('/auth/register', {
        name: cleanName,
        email: cleanEmail,
        password
      });

      if (data?.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
      }
      const formatted = formatUser(data);
      setUser(formatted);
      return formatted;
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message || error?.message || 'Registration failed.';
      throw message;
    } finally {
      setLoading(false);
    }
  };

  // Redirects the browser to the backend Google OAuth endpoint.
  const signInWithGoogle = async () => {
    const base = getApiBaseUrl();
    window.location.href = `${base}/auth/google`;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/auth/profile', profileData);
      const updated = formatUser(data);
      setUser(updated);
      return updated;
    } catch (error) {
      const message =
        typeof error === 'string'
          ? error
          : error?.response?.data?.message || error?.message || 'Profile update failed';
      throw message;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, checkAuth, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
