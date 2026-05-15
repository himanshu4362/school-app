import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronRight,
  Settings,
  TrendingUp,
  Award,
  Briefcase,
  Wallet,
  Library
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const history = useHistory();
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  // White-label configuration
  const schoolConfig = {
    shortName: "DPS Ranchi",
    logoText: "DPS"
  };

  // Navigation Array with Sub-Menus
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },

    {
      name: 'Admissions Hub',
      icon: <TrendingUp size={20} />,
      basePath: '/admin/admissions',
      subItems: [
        { name: 'Lead CRM', path: '/admin/admissions' },
        { name: 'Application Desk', path: '/admin/admissions/applications' }
      ]
    },

    {
      name: 'Students & Alumni',
      icon: <Users size={20} />,
      basePath: '/admin/student',
      subItems: [
        { name: 'Active Directory', path: '/admin/students' },
        { name: 'Exit & Alumni Hub', path: '/admin/student/exits' },
      ]
    },
    {
      name: 'HR & Faculty',
      icon: <Briefcase size={20} />,
      basePath: '/admin/faculty',
      subItems: [
        { name: 'Talent Acquisition', path: '/admin/faculty/recruitment' },
        { name: 'Staff Directory', path: '/admin/faculty/directory' },
        { name: 'Separation Engine', path: '/admin/hr/separations' },
        { name: 'Daily Attendance', path: '/admin/faculty/attendance' },
        { name: 'Data Migration', path: '/admin/faculty/migration' },
        { name: 'Onboarding Wizard', path: '/admin/faculty/onboarding' },
        { name: 'Leave Inbox', path: '/admin/faculty/leave' },
      ]
    },
    {
      name: 'Finance & Accounts',
      icon: <Wallet size={20} />,
      basePath: '/admin/finance',
      subItems: [
        { name: 'Executive P&L', path: '/admin/finance/executive-dashboard' },
        { name: 'Revenue Passbook', path: '/admin/finance/passbook' },
        { name: 'Expense Passbook', path: '/admin/finance/expenses' },
        { name: 'Fee Master Catalog', path: '/admin/finance/fee-master' },
        { name: 'Student Ledger', path: '/admin/finance/ledger' },
        { name: 'Cash Desk (POS)', path: '/admin/finance/pos' },
        { name: 'Payroll Engine', path: '/admin/finance/payroll' },
      ]
    },
    // 4. ACADEMIC OPERATIONS
    {
      name: 'Academic Hub',
      icon: <BookOpen size={20} />,
      basePath: '/admin/academic',
      subItems: [
        { name: 'Subjects & Allocation', path: '/admin/academic/subjects' },
        { name: 'Timetable Desk', path: '/admin/academic/timetable' },
        { name: 'Syllabus Tracker', path: '/admin/academic/syllabus' }
      ]
    },
    {
      name: 'System Config',
      icon: <Settings size={20} />,
      basePath: '/admin/config',
      subItems: [
        { name: 'Master Data Hub', path: '/admin/config/master-data' },
        { name: 'Holiday Calendar', path: '/admin/config/holidays' },
        { name: 'Seat Management', path: "/admin/config/seats" },
      ]
    },
    {
      name: 'Examination',
      icon: <Award size={20} />,
      basePath: '/admin/examination',
      subItems: [
        { name: 'Marks & Grading', path: '/admin/examination/marks-hub' },
        { name: 'Paper Evaluation', path: '/admin/examination/evaluate' },
        { name: 'Monthly Tests', path: '/admin/examination/monthly-tests' },
      ]
    },
    {
      name: 'Library Hub',
      icon: <Library size={20} />,
      basePath: '/admin/library',
      subItems: [
        { name: 'Procurement & Catalog', path: '/admin/library/procurement' },
        { name: 'Circulation Desk', path: '/admin/library/circulation' },
        { name: 'OPAC Search', path: '/admin/library/opac' },
        { name: 'Inventory & Analytics', path: '/admin/library/analytics' }
      ]
    }
  ];

  // Auto-expand the menu if the user is currently on a nested route
  useEffect(() => {
    const activeItem = navItems.find(item =>
      item.subItems && location.pathname.startsWith(item.basePath || '')
    );
    if (activeItem) setExpandedMenu(activeItem.name);
  }, [location.pathname]);

  const toggleMenu = (name: string) => {
    setExpandedMenu(expandedMenu === name ? null : name);
  };

  const handleNavigation = (path: string) => {
    history.push(path);
    setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      )}

      <div className={`
        fixed md:sticky md:top-0 inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-slate-300
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen border-r border-slate-800
      `}>

        {/* White-Label School Brand Area */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center font-black text-slate-900 shadow-md">
            {schoolConfig.logoText}
          </div>
          <span className="text-white font-black text-lg tracking-tight uppercase">
            {schoolConfig.shortName}
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const hasSubItems = !!item.subItems;
            const isExactActive = location.pathname === item.path;
            const isParentActive = hasSubItems && location.pathname.startsWith(item.basePath || '');
            const isExpanded = expandedMenu === item.name;

            return (
              <div key={item.name}>
                <button
                  onClick={() => hasSubItems ? toggleMenu(item.name) : handleNavigation(item.path!)}
                  className={`flex items-center justify-between px-4 py-3 w-full rounded-xl transition-all duration-200 text-left
                    ${(isExactActive || isParentActive)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 font-bold'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={(isExactActive || isParentActive) ? 'text-white' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  {hasSubItems && (
                    isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                  )}
                </button>

                {/* Sub-Items Rendering */}
                {hasSubItems && isExpanded && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-slate-700/50 space-y-1">
                    {item.subItems!.map(sub => (
                      <button
                        key={sub.name}
                        onClick={() => handleNavigation(sub.path)}
                        className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-colors
                          ${location.pathname === sub.path
                            ? 'text-blue-400 font-bold bg-slate-800/50'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                          }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-left font-medium">
            <LogOut size={20} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;