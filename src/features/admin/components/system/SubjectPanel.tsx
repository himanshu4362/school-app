import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Save } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertSubject } from '../../../../store/slices/systemConfigSlice';
import { SubjectSchema, Subject } from '../../../../types/core/systemConfig.schema';

const SubjectPanel: React.FC = () => {
  const dispatch = useDispatch();
  const subjects = useSelector((state: RootState) => state.systemConfig.subjects);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Subject>({
    resolver: zodResolver(SubjectSchema.omit({ id: true })) as any,
    defaultValues: { status: 'draft' }
  });

  const onSubmit = (data: Subject) => {
    const newSubject: Subject = { ...data, id: crypto.randomUUID() };
    dispatch(upsertSubject(newSubject));
    setTimeout(() => { setIsDrawerOpen(false); reset(); }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900">Subject Master Data</h3>
          <p className="text-xs font-bold text-slate-500">Define global subjects before mapping to curriculums.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
          <Plus size={16}/> New Subject
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.values(subjects).length === 0 ? (
          <div className="col-span-full p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-sm">No Subjects configured.</div>
        ) : (
          Object.values(subjects).map(sub => (
            <div key={sub.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
              <h4 className="text-sm font-black text-slate-900">{sub.name}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-3">{sub.code}</p>
              <div className="mt-auto pt-3 border-t border-slate-100">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{sub.status}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {isDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex justify-end p-2 sm:p-4">
          <div className="bg-white w-full max-w-sm h-full shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 flex flex-col">
            
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">Register Subject</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject Code *</label>
                <input {...register('code')} placeholder="e.g. MAT-101" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:border-indigo-500"/>
                {errors.code && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.code.message as string}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Subject Name *</label>
                <input {...register('name')} placeholder="e.g. Advanced Mathematics" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message as string}</p>}
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-4 hover:bg-indigo-700 transition-colors">
                <Save size={16} className="inline mr-2"/> Save Subject
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPanel;