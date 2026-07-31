import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();

    // Listen for global auth errors (e.g. from interceptor)
    const handleAuthError = () => {
      setUser(null);
    };
    window.addEventListener('auth-error', handleAuthError);

    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  // Existing admin login — UNCHANGED
  const loginAdmin = async (username, password) => {
    const res = await api.post('/auth/admin/login', { username, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // Existing voter login — UNCHANGED (legacy)
  const loginVoter = async (voterId, password) => {
    const res = await api.post('/auth/voter/login', { voterId, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // New: unified student login (email OR register number)
  const loginStudent = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // New: student self-registration (multipart/form-data)
  const registerStudent = async (formData) => {
    const res = await api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginAdmin, loginVoter, loginStudent, registerStudent, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

