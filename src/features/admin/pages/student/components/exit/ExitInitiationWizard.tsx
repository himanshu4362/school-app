import React, { useState, useMemo } from 'react';
import { UserMinus, Search, Filter, CheckCircle2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { initiateExit } from '../../../../../../store/slices/studentExitSlice';

const MOCK_CLASSES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

interface Props {
  mockStudents: any[];
  exitRecords: Record<string, any>;
  onComplete: (studentId: string) => void;
}

export const ExitInitiationWizard: React.FC<Props> = ({ mockStudents, exitRecords, onComplete }) => {
  const dispatch = useDispatch();
  
  const [searchClass, setSearchClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [initStudentId, setInitStudentId] = useState('');
  const [initExitType, setInitExitType] = useState('TRANSFER_OUT');
  const [initEffectiveDate, setInitEffectiveDate] = useState('');

  // 🔴 Smart Filter: Filters by Class, then by Search Query (Name, Roll, Parent)
  const filteredWizardStudents = useMemo(() => {
    return mockStudents.filter(s => {
      if (exitRecords[s.id]) return false; // Hide if already exiting
      if (searchClass && s.classId !== searchClass) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || 
               s.rollNumber.toLowerCase().includes(q) || 
               s.parentName.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchClass, searchQuery, exitRecords, mockStudents]);

  const handleInitiate = () => {
    if (!initStudentId || !initEffectiveDate) return;
    dispatch(initiateExit({
      studentId: initStudentId, academicYearId: 'AY-2026-27', 
      exitType: initExitType as any, effectiveExitDate: initEffectiveDate, adminId: 'ADMIN-SUPER'
    }));
    onComplete(initStudentId);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto w-full pt-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4"><UserMinus size={32}/></div>
        <h2 className="text-2xl font-black text-slate-900">Initiate Student Exit</h2>
        <p className="text-sm font-bold text-slate-500 mt-1">Select a student to begin offboarding.</p>
      </div>

      <div className="space-y-6">
        {/* STEP 1: SMART LOCATOR */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Search size={14}/> Step 1: Locate Student</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Class Dropdown */}
            <select value={searchClass} onChange={e => {setSearchClass(e.target.value); setInitStudentId('');}} className="w-full md:w-1/3 p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
              <option value="">Select Class</option>
              {MOCK_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search by Name, Roll No, or Parent Name..." 
                value={searchQuery} 
                onChange={e => {setSearchQuery(e.target.value); setInitStudentId('');}} 
                className="w-full pl-10 pr-3 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl bg-white max-h-56 overflow-y-auto custom-scrollbar">
             {!searchClass && !searchQuery ? (
               <p className="text-xs font-bold text-slate-400 p-6 text-center">Select a class or type to search.</p>
             ) : filteredWizardStudents.length === 0 ? (
               <p className="text-xs font-bold text-rose-500 p-6 text-center">No active students match your search.</p>
             ) : (
               filteredWizardStudents.map(s => (
                 <div key={s.id} onClick={() => setInitStudentId(s.id)} className={`p-4 border-b border-slate-100 last:border-0 cursor-pointer flex justify-between items-center transition-colors ${initStudentId === s.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}>
                    <div>
                      <p className={`text-sm font-black flex items-center gap-2 ${initStudentId === s.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {s.name} <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Roll: {s.rollNumber}</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Sec {s.sectionId} • Parent: {s.parentName}
                      </p>
                    </div>
                    {initStudentId === s.id && <CheckCircle2 size={20} className="text-indigo-600"/>}
                 </div>
               ))
             )}
          </div>
        </div>

        {/* STEP 2: TAXONOMY */}
        <div className={`bg-slate-50 p-6 rounded-2xl border border-slate-200 transition-opacity ${!initStudentId ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Filter size={14}/> Step 2: Exit Taxonomy</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Exit Type</label>
              <select value={initExitType} onChange={e => setInitExitType(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"><option value="GRADUATION">🎓 Graduation (Passout)</option><option value="TRANSFER_OUT">🚚 Transfer Out</option><option value="DROPOUT">📉 Dropout</option><option value="EXPULSION">⛔ Expulsion (Legal Lock)</option></select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Effective Exit Date</label>
              <input type="date" value={initEffectiveDate} onChange={e => setInitEffectiveDate(e.target.value)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
            </div>
          </div>
        </div>

        <button onClick={handleInitiate} disabled={!initStudentId || !initEffectiveDate} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 shadow-lg transition-all">
          Trigger Exit Pipeline
        </button>
      </div>
    </div>
  );
};