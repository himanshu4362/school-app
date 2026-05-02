import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, DollarSign, Settings, LogOut, ChevronDown, ChevronRight, UserPlus, CalendarCheck, Banknote } from 'lucide-react';
import SchoolLogo from '../../../assets/school logo.jpg';
import SessionModal from './SessionModal';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState<string | null>('Teachers');
  const [showSessions, setShowSessions] = useState(false);
  const history = useHistory()
  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <Users size={20} /> },
    {
      name: 'Teachers',
      path: '/admin/teachers',
      icon: <GraduationCap size={20} />,
      subItems: [
        { name: 'Overview', path: '/admin/teachers' },
        { name: 'Manage Teachers', path: '/admin/teachers/manage', icon: <UserPlus size={16} /> },
        { name: 'Attendance', path: '/admin/teachers/attendance', icon: <CalendarCheck size={16} /> },
        { name: 'Payroll', path: '/admin/teachers/payroll', icon: <Banknote size={16} /> },
      ]
    },
    { name: 'Finance', path: '/admin/finance', icon: <DollarSign size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const toggleMenu = (name: string) => {
    if (expandedMenu === name) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(name);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        fixed md:sticky md:top-0 inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-300
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen
      `}>
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <img src={SchoolLogo} alt="Logo" className="w-10 h-10 rounded-full" />
          <span className="text-white font-bold text-lg tracking-wide">DPS Admin</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            // Check if exact match for parent, or if we are in a sub-route
            const isActive = location.pathname === item.path || (item.subItems && location.pathname.startsWith(item.path + '/'));
            const isExpanded = expandedMenu === item.name;

            return (
              <div key={item.name}>
                {item.subItems ? (
                  // Render a button that expands/collapses sub-items
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`
                      flex items-center justify-between px-4 py-3 w-full rounded-lg transition-colors
                      ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.name}</span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                ) : (
                  // Render standard link
                  <Link
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive && !item.subItems ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}
                    `}
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )}

                {/* Render SubItems if expanded */}
                {item.subItems && isExpanded && (
                  <div className="mt-2 ml-4 space-y-1 border-l border-slate-700 pl-4">
                    {item.subItems.map(subItem => (
                      <Link
                        key={subItem.name}
                        to={subItem.path}
                        onClick={() => setIsOpen(false)}
                        className={`
                          flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors
                          ${location.pathname === subItem.path ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                        `}
                      >
                        {subItem.icon && <span className="opacity-70">{subItem.icon}</span>}
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>


        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => setShowSessions(true)} // Wired up
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <SessionModal
          isOpen={showSessions}
          onClose={() => setShowSessions(false)}
          onConfirmLogout={() => history.push('/auth/login')}
        />
      </div>
    </>
  );
};

export default Sidebar;