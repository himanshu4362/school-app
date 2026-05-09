import React, { useMemo } from 'react';
import { useForm, useWatch, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ShieldCheck, UploadCloud, CheckCircle, AlertCircle, 
  Camera, Plus, Trash2, FileText, BadgeCheck 
} from 'lucide-react';

import { RootState } from '../../../../../store/store';
import { nextFacultyStep, saveVault } from '../../../../../store/slices/facultySlice';
import { FacultyVaultDTO, FacultyVaultSchema } from '../../../../../types/faculty/faculty.schema';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const StatusBadge: React.FC<{ uploaded: boolean; verified?: boolean }> = ({ uploaded, verified }) => {
  if (!uploaded) return (
    <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 uppercase">
      <AlertCircle size={10} /> Pending
    </div>
  );
  return (
    <div className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black uppercase ${verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
      {verified ? <BadgeCheck size={10} /> : <CheckCircle size={10} />}
      {verified ? 'Verified' : 'Uploaded'}
    </div>
  );
};

const DocumentCard: React.FC<{
  title: string;
  description: string;
  uploaded: boolean;
  verified?: boolean;
  mandatory?: boolean;
  error?: string;
  onUpload: () => void;
  onVerify?: () => void;
}> = ({ title, description, uploaded, verified, mandatory, error, onUpload, onVerify }) => (
  <div className={`rounded-2xl border-2 p-5 transition-all flex flex-col justify-between ${uploaded ? 'border-emerald-200 bg-emerald-50/30' : (error ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white')}`}>
    <div className="mb-4 flex items-start justify-between">
      <div className="space-y-1">
        <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
          {title} {mandatory && <span className="text-rose-500">*</span>}
        </h4>
        <p className="text-[11px] font-medium text-slate-500 leading-tight">{description}</p>
        {error && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle size={10}/> {error}</p>}
      </div>
      <StatusBadge uploaded={uploaded} verified={verified} />
    </div>
    <div className="flex gap-2 mt-auto">
      <button type="button" onClick={onUpload} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black transition-all border ${uploaded ? 'bg-white border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
        <UploadCloud size={14} /> {uploaded ? 'Attached' : 'Upload'}
      </button>
      {onVerify && (
        <button type="button" onClick={onVerify} disabled={!uploaded} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black transition-all border ${verified ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-slate-400 disabled:opacity-50'}`}>
          <ShieldCheck size={14} /> {verified ? 'Verified' : 'Verify'}
        </button>
      )}
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Step6Vault: React.FC = () => {
  const dispatch = useDispatch();
  const existingData = useSelector((state: RootState) => state.faculty.onboardingDraft.documents);

  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<FacultyVaultDTO>({
    resolver: zodResolver(FacultyVaultSchema) as any,
    mode: 'onChange',
    defaultValues: (existingData as any) || {
      aadhaarNumber: '',
      isAadhaarVerified: false,
      hasProfilePhotoUploaded: false,
      hasDegreeUploaded: false,
      hasResumeUploaded: false,
      hasExperienceLetterUploaded: false,
      additionalDocuments: []
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'additionalDocuments' });

  const isProfileUp = useWatch({ control, name: 'hasProfilePhotoUploaded' });
  const isDegreeUp = useWatch({ control, name: 'hasDegreeUploaded' });
  const isResumeUp = useWatch({ control, name: 'hasResumeUploaded' });
  const isExperienceUp = useWatch({ control, name: 'hasExperienceLetterUploaded' });
  const isAadhaarVerified = useWatch({ control, name: 'isAadhaarVerified' });
  const additionalDocs = useWatch({ control, name: 'additionalDocuments' });

  const completionStats = useMemo(() => {
    const required = [isProfileUp, isDegreeUp, isResumeUp, isAadhaarVerified];
    const completed = required.filter(Boolean).length;
    return {
      completed,
      total: required.length,
      percentage: Math.round((completed / required.length) * 100),
    };
  }, [isProfileUp, isDegreeUp, isResumeUp, isAadhaarVerified]);

  const onSubmit = (data: FacultyVaultDTO) => {
    dispatch(saveVault(data));
    dispatch(nextFacultyStep());
  };

  const onError = (errors: any) => {
    console.warn("Form Validation Blocked Submission:", errors);
  };

  return (
    <form 
      id="faculty-step6-form" 
      onSubmit={handleSubmit(onSubmit, onError)}
      className="space-y-8 animate-in fade-in duration-500"
    >
      {/* 🔴 THE FIX: HIDDEN CHECKBOXES SO REACT-HOOK-FORM CAN TRACK BOOLEANS */}
      <div className="hidden">
        <input type="checkbox" {...register('hasProfilePhotoUploaded')} />
        <input type="checkbox" {...register('isAadhaarVerified')} />
        <input type="checkbox" {...register('hasDegreeUploaded')} />
        <input type="checkbox" {...register('hasResumeUploaded')} />
        <input type="checkbox" {...register('hasExperienceLetterUploaded')} />
      </div>

      {/* 📊 SUMMARY PROGRESS CARD */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-lg font-black text-slate-900">Faculty Compliance Vault</h2>
          <p className="text-xs font-bold text-slate-500">Ensure all mandatory KYC and academic proofs are verified.</p>
        </div>
        <div className="w-full md:w-64 space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
            <span className="text-slate-400">Vault Readiness</span>
            <span className="text-indigo-600">{completionStats.percentage}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all duration-700" style={{ width: `${completionStats.percentage}%` }} />
          </div>
        </div>
      </div>

      {/* 🆔 IDENTITY & KYC */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <ShieldCheck size={16} className="text-indigo-600" />
          <h3 className="text-sm font-black text-slate-900">Identity & Government KYC</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Profile Photo Module */}
          <div className={`rounded-3xl border ${errors.hasProfilePhotoUploaded ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 bg-white'} p-6 flex flex-col items-center text-center transition-all`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 transition-all ${isProfileUp ? 'bg-indigo-100 text-indigo-600 border-4 border-indigo-200' : 'bg-slate-50 text-slate-300'}`}>
              {isProfileUp ? <CheckCircle size={40} /> : <Camera size={32} />}
            </div>
            <h4 className="text-sm font-black text-slate-900 mb-1">Profile Photograph *</h4>
            {errors.hasProfilePhotoUploaded && <p className="text-[10px] font-bold text-rose-500 mb-2">{errors.hasProfilePhotoUploaded.message as string}</p>}
            {!errors.hasProfilePhotoUploaded && <p className="text-[10px] font-bold text-slate-400 mb-4 uppercase">Mandatory for ERP Identity</p>}
            
            <button type="button" onClick={() => setValue('hasProfilePhotoUploaded', !isProfileUp, { shouldValidate: true })} className={`w-full py-2.5 rounded-xl text-xs font-black transition-all mt-auto ${isProfileUp ? 'bg-indigo-600 text-white' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              {isProfileUp ? 'Photo Uploaded' : 'Simulate Upload'}
            </button>
          </div>

          {/* Aadhaar Module */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 flex flex-col justify-between space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Aadhaar Number *</label>
              <input type="text" maxLength={12} {...register('aadhaarNumber')} placeholder="12-Digit Number" className={`w-full p-3 text-sm font-bold bg-slate-50 border-2 rounded-xl outline-none focus:border-indigo-500 transition-all ${errors.aadhaarNumber ? 'border-rose-400' : 'border-slate-200'}`} />
              {errors.aadhaarNumber && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.aadhaarNumber.message as string}</p>}
            </div>
            <button type="button" onClick={() => setValue('isAadhaarVerified', !isAadhaarVerified, { shouldValidate: true })} className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all mt-auto ${isAadhaarVerified ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              <ShieldCheck size={16} /> {isAadhaarVerified ? 'Verified' : 'Mark Physically Verified'}
            </button>
          </div>
        </div>
      </section>

      {/* 🎓 ACADEMIC VAULT */}
      <section className="space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <FileText size={16} className="text-amber-500" />
          <h3 className="text-sm font-black text-slate-900">Standard Academic Proofs</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DocumentCard title="Highest Degree" description="Primary academic qualification proof" mandatory uploaded={!!isDegreeUp} error={errors.hasDegreeUploaded?.message as string} onUpload={() => setValue('hasDegreeUploaded', !isDegreeUp, { shouldValidate: true })} />
          <DocumentCard title="Professional Resume" description="Updated teaching profile & CV" mandatory uploaded={!!isResumeUp} error={errors.hasResumeUploaded?.message as string} onUpload={() => setValue('hasResumeUploaded', !isResumeUp, { shouldValidate: true })} />
          <DocumentCard title="Experience Letter" description="Previous institution employment proof" uploaded={!!isExperienceUp} onUpload={() => setValue('hasExperienceLetterUploaded', !isExperienceUp)} />
        </div>
      </section>

      {/* 📂 CUSTOM DOCUMENTS (Dynamic) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Plus size={16} className="text-emerald-500" />
            <h3 className="text-sm font-black text-slate-900">Additional School Documents</h3>
          </div>
          <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{fields.length} Custom</span>
        </div>
        
        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col md:flex-row items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 animate-in slide-in-from-left-2 transition-all">
              <input {...register(`additionalDocuments.${index}.name`)} placeholder="e.g. Police NOC, Health Cert" className="flex-1 w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-emerald-500" />
              
              {/* 🔴 THE FIX: DYNAMIC HIDDEN CHECKBOXES */}
              <div className="hidden">
                <input type="checkbox" {...register(`additionalDocuments.${index}.isUploaded`)} />
                <input type="checkbox" {...register(`additionalDocuments.${index}.isPhysicallyVerified`)} />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <button type="button" onClick={() => setValue(`additionalDocuments.${index}.isUploaded`, !additionalDocs?.[index]?.isUploaded, { shouldValidate: true })} className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border ${additionalDocs?.[index]?.isUploaded ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                   {additionalDocs?.[index]?.isUploaded ? 'Attached' : 'Upload'}
                </button>
                <button type="button" onClick={() => setValue(`additionalDocuments.${index}.isPhysicallyVerified`, !additionalDocs?.[index]?.isPhysicallyVerified, { shouldValidate: true })} className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all border ${additionalDocs?.[index]?.isPhysicallyVerified ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-400'}`}>
                   {additionalDocs?.[index]?.isPhysicallyVerified ? 'Verified' : 'Verify'}
                </button>
                <button type="button" onClick={() => remove(index)} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          <button type="button" onClick={() => append({ id: crypto.randomUUID(), name: '', isUploaded: false, isPhysicallyVerified: false })} className="w-full py-4 border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2">
            <Plus size={18} /> Add Document Requirement
          </button>
        </div>
      </section>
    </form>
  );
};

export default Step6Vault;