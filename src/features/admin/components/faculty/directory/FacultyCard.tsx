import React from 'react';
import { FacultyEmployee } from '../../../../../types/faculty/directory.schema';
import { MoreVertical, Mail, Phone, BookOpen, UserCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { openProfile } from '../../../../../store/slices/facultyDirectorySlice';

const FacultyCard: React.FC<{ employee: FacultyEmployee }> = ({ employee }) => {
  const dispatch = useDispatch();

  const workloadColors = {
    balanced: 'bg-emerald-100 text-emerald-700',
    high_load: 'bg-amber-100 text-amber-700',
    critical: 'bg-rose-100 text-rose-700',
    underutilized: 'bg-blue-100 text-blue-700',
    unassigned: 'bg-slate-100 text-slate-500'
  };

  return (
    <div 
      onClick={() => dispatch(openProfile(employee.id))}
      className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm">
            {employee.profilePhoto ? (
              <img src={employee.profilePhoto} alt={employee.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300"><UserCircle size={32}/></div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
        </div>
        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical size={18}/></button>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{employee.fullName}</h3>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{employee.employeeId}</p>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
          <BookOpen size={14} className="text-indigo-400"/> {employee.primarySubject}
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600">
          <Mail size={14} className="text-slate-400"/> {employee.email}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Workload</span>
        <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${workloadColors[employee.workloadStatus]}`}>
          {employee.workloadStatus.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};

export default FacultyCard;