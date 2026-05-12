import React from 'react';
import { NavLink } from 'react-router-dom';
import shcoolLogo from "../../../../../public/images.jpg"
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  ClipboardList, 
  Calendar, 
  Bell, 
  LogOut,  
} from 'lucide-react';

// 🟢 FIXED: Removed 'exact: true' to stop the React DOM error bleeding
const STUDENT_NAV = [
  { path: '/student', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/student/exams', label: 'Examinations', icon: ClipboardList },
  { path: '/student/academics', label: 'My Courses', icon: BookOpen },
  { path: '/student/performance', label: 'Leaderboard', icon: Trophy },
  { path: '/student/timetable', label: 'Class Schedule', icon: Calendar },
  { path: '/student/notices', label: 'Notice Board', icon: Bell },
];

const StudentSidebar: React.FC = () => {
  return (
    // 🟢 FIXED: Removed 'hidden lg:flex' from here so the Layout component can control it via Drawer
    <aside className="w-72 bg-slate-900 h-full flex flex-col border-r border-slate-800 shrink-0">
      
      {/* BRANDING */}
      <div className="p-8">
        <div className="flex items-center gap-3 bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
          <img src={shcoolLogo} alt="school logo" className="rounded-full h-10"/>
          <span className="text-white font-black text-xl tracking-tighter uppercase">
            DPS <span className="text-blue-200">Ranchi</span>
          </span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {STUDENT_NAV.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            // 🟢 FIXED: Completely removed the 'end' prop hack that was causing the red console error
            className={(navData: any) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group
              ${(navData.isActive || navData === true) 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}
            `}
          >
            <link.icon size={20} className="shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest">{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      <div className="p-6 border-t border-slate-800">
        <button className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all">
          <LogOut size={20} />
          <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;