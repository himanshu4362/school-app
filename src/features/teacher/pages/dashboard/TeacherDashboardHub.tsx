import React from 'react';
import { useHistory } from 'react-router-dom';
import { PlayCircle, Clock, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import TeacherLayout from '../../components/layout/TeacherLayout';
import Breadcrumbs from '../../components/shared/Breadcrumbs';

const TeacherDashboardHub: React.FC = () => {
  const history = useHistory();

  // Helper to route to the full-screen Cockpit
  const launchSession = (sessionId: string) => {
    history.push(`/teacher/execution/cockpit/${sessionId}`);
  };

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full">
        
        {/* 🟢 BREADCRUMBS ADDED */}
        <Breadcrumbs items={[
          { label: 'Daily Execution' }
        ]} />

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Clock className="text-blue-600" size={28} />
            Today's Execution Radar
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1">Manage your active classes and daily schedule.</p>
        </div>

        {/* DAILY TIMELINE GRID */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex-1">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <CalendarIcon size={16} className="text-slate-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Today's Periods</span>
          </div>

          <div className="p-6 space-y-4">
            {/* COMPLETED CLASS */}
            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50 flex items-center justify-between opacity-75">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex flex-col items-center justify-center text-emerald-700">
                  <span className="text-[10px] font-black uppercase tracking-widest">Per</span>
                  <span className="text-lg font-black leading-none">1</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-emerald-900">Mathematics</h3>
                  <p className="text-xs font-bold text-emerald-600">Class 10-A • 08:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-200/50 rounded-lg text-emerald-700 font-bold text-xs">
                <CheckCircle size={14} /> Completed
              </div>
            </div>

            {/* ACTIVE CLASS (Ready to Launch) */}
            <div className="p-4 rounded-2xl border-2 border-blue-500 bg-white shadow-md shadow-blue-500/10 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <div className="flex items-center gap-4 ml-2">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex flex-col items-center justify-center text-blue-700">
                  <span className="text-[10px] font-black uppercase tracking-widest">Per</span>
                  <span className="text-lg font-black leading-none">2</span>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Physics</h3>
                  <p className="text-xs font-bold text-slate-500">Class 10-B • 08:45 AM</p>
                </div>
              </div>
              <button 
                onClick={() => launchSession('DEMO-SESSION-001')}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20"
              >
                <PlayCircle size={16} /> Launch Cockpit
              </button>
            </div>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
};

export default TeacherDashboardHub;