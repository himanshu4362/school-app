import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Clock, CalendarX2, AlertTriangle, CheckCircle2, Search } from 'lucide-react';

const mockAttendanceData = [
  { 
    id: 'TCH-001', name: 'Dr. Arvind Sharma', status: 'Present', timeIn: '07:45 AM', 
    stats: { clTotal: 12, clUsed: 2, lateEntries: 0, consecutiveLates: 0 }
  },
  { 
    id: 'TCH-002', name: 'Meera Reddy', status: 'Late', timeIn: '08:20 AM', // > 15 mins late
    stats: { clTotal: 12, clUsed: 4, lateEntries: 4, consecutiveLates: 3 } // Trigger warning
  }
];

const TeacherAttendance: React.FC = () => {
  const [selected, setSelected] = useState(mockAttendanceData[0]);

  return (
    <AdminLayout pageTitle="Attendance Analytics" pageDescription="Punctuality tracking and leave management.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Master List */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Staff Roster</h3>
            <div className="relative"><Search size={14} className="absolute left-2 top-2 text-slate-400"/><input className="pl-7 pr-3 py-1 text-xs border rounded-md" placeholder="Filter staff..."/></div>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-slate-100">
              {mockAttendanceData.map(t => (
                <tr key={t.id} onClick={() => setSelected(t)} className={`cursor-pointer transition-colors ${selected.id === t.id ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                  <td className="px-6 py-4 font-medium text-slate-900">{t.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 font-mono text-xs ${t.status === 'Late' ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>{t.timeIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Analytics Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-lg font-bold text-slate-900 mb-6">{selected.name}</h2>
          
          {selected.stats.consecutiveLates >= 3 && (
            <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex gap-3 text-xs">
              <AlertTriangle size={18} className="shrink-0" />
              <p><strong>Punctuality Warning:</strong> Arrived late for {selected.stats.consecutiveLates} consecutive days. Admin review required.</p>
            </div>
          )}

          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Leave Balance (CL)</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 font-medium">Used: {selected.stats.clUsed}</span>
                <span className="text-emerald-600 font-bold">Remaining: {selected.stats.clTotal - selected.stats.clUsed}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-full transition-all" style={{ width: `${(selected.stats.clUsed / selected.stats.clTotal) * 100}%` }} />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Historical Flags</p>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-100 text-xs">
                  <span className="text-slate-500 font-medium italic">Late Arrival</span>
                  <span className="text-rose-600 font-bold">Today (+35m)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default TeacherAttendance;