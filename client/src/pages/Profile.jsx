import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Lock, ExternalLink, Globe, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const { register: regProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      name: user?.name || '',
      college: user?.college || '',
      branch: user?.branch || '',
      graduationYear: user?.graduationYear || '',
      linkedin: user?.linkedin || '',
      github: user?.github || ''
    }
  });

  const { register: regPassword, handleSubmit: handlePasswordSubmit, reset: resetPasswordForm } = useForm();

  const onProfileSubmit = async (data) => {
    setUpdatingProfile(true);
    try {
      await updateProfile({
        name: data.name,
        college: data.college,
        branch: data.branch,
        graduationYear: data.graduationYear ? parseInt(data.graduationYear) : null,
        linkedin: data.linkedin,
        github: data.github
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error(error || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateProfile({ password: data.password });
      toast.success('Password updated successfully!');
      resetPasswordForm();
    } catch (error) {
      console.error(error);
      toast.error(error || 'Failed to change password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 text-left max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Profile & Settings</h2>
        <p className="text-slate-400 text-sm mt-1">
          Manage your personal details, academic metadata, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card: Account Card Summary */}
        <div className="md:col-span-1 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 h-fit">
          <div className="w-24 h-24 rounded-full bg-brandPurple/20 border-2 border-brandPurple flex items-center justify-center text-3xl font-extrabold text-brandPurple uppercase shadow-lg shadow-brandPurple/10">
            {user?.name?.slice(0, 2) || 'RR'}
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          {user?.college && (
            <div className="pt-2 border-t border-slate-850 w-full text-slate-400 text-xs flex items-center justify-center space-x-1">
              <GraduationCap className="w-4 h-4 text-brandPurple" />
              <span className="truncate max-w-[180px]">{user.college}</span>
            </div>
          )}
        </div>

        {/* Right Section: Form Tabs */}
        <div className="md:col-span-2 space-y-8">
          {/* Form 1: General Profile */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-850 pb-3">
              <User className="w-5 h-5 text-brandPurple" />
              <span>Personal & Academic Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    {...regProfile('name', { required: true })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">College Name</label>
                  <input
                    type="text"
                    {...regProfile('college')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Branch / Specialization</label>
                  <input
                    type="text"
                    {...regProfile('branch')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Graduation Year</label>
                  <input
                    type="number"
                    placeholder="e.g. 2024"
                    {...regProfile('graduationYear')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    {...regProfile('linkedin')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">GitHub URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    {...regProfile('github')}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-brandPurple font-semibold rounded-xl text-sm transition-all hover:border-slate-700 disabled:opacity-50"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Form 2: Change Password */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 border-b border-slate-850 pb-3">
              <Shield className="w-5 h-5 text-brandPurple" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...regPassword('password', { required: true, minLength: 6 })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...regPassword('confirmPassword', { required: true })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 focus:border-brandPurple focus:outline-none rounded-xl text-white transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="px-6 py-2.5 bg-slate-900 border border-slate-800 text-brandPurple font-semibold rounded-xl text-sm transition-all hover:border-slate-700 disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
