import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { UserPlus, Contact2, Wallet, ScrollText, ArrowRight } from 'lucide-react';

const NewEnrollment: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  return (
    <AdminLayout
      pageTitle="Enrollment Wizard"
      pageDescription="Step-by-step registration for new student intake."
    >
      <div className="max-w-5xl">
        {/* Step Progress */}
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 custom-scrollbar">
          {[
            { n: '01', l: 'Student Info', active: true },
            { n: '02', l: 'Parent/Guardian', active: false },
            { n: '03', l: 'Medical & Transport', active: false },
            { n: '04', l: 'Fee Assignment', active: false }
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-black ${step.active ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-400 border border-slate-200'}`}>
                {step.n}
              </div>
              <span className={`text-sm font-bold whitespace-nowrap ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>{step.l}</span>
              {i < 3 && <div className="h-px w-8 bg-slate-200 mx-2" />}
            </div>
          ))}
        </div>

        {/* Data Intake Form */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">

            {/* Form Left Side */}
            <div className="md:col-span-8 p-8 lg:p-12 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Official Full Name</label>
                  <input className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-lg font-bold placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all outline-none" placeholder="Aarav Kumar Sharma" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Admission For Grade</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none">
                    <option>Grade 10</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Date of Birth</label>
                  <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white outline-none" />
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-900/20 active:scale-95">
                  Save & Continue <ArrowRight size={18} />
                </button>
              </div>

              {currentStep === 4 && (
                <div className="p-8 text-center">
                  <h3 className="font-bold mb-4">Step 4: Finalize & Generate Enrollment ID</h3>
                  <button
                    onClick={() => alert("Admission Complete! ID: DPS/2026/1024 Generated.")}
                    className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black"
                  >
                    Commit Admission
                  </button>
                </div>
              )}

            </div>

            {/* Quick Context Sidebar */}
            <div className="md:col-span-4 bg-slate-50/80 border-l border-slate-100 p-8 space-y-8">
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase mb-4">Required Documents</h5>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <ScrollText size={16} className="text-slate-400" /> Birth Certificate
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                    <ScrollText size={16} className="text-slate-400" /> Transfer Certificate
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default NewEnrollment;