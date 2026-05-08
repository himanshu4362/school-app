import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextFacultyStep, saveIdentity } from '../../../../../store/slices/facultySlice';
import { FacultyIdentityDTO, FacultyIdentitySchema } from '../../../../../types/faculty/faculty.schema';
import { User, Phone, MapPin, HeartPulse } from 'lucide-react';

const Step1Identity: React.FC = () => {
    const dispatch = useDispatch();

    // Pull existing draft data if they hit "Back"
    const existingData = useSelector((state: RootState) => state.faculty.onboardingDraft.identity);

    const { register, handleSubmit, formState: { errors } } = useForm<FacultyIdentityDTO>({
        resolver: zodResolver(FacultyIdentitySchema),
        mode: 'onChange',
        defaultValues: existingData || {
            gender: 'male',
            maritalStatus: 'single'
        }
    });

    const onSubmit = (data: FacultyIdentityDTO) => {
        // Save to Redux Draft State
        dispatch(saveIdentity(data));
        // Move to next step
        dispatch(nextFacultyStep());
    };

    return (
        <form id="faculty-step1-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">

            {/* Basic Identity */}
            <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <User size={16} className="text-indigo-500" /> Core Identity
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">First Name <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('firstName')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.firstName ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`} placeholder="Legal First Name" />
                        {errors.firstName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Last Name <span className="text-rose-500">*</span></label>
                        <input type="text" {...register('lastName')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.lastName ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`} placeholder="Legal Last Name" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date of Birth <span className="text-rose-500">*</span></label>
                        <input type="date" {...register('dob')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500" />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Gender</label>
                        <select {...register('gender')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500">
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Marital Status</label>
                        <select {...register('maritalStatus')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500">
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Blood Group</label>
                        <input type="text" {...register('bloodGroup')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500" placeholder="e.g. O+" />
                    </div>
                </div>
            </div>

            {/* Contact & Address */}
            <div className="space-y-6">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 mt-4">
                    <Phone size={16} className="text-indigo-500" /> Contact & Emergency
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Primary Mobile <span className="text-rose-500">*</span></label>
                        <input type="tel" maxLength={10} {...register('mobile')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.mobile ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`} placeholder="10-digit number" />
                        {errors.mobile && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.mobile.message}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Personal Email <span className="text-rose-500">*</span></label>
                        <input type="email" {...register('email')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.email ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`} placeholder="e.g. name@gmail.com" />
                    </div>
                </div>

                <div className="bg-rose-50/50 p-5 rounded-2xl border border-rose-100 space-y-4">
                    <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                        <HeartPulse size={14} /> Emergency Contact
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-1.5 block">Contact Name <span className="text-rose-500">*</span></label>
                            <input type="text" {...register('emergencyContactName')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.emergencyContactName ? 'border-rose-400' : 'border-rose-200 focus:border-rose-400'}`} placeholder="Spouse/Parent Name" />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest mb-1.5 block">Emergency Mobile <span className="text-rose-500">*</span></label>
                            <input type="tel" maxLength={10} {...register('emergencyContactMobile')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.emergencyContactMobile ? 'border-rose-400' : 'border-rose-200 focus:border-rose-400'}`} placeholder="10-digit number" />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        <MapPin size={12} /> Full Residential Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea {...register('address')} rows={3} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.address ? 'border-rose-400' : 'border-slate-200 focus:border-indigo-500'}`} placeholder="House No, Street, City, State, Pincode" />
                </div>
            </div>

        </form>
    );
};

export default Step1Identity;