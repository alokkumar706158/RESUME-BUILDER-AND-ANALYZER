import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  User, 
  Flame, 
  Home, 
  FileEdit, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('resumeroast_sidebar_collapsed') === 'true';
  });

  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('resumeroast_sidebar_width');
    return saved ? parseInt(saved, 10) : 256;
  });

  const [isResizing, setIsResizing] = useState(false);

  // Sync states with localStorage
  useEffect(() => {
    localStorage.setItem('resumeroast_sidebar_collapsed', isCollapsed);
  }, [isCollapsed]);

  useEffect(() => {
    localStorage.setItem('resumeroast_sidebar_width', width);
  }, [width]);

  // Handle Drag-to-Resize width
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(360, Math.max(180, e.clientX));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const links = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Builder', path: '/builder', icon: FileEdit },
    { name: 'My Resumes', path: '/history', icon: History },
    { name: 'Profile & Settings', path: '/profile', icon: User },
    { name: 'Landing Page', path: '/', icon: Home },
  ];

  return (
    <aside 
      style={{ width: isCollapsed ? '72px' : `${width}px` }}
      className="hidden md:flex flex-col glass-panel border-r border-slate-800 min-h-screen relative transition-all duration-200 ease-in-out select-none flex-shrink-0 z-20 group"
    >
      {/* HEADER & TOGGLE ARROW */}
      <div className={`p-4 flex items-center justify-between border-b border-slate-800/80 ${isCollapsed ? 'flex-col gap-3 justify-center' : ''}`}>
        <div className="flex items-center space-x-2.5 min-w-0 overflow-hidden">
          <div className="bg-gradient-to-r from-brandPurple to-brandBlue p-2 rounded-xl text-white shadow-md flex-shrink-0">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          {!isCollapsed && (
            <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brandPurple to-brandBlue truncate">
              ResumeRoast
            </span>
          )}
        </div>

        {/* Collapse / Expand Arrow Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(prev => !prev)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition flex-shrink-0"
          title={isCollapsed ? "Expand Menu" : "Hide Menu (Icon view)"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4 text-brandPurple" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <nav className="flex-1 p-3 space-y-1.5 mt-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              title={link.name}
              className={({ isActive }) =>
                `flex items-center ${isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-3.5 py-3'} rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-brandPurple/25 to-brandBlue/15 border-l-4 border-brandPurple text-white font-semibold shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border-l-4 border-transparent'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="text-sm truncate font-medium">{link.name}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-3 border-t border-slate-800/80 text-center">
        {!isCollapsed ? (
          <span className="text-[11px] text-slate-500 font-medium block truncate">ResumeRoast AI v1.0</span>
        ) : (
          <span className="text-[10px] text-slate-500 font-mono block">v1.0</span>
        )}
      </div>

      {/* DRAG-TO-RESIZE EDGE HANDLE */}
      {!isCollapsed && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-brandPurple/50 active:bg-brandPurple transition-colors z-30"
          title="Drag to resize sidebar width"
        />
      )}
    </aside>
  );
};

export default Sidebar;
