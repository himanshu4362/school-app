import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, } from 'date-fns';
import { 
  CheckCircle2, XCircle, Clock, CalendarOff, Save, Lock, AlertCircle, UserCheck 
} from 'lucide-react';
import { z } from 'zod';
import { RootState } from '../../../../../store/store';
import { 
  setSelectedDate, updateDraftRecord, commitDailyAttendance, clearDraft 
} from '../../../../../store/slices/attendanceSlice';
import { AttendanceRecord, AttendanceSession, BaseAttendanceStatus } from '../../../../../types/faculty/attendance.schema';
import { FacultyEmployee } from '../../../../../types/faculty/directory.schema';

// ============================================================================
// ROW COMPONENT (Handles individual teacher state)
// ============================================================================
const AttendanceRow: React.FC<{ 
  employee: FacultyEmployee; 
  date: string;
  existingRecord?: AttendanceRecord;
  draftRecord?: Partial<AttendanceRecord>;
  isLocked: boolean;
}> = ({ employee, date, existingRecord, draftRecord, isLocked }) => {
  const dispatch = useDispatch();

  // 1. Determine Current Visual State (Draft > Existing > Default)
  const currentStatus = draftRecord?.status || existingRecord?.status || 'present';
  const isLate = draftRecord?.modifiers?.isLate ?? existingRecord?.modifiers.isLate ?? false;
  const isHalfDay = draftRecord?.modifiers?.isHalfDay ?? existingRecord?.modifiers.isHalfDay ?? false;
  
  // Is this row currently modified and unsaved?
  const isDirty = !!draftRecord && Object.keys(draftRecord).length > 0;

  // 2. Handlers
  const handleStatusChange = (status: z.infer<typeof BaseAttendanceStatus>) => {
    if (isLocked || employee.status === 'on_leave') return;
    dispatch(updateDraftRecord({
      employeeId: employee.id,
      changes: { status, modifiers: { isLate: false, isHalfDay: false } } // Reset modifiers on status change
    }));
  };

  const handleModifierToggle = (modifier: 'isLate' | 'isHalfDay') => {
    if (isLocked || currentStatus !== 'present') return;
    dispatch(updateDraftRecord({
      employeeId: employee.id,
      changes: { 
        status: 'present', 
        modifiers: { 
          isLate: modifier === 'isLate' ? !isLate : isLate,
          isHalfDay: modifier === 'isHalfDay' ? !isHalfDay : isHalfDay
        }
      }
    }));
  };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-between p-4 mb-3 rounded-2xl border transition-all ${isDirty ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      
      {/* Teacher Info */}
      <div className="flex items-center gap-4 w-full md:w-1/3 mb-4 md:mb-0">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-500 overflow-hidden">
          {employee.profilePhoto ? <img src={employee.profilePhoto} alt="" className="w-full h-full object-cover"/> : employee.fullName.charAt(0)}
        </div>
        <div>
          <h4 className="text-sm font-black text-slate-900">{employee.fullName}</h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{employee.departmentId} • {employee.employeeId}</p>
        </div>
      </div>

      {/* Trust & Source Indicator */}
      <div className="w-full md:w-1/4 flex items-center justify-start md:justify-center mb-4 md:mb-0">
        {existingRecord?.source === 'self' && (
           <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
             <UserCheck size={12}/> Self-Marked
           </span>
        )}
        {employee.status === 'on_leave' && (
           <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
             <CalendarOff size={12}/> Auto: On Leave
           </span>
        )}
      </div>

      {/* Action Toggles */}
      <div className={`flex gap-2 w-full md:w-auto ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Base Statuses */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => handleStatusChange('present')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${currentStatus === 'present' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <CheckCircle2 size={14}/> P
          </button>
          <button onClick={() => handleStatusChange('absent')} className={`px-4 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${currentStatus === 'absent' ? 'bg-rose-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <XCircle size={14}/> A
          </button>
        </div>

        {/* Modifiers (Only active if Present) */}
        <div className={`flex bg-slate-100 p-1 rounded-xl transition-all ${currentStatus !== 'present' ? 'opacity-30' : ''}`}>
          <button onClick={() => handleModifierToggle('isLate')} className={`px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${isLate ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            <Clock size={14}/> Late
          </button>
          <button onClick={() => handleModifierToggle('isHalfDay')} className={`px-3 py-2 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${isHalfDay ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            HD
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN GRID COMPONENT
// ============================================================================
const DailyAttendanceGrid: React.FC = () => {
  const dispatch = useDispatch();
  
  // 1. Global State
  const { staff } = useSelector((state: RootState) => state.facultyDirectory);
  const { selectedDate, draftGrid, recordsById, recordsByDate, sessions } = useSelector((state: RootState) => state.attendance);
  
  // 2. Local Initialization (Default to today using local timezone)
  const [dateInput, setDateInput] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    dispatch(setSelectedDate(dateInput));
  }, [dateInput, dispatch]);

  // 3. Derived Data
  const activeStaff = staff.filter(s => s.status !== 'terminated' && s.status !== 'inactive');
  const currentSession = sessions[selectedDate];
  const isLocked = currentSession?.status === 'locked';
  const hasDrafts = Object.keys(draftGrid).length > 0;

  // 4. Submit Financial Ledger
  const handleCommit = () => {
    if (isLocked) return alert("Session is locked.");

    const recordsToCommit: AttendanceRecord[] = activeStaff.map(emp => {
      // Prioritize Draft -> Existing -> Default(Present)
      const existingId = recordsByDate[selectedDate]?.find(id => recordsById[id].employeeId === emp.id);
      const existingRecord = existingId ? recordsById[existingId] : null;
      const draft = draftGrid[emp.id];

      return {
        id: existingRecord?.id || crypto.randomUUID(),
        employeeId: emp.id,
        date: selectedDate,
        status: draft?.status || existingRecord?.status || (emp.status === 'on_leave' ? 'leave' : 'present'),
        modifiers: draft?.modifiers || existingRecord?.modifiers || { isLate: false, isHalfDay: false },
        source: 'admin', // Admin is operating the grid
        verificationStatus: 'admin_verified',
        markedBy: 'CURRENT_ADMIN_ID', // Replace with real auth user later
        markedAt: new Date().toISOString(),
        changeLogs: existingRecord?.changeLogs || [],
        isAutoGeneratedFromLeave: emp.status === 'on_leave',
      };
    });

    // Calculate Snapshot
    let tPresent = 0, tAbsent = 0, tLeave = 0;
    recordsToCommit.forEach(r => {
      if (r.status === 'present') tPresent++;
      if (r.status === 'absent') tAbsent++;
      if (r.status === 'leave') tLeave++;
    });

    const newSession: AttendanceSession = {
      date: selectedDate,
      status: 'submitted',
      totalPresent: tPresent,
      totalAbsent: tAbsent,
      totalOnLeave: tLeave,
    };

    dispatch(commitDailyAttendance({ session: newSession, records: recordsToCommit }));
    alert(`Successfully committed attendance for ${recordsToCommit.length} staff members.`);
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* TOOLBAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-slate-100 p-2 rounded-xl border border-slate-200 flex items-center">
            <input 
              type="date" 
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="bg-transparent text-sm font-black text-slate-800 outline-none cursor-pointer"
            />
          </div>
          
          {isLocked ? (
            <span className="flex items-center gap-1 text-xs font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
              <Lock size={14}/> Ledger Locked
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              Open for Entry
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => dispatch(clearDraft())}
            disabled={!hasDrafts || isLocked}
            className="px-4 py-2.5 text-xs font-black text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-all"
          >
            Discard Changes
          </button>
          
          <button 
            onClick={handleCommit}
            disabled={isLocked}
            className={`px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-sm ${isLocked ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : (hasDrafts ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md' : 'bg-slate-800 text-white hover:bg-slate-900')}`}
          >
            <Save size={16}/> {hasDrafts ? 'Commit Changes' : 'Confirm Present Default'}
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="space-y-1">
        {activeStaff.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
            <AlertCircle size={32} className="mx-auto text-slate-300 mb-3"/>
            <h3 className="text-sm font-black text-slate-500">No active staff found to mark attendance.</h3>
          </div>
        ) : (
          activeStaff.map(emp => {
            const existingId = recordsByDate[selectedDate]?.find(id => recordsById[id].employeeId === emp.id);
            return (
              <AttendanceRow 
                key={emp.id} 
                employee={emp} 
                date={selectedDate}
                existingRecord={existingId ? recordsById[existingId] : undefined}
                draftRecord={draftGrid[emp.id]}
                isLocked={isLocked}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default DailyAttendanceGrid;