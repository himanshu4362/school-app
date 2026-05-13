import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch } from 'react-redux';
import { Building2, MapPin, UserCircle, Send } from 'lucide-react';
import { IonContent, IonPage } from '@ionic/react';

// --- MOCK GEOGRAPHY & PINCODE DATABASE ---
const GEOGRAPHY_MASTER: Record<string, string[]> = {
    "Jharkhand": ["Ranchi", "East Singhbhum", "Dhanbad", "Bokaro"],
    "Maharashtra": ["Pune", "Mumbai", "Nagpur", "Thane"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
};

const PINCODE_MASTER: Record<string, { city: string, district: string, state: string }> = {
    "834001": { city: "Ranchi", district: "Ranchi", state: "Jharkhand" },
    "831001": { city: "Jamshedpur", district: "East Singhbhum", state: "Jharkhand" },
    "411001": { city: "Pune", district: "Pune", state: "Maharashtra" },
    "110001": { city: "New Delhi", district: "New Delhi", state: "Delhi" },
};

const DESIGNATION_OPTIONS = [
    "Principal",
    "Director",
    "Trustee",
    "Admin Officer",
    "IT Coordinator"
];

// --- ZOD VALIDATION SCHEMA ---
const SchoolRegistrationSchema = z.object({
    schoolName: z.string().min(3, "School Name must be at least 3 characters"),
    udiseCode: z.string().length(11, "UDISE code must be exactly 11 digits").regex(/^\d+$/, "UDISE must be numeric"),

    schoolAddress: z.object({
        address: z.string().min(5, "Full address is required"),
        pinCode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit Pincode required"),
        city: z.string().min(1, "City is required"),
        district: z.string().min(1, "District is required"),
        state: z.string().min(1, "State is required"),
    }),

    adminName: z.string().min(2, "Admin Name is required"),
    designation: z.string().min(1, "Please select a designation"),
    adminMobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
    adminEmail: z.string().email("Valid email address required"),
});

type RegistrationFormData = z.infer<typeof SchoolRegistrationSchema>;

const SchoolRegistration: React.FC = () => {
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors, isSubmitting },
        reset
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(SchoolRegistrationSchema),
        mode: 'onChange',
        defaultValues: {
            schoolAddress: {
                address: "",
                pinCode: "",
                city: "",
                district: "",
                state: ""
            }
        }
    });

    // --- DROPDOWN OPTIONS ---
    const stateOptions = Object.keys(GEOGRAPHY_MASTER);
    const watchState = useWatch({ control, name: 'schoolAddress.state' });
    const districtOptions = watchState ? GEOGRAPHY_MASTER[watchState] || [] : [];

    // --- HYBRID PINCODE AUTO-FILL LOGIC ---
    const watchPincode = useWatch({ control, name: 'schoolAddress.pinCode' });

    useEffect(() => {
        if (watchPincode && watchPincode.length === 6) {
            const locationData = PINCODE_MASTER[watchPincode];

            // Auto-fill if found
            if (locationData) {
                setValue('schoolAddress.state', locationData.state, { shouldValidate: true });
                // Small delay ensures state is set before district attempts to select
                setTimeout(() => {
                    setValue('schoolAddress.district', locationData.district, { shouldValidate: true });
                    setValue('schoolAddress.city', locationData.city, { shouldValidate: true });
                }, 50);
            }
        }
    }, [watchPincode, setValue]);

    // Clear district if state changes manually
    useEffect(() => {
        if (watchState && watchPincode?.length !== 6) {
            setValue('schoolAddress.district', '');
        }
    }, [watchState, setValue, watchPincode]);

    const onSubmit = (data: RegistrationFormData) => {
        console.log("[API CONTRACT] POST /api/v1/platform/provision-tenant");
        console.log(JSON.stringify(data, null, 2));

        alert("School Provisioning Payload logged to console.");
        reset();
    };

    return (
        <IonPage>
            <IonContent>
                <div className="min-h-screen bg-slate-50 py-12 px-4 flex justify-center font-sans">
                    <div className="w-full max-w-4xl">

                        <div className="mb-8 text-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
                                <Building2 size={32} className="text-white" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Institution Onboarding</h1>
                            <p className="text-slate-500 font-bold mt-2">Register a new school entity into the platform.</p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-[32px] border border-slate-200 shadow-xl overflow-hidden space-y-0">

                            {/* SECTION 1: INSTITUTION DETAILS */}
                            <div className="p-8 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                                    <Building2 size={16} className="text-blue-600" /> 1. Institutional Identity
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Official School Name *</label>
                                        <input {...register('schoolName')} type="text" className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.schoolName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="e.g. Delhi Public School" />
                                        {errors.schoolName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.schoolName.message}</p>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">UDISE Code *</label>
                                        <input {...register('udiseCode')} type="text" maxLength={11} className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.udiseCode ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="11-digit numeric code" />
                                        {errors.udiseCode && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.udiseCode.message}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 2: ADDRESS DETAILS */}
                            <div className="p-8 border-b border-slate-100">
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                                    <MapPin size={16} className="text-blue-600" /> 2. Location & Address
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    <div className="md:col-span-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Street Address *</label>
                                        <input {...register('schoolAddress.address')} type="text" className={`w-full bg-slate-50 border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.schoolAddress?.address ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="Building, Street, Area" />
                                        {errors.schoolAddress?.address && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.schoolAddress.address.message}</p>}
                                    </div>

                                    <div className="md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">PIN Code *</label>
                                        <input {...register('schoolAddress.pinCode')} type="text" maxLength={6} className={`w-full bg-slate-50 border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.schoolAddress?.pinCode ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="6-digit PIN" />
                                        {errors.schoolAddress?.pinCode && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.schoolAddress.pinCode.message}</p>}
                                    </div>

                                    <div className="md:col-span-2 grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">State *</label>
                                            <select {...register('schoolAddress.state')} className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors cursor-pointer focus:border-blue-500 ${errors.schoolAddress?.state ? 'border-rose-400' : 'border-slate-200'}`}>
                                                <option value="">Select State...</option>
                                                {stateOptions.map(state => <option key={state} value={state}>{state}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">District *</label>
                                            <select {...register('schoolAddress.district')} disabled={!watchState} className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors cursor-pointer focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${errors.schoolAddress?.district ? 'border-rose-400' : 'border-slate-200'}`}>
                                                <option value="">Select District...</option>
                                                {districtOptions.map(district => <option key={district} value={district}>{district}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">City / Taluka *</label>
                                            <input {...register('schoolAddress.city')} type="text" className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors focus:border-blue-500 ${errors.schoolAddress?.city ? 'border-rose-400' : 'border-slate-200'}`} placeholder="City Name" />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* SECTION 3: ADMIN DETAILS */}
                            <div className="p-8 bg-slate-50/50">
                                <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-2 mb-6">
                                    <UserCircle size={16} className="text-blue-600" /> 3. Primary Administrator
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Admin Full Name *</label>
                                        <input {...register('adminName')} type="text" className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.adminName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="Legal Name" />
                                        {errors.adminName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.adminName.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Designation / Role *</label>
                                        <select {...register('designation')} className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors cursor-pointer ${errors.designation ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`}>
                                            <option value="">Select Designation...</option>
                                            {DESIGNATION_OPTIONS.map((role) => (
                                                <option key={role} value={role}>{role}</option>
                                            ))}
                                        </select>
                                        {errors.designation && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.designation.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Official Email *</label>
                                        <input {...register('adminEmail')} type="email" className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.adminEmail ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="admin@school.edu" />
                                        {errors.adminEmail && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.adminEmail.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Mobile Number *</label>
                                        <input {...register('adminMobile')} type="tel" maxLength={10} className={`w-full bg-white border-2 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none transition-colors ${errors.adminMobile ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`} placeholder="10-digit number" />
                                        {errors.adminMobile && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.adminMobile.message}</p>}
                                    </div>

                                </div>

                                {/* SUBMIT BUTTON */}
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 transition-all flex justify-center items-center gap-2"
                                    >
                                        <Send size={16} />
                                        {isSubmitting ? "Processing..." : "Complete Registration"}
                                    </button>
                                </div>
                            </div>

                        </form>
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default SchoolRegistration;