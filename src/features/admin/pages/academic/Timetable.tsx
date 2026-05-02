import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Calendar, User, MapPin } from 'lucide-react';

const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM"];
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const Timetable: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Academic Timetable" 
      pageDescription="Master schedule for Grade 12 - Section A. Review for teacher conflicts."
    >
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-6 py-4 border-r font-black text-slate-400 uppercase text-[10px] tracking-widest w-32">Time / Day</th>
                {days.map(day => (
                  <th key={day} className="px-6 py-4 font-bold text-slate-800 text-left">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timeSlots.map(time => (
                <tr key={time}>
                  <td className="px-6 py-8 border-r bg-slate-50/30 font-bold text-slate-500 text-xs text-center">{time}</td>
                  {days.map(day => (
                    <td key={`${day}-${time}`} className="px-4 py-4 min-w-[180px]">
                      <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3 group hover:bg-blue-600 transition-all cursor-pointer">
                        <p className="font-black text-blue-900 group-hover:text-white text-xs mb-1">PHYSICS</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-700/60 group-hover:text-blue-100 font-bold">
                          <User size={10}/> Dr. Arvind Sharma
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-blue-700/60 group-hover:text-blue-100 font-bold mt-1">
                          <MapPin size={10}/> Lab 01
                        </div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
export default Timetable;