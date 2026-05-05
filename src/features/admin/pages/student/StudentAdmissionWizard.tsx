import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { 
  User, Users, FileCheck, Wallet, ArrowRight, ArrowLeft, 
  CheckCircle2, ShieldCheck, Search, AlertCircle, Upload 
} from 'lucide-react';

const StudentAdmissionWizard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    studentName: '', dob: '', gender: '', aadhar: '',
    parentName: '', parentMobile: '', parentEmail: '', address: '',
    prevSchool: '', entranceScore: '', tcStatus: 'Pending',
    feePlan: 'Standard'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = () => {
    let newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.studentName.trim()) newErrors.studentName = "Student name is required";
      if (!formData.dob) newErrors.dob = "Date of birth is required";
      // Strict Indian Mobile Validation: 10 digits, starts with 6,7,8,9
      if (!/^[6-9]\d{9}$/.test(formData.parentMobile)) {
        newErrors.parentMobile = "Invalid mobile (Must be 10 digits starting with 6-9)";
      }
      if (!/\S+@\S+\.\S+/.test(formData.parentEmail)) newErrors.parentEmail = "Invalid email format";
    }

    if (step === 3) {
      if (!formData.entranceScore) newErrors.entranceScore = "Entrance score is mandatory for eligibility";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep()) setStep(prev => prev + 1); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  return (
    <AdminLayout 
      pageTitle="Student Admission Engine" 
      pageDescription="Direct command center for vetting applicants and finalizing enrollment."
    >
      <div className="max-w-6xl mx-auto">
        {/* Professional Stepper */}
        <div className="flex items-center justify-between mb-10 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm">
          {[
            { s: 1, l: 'KYC & Parent Profile', i: <User size={18}/> },
            { s: 2, l: 'Document Vetting', i: <FileCheck size={18}/> },
            { s: 3, l: 'Academic Eligibility', i: <ShieldCheck size={18}/> },
            { s: 4, l: 'Finance Mapping', i: <Wallet size={18}/> }
          ].map(item => (
            <div key={item.s} className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all ${
                step >= item.s ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
              }`}>
                {step > item.s ? <CheckCircle2 size={18}/> : item.i}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stage 0{item.s}</p>
                <p className={`text-xs font-bold ${step >= item.s ? 'text-slate-900' : 'text-slate-400'}`}>{item.l}</p>
              </div>
              {item.s < 4 && <div className="hidden xl:block h-px w-12 bg-slate-100 mx-2" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden min-h-[550px] flex flex-col">
          <div className="p-8 lg:p-12 flex-1">
            
            {/* STAGE 1: Profile & Mobile Validation */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h3 className="text-2xl font-black text-slate-900 mb-8">Personal & Guardian Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Student's Full Name</label>
                      <input name="studentName" value={formData.studentName} onChange={handleChange} className={`w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 ${errors.studentName ? 'border-rose-500' : 'border-transparent focus:border-blue-500'}`} placeholder="Official Name" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Parent/Guardian Name</label>
                      <input name="parentName" value={formData.parentName} onChange={handleChange} className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none" placeholder="Father/Mother Name" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Guardian Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">+91</span>
                        <input name="parentMobile" value={formData.parentMobile} onChange={handleChange} className={`w-full p-4 pl-14 bg-slate-50 rounded-2xl font-bold outline-none border-2 ${errors.parentMobile ? 'border-rose-500' : 'border-transparent focus:border-blue-500'}`} placeholder="98XXXXXXXX" />
                      </div>
                      {errors.parentMobile && <p className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1"><AlertCircle size={12}/> {errors.parentMobile}</p>}
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Guardian Email</label>
                      <input name="parentEmail" value={formData.parentEmail} onChange={handleChange} className={`w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 ${errors.parentEmail ? 'border-rose-500' : 'border-transparent focus:border-blue-500'}`} placeholder="guardian@email.com" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STAGE 4: Final Fee Mapping */}
            {step === 4 && (
              <div className="text-center py-6 animate-in zoom-in-95">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner"><Wallet size={40}/></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Finalize Enrollment</h2>
                <p className="text-slate-500 font-medium mb-10">Assign the billing category for <strong>{formData.studentName}</strong>.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
                  <div onClick={() => setFormData({...formData, feePlan: 'Standard'})} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${formData.feePlan === 'Standard' ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                    <p className="font-black uppercase text-[10px] mb-2 opacity-60">Day Scholar</p>
                    <p className="text-xl font-bold">Standard Plan</p>
                    <p className="text-xs mt-1 font-medium italic opacity-80">Tuition + Transport only</p>
                  </div>
                  <div onClick={() => setFormData({...formData, feePlan: 'Hostel'})} className={`p-6 rounded-3xl border-2 cursor-pointer transition-all ${formData.feePlan === 'Hostel' ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 border-slate-100 hover:border-slate-200'}`}>
                    <p className="font-black uppercase text-[10px] mb-2 opacity-60">Residential</p>
                    <p className="text-xl font-bold">Hostel Plan</p>
                    <p className="text-xs mt-1 font-medium italic opacity-80">Full Boarding + Mess</p>
                  </div>
                </div>

                <button className="px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 mx-auto shadow-2xl hover:scale-105 transition-all active:scale-95">
                  <CheckCircle2 size={24}/> Generate Enrollment ID
                </button>
              </div>
            )}

            {/* Stages 2 and 3 Placeholder for structure */}
            {(step === 2 || step === 3) && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 text-slate-300">
                <Upload size={64} className="opacity-10"/>
                <p className="font-black uppercase tracking-widest text-sm">Vetting Module Active</p>
                <button onClick={() => setStep(prev => prev + 1)} className="text-blue-600 font-bold underline">Fast-track to Finance Stage</button>
              </div>
            )}
          </div>

          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => setStep(prev => prev - 1)} 
              disabled={step === 1}
              className="flex items-center gap-2 font-bold text-slate-400 hover:text-slate-900 disabled:opacity-0 transition-all"
            >
              <ArrowLeft size={18}/> Back
            </button>
            {step < 4 && (
              <button 
                onClick={handleNext}
                className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black flex items-center gap-3 shadow-xl hover:bg-blue-600 transition-all"
              >
                Next Stage <ArrowRight size={18}/>
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default StudentAdmissionWizard;