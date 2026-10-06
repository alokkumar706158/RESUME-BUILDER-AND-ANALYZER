import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
  const { register: registerAuth, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await registerAuth(data.name, data.email, data.password);
      toast.success(`Verification email sent to ${data.email}. Please verify your email before logging in.`, {
        duration: 7000
      });
      navigate('/login');
    } catch (err) {
      console.error('Registration Error:', err);
      const message = typeof err === 'string' ? err : (err?.response?.data?.message || err?.message || 'Failed to register account.');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      const message = typeof err === 'string' ? err : (err?.message || 'Google sign in failed');
      toast.error(message);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-brandPurple/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-brandBlue/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative">
        <div className="flex flex-col items-center justify-center space-y-2">
          <Link to="/" className="flex items-center space-x-2">
            <Flame className="w-8 h-8 text-brandPurple" />
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-brandPurple to-brandBlue tracking-tight">
              ResumeRoast
            </span>
          </Link>
          <p className="text-slate-400 text-sm">Create an account to scan your resumes</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || submitting}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 shadow-sm"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#131B2E] px-3 text-slate-500 font-semibold tracking-wider">
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors"
                />
              </div>
              {errors.name && <span className="text-xs text-rose-500 font-medium">{errors.name.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  placeholder="name@college.edu"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full pl-12 pr-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors"
                />
              </div>
              {errors.email && <span className="text-xs text-rose-500 font-medium">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3 w-5 h-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full pl-12 pr-12 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <span className="text-xs text-rose-500 font-medium">{errors.password.message}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting || googleLoading}
              className="w-full py-3 bg-gradient-to-r from-brandPurple to-brandBlue hover:opacity-95 text-white font-semibold rounded-xl shadow-lg shadow-brandPurple/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brandPurple hover:underline font-semibold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
