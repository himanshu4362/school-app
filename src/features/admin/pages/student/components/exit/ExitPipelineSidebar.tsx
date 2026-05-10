import React from 'react';
import { GraduationCap, Plus } from 'lucide-react';
import { StudentExitRecord } from '../../../../../../types/student/exit.schema';

interface Props {
  activeExits: StudentExitRecord[];
  selectedExitId: string;
  isInitiating: boolean;
  onSelectExit: (id: string) => void;
  onNewExit: () => void;
  mockStudents: any[];
}

export const ExitPipelineSidebar: React.FC<Props> = ({ activeExits, selectedExitId, isInitiating, onSelectExit, onNewExit, mockStudents }) => {
  const getStatusBadge = (status: string) => {
    if (status === 'ALUMNI') return 'bg-emerald-100 text-emerald-800 border-emerald-400';
    if (status === 'ARCHIVED') return 'bg-slate-900 text-slate-300 border-slate-700';
    return 'bg-amber-100 text-amber-700 border-amber-300';
  };

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[400px] lg:h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <GraduationCap size={16} className="text-indigo-600"/> Active Pipeline
        </h3>
        <button 
          onClick={onNewExit} 
          className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1 shadow-md ${isInitiating ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-slate-900 text-white hover:bg-black'}`}
        >
          <Plus size={12}/> New Exit
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl divide-y divide-slate-100">
        {activeExits.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs font-bold">No active exits pending.</div>
        ) : (
          activeExits.map(record => {
            const student = mockStudents.find(s => s.id === record.studentId);
            const isSelected = selectedExitId === record.studentId && !isInitiating;
            
            return (
              <div key={record.studentId} onClick={() => onSelectExit(record.studentId)} className={`p-4 cursor-pointer transition-all ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className={`text-sm font-black ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>{student?.name || record.studentId}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{record.exitType.replace('_', ' ')}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border border-slate-200 ${getStatusBadge(record.status)}`}>
                  {record.status.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};