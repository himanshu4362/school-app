import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BookMarked, Users, ShieldAlert, X } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { clearAcademicErrors } from '../../../../store/slices/academicSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { SubjectManager } from '../../components/academic/SubjectManager';
import AllocationManager from '../../components/academic/AllocationManager';

const AcademicAdminHub: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<'SUBJECTS' | 'ALLOCATIONS'>('SUBJECTS');
  const { subjects, allocations, validationErrors } = useSelector((state: RootState) => state.academic);

  return (
    <AdminLayout pageTitle="Academic Command Center" pageDescription="Manage Master Subjects and allocate Faculty to Classes." breadcrumbs={[{ label: 'Academic Hub' }, { label: 'Subjects & Allocation' }]}>
      
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
          <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20}/>
          <div>
            <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Allocation Conflict</h4>
            <ul className="mt-1 space-y-1">{validationErrors.map((err, idx) => <li key={idx} className="text-xs font-bold text-rose-700">{err.message}</li>)}</ul>
          </div>
          <button onClick={() => dispatch(clearAcademicErrors())} className="ml-auto text-rose-400 hover:text-rose-700"><X size={20}/></button>
        </div>
      )}

      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button onClick={() => setActiveTab('SUBJECTS')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all ${activeTab === 'SUBJECTS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <BookMarked size={16}/> Master Subjects
        </button>
        <button onClick={() => setActiveTab('ALLOCATIONS')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 flex items-center gap-2 transition-all ${activeTab === 'ALLOCATIONS' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Users size={16}/> Faculty Allocations
        </button>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 h-[calc(100vh-220px)] overflow-y-auto custom-scrollbar">
        {activeTab === 'SUBJECTS' ? (
          <SubjectManager subjects={subjects} />
        ) : (
          <AllocationManager subjects={subjects} allocations={allocations} />
        )}
      </div>

    </AdminLayout>
  );
};

export default AcademicAdminHub;