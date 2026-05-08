import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Edit3, Clock, History, CalendarDays } from 'lucide-react';

const ClassTimetableDashboard: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const history = useHistory();

  // MOCK DATA: Matrix Layout Generation
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 'RECESS', 5, 6, 7, 8];

  // MOCK DATA: Audit History Log
  const auditLogs = [
    { date: 'May 07, 2026 - 09:14 AM', user: 'System Admin', action: 'Swapped Math & Physics (Mon P1/P2)', status: 'Approved' },
    { date: 'May 05, 2026 - 14:20 PM', user: 'Dr. Arora', action: 'Added Proxy: Ravi Verma for Chemistry', status: 'Override Used' },
    { date: 'Apr 28, 2026 - 10:00 AM', user: 'Principal', action: 'Initial Timetable Master Launch', status: 'Approved' },
  ];

  return (
    <AdminLayout 
      pageTitle={`${classId} Timetable Master`} 
      pageDescription="Read-only schedule view and audit tracking."
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: 'Timetable', path: '/admin/academic/timetable' },
        { label: classId }
      ]}
      headerActions={
        <button 
          onClick={() => history.push(`/admin/academic/timetable/editor/${classId}`)}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
        >
          <Edit3 size={18} /> Modify Timetable
        </button>
      }
    >
      
      {/* SECTION 1: THE READ-ONLY MATRIX GRID */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm mb-8 overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <CalendarDays size={20} className="text-blue-600" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Current Active Schedule</h3>
        </div>

        <div className="overflow-x-auto custom-scrollbar pb-4">
          <div className="min-w-[1000px]">
            {/* Header Row (Periods) */}
            <div className="grid grid-cols-[120px_repeat(4,1fr)_60px_repeat(4,1fr)] gap-2 mb-2">
              <div className="font-black text-[10px] text-slate-400 uppercase tracking-widest p-2">Day / Time</div>
              {periods.map((p, i) => (
                <div key={i} className={`text-center font-black text-[10px] tracking-widest uppercase p-2 rounded-lg ${
                  p === 'RECESS' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p === 'RECESS' ? 'BREAK' : `Period ${p}`}
                </div>
              ))}
            </div>

            {/* Matrix Body (Days & Subjects) */}
            <div className="space-y-2">
              {days.map((day) => (
                <div key={day} className="grid grid-cols-[120px_repeat(4,1fr)_60px_repeat(4,1fr)] gap-2 items-stretch">
                  {/* Day Label */}
                  <div className="bg-slate-900 text-white font-bold text-xs flex items-center justify-center rounded-xl py-3 shadow-sm">
                    {day}
                  </div>
                  
                  {/* Render Cells */}
                  {periods.map((p, idx) => {
                    if (p === 'RECESS') {
                      return (
                        <div key={idx} className="bg-amber-50 border border-amber-100/50 rounded-xl flex items-center justify-center relative overflow-hidden">
                          {/* Vertical Text Trick for Recess */}
                          <span className="text-amber-300 font-black text-[10px] tracking-[0.3em] rotate-180" style={{ writingMode: 'vertical-rl' }}>
                            RECESS
                          </span>
                        </div>
                      );
                    }
                    
                    // MOCK DATA for generic cells (In Phase 3 this will be real Redux data)
                    const isLeisure = Math.random() > 0.85; // Randomly assign some free periods for visual testing
                    return (
                      <div key={idx} className={`border rounded-xl p-2 flex flex-col justify-center items-center text-center transition-colors ${
                        isLeisure ? 'bg-slate-50 border-dashed border-slate-200' : 'bg-white border-slate-200 hover:border-blue-300'
                      }`}>
                        {isLeisure ? (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free / Leisure</span>
                        ) : (
                          <>
                            <span className="text-xs font-black text-slate-800">Mathematics</span>
                            <span className="text-[10px] font-bold text-slate-400 mt-0.5">R. Verma</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: AUDIT HISTORY TABLE */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <History size={20} className="text-slate-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Modification History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tl-xl">Timestamp</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Modified By</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Details</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest rounded-tr-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-slate-600 text-xs font-bold">
                      <Clock size={14} className="text-slate-400"/> {log.date}
                    </div>
                  </td>
                  <td className="p-4 text-xs font-black text-slate-800">{log.user}</td>
                  <td className="p-4 text-xs font-medium text-slate-600">{log.action}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${
                      log.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </AdminLayout>
  );
};

export default ClassTimetableDashboard;