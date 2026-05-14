import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDays, Plus, X, Save, CheckCircle2 } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertAcademicYear } from '../../../../store/slices/systemConfigSlice';
import { AcademicYearSchema } from '../../../../types/core/systemConfig.schema';
import api from '../../../../services/api';

const AcademicYearPanel: React.FC = () => {
  const dispatch = useDispatch();
  const years = useSelector((state: RootState) => state.systemConfig.academicYears);
  const globalCurrentYear = useSelector((state: RootState) => state.systemConfig.globalCurrentAcademicYearId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // We use 'any' temporarily in case your Zod schema still expects 'code'
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    // If your Zod schema still uses 'code', you may need to bypass the resolver temporarily
    // resolver: zodResolver(AcademicYearSchema.omit({ id: true })),
    defaultValues: { status: 'draft' }
  });

  const onSubmit = async (data: any) => {
    try {
      const apiPayload = {
        name: data.name, 
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        isActive: data.status === 'active'
      };

      const response = await api.post('/api/master-data/academic-years', apiPayload);
      
      const newYear = { ...response.data.data, id: response.data.data._id };
      dispatch(upsertAcademicYear(newYear));
      
      setIsDrawerOpen(false);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create Academic Year");
    }
  };

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-indigo-600" /> Academic Years
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Configure global timeline and terms.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={16} /> New Year
        </button>
      </div>

      {/* LIST SECTION */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {Object.values(years).map(year => (
          <div key={year.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">{year.name || (year as any).code}</h3>
                {year.id === globalCurrentYear && (
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 size={10} /> Active Now
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {new Date(year.startDate).toLocaleDateString()} — {new Date(year.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
               year.isActive || (year as any).status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
               (year as any).status === 'closed' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'
            }`}>
              {year.isActive || (year as any).status === 'active' ? 'Active' : (year as any).status || 'Draft'}
            </div>
          </div>
        ))}
        {Object.keys(years).length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
            <CalendarDays size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No academic years defined.</p>
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER (PORTAL) */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2"><Plus size={18} className="text-indigo-600" /> New Academic Year</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* 🟢 CHANGED TO NAME INSTEAD OF CODE */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year Name *</label>
                <input {...register('name', { required: "Name is required" })} placeholder="e.g. 2028-2029" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date *</label>
                  <input type="date" {...register('startDate', { required: "Start date is required" })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                  {errors.startDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.startDate.message as string}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">End Date *</label>
                  <input type="date" {...register('endDate', { required: "End date is required" })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                  {errors.endDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.endDate.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">System Status</label>
                <select {...register('status')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                  <option value="draft">Planning (Draft)</option>
                  <option value="active">Active (Current Year)</option>
                  <option value="closed">Closed (Archived)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
                <Save size={16} /> Save Year Configuration
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AcademicYearPanel;