import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { BookOpen, Save, Search } from 'lucide-react';
import { addSubject } from '../../../../store/slices/academicSlice';
import { Subject, SubjectTypeEnum } from '../../../../types/academic/academic.schema';

interface Props {
  subjects: Record<string, Subject>;
}

export const SubjectManager: React.FC<Props> = ({ subjects }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<Subject['type']>('THEORY');

  const handleSave = () => {
    if (!code || !name) return;
    dispatch(addSubject({ id: crypto.randomUUID(), code, name, type }));
    setCode(''); setName(''); setType('THEORY');
  };

  const filteredSubjects = Object.values(subjects).filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
      <div className="lg:col-span-1 bg-slate-50 p-6 rounded-2xl border border-slate-200 h-fit">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
          <BookOpen size={16} className="text-indigo-600"/> Add Subject
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject Code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="e.g. PHY-101" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none uppercase"/>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Physics" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"/>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none">
              <option value="THEORY">Theory</option><option value="PRACTICAL">Practical</option><option value="LAB">Laboratory</option><option value="CO_SCHOLASTIC">Co-Scholastic</option>
            </select>
          </div>
          <button onClick={handleSave} disabled={!code || !name} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2">
             <Save size={16}/> Save Subject
          </button>
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Master Subject Registry</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2 text-slate-400" size={14} />
            <input type="text" placeholder="Search code or name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"/>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar h-[400px]">
          {filteredSubjects.map(s => (
            <div key={s.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center shrink-0 font-black text-[10px]">{s.code.split('-')[0]}</div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">{s.name}</h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Code: {s.code}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${s.type === 'THEORY' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{s.type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};