import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Menu, X, ArrowRight, User } from 'lucide-react';

export const LandingNavbar = () => {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '#hero' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Templates', href: '#templates' },
    { label: 'Before & After', href: '#comparison' },
  ];

  const handleScrollTo = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080d1a]/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/40 py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brandPurple to-brandBlue flex items-center justify-center p-0.5 shadow-lg shadow-brandPurple/30 group-hover:shadow-brandPurple/50 transition-all duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-[#0b1120] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-brandPurple group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
              Resume Builder <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-brandPurple/20 text-brandPurple border border-brandPurple/30">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-slate-900/60 border border-slate-800/80 rounded-full px-4 py-1.5 backdrop-blur-md">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleScrollTo(e, link.href)}
              className="text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right CTA Actions */}
        <div className="hidden sm:flex items-center space-x-3">
          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-all"
            >
              <User className="w-4 h-4 text-brandPurple" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            to={user ? "/builder" : "/signup"}
            className="group relative inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brandPurple via-indigo-600 to-brandBlue hover:opacity-95 shadow-lg shadow-brandPurple/25 hover:shadow-brandPurple/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
          >
            <span>Build Resume</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#080d1a]/95 backdrop-blur-2xl border-b border-slate-800 px-6 py-6 space-y-4 animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleScrollTo(e, link.href)}
                className="text-base font-medium text-slate-300 hover:text-white py-2"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="pt-4 border-t border-slate-800 flex flex-col space-y-3">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 border border-slate-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 border border-slate-700"
              >
                Sign In
              </Link>
            )}
            <Link
              to={user ? "/builder" : "/signup"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brandPurple to-brandBlue"
            >
              Build Resume Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
