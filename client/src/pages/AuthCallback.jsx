import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const processUserSession = async (session) => {
      if (!session?.user) return false;
      const user = session.user;
      const rawName = user.user_metadata?.full_name || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0] || 
                      'User';
      const cleanName = rawName.trim();

      if (!user.user_metadata?.full_name && cleanName) {
        try {
          await supabase.auth.updateUser({
            data: { full_name: cleanName }
          });
        } catch (updateErr) {
          console.warn('Could not update metadata name:', updateErr);
        }
      }

      if (session.access_token) {
        localStorage.setItem('resumeroast_auth_token', session.access_token);
      }

      if (checkAuth) {
        await checkAuth();
      }

      toast.success(`Welcome back, ${cleanName}!`);
      navigate('/dashboard', { replace: true });
      return true;
    };

    const handleOAuthCallback = async () => {
      try {
        // Inspect Hash and Search query params for OAuth errors
        const hashStr = window.location.hash ? window.location.hash.substring(1) : '';
        const hashParams = new URLSearchParams(hashStr);
        const searchParams = new URLSearchParams(window.location.search);

        const oauthError = hashParams.get('error_description') || 
                           hashParams.get('error') || 
                           searchParams.get('error_description') || 
                           searchParams.get('error');

        if (oauthError) {
          const cleanMsg = decodeURIComponent(oauthError).replace(/\+/g, ' ');
          toast.error(cleanMsg);
          navigate('/login', { replace: true });
          return;
        }

        // Try getting session from Supabase client
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          toast.error(error.message || 'Google authentication failed.');
          navigate('/login', { replace: true });
          return;
        }

        if (session?.user) {
          await processUserSession(session);
          return;
        }

        // If session not hydrated yet, listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
          if (authSession?.user) {
            subscription.unsubscribe();
            await processUserSession(authSession);
          }
        });

        // Safety timeout if OAuth flow fails or is canceled
        const timer = setTimeout(() => {
          subscription?.unsubscribe();
          toast.error('Authentication timed out. Please try signing in again.');
          navigate('/login', { replace: true });
        }, 6000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        toast.error('An error occurred during authentication.');
        navigate('/login', { replace: true });
      }
    };

    handleOAuthCallback();
  }, [navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center p-6 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-brandPurple" />
      <p className="text-slate-300 font-medium text-sm">Completing Google authentication...</p>
    </div>
  );
};

export default AuthCallback;
