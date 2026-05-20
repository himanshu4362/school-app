import React, { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { useHistory } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';
import {
    ChevronRight, ChevronLeft, Check, User, Users, MapPin,
    GraduationCap, FileText, Loader2, AlertCircle, Plus, Trash2, CloudUpload, Camera, CheckCircle,
    Clock,
    UploadCloud,
    CheckCircle2
} from 'lucide-react';
import {
    nextWizardStep, prevWizardStep, updateWizardDraft, resetWizard
} from '../../../../store/slices/admissionSlice';
import api from '../../../../services/api';

// ==========================================
// 1. ZOD SCHEMAS
// ==========================================
const Step1Schema = z.object({
    admissionType: z.string().min(1, "Required"),
    selectedClassId: z.string().min(1, "Required"),
    profilePhotoKey: z.string().min(1, "Profile Photo is Required"),
    nationalId: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits"),
    firstName: z.string().min(2, "Required"),
    lastName: z.string().min(2, "Required"),
    dob: z.string().min(1, "Required"),
    gender: z.string().min(1, "Required"),
    category: z.string().min(1, "Required"),
    bloodGroup: z.string().optional(),
    nationality: z.string().min(1, "Required"),
    religion: z.string().min(1, "Required"),
    hasDisability: z.boolean(),
    allergies: z.string().optional(),
    medicalSeverity: z.string().optional(),
    disabilityType: z.string().optional(),
    chronicConditions: z.string().optional(),
    medication: z.string().optional(),
    emergencyAction: z.string().optional(),
});

const GuardianSchema = z.object({
    relation: z.string().min(1, "Required"),
    fullName: z.string().min(2, "Required"),
    mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit Indian number required"),
    email: z.string().email("Invalid email").optional().or(z.literal('')),
    occupation: z.string().optional(),
    isPrimaryContact: z.boolean().optional(),
});

const Step2Schema = z.object({
    guardians: z.array(GuardianSchema).min(1, "At least one guardian required")
}).refine(data => data.guardians.some(g => g.isPrimaryContact), {
    message: "At least one guardian MUST be marked as Primary Contact",
    path: ["guardians"]
});
const Step3Schema = z.object({
    currentAddressLine1: z.string().min(3, "Required"),
    currentAddressCity: z.string().min(2, "Required"),
    currentAddressDistrict: z.string().min(2, "Required"),
    currentAddressState: z.string().min(2, "Required"),
    currentAddressPincode: z.string().regex(/^\d{6}$/, "Valid 6-digit Pincode required"),
    isSameAsCurrent: z.boolean(),
    permanentAddressLine1: z.string().optional(),
    permanentAddressCity: z.string().optional(),
    permanentAddressDistrict: z.string().optional(),
    permanentAddressState: z.string().optional(),
    permanentAddressPincode: z.string().optional(),
});

const Step4Schema = z.object({
    previousSchoolName: z.string().min(2, "Required"),
    previousClass: z.string().min(1, "Required"),
    previousSchoolBoard: z.string().min(2, "Required"),
    previousSchoolTcNumber: z.string().optional(), // TC usually baad me aata hai, isliye optional
    hostelStatus: z.string().min(1, "Required"),
    previousSchoolAddressLine1: z.string().min(3, "Required"),
    previousSchoolCity: z.string().min(2, "Required"),
    previousSchoolDistrict: z.string().min(2, "Required"),
    previousSchoolState: z.string().min(2, "Required"),
    previousSchoolPincode: z.string().regex(/^\d{6}$/, "Valid 6-digit Pincode required"),
    migrationReason: z.string().optional(),
});


// CHILD COMPONENTS

const ProfilePhotoUploader = ({ onUploadSuccess, defaultImageKey, studentName }: any) => {
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setIsUploading(true);
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        const extension = file.name.split('.').pop();
        const safeName = studentName && studentName.trim() !== '_' ? studentName.replace(/[^a-zA-Z0-9]/g, '_') : 'Student_Profile';
        const renamedFileName = `${safeName}_Profile_${Date.now()}.${extension}`;

        try {
            const { data } = await api.get(`/api/admissions/upload-url?fileName=${encodeURIComponent(renamedFileName)}&fileType=${encodeURIComponent(file.type)}`);
            await axios.put(data.data.uploadUrl, file, { headers: { 'Content-Type': file.type } });
            onUploadSuccess(data.data.fileKey);
        } catch (err) {
            alert("Photo upload failed.");
            setPreview(null);
        } finally {
            setIsUploading(false);
        }
    }, [onUploadSuccess, studentName]);

    const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: false });

    return (
        <div className="flex justify-center mb-6">
            <div {...getRootProps()} className="relative w-28 h-28 rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer overflow-hidden group hover:border-blue-200 transition-all shadow-sm">
                <input {...getInputProps()} />
                {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                ) : defaultImageKey ? (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center"><Check size={32} className="text-blue-500" /></div>
                ) : (
                    <div className="text-slate-400 flex flex-col items-center"><Camera size={24} /><span className="text-[9px] font-black uppercase mt-1">Upload</span></div>
                )}
                {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={24} /></div>
                )}
                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-[10px] font-black uppercase tracking-wider">Change</div>
            </div>
        </div>
    );
};

const Step1 = ({ draft, meta, isLoadingMeta }: any) => {
    const dispatch = useDispatch();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<z.infer<typeof Step1Schema>>({
        resolver: zodResolver(Step1Schema), defaultValues: draft as any
    });
    const watchHasDisability = watch('hasDisability');
    const firstName = watch('firstName');
    const lastName = watch('lastName');

    const onSubmit = (data: any) => { dispatch(updateWizardDraft(data)); dispatch(nextWizardStep()); };

    if (isLoadingMeta) return <SkeletonLoader />;

    return (
        <form id="step1-form" onSubmit={handleSubmit(onSubmit)} className="animate-in fade-in duration-300">
            <ProfilePhotoUploader
                defaultImageKey={draft.profilePhotoKey}
                onUploadSuccess={(key: string) => setValue('profilePhotoKey', key, { shouldValidate: true })}
                studentName={`${firstName || ''}_${lastName || ''}`}
            />

            {errors.profilePhotoKey && (
                <p className="text-xs text-rose-500 font-bold text-center mb-4 mt-[-15px]">{errors.profilePhotoKey.message as string}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Admission Type <span className="text-rose-500">*</span></label>
                    <select {...register('admissionType')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700">
                        <option value="">Select...</option>
                        {meta.admissionTypes?.map((t: any) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    {errors.admissionType && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.admissionType.message}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Target Class <span className="text-rose-500">*</span></label>
                    <select {...register('selectedClassId')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700">
                        <option value="">Select...</option>
                        {meta.grades?.map((g: any) => <option key={g._id} value={g._id}>{g.name}</option>)}
                    </select>
                    {errors.selectedClassId && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.selectedClassId.message}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Aadhaar Number (12 Digits) <span className="text-rose-500">*</span></label>
                    <input {...register('nationalId')} maxLength={12} placeholder="e.g. 123456789012" className={`w-full p-3 bg-slate-50 border-2 rounded-xl outline-none font-bold text-slate-700 ${errors.nationalId ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} />
                    {errors.nationalId && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.nationalId.message}</p>}
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">First Name <span className="text-rose-500">*</span></label>
                    <input {...register('firstName')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700" />
                    {errors.firstName && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.firstName.message}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Last Name <span className="text-rose-500">*</span></label>
                    <input {...register('lastName')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700" />
                    {errors.lastName && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.lastName.message}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Date of Birth <span className="text-rose-500">*</span></label>
                    <input type="date" {...register('dob')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700" />
                    {errors.dob && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.dob.message}</p>}
                </div>

                <div>
                    {/*   COMPLETELY DYNAMIC GENDER DROPDOWN */}
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Gender <span className="text-rose-500">*</span></label>
                    <select {...register('gender')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700">
                        <option value="">Select...</option>
                        {meta.genders?.map((g: any) => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                    {errors.gender && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.gender.message}</p>}
                </div>
                <div>
                    {/*   COMPLETELY DYNAMIC CATEGORY DROPDOWN */}
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Category <span className="text-rose-500">*</span></label>
                    <select {...register('category')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700">
                        <option value="">Select...</option>
                        {meta.categories?.map((c: any) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    {errors.category && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.category.message}</p>}
                </div>
                <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Blood Group (Optional)</label>
                    <select {...register('bloodGroup')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-700">
                        <option value="">Unknown</option><option value="A+">A+</option><option value="O+">O+</option><option value="B+">B+</option><option value="AB+">AB+</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Nationality *</label>
                        <select {...register('nationality')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm">
                            <option value="Indian">Indian</option>
                            <option value="NRI">NRI</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.nationality && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.nationality.message as string}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Religion *</label>
                        <select {...register('religion')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm">
                            <option value="">Select Religion</option>
                            <option value="Hindu">Hindu</option>
                            <option value="Muslim">Muslim</option>
                            <option value="Christian">Christian</option>
                            <option value="Sikh">Sikh</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.religion && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.religion.message as string}</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-600" /> Medical & Health Information
                </h3>

                <div className="flex items-center gap-3 mb-2">
                    <input
                        type="checkbox"
                        id="hasDisability"
                        {...register('hasDisability')}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="hasDisability" className="text-sm font-bold text-slate-700 cursor-pointer">
                        Student has a physical disability, allergy, or special medical condition
                    </label>
                </div>

                {watchHasDisability && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 mt-4 bg-white rounded-xl border border-rose-100 animate-in fade-in slide-in-from-top-2 shadow-sm">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Specific Allergies or Condition</label>
                            <input
                                type="text"
                                {...register('allergies')}
                                placeholder="e.g. Dust allergy, Asthma, Diabetes..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Condition Severity</label>
                            <select {...register('medicalSeverity')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-sm">
                                <option value="LOW">Low / Manageable</option>
                                <option value="MEDIUM">Medium / Requires Attention</option>
                                <option value="HIGH">High / Critical</option>
                                <option value="CRITICAL">Critical Emergency Care</option>
                            </select>
                        </div>
                        {/* Disability Type & Chronic Conditions */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Disability Type (If Any)</label>
                            <input
                                type="text"
                                {...register('disabilityType')}
                                placeholder="e.g. Locomotor, Visual, Hearing impairment"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Chronic Medical Conditions</label>
                            <input
                                type="text"
                                {...register('chronicConditions')}
                                placeholder="e.g. Heart ailment, Epilepsy, None"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-sm"
                            />
                        </div>
                        {/* Required Medication & Emergency Action Plan */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Routine/Required Medication</label>
                            <input
                                type="text"
                                {...register('medication')}
                                placeholder="e.g. Insulin injections, Inhaler twice a day..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Emergency Action Plan / Instructions</label>
                            <input
                                type="text"
                                {...register('emergencyAction')}
                                placeholder="e.g. Administer inhaler and immediately notify parent"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-rose-500 font-bold text-sm"
                            />
                        </div>
                    </div>
                )}
            </div>
        </form>
    );
};

const Step2 = ({ draft, meta }: any) => {
    const dispatch = useDispatch();
    const { register, control, handleSubmit, formState: { errors } } = useForm<z.infer<typeof Step2Schema>>({
        resolver: zodResolver(Step2Schema), defaultValues: draft as any
    });

    const { fields, append, remove } = useFieldArray({ control, name: "guardians" });

    useEffect(() => {
        if (fields.length === 0) append({ relation: 'father', fullName: '', mobile: '', isPrimaryContact: true });
    }, [fields.length, append]);

    const onSubmit = (data: any) => { dispatch(updateWizardDraft(data)); dispatch(nextWizardStep()); };

    return (
        <form id="step2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
            {fields.map((field, index) => (
                <div key={field.id} className="p-6 border border-slate-200 rounded-3xl bg-white shadow-sm relative">
                    <h4 className="font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2">
                        <Users size={18} className="text-purple-500" /> Guardian {index + 1}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            {/*   COMPLETELY DYNAMIC GUARDIAN RELATION */}
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Relation <span className="text-rose-500">*</span></label>
                            <select {...register(`guardians.${index}.relation` as const)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm">
                                <option value="">Select...</option>
                                {meta.relations?.map((r: any) => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name <span className="text-rose-500">*</span></label>
                            <input {...register(`guardians.${index}.fullName` as const)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                            {errors.guardians?.[index]?.fullName && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.guardians[index]?.fullName?.message}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Mobile Number <span className="text-rose-500">*</span></label>
                            <input {...register(`guardians.${index}.mobile` as const)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="10 Digits" maxLength={10} />
                            {errors.guardians?.[index]?.mobile && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.guardians[index]?.mobile?.message}</p>}
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                            <input {...register(`guardians.${index}.email` as const)} type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="Optional" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Occupation</label>
                            <input {...register(`guardians.${index}.occupation` as const)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" placeholder="e.g. Business, Engineer" />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                        <input
                            type="checkbox"
                            id={`primary-${index}`}
                            {...register(`guardians.${index}.isPrimaryContact` as const)}
                            className="w-5 h-5 cursor-pointer text-blue-600 rounded"
                        />
                        <label htmlFor={`primary-${index}`} className="cursor-pointer text-sm font-bold text-blue-900 select-none">
                            Make Primary Contact (Receive SMS/WhatsApp Alerts)
                        </label>
                    </div>

                    {index > 0 && (
                        <button type="button" onClick={() => remove(index)} className="absolute top-6 right-6 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}

            <button type="button" onClick={() => append({ relation: 'mother', fullName: '', mobile: '', isPrimaryContact: false })} className="px-5 py-3 bg-purple-50 border border-purple-100 text-purple-600 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-purple-100 transition-all shadow-sm">
                <Plus size={18} /> Add Another Guardian
            </button>
        </form>
    );
};

const Step3 = ({ draft }: any) => {
    const dispatch = useDispatch();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof Step3Schema>>({ resolver: zodResolver(Step3Schema), defaultValues: draft as any });
    const isSame = watch('isSameAsCurrent');

    const onSubmit = (data: any) => {
        if (data.isSameAsCurrent) {
            data.permanentAddressLine1 = data.currentAddressLine1;
            data.permanentAddressCity = data.currentAddressCity;
            data.permanentAddressDistrict = data.currentAddressDistrict; // 🟢 FIX
            data.permanentAddressState = data.currentAddressState;
            data.permanentAddressPincode = data.currentAddressPincode;
        }
        dispatch(updateWizardDraft(data));
        dispatch(nextWizardStep());
    };

    return (
        <form id="step3-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h4 className="font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2"><MapPin size={18} className="text-blue-500" /> Current Address</h4>
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Address Line 1 (Full Width)</label>
                        <input {...register('currentAddressLine1')} placeholder="House No, Street, Locality" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        {errors.currentAddressLine1 && <p className="text-xs text-rose-500 mt-1">{errors.currentAddressLine1.message}</p>}
                    </div>
                    {/* GRID (4 columns for City, District, State, Pincode) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">City</label>
                            <input {...register('currentAddressCity')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">District</label>
                            <input {...register('currentAddressDistrict')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">State</label>
                            <input {...register('currentAddressState')} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Pincode</label>
                            <input {...register('currentAddressPincode')} maxLength={6} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                            {errors.currentAddressPincode && <p className="text-xs text-rose-500 mt-1">{errors.currentAddressPincode.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <input type="checkbox" id="same" {...register('isSameAsCurrent')} className="w-5 h-5 cursor-pointer text-blue-600 rounded" />
                <label htmlFor="same" className="font-bold text-sm text-slate-700 cursor-pointer">Permanent Address is identical to Current Address</label>
            </div>

            {!isSame && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm animate-in slide-in-from-top-4">
                    <h4 className="font-black text-slate-800 border-b border-slate-100 pb-3 mb-5">Permanent Address</h4>
                    <div className="space-y-5">
                        <div>
                            <input {...register('permanentAddressLine1')} placeholder="House No, Street, Locality" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>
                        {/* GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <input {...register('permanentAddressCity')} placeholder="City" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                            <input {...register('permanentAddressDistrict')} placeholder="District" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                            <input {...register('permanentAddressState')} placeholder="State" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                            <input {...register('permanentAddressPincode')} placeholder="Pincode" maxLength={6} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold" />
                        </div>
                    </div>
                </div>
            )}
        </form>
    );
};

const Step4 = ({ draft }: any) => {
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof Step4Schema>>({ resolver: zodResolver(Step4Schema), defaultValues: draft as any });

    const onSubmit = (data: any) => { dispatch(updateWizardDraft(data)); dispatch(nextWizardStep()); };

    return (
        <form id="step4-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                <h4 className="font-black text-slate-800 border-b border-slate-100 pb-3 mb-5 flex items-center gap-2"><GraduationCap size={18} className="text-orange-500" /> Academic History</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Previous School Name *</label>
                        <input {...register('previousSchoolName')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                        {errors.previousSchoolName && <p className="text-xs text-rose-500 mt-1">{errors.previousSchoolName.message}</p>}
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Board (CBSE, ICSE, State) *</label>
                        <input {...register('previousSchoolBoard')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Previous Class *</label>
                        <input {...register('previousClass')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">TC Number (Optional for now)</label>
                        <input {...register('previousSchoolTcNumber')} placeholder="If available" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Hostel Requirement *</label>
                        <select {...register('hostelStatus')} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm">
                            <option value="day_scholar">Day Scholar</option>
                            <option value="hosteler">Hosteler</option>
                        </select>
                    </div>
                </div>

                {/* School Address Block */}
                <h5 className="font-bold text-slate-700 mt-8 mb-4">Previous School Address</h5>
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Address Line 1 *</label>
                        <input {...register('previousSchoolAddressLine1')} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">City *</label>
                            <input {...register('previousSchoolCity')} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">District *</label>
                            <input {...register('previousSchoolDistrict')} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">State *</label>
                            <input {...register('previousSchoolState')} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Pincode *</label>
                            <input {...register('previousSchoolPincode')} maxLength={6} className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-bold text-sm" />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
};

const DropzoneArea = ({ onDrop, isUploading }: { onDrop: (files: File[]) => void, isUploading: boolean }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });
    return (
        <div {...getRootProps()} className={`h-full min-h-[100px] p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${isDragActive ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-500'}`}>
            <input {...getInputProps()} />
            {isUploading ? <Loader2 className="animate-spin mb-2 text-blue-500" size={24} /> : <CloudUpload size={28} className="mb-2" />}
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{isUploading ? 'Uploading...' : 'Drag & Drop or Click'}</span>
        </div>
    );
};


// DOCUMENT ENGINE MATRIX (Frontend Replica)
const REQUIREMENT_MATRIX: Record<string, Record<string, string[]>> = {
    'fresh': {
        'GENERAL': ['AADHAAR', 'BIRTH_CERTIFICATE', 'ADDRESS_PROOF'],
        'OBC': ['AADHAAR', 'BIRTH_CERTIFICATE', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE'],
        'SC': ['AADHAAR', 'BIRTH_CERTIFICATE', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE'],
        'ST': ['AADHAAR', 'BIRTH_CERTIFICATE', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE'],
        'EWS': ['AADHAAR', 'BIRTH_CERTIFICATE', 'ADDRESS_PROOF', 'INCOME_CERTIFICATE'],
        'OTHER': ['AADHAAR', 'BIRTH_CERTIFICATE', 'ADDRESS_PROOF']
    },
    'transfer': {
        'GENERAL': ['AADHAAR', 'TRANSFER_CERTIFICATE', 'MARKSHEET', 'ADDRESS_PROOF'],
        'OBC': ['AADHAAR', 'TRANSFER_CERTIFICATE', 'MARKSHEET', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE'],
        'SC': ['AADHAAR', 'TRANSFER_CERTIFICATE', 'MARKSHEET', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE'],
        'ST': ['AADHAAR', 'TRANSFER_CERTIFICATE', 'MARKSHEET', 'ADDRESS_PROOF', 'CASTE_CERTIFICATE'],
        'EWS': ['AADHAAR', 'TRANSFER_CERTIFICATE', 'MARKSHEET', 'ADDRESS_PROOF', 'INCOME_CERTIFICATE'],
        'OTHER': ['AADHAAR', 'TRANSFER_CERTIFICATE', 'MARKSHEET', 'ADDRESS_PROOF']
    }
};

const DOC_DISPLAY_NAMES: Record<string, string> = {
    'AADHAAR': 'Aadhaar Card',
    'BIRTH_CERTIFICATE': 'Birth Certificate',
    'TRANSFER_CERTIFICATE': 'Transfer Certificate',
    'MARKSHEET': 'Previous Marksheet',
    'ADDRESS_PROOF': 'Address Proof',
    'CASTE_CERTIFICATE': 'Caste Certificate',
    'INCOME_CERTIFICATE': 'Income Certificate',
    'MEDICAL_CERTIFICATE': 'Medical Certificate'
};

// ==========================================
// SINGLE DOCUMENT UPLOADER COMPONENT
// ==========================================
const DocumentUploadRow = ({ doc, draft, meta, onUpdate, onRemove }: any) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        // Custom document checking: If type is empty, restrict upload
        if (doc.isCustom && (!doc.documentType || !doc.displayName)) {
            return alert("Please select Document Type and enter Name before uploading.");
        }

        try {
            setUploading(true);
            onUpdate('progress', 10);

            const ext = file.name.split('.').pop();
            const safeName = `Doc_${Date.now()}.${ext}`;
            const studentName = `${draft.firstName}_${draft.lastName}`;

            // S3 Presigned URL fetch
            const { data } = await api.get(`/api/admissions/upload-url?fileName=${encodeURIComponent(safeName)}&fileType=${encodeURIComponent(file.type)}&studentName=${encodeURIComponent(studentName)}`);

            // S3 Upload
            await axios.put(data.data.uploadUrl, file, { headers: { 'Content-Type': file.type } });

            // 🟢 STRICT STATUS FLOW: Update to SUBMITTED once uploaded successfully
            onUpdate('fileKey', data.data.fileKey);
            onUpdate('status', 'SUBMITTED');
            onUpdate('progress', 100);
        } catch (error) {
            console.error("Upload failed", error);
            alert(`Failed to upload. Check S3 CORS or Network.`);
            onUpdate('progress', 0);
        } finally {
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop, accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] }, maxSize: 5 * 1024 * 1024
    });

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-300 transition-all">
            {/* Left Info: Dynamic based on isCustom */}
            <div className="flex-1 w-full">
                {doc.isCustom ? (
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                        {/* 🟢 METADATA DROPDOWN FOR CUSTOM DOCS */}
                        <select
                            value={doc.documentType}
                            onChange={(e) => onUpdate('documentType', e.target.value)}
                            className="p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-bold text-xs"
                        >
                            <option value="">Select Doc Type</option>
                            {meta?.documentTypes?.map((t: any) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            placeholder="Custom Name (e.g., Father PAN Card)"
                            value={doc.displayName}
                            onChange={(e) => onUpdate('displayName', e.target.value)}
                            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-bold text-xs"
                        />
                    </div>
                ) : (
                    <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-black text-slate-800 text-sm">{doc.displayName}</h5>
                        {doc.isMandatory && <span className="text-[9px] font-bold px-2 py-0.5 bg-rose-50 text-rose-600 rounded">REQUIRED</span>}
                    </div>
                )}

                <input
                    type="text"
                    placeholder={`Enter ${doc.isCustom ? 'Document' : doc.displayName} Number (Optional)`}
                    value={doc.documentNumber || ''}
                    onChange={(e) => onUpdate('documentNumber', e.target.value)}
                    className="w-full mt-2 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 font-bold text-xs"
                />

                {doc.isCustom && doc.status === 'PENDING' && (
                    <button type="button" onClick={onRemove} className="text-[10px] text-rose-500 font-bold mt-2 hover:underline">Remove Document</button>
                )}
            </div>

            {/* Right Uploader Zone */}
            <div className="w-full md:w-64 shrink-0">
                {doc.status === 'SUBMITTED' && doc.fileKey ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /><span className="font-bold text-emerald-700 text-xs">Uploaded</span></div>
                        <button type="button" onClick={() => { onUpdate('fileKey', ''); onUpdate('status', 'PENDING'); onUpdate('progress', 0); }} className="text-[10px] font-bold text-rose-500 hover:underline">Remove</button>
                    </div>
                ) : uploading ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center gap-2">
                        <Loader2 size={18} className="text-blue-500 animate-spin" /><span className="text-xs font-bold text-blue-700">Uploading...</span>
                    </div>
                ) : (
                    <div {...getRootProps()} className={`p-4 border-2 border-dashed rounded-xl cursor-pointer text-center transition-all ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud size={20} className="mx-auto text-slate-400 mb-1" />
                        <p className="text-[10px] font-bold text-slate-500">Drop PDF/JPG here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const Step5 = ({ draft, globalYearId, meta, setShowSuccess }: any) => {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [docs, setDocs] = useState<any[]>(() => {
        const requiredTypes = REQUIREMENT_MATRIX[draft.admissionType]?.[draft.category] || REQUIREMENT_MATRIX[draft.admissionType]?.['GENERAL'] || [];
        let finalTypes = [...requiredTypes];

        if (draft.hasDisability && !finalTypes.includes('MEDICAL_CERTIFICATE')) {
            finalTypes.push('MEDICAL_CERTIFICATE');
        }

        return finalTypes.map(type => ({
            id: type,
            documentType: type, // Matches 'AADHAAR', 'BIRTH_CERTIFICATE' etc.
            displayName: DOC_DISPLAY_NAMES[type] || type,
            documentNumber: '',
            status: 'PENDING', // Initial status strictly PENDING
            fileKey: '',
            isMandatory: true,
            progress: 0,
            isCustom: false
        }));
    });

    const handleUpdate = (id: string, field: string, value: any) => {
        setDocs(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    };

    const removeDoc = (id: string) => {
        setDocs(prev => prev.filter(d => d.id !== id));
    };

    useEffect(() => {
        let requiredDocs = [...docs];
        if (draft.admissionType === 'transfer' && !requiredDocs.find(d => d.documentType === 'TRANSFER_CERTIFICATE')) {
            requiredDocs.push({ id: 'tc', documentType: 'TRANSFER_CERTIFICATE', displayName: 'Transfer Certificate', documentNumber: '', status: 'PENDING', fileKey: '', isMandatory: true, progress: 0 });
        }
        setDocs(requiredDocs);
    }, [draft.admissionType]);

    const addCustomDoc = () => {
        setDocs([...docs, {
            id: Date.now().toString(),
            documentType: '', // User will select from metadata dropdown
            displayName: '',  // User will type the name
            documentNumber: '',
            status: 'PENDING',
            fileKey: '',
            isMandatory: false,
            progress: 0,
            isCustom: true
        }]);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const invalidDoc = docs.find(d =>
            (d.isMandatory && d.status !== 'SUBMITTED') ||
            (d.isCustom && d.status === 'SUBMITTED' && !d.documentType)
        );
        if (invalidDoc) return alert(`Action blocked: Missing or incomplete document -> ${invalidDoc.displayName || 'Custom Document'}`);

        setIsSubmitting(true);

        //   FIXED: Remapped the final payload strictly according to your original working structure
        const finalPayload = {
            academicYearId: globalYearId,
            appliedGradeId: draft.selectedClassId,
            admissionType: draft.admissionType,
            admissionSource: "walk_in",
            studentProfile: {
                firstName: draft.firstName,
                lastName: draft.lastName,
                dob: draft.dob,
                gender: draft.gender,
                category: draft.category,
                bloodGroup: draft.bloodGroup,
                nationality: draft.nationality,
                religion: draft.religion,
                aadhaarEncrypted: draft.nationalId,
                aadhaarLast4: draft.nationalId.slice(-4),
                profilePhotoKey: draft.profilePhotoKey,
                medicalInfo: {
                    hasDisability: draft.hasDisability,
                    allergies: draft.allergies || "",
                    severity: draft.medicalSeverity || "LOW",
                    disabilityType: draft.disabilityType || "",
                    chronicConditions: draft.chronicConditions || "",
                    medication: draft.medication || "",
                    emergencyAction: draft.emergencyAction || ""
                }
            },
            guardians: draft.guardians.map((g: any) => ({
                relation: g.relation,
                fullName: g.fullName,
                mobile: g.mobile,
                email: g.email || undefined,
                occupation: g.occupation || undefined,
                isPrimaryContact: g.isPrimaryContact
            })),
            address: {
                current: {
                    addressLine1: draft.currentAddressLine1,
                    city: draft.currentAddressCity,
                    district: draft.currentAddressDistrict,
                    state: draft.currentAddressState,
                    pincode: draft.currentAddressPincode
                },
                ...(!draft.isSameAsCurrent && {
                    permanent: {
                        addressLine1: draft.permanentAddressLine1,
                        city: draft.permanentAddressCity,
                        district: draft.permanentAddressDistrict,
                        state: draft.permanentAddressState,
                        pincode: draft.permanentAddressPincode
                    }
                })
            },

            academicHistory: draft.admissionType === 'transfer' ? {
                schoolName: draft.previousSchoolName,
                previousClass: draft.previousClass,
                board: draft.previousSchoolBoard,
                tcNumber: draft.previousSchoolTcNumber || undefined,
                hostelStatus: draft.hostelStatus,
                schoolAddress: {
                    addressLine1: draft.previousSchoolAddressLine1,
                    city: draft.previousSchoolCity,
                    district: draft.previousSchoolDistrict,
                    state: draft.previousSchoolState,
                    pincode: draft.previousSchoolPincode
                }
            } : undefined,

            admissionTest: {
                status: 'PENDING'
            },

            documents: docs.map(d => ({
                documentType: d.documentType,
                displayName: d.displayName,
                documentNumber: d.documentNumber ? d.documentNumber : undefined,
                status: d.status,
                fileKey: d.fileKey || undefined
            }))
        };

        try {
            await api.post('/api/admissions/applications', finalPayload);
            setShowSuccess(true);
            dispatch(resetWizard());
        } catch (err: any) {
            alert(err.response?.data?.message || "Submission failed. Check backend logs.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form id="step5-form" onSubmit={onSubmit} className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                <div>
                    <h3 className="font-black text-slate-800 text-lg">Document Vault</h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">Checklist auto-generated for <span className="text-blue-600 uppercase font-black">{draft.admissionType} - {draft.category}</span></p>
                </div>
                <button type="button" onClick={addCustomDoc} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 flex items-center gap-2 transition-all">
                    <Plus size={16} /> Add Custom Doc
                </button>
            </div>

            <div className="space-y-4">
                {docs.map((doc) => (
                    <DocumentUploadRow
                        key={doc.id}
                        doc={doc}
                        draft={draft}
                        meta={meta} // 🟢 Passed meta for dropdown
                        onUpdate={(field: string, value: any) => handleUpdate(doc.id, field, value)}
                        onRemove={() => removeDoc(doc.id)} // 🟢 Allows removing custom docs
                    />
                ))}
            </div>

            {isSubmitting && (
                <div className="p-4 bg-blue-50 text-blue-600 font-bold rounded-xl text-center flex justify-center items-center gap-2 animate-pulse border border-blue-200">
                    <Loader2 className="animate-spin" size={18} /> Connecting to Backend & Finalizing ERP Entry...
                </div>
            )}
        </form>
    );
};

const SuccessModal = ({ onComplete }: { onComplete: () => void }) => (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="text-emerald-500 animate-[bounce_1s_ease-in-out]" size={48} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Success!</h2>
            <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8">Application successfully vaulted. Redirecting to desk...</p>
            <button onClick={onComplete} className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95">Go to Dashboard</button>
        </div>
    </div>
);

// MASTER COMPONENT
const AdmissionWizard: React.FC = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const draft = useSelector((state: RootState) => state.admission.wizardDraft);

    const [globalYearId, setGlobalYearId] = useState<string | null>(null);
    const [meta, setMeta] = useState<any>({ admissionTypes: [], grades: [], relations: [], documentTypes: [], genders: [], categories: [] });
    const [isLoadingMeta, setIsLoadingMeta] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // page will scroll to top on re-render or new 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [draft.currentStep]);

    // for specific div 
    // useEffect(() => {
    //     const formContainer = document.getElementById('wizard-container'); // Apne main div ko id="wizard-container" de dein
    //     if (formContainer) {
    //         formContainer.scrollTo({ top: 0, behavior: 'smooth' });
    //     }
    // }, [draft.currentStep]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [metaRes, gradesRes, yearsRes] = await Promise.all([
                    api.get('/api/admissions/applications/metadata'),
                    api.get('/api/master-data/grades'),
                    api.get('/api/master-data/academic-years')
                ]);
                const newMeta = { ...meta };
                if (metaRes.data.success) {
                    newMeta.admissionTypes = metaRes.data.data.admissionTypes || [];
                    newMeta.relations = metaRes.data.data.relations || [];
                    newMeta.documentTypes = metaRes.data.data.documentTypes || [];
                    newMeta.genders = metaRes.data.data.genders || [];
                    newMeta.categories = metaRes.data.data.categories || [];
                }
                if (gradesRes.data.success) newMeta.grades = gradesRes.data.data;

                if (yearsRes.data.success) {
                    const activeYear = yearsRes.data.data.find((y: any) => y.isActive);
                    if (activeYear) setGlobalYearId(activeYear._id);
                }
                setMeta(newMeta);
            } catch (err) { console.error(err); } finally { setIsLoadingMeta(false); }
        };
        fetchMeta();
    }, []);

    const steps = [
        { id: 1, title: 'Student' }, { id: 2, title: 'Guardians' }, { id: 3, title: 'Address' },
        { id: 4, title: 'Academics' }, { id: 5, title: 'Vault' }
    ];

    return (
        <AdminLayout pageTitle="Admission Wizard" breadcrumbs={[{ label: 'Admissions' }, { label: 'New Application' }]}>
            {showSuccess && <SuccessModal onComplete={() => history.push('/admin/admissions/applications')} />}

            <div className="bg-white px-4 py-6 md:p-6 rounded-3xl border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <div className="absolute top-1/2 left-[5%] right-[5%] h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full" />
                    <div className="absolute top-1/2 left-[5%] h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 rounded-full" style={{ width: `calc(${((draft.currentStep - 1) / (steps.length - 1)) * 90}%)` }} />

                    {steps.map(step => (
                        <div key={step.id} className="relative z-10 flex flex-col items-center gap-2 bg-white px-2">
                            <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black transition-colors shadow-sm border-[3px] md:border-[4px] border-white ${draft.currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                {draft.currentStep > step.id ? <Check size={16} className="md:w-5 md:h-5" /> : <span className="text-xs md:text-sm">{step.id}</span>}
                            </div>
                            <span className={`hidden md:block text-[10px] font-black uppercase tracking-widest ${draft.currentStep >= step.id ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
                {draft.currentStep === 1 && <Step1 draft={draft} meta={meta} isLoadingMeta={isLoadingMeta} />}
                {draft.currentStep === 2 && <Step2 draft={draft} meta={meta} />}
                {draft.currentStep === 3 && <Step3 draft={draft} />}
                {draft.currentStep === 4 && <Step4 draft={draft} />}
                {draft.currentStep === 5 && <Step5 draft={draft} globalYearId={globalYearId} meta={meta} setShowSuccess={setShowSuccess} />}
            </div>

            <div className="flex justify-between items-center mt-8 pb-10">
                <button onClick={() => dispatch(prevWizardStep())} disabled={draft.currentStep === 1} className="px-5 py-3 md:px-6 md:py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm">
                    <ChevronLeft size={16} /> <span className="hidden md:inline">Go Back</span>
                </button>
                <button type="submit" form={`step${draft.currentStep}-form`} className="px-6 py-3 md:px-8 md:py-3.5 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 active:scale-95 flex items-center gap-2 transition-all">
                    {draft.currentStep === 5 ? 'Submit Application' : 'Save & Continue'} <ChevronRight size={18} />
                </button>
            </div>
        </AdminLayout>
    );
};

const SkeletonLoader = () => (
    <div className="animate-pulse space-y-6">
        <div className="w-28 h-28 bg-slate-200 rounded-full mx-auto"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-14 bg-slate-100 rounded-2xl"></div><div className="h-14 bg-slate-100 rounded-2xl"></div><div className="h-14 bg-slate-100 rounded-2xl"></div>
        </div>
    </div>
);

export default AdmissionWizard;