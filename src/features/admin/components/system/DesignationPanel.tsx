import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Users, Plus, X, Save } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertDesignation } from '../../../../store/slices/systemConfigSlice';
import { DesignationSchema, Designation } from '../../../../types/core/systemConfig.schema';
import { createPortal } from 'react-dom';

const DesignationPanel: React.FC = () => {
    const dispatch = useDispatch();
    const designations = useSelector((state: RootState) => state.systemConfig.designations);
    const departments = useSelector((state: RootState) => state.systemConfig.departments);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<Designation>({
        resolver: zodResolver(DesignationSchema.omit({ id: true })) as any,
        defaultValues: { status: 'draft', hierarchyLevel: 1 }
    });

    const onSubmit = (data: Designation) => {
    const apiPayload = {
      title: data.title,
      departmentId: data.departmentId || null, // Null if General/Admin
      hierarchyLevel: data.hierarchyLevel,
      status: data.status || 'draft'
    };
    console.log(JSON.stringify(apiPayload, null, 2));

    const newDesig: Designation = { ...data, id: crypto.randomUUID() };
    dispatch(upsertDesignation(newDesig));
    setTimeout(() => { setIsDrawerOpen(false); reset(); }, 100);
  };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-black text-slate-900">Job Designations</h3>
                    <p className="text-xs font-bold text-slate-500">Define roles, hierarchy levels, and department mapping.</p>
                </div>
                <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm">
                    <Plus size={16} /> New Designation
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.values(designations).length === 0 ? (
                    <div className="col-span-full p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-bold text-sm">No Designations configured.</div>
                ) : (
                    Object.values(designations).map(desig => (
                        <div key={desig.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                            <div>
                                <h4 className="text-sm font-black text-slate-900">{desig.title}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Level: {desig.hierarchyLevel}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest truncate max-w-[120px]">
                                    {desig.departmentId ? departments[desig.departmentId]?.name || 'Unknown' : 'General / Admin'}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${desig.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{desig.status}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isDrawerOpen && createPortal (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[999] flex justify-end p-2 sm:p-4">
                    <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-right-8 flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50">
                            <h3 className="text-sm font-black text-slate-900">New Designation</h3>
                            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400"><X size={16} /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Job Title *</label>
                                <input {...register('title')} placeholder="e.g. Senior PGT Teacher" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold" />
                                {errors.title && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.title.message as string}</p>}
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Department Link (Optional)</label>
                                <select {...register('departmentId')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700">
                                    <option value="">-- General / Admin (No Dept) --</option>
                                    {Object.values(departments).map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Hierarchy Level (1-10) *</label>
                                <input type="number" {...register('hierarchyLevel', { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold" />
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-xs uppercase tracking-widest mt-4">Save Designation</button>
                        </form>
                    </div>
                </div>, 
                document.body
            )}
        </div>
    );
};

export default DesignationPanel;