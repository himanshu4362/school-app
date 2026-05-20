import React from 'react';
import StudentLayout from '../../components/layout/StudentLayout';
import { Home, ChevronRight, LayoutDashboard, Sparkles, Calendar } from 'lucide-react';

const StudentDashboardHub: React.FC = () => {
  return (
    <StudentLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-6">
        
        {/* INTERACTIVE BREADCRUMB */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 bg-white w-max px-4 py-2 rounded-xl border border-slate-200">
          <Home size={14}/> 
          <ChevronRight size={14} className="text-slate-300" />
          <span className="text-blue-600">My Dashboard</span>
        </div>

        {/* HERO AREA */}
        <div className="bg-slate-900 rounded-[40px] p-8 lg:p-12 relative overflow-hidden text-white flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] opacity-20 -mr-48 -mt-48"></div>
          
          <div className="z-10 text-center lg:text-left">
            {/*   FIXED: DPS Ranchi branding */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles size={14}/> Welcome to DPS Ranchi
            </div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
              Hello, <span className="text-blue-400">Himanshu!</span>
            </h1>
            <p className="text-slate-400 font-bold max-w-md mx-auto lg:mx-0">
              You have 2 exams scheduled for this week. Keep up the momentum, you are in the top 10% of your class.
            </p>
          </div>

          <div className="z-10 grid grid-cols-2 gap-4 w-full max-w-sm">
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Attendance</p>
                <p className="text-3xl font-black mt-1">94%</p>
             </div>
             <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[32px] text-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GPA Score</p>
                <p className="text-3xl font-black mt-1">3.8</p>
             </div>
          </div>
        </div>

        {/* PLACEHOLDER FOR ANALYTICS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
          <div className="lg:col-span-2 bg-white rounded-[40px] border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-slate-300">
             <LayoutDashboard size={48} className="mb-4 opacity-50"/>
             <p className="font-black uppercase tracking-widest text-xs">Visual Performance Analytics Placeholder</p>
          </div>
          <div className="bg-white rounded-[40px] border border-slate-200 border-dashed flex flex-col items-center justify-center p-12 text-slate-300">
             <Calendar size={48} className="mb-4 opacity-50"/>
             <p className="font-black uppercase tracking-widest text-xs">Upcoming Schedule Placeholder</p>
          </div>
        </div>

      </div>
    </StudentLayout>
  );
};

export default StudentDashboardHub;