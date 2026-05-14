import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { Shield, PieChart, Plus, X, Save, Layers } from 'lucide-react';

import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';
import api from '../../../../services/api';

// 🟢 Import the Redux setters to populate the dropdowns
import { setAcademicYears, setGrades, setSections } from '../../../../store/slices/systemConfigSlice';

const SeatManagementHub: React.FC = () => {
    const dispatch = useDispatch();
    const { academicYears, grades, sections } = useSelector((state: RootState) => state.systemConfig);
    const globalCurrentYear = useSelector((state: RootState) => state.systemConfig.globalCurrentAcademicYearId);
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [liveInventories, setLiveInventories] = useState<any[]>([]);

    // 🟢 FETCH EVERYTHING ON LOAD (Bulletproof Hydration)
    const fetchAllData = async () => {
        try {
            const [yearsRes, gradesRes, sectionsRes, seatsRes] = await Promise.all([
                api.get('/api/master-data/academic-years'),
                api.get('/api/master-data/grades'),
                api.get('/api/master-data/sections'),
                api.get('/api/master-data/seats')
            ]);

            // Populate Redux so the dropdowns have data!
            if (yearsRes.data.success) dispatch(setAcademicYears(yearsRes.data.data));
            if (gradesRes.data.success) dispatch(setGrades(gradesRes.data.data));
            if (sectionsRes.data.success) dispatch(setSections(sectionsRes.data.data));

            // Populate the live dashboard cards
            if (seatsRes.data.success) setLiveInventories(seatsRes.data.data);
            
        } catch (error) {
            console.error("Failed to load seat management dependencies", error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [dispatch]);

    // Form Setup
    const { register, handleSubmit, control, watch, reset } = useForm<any>({
        defaultValues: {
            academicYearId: globalCurrentYear || '',
            gradeId: '',
            sectionId: '',
            allowSpillover: true,
            quotas: [
                { id: crypto.randomUUID(), name: 'GENERAL', reservedSeats: 20 },
                { id: crypto.randomUUID(), name: 'OBC', reservedSeats: 10 },
                { id: crypto.randomUUID(), name: 'SC', reservedSeats: 5 },
                { id: crypto.randomUUID(), name: 'ST', reservedSeats: 2 },
                { id: crypto.randomUUID(), name: 'EWS', reservedSeats: 3 }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "quotas" });

    // Dynamic Watchers
    const watchYear = watch('academicYearId');
    const watchGrade = watch('gradeId');
    const watchSection = watch('sectionId');
    const watchQuotas = watch('quotas') || [];

    // Filter Sections based on selected Year & Grade
    const availableSections = Object.values(sections).filter(
        sec => sec.academicYearId === watchYear && sec.gradeId === watchGrade
    );

    // Calculate Physical Balance
    const selectedSectionData = watchSection ? sections[watchSection] : null;
    const activePhysicalCapacity = selectedSectionData?.targetCapacity || 0;
    
    const totalAllocated = watchQuotas.reduce((sum: number, q: any) => sum + (Number(q.reservedSeats) || 0), 0);
    const remaining = activePhysicalCapacity - totalAllocated;

    // SUBMIT HANDLER
    const onSubmit = async (data: any) => {
        if (!selectedSectionData) return alert("Please select a valid section.");

        if (totalAllocated !== activePhysicalCapacity) {
            return alert(`QUOTA MISMATCH: You allocated ${totalAllocated} seats, but Section ${selectedSectionData.name} only has ${activePhysicalCapacity} capacity. They must match perfectly!`);
        }

        const quotaMap: Record<string, any> = {};
        data.quotas.forEach((q: any) => {
            if (q.name && q.reservedSeats >= 0) {
                quotaMap[q.name.toUpperCase()] = { capacity: Number(q.reservedSeats) };
            }
        });

        try {
            const apiPayload = {
                academicYearId: data.academicYearId,
                gradeId: data.gradeId,
                sectionId: data.sectionId,
                allowSpillover: data.allowSpillover,
                quotas: quotaMap
            };

            await api.post('/api/master-data/seats', apiPayload);

            alert("Seat Inventory Policy Enacted Successfully!");
            setIsDrawerOpen(false);
            reset();
            fetchAllData(); // Refresh cards
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to enact seat policy.");
        }
    };

    return (
        <AdminLayout pageTitle="Seat & Quota Engine" pageDescription="Define category-wise reservations and capacities based on physical constraints.">
            
            <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 min-w-[220px]">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><PieChart size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Inventories</p>
                            <h3 className="text-2xl font-black text-slate-900">{liveInventories.length} Configured</h3>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsDrawerOpen(true)} className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-900/20">
                    <Plus size={16} /> New Policy
                </button>
            </div>

            {/* LIVE INVENTORY DISPLAY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {liveInventories.map(inv => {
                    const sec = sections[inv.sectionId];
                    const grade = grades[inv.gradeId];
                    const year = academicYears[inv.academicYearId];

                    return (
                        <div key={inv._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Layers size={14} className="text-indigo-500" />
                                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-md">
                                            {year?.name || 'Unknown Year'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900">{grade?.name || 'Unknown Grade'} - {sec?.name || 'Sec'}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Cap</p>
                                    <p className="text-lg font-black text-slate-900">{inv.totalCapacity}</p>
                                </div>
                            </div>

                            <div className="space-y-2 mt-auto">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-2">Quota Breakdown</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(inv.quotas).map(([category, data]: [string, any]) => {
                                        if (data.capacity === 0) return null;
                                        return (
                                            <div key={category} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <span className="text-xs font-black text-slate-600 uppercase">{category}</span>
                                                <span className="text-xs font-bold text-slate-900">{data.capacity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {liveInventories.length === 0 && (
                <div className="text-center py-20 bg-white border border-slate-200 border-dashed rounded-3xl">
                    <Shield size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-black text-slate-900">No Seat Inventories Configured</h3>
                    <p className="text-sm font-bold text-slate-500 mt-1">Click "New Policy" to bind quotas to your sections.</p>
                </div>
            )}

            {/* SLIDE-OVER DRAWER (PORTAL) */}
            {isDrawerOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex justify-end">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
                    <div className="relative w-full max-w-lg bg-slate-50 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-black text-slate-900 flex items-center gap-2"><Shield size={18} className="text-indigo-600" /> Seat Allocation Matrix</h3>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">
                            
                            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year *</label>
                                    <select {...register('academicYearId', { required: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                                        <option value="">Select Year...</option>
                                        {Object.values(academicYears).map(year => <option key={year.id} value={year.id}>{year.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Grade *</label>
                                        <select {...register('gradeId', { required: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                                            <option value="">Select Grade...</option>
                                            {Object.values(grades).map(grade => <option key={grade.id} value={grade.id}>{grade.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        {/* 🟢 SMART PLACEHOLDER LOGIC */}
                                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5 block">Target Section *</label>
                                        <select {...register('sectionId', { required: true })} disabled={!watchGrade || !watchYear} className="w-full p-3 bg-indigo-50 border-2 border-indigo-100 rounded-xl text-sm font-bold text-indigo-900 outline-none focus:border-indigo-500 disabled:opacity-50">
                                            <option value="">
                                                {!watchYear ? 'Select Year first...' : !watchGrade ? 'Select Grade first...' : availableSections.length === 0 ? 'No Sections Found' : 'Select Section...'}
                                            </option>
                                            {availableSections.map(sec => <option key={sec.id} value={sec.id}>{sec.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-5 rounded-2xl border-2 transition-colors ${watchSection ? 'bg-white border-indigo-100' : 'bg-slate-100 border-slate-200 opacity-60 pointer-events-none'}`}>
                                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                                    <PieChart size={14} className="text-indigo-500" /> Category Distribution
                                </h4>
                                
                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex gap-3 items-center">
                                            <div className="flex-1">
                                                <input {...register(`quotas.${index}.name`)} placeholder="Category (e.g. GENERAL, OBC)" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold uppercase outline-none focus:border-indigo-500" />
                                            </div>
                                            <div className="w-24">
                                                <input type="number" {...register(`quotas.${index}.reservedSeats`, { valueAsNumber: true })} placeholder="Seats" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-center outline-none focus:border-indigo-500" />
                                            </div>
                                            <button type="button" onClick={() => remove(index)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>

                                <button type="button" onClick={() => append({ id: crypto.randomUUID(), name: '', reservedSeats: 0 })} className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 flex items-center gap-1 p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <Plus size={12} /> Add Quota Category
                                </button>

                                <div className="mt-6 p-4 rounded-xl bg-slate-900 text-white">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Section Target Capacity</span>
                                        <span className="text-sm font-black">{activePhysicalCapacity} Seats</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Allocation Balance</span>
                                        <span className={`text-lg font-black ${remaining === 0 ? 'text-emerald-400' : remaining < 0 ? 'text-rose-400' : 'text-amber-400'}`}>
                                            {remaining === 0 ? 'Balanced' : remaining < 0 ? `Over by ${Math.abs(remaining)}` : `${remaining} Seats Unallocated`}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button type="submit" disabled={!watchSection || remaining !== 0} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Save size={18} /> Enact Seat Policy
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </AdminLayout>
    );
};

export default SeatManagementHub;