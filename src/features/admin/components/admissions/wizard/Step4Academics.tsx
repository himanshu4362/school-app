import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextStep, saveAcademics } from '../../../../../store/slices/applicationSlice';
import { GraduationCap, Info } from 'lucide-react';

const AcademicsSchema = z.object({
    schoolName: z.string().min(2, "School Name is required"),
    state: z.string().min(2, "State is required"),
    district: z.string().min(2, "District is required"),
    city: z.string().min(2, "City is required"),
    previousClass: z.string().min(1, "Previous Class is required"),
    hostelStatus: z.string(), 
    migrationReason: z.string().optional(),
});

type Step4Data = z.infer<typeof AcademicsSchema>;

const Step4Academics: React.FC = () => {
    const dispatch = useDispatch();
    const { academicHistory } = useSelector((state: RootState) => state.application);

    const { register, handleSubmit, formState: { errors } } = useForm<Step4Data>({
        resolver: zodResolver(AcademicsSchema),
        defaultValues: {
            schoolName: academicHistory?.schoolName || '',
            state: academicHistory?.state || '',
            district: academicHistory?.district || '',
            city: academicHistory?.city || '',
            previousClass: academicHistory?.previousClass || '',
            hostelStatus: academicHistory?.hostelStatus || 'day_scholar',
            migrationReason: academicHistory?.migrationReason || '',
        }
    });

    const onSubmit = (data: Step4Data) => {
        dispatch(saveAcademics({
            schoolName: data.schoolName,
            state: data.state,
            district: data.district,
            city: data.city,
            previousClass: data.previousClass,
            hostelStatus: data.hostelStatus,
            migrationReason: data.migrationReason
        }));
        dispatch(nextStep());
    };

    return (
        <form id="step4-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs font-bold text-blue-900 leading-relaxed">
                    Because this student is registered as a <strong className="font-black uppercase">Transfer Admission</strong>, you must collect their previous academic records. This will trigger a mandatory Transfer Certificate requirement in the next step.
                </p>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <GraduationCap size={16} className="text-blue-500" /> Previous School Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Previous School Name <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('schoolName')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.schoolName ? 'border-rose-400' : 'border-slate-200'}`} placeholder="Full Name of the Institution" />
                        {errors.schoolName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.schoolName.message}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Previous Class <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('previousClass')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.previousClass ? 'border-rose-400' : 'border-slate-200'}`} placeholder="e.g. Class 5" />
                        {errors.previousClass && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.previousClass.message}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">State <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('state')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.state ? 'border-rose-400' : 'border-slate-200'}`} />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">District <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('district')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.district ? 'border-rose-400' : 'border-slate-200'}`} />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">City <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('city')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.city ? 'border-rose-400' : 'border-slate-200'}`} />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Accommodation Status <span className="text-rose-500">*</span></label>
                        <select {...register('hostelStatus')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.hostelStatus ? 'border-rose-400' : 'border-slate-200'}`}>
                            <option value="day_scholar">Day Scholar</option>
                            <option value="hosteler">Hosteler</option>
                        </select>
                    </div>

                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Reason for Migration (Optional)</label>
                        <input type="text" {...register('migrationReason')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Casually ask the parent why they are shifting schools" />
                    </div>
                </div>
            </div>
        </form>
    );
};

export default Step4Academics;