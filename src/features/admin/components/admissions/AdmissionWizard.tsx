import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { prevStep } from '../../../../store/slices/applicationSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { ChevronRight, ChevronLeft, Check, ShieldCheck } from 'lucide-react';

import Step1Student from '../../components/admissions/wizard/Step1Student';
import Step2Guardians from '../../components/admissions/wizard/Step2Guardians';
import Step3Address from '../../components/admissions/wizard/Step3Address';
import Step4Academics from '../../components/admissions/wizard/Step4Academics';
import Step5Vault from '../../components/admissions/wizard/Step5Vault';

const WIZARD_STEPS = [
  { id: 1, title: 'Student' },
  { id: 2, title: 'Guardians' },
  { id: 3, title: 'Address' },
  { id: 4, title: 'Academics' },
  { id: 5, title: 'Vault' },
];

const AdmissionWizard: React.FC = () => {
  const dispatch = useDispatch();
  const { currentStep } = useSelector((state: RootState) => state.application);

  // Dynamic Step Renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1Student />
      case 2: return <Step2Guardians />
      case 3: return <Step3Address />;
      case 4: return <Step4Academics />;
      case 5: return <Step5Vault />;
      default: return null;
    }
  };

  return (
    <AdminLayout
      pageTitle="Application Wizard"
      pageDescription="Enterprise admission pipeline orchestrator."
      breadcrumbs={[{ label: 'Admissions Hub', path: '/admin/admissions' }, { label: 'New Application' }]}
    >
      <div className="max-w-4xl mx-auto">

        {/* 1. PROGRESS BAR */}
        <div className="flex justify-between items-center mb-8">
          {WIZARD_STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${isActive ? 'bg-blue-600 text-white shadow-md' :
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {isCompleted ? <Check size={14} /> : step.id}
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-black hidden md:block ${isActive ? 'text-slate-900' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                    {step.title}
                  </span>
                </div>
                {idx < WIZARD_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 rounded-full ${isCompleted ? 'bg-emerald-100' : 'bg-slate-100'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* 2. STEP CONTENT (The active form) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* 3. MASTER CONTROLS */}
        <div className="flex justify-between items-center mt-6 pb-10">
          <button 
            onClick={() => dispatch(prevStep())}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Back
          </button>

          <button 
            type="submit"
            form={`step${currentStep}-form`} 
            className={`px-8 py-3 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center gap-2 ${
              currentStep === 5 
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95' 
                : 'bg-slate-900 hover:bg-blue-600 active:scale-95'
            }`}
          >
            {currentStep === 5 ? 'Submit Application' : 'Save & Continue'} 
            {currentStep === 5 ? <ShieldCheck size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdmissionWizard;