import React, { useState } from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import {
  LayoutDashboard, Users, GraduationCap, DollarSign, Settings,
  LogOut, ChevronDown, ChevronRight, UserPlus, CalendarCheck,
  Banknote, Megaphone, MessageSquare, ClipboardCheck, ShieldCheck, IndianRupee, Monitor, Truck, Package,
  Search, ListChecks, Wallet
} from 'lucide-react';
import SchoolLogo from '../../../assets/school logo.jpg';
import SessionModal from './SessionModal';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const history = useHistory();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);

  // Deep Navigation structure for the whole ERP
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    {
      name: 'Students',
      path: '/admin/students',
      icon: <Users size={20} />,
      subItems: [
        { name: 'Directory', path: '/admin/students', icon: <Search size={16} /> },
        { name: 'Admissions', path: '/admin/students/admissions', icon: <UserPlus size={16} /> },
        { name: 'Exam Desk', path: '/admin/students/exams', icon: <ClipboardCheck size={16} /> },
      ]
    },
    {
      name: 'Teachers',
      path: '/admin/teachers',
      icon: <GraduationCap size={20} />,
      subItems: [
        { name: 'Overview', path: '/admin/teachers', icon: <LayoutDashboard size={16} /> },
        { name: 'Staff Directory', path: '/admin/teachers/manage', icon: <ListChecks size={16} /> },
        { name: 'Onboarding Desk', path: '/admin/teachers/verify', icon: <ShieldCheck size={16} /> },
        { name: 'Attendance', path: '/admin/teachers/attendance', icon: <CalendarCheck size={16} /> },
      ]
    },
    {
      name: 'Finance',
      path: '/admin/finance',
      icon: <DollarSign size={20} />,
      subItems: [
        { name: 'Master Ledger', path: '/admin/finance/ledger', icon: <Banknote size={16} /> },
        { name: 'Fee Collection', path: '/admin/finance/fees', icon: <Wallet size={16} /> },
        { name: 'Staff Payroll', path: '/admin/teachers/payroll', icon: <IndianRupee size={16} /> },
      ]
    },
    {
      name: 'Operations',
      path: '/admin/ops',
      icon: <Package size={20} />,
      subItems: [
        { name: 'Inventory', path: '/admin/inventory', icon: <Monitor size={16} /> },
        { name: 'Transport', path: '/admin/transport', icon: <Truck size={16} /> },
      ]
    },
    { name: 'Notice Board', path: '/admin/notices', icon: <Megaphone size={20} /> },
    { name: 'Complaints', path: '/admin/complaints', icon: <MessageSquare size={20} /> },
  ];

  const toggleMenu = (name: string) => {
    setExpandedMenu(expandedMenu === name ? null : name);
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <div className={`
      fixed md:sticky md:top-0 inset-y-0 left-0 z-50
      w-64 bg-slate-900 text-slate-300
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      flex flex-col h-screen border-r border-white/5
    `}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <img src={SchoolLogo} alt="Logo" className="w-10 h-10 rounded-xl" />
          <span className="text-white font-bold text-lg tracking-tight">DPS Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar font-medium">
          {navItems.map((item) => {
            const isParentActive = location.pathname.startsWith(item.path);
            const isExpanded = expandedMenu === item.name || (expandedMenu === null && isParentActive && item.subItems);

            return (
              <div key={item.name}>
                {item.subItems ? (
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between px-4 py-2.5 w-full rounded-xl transition-all duration-200 group
                      ${isParentActive ? 'text-white' : 'hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`${isParentActive ? 'text-blue-500' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                      ${location.pathname === item.path ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.icon}</span>
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )}

                {item.subItems && isExpanded && (
                  <div className="mt-1 ml-4 space-y-1 border-l border-white/5 pl-3">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-[13px] transition-all
                          ${location.pathname === subItem.path ? 'text-blue-400 font-bold' : 'text-slate-500 hover:text-white'}`}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={() => setShowSessions(true)} className="...">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      <SessionModal
        isOpen={showSessions}
        onClose={() => setShowSessions(false)}
        onConfirmLogout={() => history.push('/auth/login')}
      />
    </>
  );
};

export default Sidebar;