import React, { useState } from 'react';
import StudentSidebar from './StudentSidebar';
import { Bell, Search, Menu, X } from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

const StudentLayout: React.FC<Props> = ({ children }) => {
    // 🟢 FIXED: Added state to handle the mobile drawer
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
            <div className="hidden lg:block h-full z-10">
                <StudentSidebar />
            </div>

            <div className={`fixed inset-0 z-[100] lg:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                <div
                    className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className={`absolute top-0 left-0 w-72 h-full shadow-2xl transition-transform duration-300 ease-in-out flex ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <StudentSidebar />
                </div>
            </div>


            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden w-full">

                {/* TOP BAR */}
                <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-10 shrink-0">
                    <div className="flex items-center gap-4">
                        {/* 🟢 FIXED: Hamburger button now triggers the drawer state */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find a course or test..."
                                className="bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold w-64 outline-none focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Himanshu Raj</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">10-A • STU-001</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">
                                HR
                            </div>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT CONTAINER */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default StudentLayout;