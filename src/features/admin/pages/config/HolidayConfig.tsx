import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Calendar, Plus, Palmtree, PartyPopper, AlertCircle, Trash2, Globe } from 'lucide-react';

interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  type: 'National' | 'Festival' | 'Institutional' | 'Event';
  isHoliday: boolean;
}

const HolidayConfig: React.FC = () => {
  const [events, setEvents] = useState<SchoolEvent[]>([
    { id: '1', title: 'Independence Day', date: '2026-08-15', type: 'National', isHoliday: true },
    { id: '2', title: 'Annual Sports Day', date: '2026-11-20', type: 'Event', isHoliday: false },
    { id: '3', title: 'Diwali Break', date: '2026-10-31', type: 'Festival', isHoliday: true },
  ]);

  return (
    <AdminLayout 
      pageTitle="Academic Calendar Master" 
      pageDescription="Declare holidays, schedule festivals, and manage institutional events."
      headerActions={
        <button className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-blue-600 transition-all">
          <Plus size={18}/> Add Holiday/Event
        </button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Add Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm ring-1 ring-slate-900/5">
            <h3 className="text-lg font-black text-slate-900 mb-6">Declare New Holiday</h3>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Title</label>
                <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" placeholder="e.g. Holi Vacation" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Start Date</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">End Date</label>
                  <input type="date" className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none text-xs" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <div>
                  <p className="text-sm font-bold text-blue-900 leading-none">Declare as Holiday</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-1">Affects attendance & payroll</p>
                </div>
                <input type="checkbox" className="h-6 w-12 appearance-none bg-slate-200 rounded-full checked:bg-blue-600 transition-all relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-7 before:transition-all" />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm mt-4">Save to Calendar</button>
            </div>
          </div>
        </div>

        {/* Existing List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden ring-1 ring-slate-900/5">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-5 text-left">Date & Event</th>
                <th className="px-8 py-5 text-left">Classification</th>
                <th className="px-8 py-5 text-left">Impact</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events.map(event => (
                <tr key={event.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-slate-900">{event.title}</p>
                    <p className="text-xs text-slate-500 font-medium">{event.date}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className="flex items-center gap-2 text-slate-600 font-bold">
                      {event.type === 'National' ? <Globe size={14}/> : event.type === 'Festival' ? <Palmtree size={14}/> : <PartyPopper size={14}/>}
                      {event.type}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {event.isHoliday ? (
                      <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase ring-1 ring-rose-200">School Closed</span>
                    ) : (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase ring-1 ring-emerald-200">Working Day</span>
                    )}
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="text-slate-300 hover:text-rose-600 transition-colors"><Trash2 size={18}/></button>
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
export default HolidayConfig;