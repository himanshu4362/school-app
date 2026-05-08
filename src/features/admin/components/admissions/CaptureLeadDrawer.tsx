import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Phone, BookOpen, Search } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { closeLeadDrawer } from '../../../../store/slices/admissionSlice';
import { AdmissionLeadDTO, AdmissionLeadSchema } from '../../../../types/admission/lead.schema';

const CaptureLeadDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { isDrawerOpen, selectedLeadId } = useSelector((state: RootState) => state.admission);

  // Initialize React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AdmissionLeadDTO>({
    resolver: zodResolver(AdmissionLeadSchema),
    defaultValues: {
      status: 'new',
      source: 'walk_in',
      campaignId: 'CAMP-2026-DEFAULT', // This would normally come from active config
    }
  });

  // Reset form when drawer opens/closes or when switching to editing a lead
  useEffect(() => {
    if (isDrawerOpen && !selectedLeadId) {
      reset({ status: 'new', source: 'walk_in', campaignId: 'CAMP-2026-DEFAULT' });
    }
  }, [isDrawerOpen, selectedLeadId, reset]);

  const onSubmit = async (data: AdmissionLeadDTO) => {
    try {
      console.log("🚀 Validated Lead Payload:", data);
      // TODO: Dispatch API call here
      
      alert("Lead Captured Successfully!");
      dispatch(closeLeadDrawer());
      reset();
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => dispatch(closeLeadDrawer())}
        />
      )}

      {/* Slide-over Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-drawer z-50 flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              {selectedLeadId ? 'Edit Enquiry' : 'Capture New Lead'}
            </h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Pre-Admission CRM</p>
          </div>
          <button 
            onClick={() => dispatch(closeLeadDrawer())} 
            className="p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Contact Details Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Parent Details
              </h3>
              
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Parent / Guardian Name <span className="text-rose-500">*</span></label>
                <input 
                  {...register('parentName')}
                  type="text" 
                  className={`w-full p-2.5 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.parentName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`}
                  placeholder="Full Name"
                />
                {errors.parentName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.parentName.message}</p>}
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Mobile Number <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    {...register('mobile')}
                    type="tel" 
                    maxLength={10}
                    className={`w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.mobile ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-500'}`}
                    placeholder="10-digit mobile number"
                  />
                </div>
                {errors.mobile && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.mobile.message}</p>}
              </div>
            </div>

            {/* Interest & Source Section */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
                <BookOpen size={14} className="text-purple-500" /> Enrollment Interest
              </h3>
              
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Interested Class</label>
                <select 
                  {...register('interestedClassId')}
                  className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500"
                >
                  <option value="">Select a Class...</option>
                  <option value="Class 1">Class 1</option>
                  <option value="Class 6">Class 6</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 11">Class 11</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Enquiry Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['walk_in', 'website', 'referral', 'other'] as const).map(source => (
                    <label key={source} className="cursor-pointer">
                      <input type="radio" value={source} {...register('source')} className="peer sr-only" />
                      <div className="p-2 text-center text-[10px] font-bold uppercase tracking-widest rounded-lg border-2 border-slate-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all text-slate-500">
                        {source.replace('_', ' ')}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Internal Remarks</label>
                <textarea 
                  {...register('remarks')}
                  className="w-full p-3 text-sm font-medium bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500"
                  rows={3}
                  placeholder="Notes from interaction..."
                />
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button 
            type="submit"
            form="lead-form"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save Lead'}
          </button>
        </div>

      </div>
    </>
  );
};

export default CaptureLeadDrawer;