import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Save, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertGrade } from '../../../../store/slices/systemConfigSlice';
import { GradeSchema } from '../../../../types/core/systemConfig.schema';
import api from '../../../../services/api';

const GradePanel: React.FC = () => {
  const dispatch = useDispatch();
  const grades = useSelector((state: RootState) => state.systemConfig.grades);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Using 'any' to cleanly bypass any strict Zod omissions temporarily while we wire the new fields
  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: { 
      admissionOpen: 'true', // HTML selects use strings
      level: 1,
      minAge: 4,
      maxAge: 7
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // 🟢 The exact payload your backend expects
      const apiPayload = {
        name: data.name,
        level: data.level,
        minAge: data.minAge,
        maxAge: data.maxAge,
        admissionOpen: data.admissionOpen === 'true' // Convert string to boolean
      };

      const response = await api.post('/api/master-data/grades', apiPayload);

      // Map _id from MongoDB to id for Redux
      const newGrade = { 
        ...response.data.data, 
        id: response.data.data._id 
      };
      
      dispatch(upsertGrade(newGrade));
      
      setIsDrawerOpen(false);
      reset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create Grade Configuration.");
    }
  };

  return (
    <div className="h-full flex flex-col relative animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="text-indigo-600" /> Academic Grades
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">Configure class levels, age limits, and admissions.</p>
        </div>
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
        >
          <Plus size={16} /> Add Grade
        </button>
      </div>

      {/* LIST SECTION */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-3">
        {Object.values(grades).sort((a, b) => a.level - b.level).map(grade => (
          <div key={grade.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-between items-center group hover:border-indigo-300 transition-all shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">{grade.name}</h3>
                <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest">
                  Level {grade.level}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-1">
                Age Target: {grade.minAge || 'N/A'} - {grade.maxAge || 'N/A'} yrs
              </p>
            </div>
            
            {/* Dynamic Admission Badge */}
            <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${
              grade.admissionOpen 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                : 'bg-rose-50 text-rose-600 border border-rose-100'
            }`}>
              {grade.admissionOpen ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {grade.admissionOpen ? 'Admissions Open' : 'Closed'}
            </div>
          </div>
        ))}

        {Object.keys(grades).length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 border-dashed rounded-3xl">
            <GraduationCap size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-500">No grades configured yet.</p>
          </div>
        )}
      </div>

      {/* SLIDE-OVER DRAWER (PORTAL) */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600" /> New Grade Config
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Grade Name *</label>
                  <input {...register('name', { required: true })} placeholder="e.g. Class 2" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                  {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">Required.</p>}
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Level *</label>
                  <input type="number" {...register('level', { valueAsNumber: true, required: true })} placeholder="1" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Minimum Age</label>
                  <input type="number" {...register('minAge', { valueAsNumber: true })} placeholder="4" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Maximum Age</label>
                  <input type="number" {...register('maxAge', { valueAsNumber: true })} placeholder="7" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Admission Window</label>
                <select {...register('admissionOpen')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 cursor-pointer">
                  <option value="true">Open (Accepting Applications)</option>
                  <option value="false">Closed</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-indigo-200">
                <Save size={16} /> Save Grade
              </button>

            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GradePanel;