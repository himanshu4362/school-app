import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { CalendarDays, Plus, X, Save, Pencil, CheckCircle2, Loader2 } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertAcademicYear } from '../../../../store/slices/systemConfigSlice';
import api from '../../../../services/api';

type AcademicYearFormData = {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const AcademicYearPanel: React.FC = () => {
  const dispatch = useDispatch();
  const years = useSelector((state: RootState) => state.systemConfig.academicYears);
  const globalCurrentYear = useSelector((state: RootState) => state.systemConfig.globalCurrentAcademicYearId);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AcademicYearFormData>({
    defaultValues: { isActive: false }
  });

  const openCreate = () => {
    setEditId(null);
    setApiError(null);
    reset({ name: '', startDate: '', endDate: '', isActive: false });
    setIsDrawerOpen(true);
  };

  const openEdit = (year: any) => {
    setEditId(year.id);
    setApiError(null);
    reset({
      name: year.name,
      startDate: year.startDate?.split('T')[0] || '',
      endDate: year.endDate?.split('T')[0] || '',
      isActive: year.isActive,
    });
    setIsDrawerOpen(true);
  };

  const onSubmit = async (data: AcademicYearFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const apiPayload = {
        name: data.name,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        isActive: data.isActive,
      };

      let response;
      if (editId) {
        response = await api.put(`/api/master-data/academic-years/${editId}`, apiPayload);
      } else {
        response = await api.post('/api/master-data/academic-years', apiPayload);
      }

      const saved = { ...response.data.data, id: response.data.data._id || response.data.data.id };
      dispatch(upsertAcademicYear(saved));

      setIsDrawerOpen(false);
      reset();
    } catch (error: any) {
      setApiError(error.response?.data?.message || "Operation failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedYears = Object.values(years).sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-300">

      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="text-indigo-600" /> Academic Years
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Configure global timeline and terms.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={16} /> New Year
        </button>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {sortedYears.map(year => (
          <div key={year.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">{year.name}</h3>
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
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                year.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}>
                {year.isActive ? 'Active' : 'Inactive'}
              </div>
              <button
                onClick={() => openEdit(year)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Pencil size={14} />
              </button>
            </div>
          </div>
        ))}
        {sortedYears.length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
            <CalendarDays size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No academic years defined.</p>
          </div>
        )}
      </div>

      {/* DRAWER */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => !isSubmitting && setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                {editId ? <Pencil size={18} className="text-indigo-600" /> : <Plus size={18} className="text-indigo-600" />}
                {editId ? 'Edit Academic Year' : 'New Academic Year'}
              </h3>
              <button onClick={() => !isSubmitting && setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">

              {/* ERROR BANNER */}
              {apiError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm font-bold text-rose-700 flex items-start gap-2">
                  <X size={14} className="shrink-0 mt-0.5 cursor-pointer hover:text-rose-900" onClick={() => setApiError(null)} />
                  {apiError}
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year Name *</label>
                <input
                  {...register('name', { required: "Name is required" })}
                  placeholder="e.g. 2025-2026"
                  inputMode="text"
                  className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                />
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Start Date *</label>
                  <input
                    type="date"
                    {...register('startDate', { required: "Start date is required" })}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                  {errors.startDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">End Date *</label>
                  <input
                    type="date"
                    {...register('endDate', { required: "End date is required" })}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                  />
                  {errors.endDate && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-sm font-black text-slate-900">Set as Active Year</span>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">Activating this will deactivate all other academic years.</p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSubmitting ? 'Saving...' : (editId ? 'Update Year' : 'Save Year Configuration')}
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