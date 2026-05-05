import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import {
    User, GraduationCap, Briefcase, FileText,
    ArrowRight, ArrowLeft, CheckCircle2, Mail, AlertCircle
} from 'lucide-react';

const NewTeacherAppointment: React.FC = () => {
    const handleNext = () => {
        if (validate()) setStep(prev => prev + 1);
    };
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '', dob: '', aadhar: '', mobile: '', email: '',
        degree: '', board: '', specialization: '',
        prevSchool: '', expYears: '',
        offeredSalary: '', joiningDate: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = () => {
        let newErrors: Record<string, string> = {};
        if (step === 1) {
            if (!formData.fullName.trim()) newErrors.fullName = "Legal name required";
            if (!/^[6-9]\d{9}$/.test(formData.mobile)) newErrors.mobile = "Mobile must be 10 digits starting with 6-9";
            if (!/^\d{12}$/.test(formData.aadhar)) newErrors.aadhar = "Aadhar must be 12 digits";
        }
        if (step === 2) {
            if (!formData.degree) newErrors.degree = "Degree is required";
            if (!formData.specialization) newErrors.specialization = "Specialization required";
        }
        if (step === 4 && !formData.offeredSalary) newErrors.offeredSalary = "Salary must be defined";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
    };
    return (
        <AdminLayout pageTitle="Teacher Appointment Pipeline" pageDescription="Securely register new faculty and issue legal joining letters.">
            <div className="max-w-5xl mx-auto">
                {/* Progress Stepper */}
                <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl border border-slate-200">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`flex items-center gap-2 ${step >= s ? 'text-blue-600' : 'text-slate-300'}`}>
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>{s}</div>
                            <span className="text-xs font-black uppercase tracking-tighter hidden md:block">Step 0{s}</span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                    <div className="p-8 lg:p-12 flex-1">
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-xl font-black flex items-center gap-2"><User /> Identity</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="text-[10px] font-black uppercase text-slate-400">Full Name</label>
                                        <input name="fullName" value={formData.fullName} onChange={handleChange} className={`w-full p-4 bg-slate-50 rounded-xl outline-none border-2 ${errors.fullName ? 'border-rose-500' : 'border-transparent'}`} /></div>
                                    <div><label className="text-[10px] font-black uppercase text-slate-400">Mobile</label>
                                        <input name="mobile" value={formData.mobile} onChange={handleChange} placeholder="6xxx-xxxxxx" className={`w-full p-4 bg-slate-50 rounded-xl outline-none border-2 ${errors.mobile ? 'border-rose-500' : 'border-transparent'}`} /></div>
                                </div>
                            </div>
                        )}


                        {/* Steps 2 and 3 can be implemented with similar patterns */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-xl font-black flex items-center gap-2"><GraduationCap /> Academic Vetting</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div><label className="text-[10px] font-black uppercase text-slate-400">Highest Degree</label>
                                        <select name="degree" onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-xl"><option value="">Select</option><option>B.Ed</option><option>M.Sc</option><option>PhD</option></select></div>
                                    <div><label className="text-[10px] font-black uppercase text-slate-400">Specialization</label>
                                        <input name="specialization" onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="e.g. Quantum Physics" /></div>
                                </div>
                            </div>
                        )}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-xl font-black flex items-center gap-2"><Briefcase /> Experience History</h3>
                                <div><label className="text-[10px] font-black uppercase text-slate-400">Previous Institution</label>
                                    <input name="prevSchool" onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-xl" placeholder="Last School Name" /></div>
                                <div><label className="text-[10px] font-black uppercase text-slate-400">Total Years of Exp</label>
                                    <input name="expYears" type="number" onChange={handleChange} className="w-full p-4 bg-slate-50 rounded-xl" /></div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center space-y-6">
                                <div className="p-8 bg-slate-900 rounded-3xl text-white">
                                    <p className="text-sm text-slate-400">Final Salary Assignment</p>
                                    <input name="offeredSalary" type="number" onChange={handleChange} className="bg-transparent text-4xl font-black text-center outline-none w-full border-b border-white/10 py-4" placeholder="₹ 00,000" />
                                </div>
                                <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"><Mail /> Issue Official Joining Letter</button>
                            </div>
                        )}
                    </div>

                    {step < 4 && (
                        <div className="mt-8 flex justify-between">
                            <button onClick={() => setStep(s => s - 1)} disabled={step === 1} className="text-slate-400 font-bold">Back</button>
                            <button onClick={() => validate() && setStep(s => s + 1)} className="px-10 py-4 bg-slate-900 text-white rounded-xl font-black">Continue</button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};
export default NewTeacherAppointment;