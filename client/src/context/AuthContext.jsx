import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (supabaseUser, session = null) => {
    if (!supabaseUser) return null;
    return {
      _id: supabaseUser.id,
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email,
      avatar: supabaseUser.user_metadata?.avatar_url || '',
      college: supabaseUser.user_metadata?.college || '',
      branch: supabaseUser.user_metadata?.branch || '',
      graduationYear: supabaseUser.user_metadata?.graduationYear || null,
      linkedin: supabaseUser.user_metadata?.linkedin || '',
      github: supabaseUser.user_metadata?.github || '',
      token: session?.access_token || localStorage.getItem('resumeroast_auth_token') || ''
    };
  };

  const isUserVerifiedOrOAuth = (u) => {
    if (!u) return false;
    const isOAuth = u.app_metadata?.provider || (u.identities && u.identities.length > 0) || u.role === 'authenticated';
    return Boolean(u.email_confirmed_at || u.confirmed_at || isOAuth);
  };

  const checkAuth = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        setUser(null);
        localStorage.removeItem('resumeroast_auth_token');
        return;
      }

      // Ensure email is verified or user authenticated via OAuth before restoring user session
      if (isUserVerifiedOrOAuth(session.user)) {
        if (session.access_token) {
          localStorage.setItem('resumeroast_auth_token', session.access_token);
        }
        setUser(formatUser(session.user, session));
      } else {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('resumeroast_auth_token');
      }
    } catch (error) {
      console.error('CheckAuth error:', error);
      setUser(null);
      localStorage.removeItem('resumeroast_auth_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isUserVerifiedOrOAuth(session.user)) {
        if (session.access_token) {
          localStorage.setItem('resumeroast_auth_token', session.access_token);
        }
        setUser(formatUser(session.user, session));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('resumeroast_auth_token');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw 'Supabase is not configured yet. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env';
      }

      const cleanEmail = email ? email.toLowerCase().trim() : '';
      if (!cleanEmail || !password) {
        throw 'Please provide email and password';
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });

      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('email not confirmed') || errorMsg.includes('not confirmed')) {
          throw 'Please verify your email before logging in.';
        }
        if (errorMsg.includes('invalid login credentials') || errorMsg.includes('invalid credentials')) {
          throw 'Invalid email or password';
        }
        if (errorMsg.includes('invalid email')) {
          throw 'Invalid email address';
        }
        throw error.message || 'Invalid email or password';
      }

      // Verify email confirmation status
      if (!data.user?.email_confirmed_at && !data.user?.confirmed_at) {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('resumeroast_auth_token');
        throw 'Please verify your email before logging in.';
      }

      if (data.session?.access_token) {
        localStorage.setItem('resumeroast_auth_token', data.session.access_token);
      }

      const formatted = formatUser(data.user, data.session);
      setUser(formatted);
      return formatted;
    } catch (error) {
      const message = typeof error === 'string' ? error : (error?.message || 'Login failed. Please check your credentials.');
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        throw 'Supabase is not configured yet. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env';
      }

      const cleanEmail = email ? email.toLowerCase().trim() : '';
      const cleanName = name ? name.trim() : '';

      if (!cleanName || !cleanEmail || !password) {
        throw 'Please provide name, email, and password';
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName
          }
        }
      });

      if (error) {
        const errorMsg = error.message?.toLowerCase() || '';
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists') || errorMsg.includes('user already registered')) {
          throw 'User already exists with this email';
        }
        if (errorMsg.includes('invalid email')) {
          throw 'Invalid email address';
        }
        if (errorMsg.includes('password')) {
          throw error.message;
        }
        throw error.message || 'Registration failed.';
      }

      // Check if Supabase returned existing user with empty identities (email taken)
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        throw 'User already exists with this email';
      }

      // Do NOT log in until email is verified
      if (!data?.user?.email_confirmed_at && !data?.user?.confirmed_at) {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem('resumeroast_auth_token');
      }

      return {
        email: cleanEmail,
        user: data.user,
        verified: !!(data?.user?.email_confirmed_at || data?.user?.confirmed_at)
      };
    } catch (error) {
      const message = typeof error === 'string' ? error : (error?.message || 'Registration failed.');
      throw message;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (!isSupabaseConfigured) {
        throw 'Supabase is not configured yet. Please add your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to client/.env';
      }

      const callbackUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        throw error.message || 'Google authentication failed';
      }

      return data;
    } catch (error) {
      const message = typeof error === 'string' ? error : (error?.message || 'Google authentication failed');
      throw message;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('resumeroast_auth_token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const updates = {
        data: {
          full_name: profileData.name !== undefined ? profileData.name : user?.name,
          avatar_url: profileData.avatar !== undefined ? profileData.avatar : user?.avatar,
          college: profileData.college !== undefined ? profileData.college : user?.college,
          branch: profileData.branch !== undefined ? profileData.branch : user?.branch,
          graduationYear: profileData.graduationYear !== undefined ? profileData.graduationYear : user?.graduationYear,
          linkedin: profileData.linkedin !== undefined ? profileData.linkedin : user?.linkedin,
          github: profileData.github !== undefined ? profileData.github : user?.github,
        }
      };

      if (profileData.password) {
        updates.password = profileData.password;
      }

      const { data, error } = await supabase.auth.updateUser(updates);
      if (error) {
        throw error.message || 'Profile update failed';
      }

      const updated = formatUser(data.user);
      setUser(updated);
      return updated;
    } catch (error) {
      const message = typeof error === 'string' ? error : (error?.message || 'Profile update failed');
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
