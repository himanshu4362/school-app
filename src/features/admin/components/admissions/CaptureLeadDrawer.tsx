import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Phone, BookOpen, Mail } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { closeLeadDrawer, addLead, updateLeadStatus, updateLead } from '../../../../store/slices/admissionSlice';
import api from '../../../../services/api';

const CaptureLeadDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { isDrawerOpen, selectedLeadId, leads } = useSelector((state: RootState) => state.admission);
  const grades = useSelector((state: RootState) => state.systemConfig.grades);

  // 🟢 FIXED: Solid fallback defaults so the UI NEVER disappears!
  const [metadata, setMetadata] = useState<{ statuses: { label: string, value: string }[], sources: { label: string, value: string }[] }>({
    statuses: [
      { value: 'new', label: 'New Enquiry' },
      { value: 'contacted', label: 'Contacted' },
      { value: 'follow_up', label: 'Follow Up' },
      { value: 'converted', label: 'Converted to Application' },
      { value: 'closed', label: 'Closed / Rejected' }
    ],
    sources: [
      { value: 'walk_in', label: 'Walk In' },
      { value: 'website', label: 'Website' },
      { value: 'referral', label: 'Referral' },
      { value: 'other', label: 'Other' }
    ]
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<any>({
    defaultValues: { status: 'new', source: 'walk_in', campaignId: 'CAMP-2026-DEFAULT' }
  });

  // Fetch updates from API quietly in the background
  useEffect(() => {
    api.get('/api/admissions/leads/metadata').then(res => {
      // Only override if the API gives us valid data
      if (res.data.success && res.data.data.sources.length > 0) {
        setMetadata(res.data.data);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (isDrawerOpen && selectedLeadId) {
      const leadToEdit = leads.find((l: any) => l.id === selectedLeadId || l._id === selectedLeadId);
      if (leadToEdit) {
        reset({
          ...leadToEdit,
          interestedClassId: (leadToEdit.interestedClassId as any)?._id || leadToEdit.interestedClassId || ''
        });
      }
    } else if (isDrawerOpen) {
      reset({ status: 'new', source: 'walk_in', campaignId: 'CAMP-2026-DEFAULT', remarks: '', email: '', mobile: '', parentName: '' });
    }
  }, [isDrawerOpen, selectedLeadId, reset, leads]);

  const onSubmit = async (data: any) => {
    try {
      if (selectedLeadId) {
        await api.patch(`/api/admissions/leads/${selectedLeadId}/status`, {
          status: data.status,
          remarks: data.remarks
        });
        dispatch(updateLeadStatus({ id: selectedLeadId, status: data.status }));
        dispatch(updateLead({ ...data, id: selectedLeadId }));
        alert("Lead Pipeline Stage Updated!");
      } else {
        const response = await api.post('/api/admissions/leads', data);
        const newLead = { ...response.data.data, id: response.data.data._id };
        dispatch(addLead(newLead));
      }
      dispatch(closeLeadDrawer());
      reset();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to save lead.");
    }
  };

  return (
    <>
      {isDrawerOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => dispatch(closeLeadDrawer())} />}

      <div className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-white shadow-drawer z-50 flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200 ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900">{selectedLeadId ? 'Edit Enquiry' : 'Capture New Lead'}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Pre-Admission CRM</p>
          </div>
          <button onClick={() => dispatch(closeLeadDrawer())} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="lead-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><User size={14} className="text-blue-500" /> Parent Details</h3>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Parent Name *</label>
                <input {...register('parentName', { required: true })} className="w-full p-2.5 text-sm font-bold bg-white border-2 rounded-xl outline-none focus:border-blue-500 border-slate-200" placeholder="Full Name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Mobile Number *</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('mobile', { required: true })} type="tel" maxLength={10} className="w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input {...register('email')} type="email" className="w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pipeline Stage</label>
              <select {...register('status')} className="w-full p-2.5 text-sm font-bold bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-xl outline-none focus:border-blue-500">
                {metadata.statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><BookOpen size={14} className="text-purple-500" /> Enrollment Interest</h3>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Interested Class</label>
                <select {...register('interestedClassId')} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500">
                  <option value="">Select a Class...</option>
                  {Object.values(grades).map((grade: any) => <option key={grade._id || grade.id} value={grade._id || grade.id}>{grade.name}</option>)}                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Enquiry Source</label>
                <div className="grid grid-cols-2 gap-2">
                  {metadata.sources.map(source => (
                    <label key={source.value} className="cursor-pointer">
                      <input type="radio" value={source.value} {...register('source')} className="peer sr-only" />
                      <div className="p-2 text-center text-[10px] font-bold uppercase tracking-widest rounded-lg border-2 border-slate-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 transition-all text-slate-500">
                        {source.label}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Internal Remarks</label>
                <textarea {...register('remarks')} className="w-full p-3 text-sm font-medium bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" rows={3} />
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button type="submit" form="lead-form" disabled={isSubmitting} className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl hover:bg-blue-700 transition-all flex justify-center gap-2">
            {isSubmitting ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      </div>
    </>
  );
};

export default CaptureLeadDrawer;