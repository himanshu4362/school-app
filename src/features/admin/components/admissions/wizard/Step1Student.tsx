import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextStep, saveStudentProfile, setAdmissionType, setSelectedClassId } from '../../../../../store/slices/applicationSlice';
import { User, ShieldAlert, Loader2 } from 'lucide-react';
import api from '../../../../../services/api';

const Step1Schema = z.object({
    firstName: z.string().min(2, "First name required"),
    lastName: z.string().min(2, "Last name required"),
    dob: z.string().refine((date) => {
        if (!date) return false;
        const age = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return age >= 2;
    }, { message: "Student must be at least 2 years old" }),
    gender: z.string().min(1, "Gender required"),
    bloodGroup: z.string().optional(),
    hasDisability: z.boolean(),
    admissionType: z.string().min(1, "Please select an admission type"),
    selectedClassId: z.string().min(1, "Please select a target class"),
});

type Step1Data = z.infer<typeof Step1Schema>;

const Step1Student: React.FC = () => {
    const dispatch = useDispatch();
    const { studentProfile, admissionType, selectedClassId } = useSelector((state: RootState) => state.application);
    const grades = useSelector((state: RootState) => state.systemConfig.grades);

    const [admissionTypes, setAdmissionTypes] = useState<{value: string, label: string}[]>([]);
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);

    const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
        resolver: zodResolver(Step1Schema),
        defaultValues: {
            firstName: studentProfile?.firstName || '',
            lastName: studentProfile?.lastName || '',
            dob: studentProfile?.dob || '',
            gender: studentProfile?.gender || '',
            bloodGroup: studentProfile?.bloodGroup || '',
            hasDisability: studentProfile?.hasDisability || false,
            admissionType: admissionType || '',
            selectedClassId: selectedClassId || '',
        }
    });

    useEffect(() => {
        api.get('/api/admissions/applications/metadata')
            .then(res => {
                if (res.data.success) setAdmissionTypes(res.data.data.admissionTypes);
            })
            .catch(err => console.error("Failed to load admission types", err))
            .finally(() => setIsLoadingMetadata(false));
    }, []);

    // 🟢 FIXED: Perfectly matched dispatches based on the updated applicationSlice
    const onSubmit = (data: Step1Data) => {
        dispatch(saveStudentProfile({
            firstName: data.firstName, 
            lastName: data.lastName, 
            dob: data.dob, 
            gender: data.gender, 
            bloodGroup: data.bloodGroup, 
            hasDisability: data.hasDisability
        }));
        dispatch(setAdmissionType(data.admissionType));
        dispatch(setSelectedClassId(data.selectedClassId));
        dispatch(nextStep());
    };

    const gradeList = grades ? Object.values(grades) : [];

    return (
        <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-blue-500" /> Pipeline Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Admission Type <span className="text-rose-500">*</span></label>
                        <div className="relative">
                            <select {...register('admissionType')} disabled={isLoadingMetadata} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.admissionType ? 'border-rose-400' : 'border-slate-200 focus:border-blue-500'} ${isLoadingMetadata ? 'opacity-50' : ''}`}>
                                <option value="">Select Type...</option>
                                {admissionTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                            {isLoadingMetadata && <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-500" />}
                        </div>
                        {errors.admissionType && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.admissionType.message}</p>}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Target Class <span className="text-rose-500">*</span></label>
                        <select {...register('selectedClassId')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.selectedClassId ? 'border-rose-400' : 'border-slate-200 focus:border-blue-500'}`}>
                            <option value="">Select a Class...</option>
                            {gradeList.map((grade: any, index: number) => {
                                const uniqueKey = grade?._id || grade?.id || `class-opt-${index}`;
                                const val = grade?._id || grade?.id || '';
                                return <option key={uniqueKey} value={val}>{grade?.name || 'Unknown Class'}</option>;
                            })}
                        </select>
                        {errors.selectedClassId && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.selectedClassId.message}</p>}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <User size={16} className="text-blue-500" /> Core Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">First Name <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('firstName')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.firstName ? 'border-rose-400' : 'border-slate-200'}`} placeholder="Legal First Name" />
                        {errors.firstName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Last Name <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('lastName')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.lastName ? 'border-rose-400' : 'border-slate-200'}`} placeholder="Legal Last Name" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date of Birth <span className="text-rose-500">*</span></label>
                        <input type="date" {...register('dob')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.dob ? 'border-rose-400' : 'border-slate-200'}`} />
                        {errors.dob && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.dob.message}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Gender <span className="text-rose-500">*</span></label>
                        <select {...register('gender')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.gender ? 'border-rose-400' : 'border-slate-200'}`}>
                            <option value="">Select Gender...</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber-50/50 border border-amber-200 rounded-xl cursor-pointer">
                    <input type="checkbox" id="disability" {...register('hasDisability')} className="w-4 h-4 text-amber-600 rounded border-amber-300 focus:ring-amber-500 cursor-pointer" />
                    <label htmlFor="disability" className="cursor-pointer text-sm font-bold text-amber-900 select-none">
                        Student has a medical condition or disability (Requires Certificate in Vault)
                    </label>
                </div>
            </div>
        </form>
    );
};

export default Step1Student;