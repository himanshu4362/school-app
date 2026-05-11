import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  classRoster: any[];
  draftRegister: any;
  isSubmitted: boolean;
  currentStudentIndex: number;
  setCurrentStudentIndex: (val: number | ((prev: number) => number)) => void;
  onStatusChange: (id: string, status: any, autoAdvance: boolean) => void;
}

const AttendanceRapidView: React.FC<Props> = ({ classRoster, draftRegister, isSubmitted, currentStudentIndex, setCurrentStudentIndex, onStatusChange }) => {
  const activeStudent = classRoster[currentStudentIndex];

  if (!activeStudent) return null;

  return (
    <div className="flex-1 flex flex-col relative bg-slate-50 overflow-y-auto custom-scrollbar">
      <div className="h-1.5 w-full bg-slate-200 shrink-0 sticky top-0 z-10">
        <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${((currentStudentIndex + 1) / classRoster.length) * 100}%` }}></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start sm:justify-center p-6 sm:p-12 min-h-max pb-24">
        <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-6 sm:mb-8">
          Student {currentStudentIndex + 1} of {classRoster.length}
        </p>
        
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl sm:text-4xl font-black mb-4 sm:mb-6 shadow-xl shadow-blue-500/10 border-4 border-white shrink-0">
          {activeStudent.firstName[0]}{activeStudent.lastName[0]}
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 text-center">{activeStudent.firstName} {activeStudent.lastName}</h2>
        <p className="text-xs sm:text-sm font-bold text-slate-500 mt-2 mb-8 sm:mb-10 bg-slate-200 px-4 py-1.5 rounded-full">
          Roll: {activeStudent.rollNumber} • {activeStudent.id}
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mb-4 sm:mb-6 shrink-0">
          <button
            onClick={() => onStatusChange(activeStudent.id, 'PRESENT', true)}
            disabled={isSubmitted}
            className={`py-4 sm:py-6 rounded-2xl border-4 text-center transition-all ${draftRegister[activeStudent.id]?.status === 'PRESENT' ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'bg-white border-emerald-100 text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50'}`}
          >
            <span className="block text-lg sm:text-xl font-black uppercase tracking-widest">Present</span>
          </button>
          <button
            onClick={() => onStatusChange(activeStudent.id, 'ABSENT', true)}
            disabled={isSubmitted}
            className={`py-4 sm:py-6 rounded-2xl border-4 text-center transition-all ${draftRegister[activeStudent.id]?.status === 'ABSENT' ? 'bg-rose-500 border-rose-600 text-white shadow-lg shadow-rose-500/30 scale-105' : 'bg-white border-rose-100 text-rose-600 hover:border-rose-300 hover:bg-rose-50'}`}
          >
            <span className="block text-lg sm:text-xl font-black uppercase tracking-widest">Absent</span>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 w-full max-w-md shrink-0">
          {[
            { value: 'LATE', label: 'Late', color: 'amber' },
            { value: 'HALF_DAY', label: 'Half Day', color: 'purple' }
          ].map(opt => {
            const isActive = draftRegister[activeStudent.id]?.status === opt.value;
            const cClass = opt.color === 'amber' ? (isActive ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-500 border-amber-200 hover:bg-amber-50 hover:text-amber-600') : (isActive ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-slate-500 border-purple-200 hover:bg-purple-50 hover:text-purple-600');
            return (
              <button
                key={opt.value}
                onClick={() => onStatusChange(activeStudent.id, opt.value, true)}
                disabled={isSubmitted}
                className={`flex-1 py-3 px-4 border-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${cClass}`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex w-full max-w-md justify-between items-center mt-6 sm:mt-12 border-t border-slate-200 pt-6 shrink-0">
          <button 
            onClick={() => setCurrentStudentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStudentIndex === 0}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-200 disabled:opacity-30 transition-all"
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <button 
            onClick={() => setCurrentStudentIndex(prev => Math.min(classRoster.length - 1, prev + 1))}
            disabled={currentStudentIndex === classRoster.length - 1}
            className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-100 disabled:opacity-30 transition-all"
          >
            Skip <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRapidView;