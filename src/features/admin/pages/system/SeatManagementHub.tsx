import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, PieChart, Plus, X, Save, AlertCircle, TrendingUp, Users } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { clearSeatErrors, upsertSeatPolicy } from '../../../../store/slices/seatSlice';
import { GradeSeatPolicySchema, GradeSeatPolicy } from '../../../../types/admission/seats.schema';
import { selectLiveGradeInventory } from '../../../../store/selectors/seatSelectors';
import AdminLayout from '../../components/layout/AdminLayout';

// ==========================================
// COMPONENT: Individual Grade Inventory Card
// (Separated so we can safely use the Redux Selector per policy)
// ==========================================
const GradeInventoryCard: React.FC<{ policy: GradeSeatPolicy }> = ({ policy }) => {
    const grades = useSelector((state: RootState) => state.systemConfig.grades);
    const gradeName = grades[policy.gradeId]?.name || 'Unknown Grade';

    // 🔥 THE MAGIC: Calling our Live Inventory Engine
    const liveStats = useSelector(selectLiveGradeInventory(policy.gradeId, policy.academicYearId));

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h4 className="text-lg font-black text-slate-900">{gradeName}</h4>
                    <span className="px-2.5 py-1 mt-2 inline-block rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700">
                        {policy.status} Policy
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Limit</p>
                    <p className="text-2xl font-black text-slate-800">{liveStats.totalPhysicalCapacity} <span className="text-sm text-slate-400">Seats</span></p>
                </div>
            </div>

            {/* Quota Breakdown */}
            <div className="space-y-3 mb-6 flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Configured Quotas</p>
                {policy.quotas.map((q, i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-bold text-slate-700 flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-indigo-400' : 'bg-rose-400'}`} />
                            {q.name} {q.isSpilloverAllowed && <span className="text-[9px] text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">(Spillover)</span>}
                        </span>
                        <span className="font-black text-slate-900">{q.reservedSeats}</span>
                    </div>
                ))}
            </div>

            {/* Live Transactional Status */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500">Live Escrow State</span>
                    <Users size={14} className="text-slate-400" />
                </div>
                <div className="flex gap-4">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Soft-Locked</p>
                        <p className="text-sm font-black text-amber-600">{liveStats.currentlyReserved}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Consumed</p>
                        <p className="text-sm font-black text-indigo-600">{liveStats.currentlyConsumed}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


// ==========================================
// MAIN HUB COMPONENT
// ==========================================
const SeatManagementHub: React.FC = () => {
    const dispatch = useDispatch();

    // Data for the Dropdowns & Dashboard
    const { academicYears, grades, sections } = useSelector((state: RootState) => state.systemConfig);
    const { policies, validationErrors } = useSelector((state: RootState) => state.seats);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Form Setup
    const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<GradeSeatPolicy>({
        resolver: zodResolver(GradeSeatPolicySchema.omit({ id: true })) as any,
        defaultValues: {
            status: 'draft',
            quotas: [
                { id: crypto.randomUUID(), name: 'General', reservedSeats: 0, isSpilloverAllowed: false },
                { id: crypto.randomUUID(), name: 'RTE (Legal)', reservedSeats: 0, isSpilloverAllowed: false },
                { id: crypto.randomUUID(), name: 'Management', reservedSeats: 0, isSpilloverAllowed: true }
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({ control, name: "quotas" });

    // Watchers to calculate live physical capacity dynamically in the form!
    const watchYear = watch('academicYearId');
    const watchGrade = watch('gradeId');
    const watchQuotas = watch('quotas');

    // Dynamically calculate the physical capacity while they fill the form
    const activePhysicalCapacity = Object.values(sections)
        .filter(s => s.gradeId === watchGrade && s.academicYearId === watchYear && s.status !== 'closed')
        .reduce((sum, sec) => sum + sec.maxCapacity, 0);

    const totalAllocated = (watchQuotas || []).reduce((sum, q) => sum + (Number(q.reservedSeats) || 0), 0);

    const onSubmit = (data: GradeSeatPolicy) => {
        // 🔴 THE GOLDEN ERP RULE: Validate allocations against physical reality
        if (totalAllocated > activePhysicalCapacity) {
            alert(`SYSTEM GUARD: You cannot allocate ${totalAllocated} seats. The physical rooms for this grade only hold ${activePhysicalCapacity} students.`);
            return;
        }

        // Add unique IDs to the quotas and the policy
        const newPolicy: GradeSeatPolicy = {
            ...data,
            id: crypto.randomUUID(),
            quotas: data.quotas.map(q => ({ ...q, id: crypto.randomUUID() }))
        };

        dispatch(upsertSeatPolicy(newPolicy));
        setIsDrawerOpen(false);
        reset();
    };

    return (
        <AdminLayout
            pageTitle="Seat & Quota Management"
            pageDescription="Govern admissions inventory, legal quotas, and physical capacities."
            breadcrumbs={[{ label: 'System Config' }, { label: 'Seat Management' }]}
        >
            {/* ERROR BANNER */}
            {validationErrors?.length > 0 && (
                <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm">
                    <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                    <div className="flex-1">
                        <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-1">Policy Blocked</h4>
                        <ul className="list-disc pl-4 space-y-1">
                            {validationErrors.map((err, i) => (
                                <li key={i} className="text-sm font-bold text-rose-700">{err.message}</li>
                            ))}
                        </ul>
                    </div>
                    <button onClick={() => dispatch(clearSeatErrors())} className="text-rose-400 hover:text-rose-700 bg-white p-1 rounded-lg"><X size={16} /></button>
                </div>
            )}

            {/* HEADER ACTION */}
            <div className="flex justify-end mb-6">
                <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-indigo-700 shadow-md">
                    <Shield size={18} /> Define New Grade Policy
                </button>
            </div>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.values(policies).length === 0 ? (
                    <div className="col-span-full py-20 border-2 border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center">
                        <PieChart size={48} className="text-slate-300 mb-4" />
                        <h3 className="text-lg font-black text-slate-900">No Inventory Policies Active</h3>
                        <p className="text-sm font-bold text-slate-500 mt-2 max-w-md">Admissions cannot proceed without a defined seat ledger. Click above to allocate your physical capacities.</p>
                    </div>
                ) : (
                    Object.values(policies).map(policy => (
                        <GradeInventoryCard key={policy.id} policy={policy} />
                    ))
                )}
            </div>

            {/* POLICY CREATOR MODAL (Using Portals for 100% overlay) */}
            {isDrawerOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex justify-end p-2 sm:p-4">
                    <div className="bg-white w-full max-w-lg h-full shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-8">

                        <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50 items-center">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><Shield size={16} className="text-indigo-600" /> Policy Engine</h3>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex-1 overflow-y-auto space-y-6">

                            {/* Core Assignments */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year *</label>
                                    <select {...register('academicYearId')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold">
                                        <option value="">Select Year...</option>
                                        {Object.values(academicYears).map(y => <option key={y.id} value={y.id}>{y.code}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Target Grade *</label>
                                    <select {...register('gradeId')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold">
                                        <option value="">Select Grade...</option>
                                        {Object.values(grades).map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* DYNAMIC REALITY CHECK (The ERP Magic) */}
                            {watchYear && watchGrade && (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4">
                                    <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600"><TrendingUp size={24} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Physical Room Limit</p>
                                        <p className="text-xl font-black text-indigo-900">
                                            {activePhysicalCapacity} <span className="text-sm">Seats Available</span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* QUOTA BUILDER */}
                            <div>
                                <div className="flex justify-between items-end mb-3 border-b border-slate-100 pb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocation Matrix</label>
                                    <span className={`text-xs font-black ${totalAllocated > activePhysicalCapacity ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {totalAllocated} / {activePhysicalCapacity} Allocated
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="flex-1">
                                                <input {...register(`quotas.${index}.name`)} placeholder="Quota Name" className="w-full bg-transparent text-sm font-bold outline-none" />
                                            </div>
                                            <div className="w-24">
                                                <input type="number" {...register(`quotas.${index}.reservedSeats`, { valueAsNumber: true })} placeholder="Seats" className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-center" />
                                            </div>
                                            <button type="button" onClick={() => remove(index)} className="text-slate-400 hover:text-rose-500"><X size={16} /></button>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => append({ id: crypto.randomUUID(), name: 'New Quota', reservedSeats: 0, isSpilloverAllowed: false })}
                                    className="mt-3 text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-800 flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add Quota Row
                                </button>
                            </div>

                            <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
                                <Save size={18} /> Enact Policy
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