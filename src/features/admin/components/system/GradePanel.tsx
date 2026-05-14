import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertGrade } from '../../../../store/slices/systemConfigSlice';
import { GradeSchema, Grade } from '../../../../types/core/systemConfig.schema';
import { createPortal } from 'react-dom';
import api from '../../../../services/api';

const GradePanel: React.FC = () => {
  const dispatch = useDispatch();
  const grades = useSelector((state: RootState) => state.systemConfig.grades);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

const { register, handleSubmit, reset, formState: { errors } } = useForm<Grade>({
    resolver: zodResolver(GradeSchema.omit({ id: true })) as any,
    defaultValues: { status: 'draft' }
  });

  const onError = (errors: any) => {
    console.warn("Form Validation Failed:", errors);
  };

const onSubmit = async (data: Grade) => {
    try {
        const response = await api.post('http://localhost:5000/api/master-data/grades', {
            name: data.name,
            level: data.level,
            admissionOpen: true // Or whatever your default is
        });

        const newGrade = { ...response.data.data, id: response.data.data._id };
        dispatch(upsertGrade(data));
        setIsDrawerOpen(false);
        reset();
    } catch (error: any) {
        alert(error.response?.data?.message || "Failed to create Grade");
    }
};
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900">Academic Grades</h3>
          <p className="text-xs font-bold text-slate-500">Configure academic levels and curriculums.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Grade
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Object.values(grades).length === 0 ? (
          <div className="col-span-full p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-sm">No Grades configured.</div>
        ) : (
          Object.values(grades).map(grade => (
            <div key={grade.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl mb-3">{grade.level}</div>
              <h4 className="text-sm font-black text-slate-900 mb-1">{grade.name}</h4>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${grade.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{grade.status}</span>
            </div>
          ))
        )}
      </div>

      {isDrawerOpen && createPortal (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex justify-end p-2 sm:p-4">
          <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">Configure Grade</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Grade Name *</label>
                <input {...register('name')} placeholder="e.g. Class 10" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold" />
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message as string}</p>}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Hierarchy Level (Number) *</label>
                <input type="number" {...register('level', { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold" />
                <p className="text-[9px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Used for promotion calculations.</p>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-4">Save Grade</button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default GradePanel;