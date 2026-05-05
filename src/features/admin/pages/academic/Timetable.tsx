import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Calendar, User, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

const Timetable: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [ignoreConflict, setIgnoreConflict] = useState<string | null>(null);

  // MOCK MASTER SCHEDULE (To detect conflicts across classes)
  const masterSchedule = [
    { class: 'Grade 12-B', teacher: 'Dr. Arvind Sharma', time: '09:00 AM' }
  ];

  const handleAssign = (teacher: string, time: string) => {
    const conflict = masterSchedule.find(s => s.teacher === teacher && s.time === time);
    if (conflict && ignoreConflict !== `${teacher}-${time}`) {
      alert(`CONFLICT: ${teacher} is already assigned to ${conflict.class} at ${time}`);
      return;
    }
    alert(`Success: Assigned ${teacher} to ${selectedClass} at ${time}`);
  };

  if (!selectedClass) {
    return (
      <AdminLayout pageTitle="Timetable Manager">
        <div className="grid grid-cols-3 gap-6">
          {['9-A', '10-A', '11-Sci', '12-Sci'].map(c => (
            <div key={c} onClick={() => setSelectedClass(c)} className="p-10 bg-white border-2 rounded-[2rem] hover:border-blue-500 cursor-pointer transition-all shadow-sm">
              <Calendar className="text-blue-600 mb-4" size={32}/>
              <h3 className="text-2xl font-black text-slate-800">Grade {c}</h3>
            </div>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle={`Schedule: ${selectedClass}`}>
      <div className="grid grid-cols-1 gap-4">
        {['08:00 AM', '09:00 AM', '10:00 AM'].map(time => {
          const isConflicted = time === '09:00 AM'; // Simulated conflict for demo
          return (
            <div key={time} className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center justify-between">
              <div className="flex gap-10 items-center">
                <span className="font-black text-slate-400 w-24">{time}</span>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                   <User size={16} className="text-slate-400"/>
                   <span className="font-bold text-slate-700">Dr. Arvind Sharma</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {isConflicted && !ignoreConflict && (
                  <div className="flex items-center gap-2 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 animate-pulse">
                    <AlertTriangle size={16}/>
                    <span className="text-[10px] font-black uppercase">Conflict Detected</span>
                    <button onClick={() => setIgnoreConflict(`${'Dr. Arvind Sharma'}-${time}`)} className="ml-2 text-blue-600 underline font-black">Ignore</button>
                  </div>
                )}
                <button onClick={() => handleAssign('Dr. Arvind Sharma', time)} className="bg-slate-900 text-white px-6 py-2 rounded-xl text-xs font-black">Assign Subject</button>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};
export default Timetable;