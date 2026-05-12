import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCircle, Users, LogOut, Calendar, BookOpenCheck, BookOpen, ClipboardCheck, GraduationCap, X } from 'lucide-react';
interface TeacherSidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (isOpen: boolean) => void;
}


const NAV_LINKS = [
  { path: '/teacher', label: 'Daily Execution', icon: LayoutDashboard, exact: true },
  { path: '/teacher/attendance', label: 'My Attendance', icon: UserCircle },
  { path: '/teacher/attendance/homeroom', label: 'Homeroom Register', icon: Users },
  { path: '/teacher/attendance/gate-pass', label: 'Issue Gate Pass', icon: LogOut }, // 🟢 NEW
  { path: '/teacher/schedule', label: 'My Timetable', icon: Calendar },
  { path: '/teacher/evaluation', label: 'Marks & Evaluation', icon: BookOpenCheck }, // 🟢 UPDATED
  { path: '/teacher/syllabus', label: 'Syllabus Tracker', icon: BookOpen },
];

const TeacherSidebar: React.FC<TeacherSidebarProps> = ({ isMobileOpen, setMobileOpen }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Backdrop - Forces everything else behind */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-[998] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer - z-[999] guarantees it floats over the Header */}
      <aside className={`fixed top-0 left-0 h-full z-[999] w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:static lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase">ACADEMY</h1>
              <p className="text-[9px] font-bold text-blue-400 tracking-widest uppercase">Teacher Portal</p>
            </div>
          </div>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          <p className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Operations</p>
          
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = link.exact ? location.pathname === link.path : location.pathname.startsWith(link.path);

            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Profile Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/30">
          <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group">
            <LogOut size={18} className="text-slate-500 group-hover:text-rose-500" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default TeacherSidebar;