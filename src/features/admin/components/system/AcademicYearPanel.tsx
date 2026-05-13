import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // 🔴 1. IMPORT CREATE PORTAL
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Plus, X, Save, CheckCircle2 } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertAcademicYear } from '../../../../store/slices/systemConfigSlice';
import { AcademicYearSchema, AcademicYear } from '../../../../types/core/systemConfig.schema';

const AcademicYearPanel: React.FC = () => {
  const dispatch = useDispatch();
  const years = useSelector((state: RootState) => state.systemConfig.academicYears);
  const globalCurrentYear = useSelector((state: RootState) => state.systemConfig.globalCurrentAcademicYearId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AcademicYear>({
    resolver: zodResolver(AcademicYearSchema.omit({ id: true })) as any,
    defaultValues: { status: 'draft' }
  });

  const onSubmit = (data: AcademicYear) => {
    const apiPayload = {
      code: data.code,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || 'draft'
    };
    console.log(JSON.stringify(apiPayload, null, 2));

    const newYear: AcademicYear = { ...data, id: crypto.randomUUID() };
    dispatch(upsertAcademicYear(newYear));
    setTimeout(() => { setIsDrawerOpen(false); reset(); }, 100);
  };

  const onError = (errors: any) => { console.warn("Form Validation Failed:", errors); };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ... Header and List (Keep your existing code here) ... */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900">Academic Years</h3>
          <p className="text-xs font-bold text-slate-500">The temporal backbone of the entire ERP.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition-all">
          <Plus size={16}/> New Academic Year
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Object.values(years).length === 0 ? (
          <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-sm">No Academic Years configured. System cannot operate.</div>
        ) : (
          Object.values(years).map(year => (
            <div key={year.id} className={`bg-white p-5 rounded-2xl border-2 transition-all flex justify-between items-center ${globalCurrentYear === year.id ? 'border-emerald-400 shadow-md' : 'border-slate-200'}`}>
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  {year.code} 
                  {globalCurrentYear === year.id && <span className="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1"><CheckCircle2 size={10}/> Active System Year</span>}
                </h4>
                <p className="text-xs font-bold text-slate-500 mt-1">{year.startDate} to {year.endDate}</p>
              </div>
              <span className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">{year.status}</span>
            </div>
          ))
        )}
      </div>

      {/* 🔴 2. WRAP THE DRAWER IN createPortal */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex justify-end p-2 sm:p-4">
          <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">New Academic Year</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={16}/></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6 flex-1 space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Year Code *</label>
                <input {...register('code')} placeholder="e.g. AY-2026-27" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:border-indigo-500"/>
                {errors.code && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.code.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Start Date *</label>
                  <input type="date" {...register('startDate')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                  {errors.startDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.startDate.message as string}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">End Date *</label>
                  <input type="date" {...register('endDate')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                  {errors.endDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.endDate.message as string}</p>}
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-6 hover:bg-indigo-700 transition-all">
                <Save size={16} className="inline mr-2"/> Save Year
              </button>
            </form>
          </div>
        </div>,
        document.body // 🔴 3. TELL IT TO RENDER ON THE DOCUMENT BODY
      )}
    </div>
  );
};

export default AcademicYearPanel;