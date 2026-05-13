import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Lock } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertSection, attemptCloseSection } from '../../../../store/slices/systemConfigSlice';
import { SectionSchema, Section } from '../../../../types/core/systemConfig.schema';
import { createPortal } from 'react-dom';

const SectionPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { sections, rooms, academicYears, grades } = useSelector((state: RootState) => state.systemConfig);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Section>({
    resolver: zodResolver(SectionSchema.omit({ id: true })) as any,
    defaultValues: { status: 'draft', maxCapacity: 40 }
  });

  const onSubmit = (data: Section) => {
    const apiPayload = {
      academicYearId: data.academicYearId,
      gradeId: data.gradeId,
      name: data.name,
      roomId: data.roomId || null,
      maxCapacity: data.maxCapacity,
      status: data.status || 'draft'
    };
    console.log(JSON.stringify(apiPayload, null, 2));

    const newSec: Section = { ...data, id: crypto.randomUUID() };
    dispatch(upsertSection(newSec));
    setTimeout(() => { setIsDrawerOpen(false); reset(); }, 100);
  };

  const onError = (errors: any) => {
    console.warn("Section Form Validation Failed:", errors);
  };

  const handleCloseSection = (id: string) => {
    dispatch(attemptCloseSection({ sectionId: id, activeStudentCount: 0 }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-black text-slate-900">Sections & Classrooms</h3>
          <p className="text-xs font-bold text-slate-500">Physical and operational student cohorts.</p>
        </div>
        <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
          <Plus size={16} /> New Section
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.values(sections).length === 0 ? (
          <div className="col-span-full p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-sm">No Sections configured yet.</div>
        ) : (
          Object.values(sections).map(sec => {
             const gradeName = grades[sec.gradeId]?.name || sec.gradeId;
             const roomName = sec.roomId ? (rooms[sec.roomId]?.roomNumber || sec.roomId) : 'Unassigned';

             return (
              <div key={sec.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{gradeName} - {sec.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Capacity: {sec.maxCapacity} | Room: {roomName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${sec.status === 'active' ? 'bg-emerald-100 text-emerald-700' : (sec.status === 'closed' ? 'bg-slate-800 text-slate-300' : 'bg-amber-100 text-amber-700')}`}>
                    {sec.status}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                  {sec.status !== 'closed' && (
                    <button onClick={() => handleCloseSection(sec.id)} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 transition-all flex items-center gap-1">
                      <Lock size={12} /> Close Section
                    </button>
                  )}
                </div>
              </div>
             )
          })
        )}
      </div>

      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex justify-end p-2 sm:p-4">
          <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
              <h3 className="text-sm font-black text-slate-900">Configure New Section</h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6 flex-1 overflow-y-auto space-y-5">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Academic Year Scope *</label>
                <select {...register('academicYearId')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold">
                  <option value="">Select Year...</option>
                  {Object.values(academicYears).map(year => (
                    <option key={year.id} value={year.id}>{year.code}</option>
                  ))}
                </select>
                {errors.academicYearId && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.academicYearId.message as string}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Grade *</label>
                  <select {...register('gradeId')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold">
                    <option value="">Select Grade...</option>
                    {Object.values(grades).map(grade => (
                      <option key={grade.id} value={grade.id}>{grade.name}</option>
                    ))}
                  </select>
                  {errors.gradeId && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.gradeId.message as string}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">Section Name *</label>
                  <input {...register('name')} placeholder="e.g. A" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold uppercase" />
                  {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message as string}</p>}
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-4">
                <div>
                  <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 block">Physical Room Assignment</label>
                  <select {...register('roomId')} className="w-full p-3 bg-white border-2 border-amber-100 rounded-xl text-sm font-bold">
                    <option value="">-- No Room Assigned --</option>
                    {Object.values(rooms).map(room => (
                      <option key={room.id} value={room.id}>Room {room.roomNumber} (Cap: {room.capacity})</option>
                    ))}
                  </select>
                  <p className="text-[9px] text-amber-600 mt-1 font-bold">Assigning a room limits max capacity automatically.</p>
                </div>
                <div>
                  <label className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1.5 block">Max Capacity Target</label>
                  <input type="number" {...register('maxCapacity', { valueAsNumber: true })} className="w-full p-3 bg-white border-2 border-amber-100 rounded-xl text-sm font-bold" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-4">Save & Validate</button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SectionPanel;