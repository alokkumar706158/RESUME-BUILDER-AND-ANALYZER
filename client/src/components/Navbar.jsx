import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-darkBorder px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-2 md:hidden">
        <Flame className="w-6 h-6 text-brandPurple" />
        <span className="font-bold text-lg tracking-tight text-white">ResumeRoast AI</span>
      </div>

      <div className="hidden md:block">
        <h1 className="text-sm font-medium text-slate-400">
          Welcome back, <span className="text-slate-100 font-semibold">{user?.name}</span>
        </h1>
      </div>

      <div className="flex items-center space-x-4 ml-auto">

        <Link 
          to="/profile" 
          title="Profile & Settings"
          className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-brandPurple/30 border border-brandPurple/30 flex items-center justify-center font-semibold text-brandPurple uppercase text-sm" title={`Logged in as ${user?.name || 'User'}`}>
            {user?.name?.slice(0, 2) || 'RR'}
          </div>
        </Link>
        
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          title="Sign Out / Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
