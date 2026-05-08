import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { prevFacultyStep } from '../../../../store/slices/facultySlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { ChevronRight, ChevronLeft, Check, ShieldCheck } from 'lucide-react';

// Import our steps (We will build Step 1 next)
import Step1Identity from '../../components/faculty/onboarding/Step1Identity';
import Step2Academic from '../../components/faculty/onboarding/Step2Academic';
import Step3Employment from '../../components/faculty/onboarding/Step3Employment';
import Step4Allocation from '../../components/faculty/onboarding/Step4Allocation';
import Step5Payroll from '../../components/faculty/onboarding/Step5Payroll';
import Step6Vault from '../../components/faculty/onboarding/Step6Vault';
import Step7Access from '../../components/faculty/onboarding/Step7Access';

const WIZARD_STEPS = [
  { id: 1, title: 'Identity' },
  { id: 2, title: 'Academic' },
  { id: 3, title: 'Employment' },
  { id: 4, title: 'Allocation' },
  { id: 5, title: 'Payroll' },
  { id: 6, title: 'Vault' },
  { id: 7, title: 'Access' },
];

const FacultyOnboardingWizard: React.FC = () => {
  const dispatch = useDispatch();

  // Pulling state from the facultySlice we created earlier
  const { currentStep } = useSelector((state: RootState) => state.faculty.onboardingDraft);

  // Dynamic Step Renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return <Step1Identity />;
      case 2: return <Step2Academic />;
      case 3: return <Step3Employment />;
      case 4: return <Step4Allocation />;
      case 5: return <Step5Payroll />;
      case 6: return <Step6Vault />;
      case 7: return <Step7Access />;
       default: return null;
    }
  };

  return (
    <AdminLayout
      pageTitle="Faculty Onboarding"
      pageDescription="Strict 7-step lifecycle pipeline for new staff registration."
      breadcrumbs={[{ label: 'HR & Faculty' }, { label: 'Onboarding Wizard' }]}
    >
      <div className="max-w-5xl mx-auto">

        {/* 1. PROGRESS BAR */}
        <div className="flex justify-between items-center mb-8 overflow-x-auto pb-4 custom-scrollbar">
          {WIZARD_STEPS.map((step, idx) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center flex-1 min-w-[80px] last:flex-none">
                <div className="flex flex-col items-center gap-2 w-full">
                  <div className="flex items-center w-full">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black transition-all ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' :
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}>
                      {isCompleted ? <Check size={14} /> : step.id}
                    </div>
                    {idx < WIZARD_STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full ${isCompleted ? 'bg-emerald-100' : 'bg-slate-100'}`} />
                    )}
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-black text-center ${isActive ? 'text-slate-900' : isCompleted ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                    {step.title}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. STEP CONTENT */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-8 min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* 3. MASTER CONTROLS */}
        <div className="flex justify-between items-center mt-6 pb-10">
          <button
            onClick={() => dispatch(prevFacultyStep())}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <ChevronLeft size={16} /> Back
          </button>

          {/* This button targets the form ID of whatever step is currently active */}
          <button
            type="submit"
            form={`faculty-step${currentStep}-form`}
            className={`px-8 py-3 text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center gap-2 ${currentStep === 7
              ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
          >
            {currentStep === 7 ? 'Activate Faculty Member' : 'Save & Continue'}
            {currentStep === 7 ? <ShieldCheck size={16} /> : <ChevronRight size={16} />}
          </button>
        </div>

      </div>
    </AdminLayout>
  );
};

export default FacultyOnboardingWizard;