import React from 'react';
import { Menu, Bell, Search, UserCircle } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 md:hidden hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
        >
          <Menu size={24} />
        </button>

        {/* Global Search Bar (Hidden on very small screens) */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-lg px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700"
          />
        </div>
      </div>

      {/* Right Side Icons & Profile */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="hidden md:block text-right">
            <p className="text-sm font-bold text-slate-800">System Admin</p>
            <p className="text-xs text-slate-500">Super User</p>
          </div>
          <UserCircle size={36} className="text-slate-400" />
        </div>
      </div>
    </header>
  );
};

export default Header;