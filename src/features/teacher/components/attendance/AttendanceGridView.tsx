import React from 'react';
import { Users, Info } from 'lucide-react';

interface Props {
  classRoster: any[];
  draftRegister: any;
  isSubmitted: boolean;
  classId: string;
  sectionId: string;
  onStatusChange: (id: string, status: any) => void;
}

const AttendanceGridView: React.FC<Props> = ({ classRoster, draftRegister, isSubmitted, classId, sectionId, onStatusChange }) => {
  if (classRoster.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
          <Users size={24} className="text-slate-400" />
        </div>
        <p className="text-sm font-black text-slate-600 mb-1">No Students Found</p>
        <p className="text-xs font-bold text-slate-400">There are no active students mapped to Class {classId}-{sectionId}.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead className="bg-slate-900 text-white sticky top-0 z-10">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-20 text-center border-r border-slate-800">Roll</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] w-64 border-r border-slate-800">Student Name</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] border-r border-slate-800">Status</th>
          </tr>
        </thead>
        <tbody>
          {classRoster.map((student, index) => {
            const currentStatus = draftRegister[student.id]?.status || 'UNMARKED';
            return (
              <tr key={student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-50 transition-colors`}>
                <td className="px-6 py-4 border-b border-slate-200 text-center font-black text-slate-500 border-r">{student.rollNumber}</td>
                <td className="px-6 py-4 border-b border-slate-200 border-r">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                      {student.firstName[0]}{student.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{student.firstName} {student.lastName}</p>
                      <p className="text-[9px] font-bold text-slate-400">{student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-slate-200">
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'PRESENT', label: 'Present', color: 'emerald' },
                      { value: 'ABSENT', label: 'Absent', color: 'rose' },
                      { value: 'LATE', label: 'Late', color: 'amber' },
                      { value: 'HALF_DAY', label: 'Half Day', color: 'purple' },
                    ].map(option => {
                      const isActive = currentStatus === option.value;
                      const colorClasses = {
                        emerald: isActive ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600',
                        rose: isActive ? 'bg-rose-500 text-white border-rose-600' : 'bg-white text-slate-500 border-slate-200 hover:border-rose-300 hover:text-rose-600',
                        amber: isActive ? 'bg-amber-500 text-white border-amber-600' : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300 hover:text-amber-600',
                        purple: isActive ? 'bg-purple-500 text-white border-purple-600' : 'bg-white text-slate-500 border-slate-200 hover:border-purple-300 hover:text-purple-600',
                      }[option.color];

                      return (
                        <button
                          key={option.value}
                          disabled={isSubmitted}
                          onClick={() => onStatusChange(student.id, option.value)}
                          className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest border rounded-lg transition-all ${colorClasses} ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AttendanceGridView;