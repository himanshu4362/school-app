import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Users, Save, Trash2, CalendarClock } from 'lucide-react';
import { allocateFaculty, removeAllocation } from '../../../../store/slices/academicSlice';
import { Subject, FacultyAllocation } from '../../../../types/academic/academic.schema';

interface Props {
  subjects: Record<string, Subject>;
  allocations: FacultyAllocation[];
}

const ACTIVE_FACULTY = [
  { id: 'EMP-001', firstName: 'Ravi', lastName: 'Verma', departmentId: 'Science' },
  { id: 'EMP-002', firstName: 'Anita', lastName: 'Desai', departmentId: 'Mathematics' },
  { id: 'EMP-003', firstName: 'John', lastName: 'Smith', departmentId: 'English' },
];
const ACTIVE_GRADES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const ACTIVE_SECTIONS = ['A', 'B', 'Science', 'Commerce'];

const AllocationManager: React.FC<Props> = ({ subjects, allocations }) => {
  const dispatch = useDispatch();
  
  const [facultyId, setFacultyId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [periods, setPeriods] = useState<number | ''>(6);

  const handleAllocate = () => {
    if (!facultyId || !subjectId || !classId || !sectionId || !periods) return;
    dispatch(allocateFaculty({
      facultyId, subjectId, classId, sectionId, academicYearId: 'AY-2026-27', periodsPerWeek: Number(periods)
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in">
      <div className="lg:col-span-4 bg-emerald-50 p-6 rounded-2xl border border-emerald-200 h-fit">
        <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2 mb-6">
          <Users size={16}/> Assign Faculty
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5 block">Select Teacher</label>
            <select value={facultyId} onChange={e => setFacultyId(e.target.value)} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
              <option value="">-- Choose Faculty --</option>
              {ACTIVE_FACULTY.map(f => <option key={f.id} value={f.id}>{f.firstName} {f.lastName} ({f.departmentId})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5 block">Select Subject</label>
            <select value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
              <option value="">-- Choose Subject --</option>
              {Object.values(subjects).map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5 block">Class</label>
              <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
                <option value="">Class</option>
                {ACTIVE_GRADES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5 block">Section</label>
              <select value={sectionId} onChange={e => setSectionId(e.target.value)} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500">
                <option value="">Section</option>
                {ACTIVE_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1.5 block">Periods Per Week</label>
            <input type="number" min="1" max="15" value={periods} onChange={e => setPeriods(parseInt(e.target.value))} className="w-full p-3 bg-white border border-emerald-200 rounded-xl text-sm font-bold outline-none focus:border-emerald-500"/>
          </div>
          <button onClick={handleAllocate} disabled={!facultyId || !subjectId || !classId || !sectionId} className="w-full bg-emerald-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-sm">
             <Save size={16}/> Lock Allocation
          </button>
        </div>
      </div>

      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50"><h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Faculty Allocations</h3></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="bg-white sticky top-0 shadow-sm ring-1 ring-slate-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Faculty</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Placement</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Periods</th>
                <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allocations.length === 0 ? (
                <tr><td colSpan={5} className="p-12 text-center text-slate-400"><CalendarClock size={32} className="mx-auto mb-3 opacity-20"/><p className="text-sm font-bold">No faculty allocated yet.</p></td></tr>
              ) : (
                allocations.map(alloc => {
                  const teacher = ACTIVE_FACULTY.find(f => f.id === alloc.facultyId);
                  const subject = subjects[alloc.subjectId];
                  return (
                    <tr key={alloc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4"><p className="text-sm font-black text-slate-900">{teacher?.firstName} {teacher?.lastName}</p><p className="text-[10px] font-bold text-slate-500 uppercase">{teacher?.departmentId}</p></td>
                      <td className="p-4"><p className="text-xs font-bold text-slate-900">{subject?.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase">{subject?.code}</p></td>
                      <td className="p-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-[10px] font-black uppercase tracking-widest">{alloc.classId} - {alloc.sectionId}</span></td>
                      <td className="p-4 text-center font-black text-slate-700">{alloc.periodsPerWeek} / wk</td>
                      <td className="p-4 text-right"><button onClick={() => dispatch(removeAllocation(alloc.id))} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button></td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllocationManager;