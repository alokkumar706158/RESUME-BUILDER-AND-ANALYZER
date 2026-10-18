import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(
          window.location.hash ? window.location.hash.substring(1) : ''
        );

        const errorMessage = searchParams.get('error') || hashParams.get('error');
        if (errorMessage) {
          toast.error(decodeURIComponent(errorMessage).replace(/\+/g, ' '));
          navigate('/login', { replace: true });
          return;
        }

        // The backend passes the access token in the URL hash for bearer fallback.
        const token = hashParams.get('token');
        if (token) {
          localStorage.setItem('resumeroast_auth_token', token);
        }

        // Cookies are also set by the backend, so /auth/me will hydrate the session.
        await checkAuth();
        toast.success('Signed in successfully!');
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('OAuth Callback Error:', err);
        toast.error('An error occurred during authentication.');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, [navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-darkBg flex flex-col items-center justify-center p-6 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-brandPurple" />
      <p className="text-slate-300 font-medium text-sm">Completing Google authentication...</p>
    </div>
  );
};

export default AuthCallback;
