import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Briefcase, IndianRupee, ShieldCheck } from 'lucide-react';
import { RootState } from '../../../../../store/store';
import { closeCandidateDrawer, updateCandidate, addCandidate } from '../../../../../store/slices/recruitmentSlice';
import { CandidateProfileDTO, CandidateProfileSchema } from '../../../../../types/faculty/recruitment.schema';
import { useHistory } from 'react-router-dom';

const CandidateDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { isCandidateDrawerOpen, selectedCandidateId, candidates, activeJobId } = useSelector((state: RootState) => state.recruitment);

 const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CandidateProfileDTO>({
    resolver: zodResolver(CandidateProfileSchema) as any, // Force bypass the resolver type mismatch
    defaultValues: { 
      pipelineState: 'applied', 
      source: 'website', 
      jobId: activeJobId || '',
      firstName: '',
      lastName: '',
      email: '',
      mobile: ''
    }
  });
  const pipelineState = useWatch({ control, name: 'pipelineState' });

  useEffect(() => {
    if (isCandidateDrawerOpen && selectedCandidateId) {
      const candidate = candidates.find(c => c.id === selectedCandidateId);
      if (candidate) reset(candidate);
    } else if (isCandidateDrawerOpen) {
      reset({ pipelineState: 'applied', source: 'website', jobId: activeJobId || '' });
    }
  }, [isCandidateDrawerOpen, selectedCandidateId, reset, candidates, activeJobId]);

  const onSubmit = (data: CandidateProfileDTO) => {
    if (selectedCandidateId) {
      dispatch(updateCandidate({ ...data, id: selectedCandidateId }));
    } else {
      dispatch(addCandidate(data));
    }
    dispatch(closeCandidateDrawer());
  };

  const triggerConversionBridge = () => {
    // In the next step, this will dispatch to the Faculty Onboarding slice!
    alert("🚀 TELEPORTING TO ONBOARDING WIZARD...\n\nExtracting verified KYC, Subject Expertise, and Negotiated Salary into the Faculty Employee pipeline.");
    dispatch(closeCandidateDrawer());
    history.push('/admin/faculty/onboarding'); // Moves them to the actual workforce system
  };

  return (
    <>
      {isCandidateDrawerOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" onClick={() => dispatch(closeCandidateDrawer())} />
      )}

      <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${isCandidateDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-black text-slate-900">{selectedCandidateId ? 'Evaluate Candidate' : 'New Candidate'}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Recruitment CRM</p>
          </div>
          <button onClick={() => dispatch(closeCandidateDrawer())} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="candidate-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
            
            {/* Status Engine (Pipeline Mover) */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <label className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Briefcase size={12}/> Pipeline Stage</label>
              <select {...register('pipelineState')} className="w-full p-2.5 text-sm font-black bg-white border-2 border-blue-200 text-blue-900 rounded-xl outline-none focus:border-blue-500">
                <option value="applied">1. Applied (Inbox)</option>
                <option value="shortlisted">2. Shortlisted</option>
                <option value="demo_scheduled">3. Demo Class Scheduled</option>
                <option value="interviewing">4. Management Interview</option>
                <option value="offer_processing">5. Offer Processing</option>
                <option value="hired_pending_conversion">6. Hired (Ready for Conversion)</option>
                <option value="talent_pool">Archived / Talent Pool</option>
              </select>
            </div>

            {/* Core Identity */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><User size={14} className="text-blue-500" /> Identity Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">First Name <span className="text-rose-500">*</span></label>
                  <input {...register('firstName')} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                  {errors.firstName && <p className="text-[10px] text-rose-500 mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Last Name <span className="text-rose-500">*</span></label>
                  <input {...register('lastName')} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Email Address</label>
                  <input {...register('email')} type="email" className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Mobile Number <span className="text-rose-500">*</span></label>
                  <input {...register('mobile')} maxLength={10} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                </div>
              </div>
            </div>

            {/* Compensation Data (Immutable Snapshot Trigger) */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><IndianRupee size={14} className="text-emerald-500" /> Compensation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Expected Salary</label>
                  <input {...register('expectedSalary', { valueAsNumber: true })} type="number" className="w-full p-2.5 text-sm font-bold bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                </div>
                <div className={pipelineState === 'offer_processing' || pipelineState === 'hired_pending_conversion' ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Offered Snapshot</label>
                  <input {...register('offeredSalarySnapshot', { valueAsNumber: true })} type="number" className="w-full p-2.5 text-sm font-bold bg-emerald-50 border-2 border-emerald-200 text-emerald-900 rounded-xl outline-none" placeholder="Negotiated Final" />
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Action Footer (The Conversion Bridge) */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex flex-col gap-3">
          <button type="submit" form="candidate-form" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm shadow-md hover:bg-slate-800 transition-all">
            Save Candidate Profile
          </button>
          
          {/* BRIGE UI: Only appears when candidate is ready to be hired */}
          {pipelineState === 'hired_pending_conversion' && (
            <button 
              onClick={triggerConversionBridge}
              type="button" 
              className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-900/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 border border-indigo-400"
            >
              <ShieldCheck size={18} /> Convert to Faculty Member
            </button>
          )}
        </div>

      </div>
    </>
  );
};

export default CandidateDrawer;