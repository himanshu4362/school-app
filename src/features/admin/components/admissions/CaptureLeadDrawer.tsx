import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { closeLeadDrawer, addLead, updateLeadInStore } from '../../../../store/slices/admissionSlice';
import { X, User, Phone, BookOpen, MessageSquare, Loader2, Save } from 'lucide-react';
import api from '../../../../services/api';

//   ZOD VALIDATION: Phone must start with 6-9 and be 10 digits
const LeadSchema = z.object({
    parentName: z.string().min(2, "Parent name required"),
    studentName: z.string().optional(),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Must be 10 digits starting with 6,7,8 or 9"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    interestedClassId: z.string().optional(),
    source: z.string().min(1, "Source required"),
    status: z.string().min(1, "Status required"),
    notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof LeadSchema>;

const CaptureLeadDrawer: React.FC = () => {
    const dispatch = useDispatch();
    const { isLeadDrawerOpen, selectedLeadId, leads } = useSelector((state: RootState) => state.admission);

    // Dynamic Metadata from Backend
    const [meta, setMeta] = useState<any>(null);
    const [grades, setGrades] = useState<any[]>([]);
    const [isSaving, setIsSubmitting] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<LeadFormData>({
        resolver: zodResolver(LeadSchema)
    });

    //   FETCH DYNAMIC METADATA
    useEffect(() => {
        if (isLeadDrawerOpen) {
            const fetchMeta = async () => {
                try {
                    const [metaRes, gradesRes] = await Promise.all([
                        api.get('/api/admissions/leads/metadata'),
                        api.get('/api/master-data/grades')
                    ]);
                    setMeta(metaRes.data.data);
                    setGrades(gradesRes.data.data);

                    // Agar EDIT mode hai, toh form populate karo
                    if (selectedLeadId) {
                        const lead = leads.find((l: any) => (l._id || l.id) === selectedLeadId);
                        if (lead) reset({
                            ...lead,
                            interestedClassId: (lead.interestedClassId as any)?._id || lead.interestedClassId
                        });
                    } else {
                        reset({ status: 'new', source: 'walk_in' });
                    }
                } catch (err) { console.error(err); }
            };
            fetchMeta();
        }
    }, [isLeadDrawerOpen, selectedLeadId, reset]);

    const onSubmit = async (data: LeadFormData) => {
        try {
            setIsSubmitting(true);
            if (selectedLeadId) {
                // Update existing lead status/data
                const res = await api.patch(`/api/admissions/leads/${selectedLeadId}/status`, data);
                if (res.data.success) dispatch(updateLeadInStore(res.data.data));
            } else {
                // Create new lead
                const res = await api.post('/api/admissions/leads', data);
                if (res.data.success) dispatch(addLead(res.data.data));
            }
            dispatch(closeLeadDrawer());
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to save lead");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            {isLeadDrawerOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => dispatch(closeLeadDrawer())} />}

            {/* Mobile Responsive Drawer */}
            <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isLeadDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">{selectedLeadId ? 'Update Lead' : 'New Enquiry'}</h2>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">DPS Admissions CRM</p>
                    </div>
                    <button onClick={() => dispatch(closeLeadDrawer())} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
                </div>

                {/* Form Body */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2"><User size={14} className="text-blue-500" /> Parent Info</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Parent Name *</label>
                                    <input {...register('parentName')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                                    {errors.parentName && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.parentName.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Student Name</label>
                                    <input {...register('studentName')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="Optional" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Mobile No *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                        <input {...register('mobile')} maxLength={10} className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" placeholder="9876543210" />
                                    </div>
                                    {errors.mobile && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.mobile.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Email</label>
                                    <input {...register('email')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b pb-2"><BookOpen size={14} className="text-purple-500" /> Pipeline Configuration</h3>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Class *</label>
                                <select {...register('interestedClassId')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold">
                                    <option value="">Select a Class...</option>
                                    {grades.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Status</label>
                                    <select {...register('status')} className="w-full p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl outline-none font-bold">
                                        {meta?.statuses.map((s: any) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Source</label>
                                    <select {...register('source')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold">
                                        {meta?.sources.map((s: any) => <option key={s.value} value={s.value}>{s.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Notes</label>
                                <textarea {...register('notes')} rows={3} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="Any internal notes..." />
                            </div>
                        </div>
                    </form>
                </div>

                {/* Action Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 shrink-0">
                    <button
                        type="submit"
                        form="lead-form"
                        disabled={isSaving}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-blue-600 transition-all flex justify-center items-center gap-2"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {selectedLeadId ? 'Update Activity Log' : 'Save & Capture Lead'}
                    </button>
                </div>
            </div>
        </>
    );
};

export default CaptureLeadDrawer;