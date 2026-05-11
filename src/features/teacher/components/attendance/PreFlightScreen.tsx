import React from 'react';
import { useDispatch } from 'react-redux';
import { Play, Users, CheckCircle, Clock } from 'lucide-react';
import { navToActiveSession } from '../../../../store/slices/studentAttendanceSlice';

interface Props {
  classId: string;
  sectionId: string;
  classRoster: any[];
  sessionStatus: string;
  markedCount: number;
}

const PreFlightScreen: React.FC<Props> = ({ classId, sectionId, classRoster, sessionStatus, markedCount }) => {
  const dispatch = useDispatch();

  const isResume = sessionStatus === 'IN_PROGRESS';

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">
      
      {/* THE START BUTTON SECTION */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Class {classId}-{sectionId}</h2>
          <p className="text-slate-500 font-bold mt-1">
            {classRoster.length} Total Students • {markedCount} Already Marked
          </p>
        </div>
        
        <button 
          onClick={() => dispatch(navToActiveSession())}
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 transition-transform hover:scale-105"
        >
          {isResume ? <Clock size={20} /> : <Play size={20} fill="currentColor" />}
          {isResume ? 'Resume Session' : 'Start Attendance'}
        </button>
      </div>

      {/* THE STUDENT LIST (READ-ONLY) */}
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm flex-1 flex flex-col">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
          <Users size={20} className="text-slate-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Student Roster Preview</h3>
        </div>
        
        <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1 max-h-[500px]">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 w-24">Roll No</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student Name</th>
                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</th>
              </tr>
            </thead>
            <tbody>
              {classRoster.map((student, index) => (
                <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                  <td className="px-8 py-4 border-b border-slate-100 text-sm font-black text-slate-500">{student.rollNumber}</td>
                  <td className="px-8 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{student.firstName} {student.lastName}</span>
                    </div>
                  </td>
                  <td className="px-8 py-4 border-b border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                      Pending Action
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PreFlightScreen;