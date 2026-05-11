import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, Lock, Unlock, ArrowLeft } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { requestModifyAttendance, exitAttendanceSession } from '../../../../store/slices/studentAttendanceSlice';

const PostSubmissionLockScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { activeClassId, activeSectionId, sessions } = useSelector((state: RootState) => state.studentAttendance);
  const session = sessions[`${activeClassId}-${activeSectionId}`];

  const [minutesRemaining, setMinutesRemaining] = useState(30);

  useEffect(() => {
    if (!session?.submittedAt) return;
    
    // Timer calculation loop
    const interval = setInterval(() => {
      const timePassedMs = new Date().getTime() - new Date(session.submittedAt!).getTime();
      const mins = 30 - Math.floor(timePassedMs / (1000 * 60));
      setMinutesRemaining(Math.max(0, mins));
      
      // If time runs out while sitting on this screen, force Redux update
      if (mins <= 0 && session.status !== 'LOCKED') {
        dispatch(requestModifyAttendance()); // This will lock it
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session, dispatch]);

  const isLocked = session?.status === 'LOCKED' || minutesRemaining <= 0;

  return (
    <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-300">
      
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
        <CheckCircle size={40} />
      </div>

      <h2 className="text-3xl font-black text-slate-800 mb-2">Successfully Recorded</h2>
      <p className="text-slate-500 font-bold mb-8">
        Attendance for Class {activeClassId}-{activeSectionId} has been securely logged to the database.
      </p>

      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 w-full max-w-md mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          {isLocked ? <Lock size={20} className="text-rose-500" /> : <Unlock size={20} className="text-amber-500" />}
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">Security Audit Lock</h3>
        </div>
        
        {isLocked ? (
          <p className="text-xs font-bold text-rose-600 mt-2">
            The 30-minute modification window has closed. The record is cryptographically locked. Contact Admin for changes.
          </p>
        ) : (
          <p className="text-xs font-bold text-amber-600 mt-2">
            You have {minutesRemaining} minutes remaining to modify this attendance before it permanently locks.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => dispatch(exitAttendanceSession())}
          className="flex-1 px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors flex justify-center items-center gap-2"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        
        {!isLocked && (
          <button 
            onClick={() => dispatch(requestModifyAttendance())}
            className="flex-1 px-6 py-4 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
          >
            Modify Attendance
          </button>
        )}
      </div>

    </div>
  );
};

export default PostSubmissionLockScreen;