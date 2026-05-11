import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fingerprint, Clock, CheckCircle, Calendar, ShieldCheck } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { selfCheckIn } from '../../../../store/slices/attendanceSlice';
import TeacherLayout from '../../components/layout/TeacherLayout';
import Breadcrumbs from '../../components/shared/Breadcrumbs';

const LOGGED_IN_TEACHER_ID = 'EMP-001';

const TeacherAttendanceHub: React.FC = () => {
  const dispatch = useDispatch();
  
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const { recordsById, recordsByEmployee, todayCheckedIn } = useSelector((state: RootState) => state.attendance);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
    dispatch(selfCheckIn({
      employeeId: LOGGED_IN_TEACHER_ID,
      localDate: todayDateStr,
      isoTimestamp: new Date().toISOString() // Strict ISO 8601 for Zod
    }));
  };

  // Derive Stats from the Teacher's specific Ledger
  const myRecordIds = recordsByEmployee[LOGGED_IN_TEACHER_ID] || [];
  const ledgerArray = myRecordIds
    .map(id => recordsById[id])
    .filter(Boolean)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const daysPresent = ledgerArray.filter(r => r.status === 'present').length;
  const daysLeave = ledgerArray.filter(r => r.status === 'leave').length;

  // Find today's specific record to show the exact log time
  const todayRecord = ledgerArray.find(r => r.date === todayDateStr);

  return (
    <TeacherLayout>
      <div className="w-full max-w-[1200px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-6">
        
        <Breadcrumbs items={[{ label: 'My Attendance' }]} />

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
              <Fingerprint className="text-blue-600" size={32} />
              My Attendance Desk
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Log your daily presence and view your compliance records.</p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-2 shadow-sm">
            <Calendar size={16} className="text-slate-400" />
            <span className="text-xs font-black uppercase tracking-widest">{todayFormatted}</span>
          </div>
        </div>

        {/* THE CHECK-IN GATE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className={`col-span-1 p-8 rounded-[32px] border flex flex-col items-center justify-center text-center transition-all duration-500 relative overflow-hidden ${todayCheckedIn ? 'bg-emerald-50 border-emerald-200 shadow-emerald-500/10' : 'bg-white border-blue-200 shadow-xl shadow-blue-500/10'}`}>
            
            {todayCheckedIn ? (
              <>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500"></div>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={40} className="text-emerald-600" />
                </div>
                <h2 className="text-xl font-black text-emerald-900 tracking-tight">Checked In</h2>
                <p className="text-sm font-bold text-emerald-600 mt-1 mb-6">Attendance officially locked for today.</p>
                <div className="bg-white border border-emerald-100 px-6 py-3 rounded-2xl w-full flex justify-between items-center shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Time Logged</span>
                  <span className="text-sm font-black text-slate-800">
                    {todayRecord?.modifiers.checkInAt ? new Date(todayRecord.modifiers.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just Now'}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 animate-pulse"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                  <Clock size={12} /> Live Server Time
                </div>
                <div className="text-3xl font-black text-slate-800 tracking-tight font-mono mb-8">
                  {currentTime}
                </div>
                
                <button 
                  onClick={handleCheckIn}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/20 group"
                >
                  <Fingerprint size={24} className="group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black uppercase tracking-widest">Mark Present</span>
                </button>
                <p className="text-[9px] font-bold text-slate-400 mt-4 flex items-center gap-1">
                  <ShieldCheck size={10} /> Location & IP implicitly verified
                </p>
              </>
            )}
          </div>

          {/* QUICK STATS */}
          <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Current Month</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-slate-800">{daysPresent}</span>
                <span className="text-sm font-bold text-slate-500 mb-2">Days Present</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-slate-200 flex flex-col justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Leaves Taken</p>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-black text-slate-800">{daysLeave}</span>
                <span className="text-sm font-bold text-slate-500 mb-2">Approved</span>
              </div>
            </div>
          </div>
        </div>

        {/* THE IMMUTABLE LEDGER */}
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h3 className="text-base font-black text-slate-800">Attendance Ledger</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Your Compliance Record</p>
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Date</th>
                  <th className="bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                  <th className="bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Time Logged</th>
                  <th className="bg-white px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Source</th>
                </tr>
              </thead>
              <tbody>
                {ledgerArray.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 text-xs font-bold">No attendance records found. Click 'Mark Present' above to start your ledger.</td>
                  </tr>
                ) : (
                  ledgerArray.map((record) => {
                    const isPresent = record.status === 'present';
                    const displayTime = record.modifiers.checkInAt 
                      ? new Date(record.modifiers.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '--:--';
                    
                    return (
                      <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 border-b border-slate-100">
                          <span className="text-sm font-black text-slate-700">{record.date}</span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                            isPresent ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100 text-sm font-bold text-slate-600">
                          {displayTime}
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100 text-xs font-bold text-slate-500 flex items-center gap-2">
                          <ShieldCheck size={14} className="text-blue-500" />
                          {record.source.toUpperCase().replace('_', ' ')}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </TeacherLayout>
  );
};

export default TeacherAttendanceHub;