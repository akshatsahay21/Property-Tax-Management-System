import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';


const Navbar = ({ title, icon: Icon, iconColor = 'text-primary-500', dark = false }) => {
  const { user, logout } = useAuth();

  return (
    <nav className={`sticky top-0 z-10 border-b ${dark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'} shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <h1 className={`text-xl font-semibold flex items-center gap-2 ${dark ? 'text-white' : 'text-slate-800'}`}>
          {Icon && <Icon size={22} className={iconColor} />}
          {title}
        </h1>
        <div className="flex items-center gap-4">
          {user && (
            <span className={`text-sm hidden sm:block ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
              Welcome, <span className="font-medium">{user.name}</span>
            </span>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${dark ? 'text-slate-300 hover:text-white' : 'text-slate-500 hover:text-red-600'}`}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
