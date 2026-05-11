import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface TeacherHeaderProps {
  setMobileOpen: (isOpen: boolean) => void;
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({ setMobileOpen }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-black text-slate-800 hidden sm:block">Faculty Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200 mx-2"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-xs font-black text-slate-800">Ravi Verma</p>
            <p className="text-[10px] font-bold text-slate-500">Senior Science Faculty</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-sm shadow-sm">
            RV
          </div>
        </div>
      </div>
    </header>
  );
};

export default TeacherHeader;