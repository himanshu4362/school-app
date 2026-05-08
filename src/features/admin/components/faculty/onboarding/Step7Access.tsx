import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { saveAccess, completeOnboarding } from '../../../../../store/slices/facultySlice';
import { FacultyAccessDTO, FacultyAccessSchema } from '../../../../../types/faculty/faculty.schema';
import { KeyRound, ShieldCheck, Mail, Fingerprint, Eye, EyeOff } from 'lucide-react';
import { useHistory } from 'react-router-dom';

const Step7Access: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const draft = useSelector((state: RootState) => state.faculty.onboardingDraft);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FacultyAccessDTO>({
    resolver: zodResolver(FacultyAccessSchema) as any,
    defaultValues: draft.accessConfig || {
      systemRole: 'teacher',
      isAccountActive: true,
      sendWelcomeEmail: true
    }
  });

  // Auto-generate credentials based on Step 1 & Step 3 data
  useEffect(() => {
    if (!draft.accessConfig) {
      const firstName = draft.identity?.firstName?.toLowerCase() || 'user';
      const empId = draft.employment?.employeeId?.split('-').pop() || '000';
      setValue('username', `${firstName}.${empId}@nexus.edu`);
      setValue('password', `Welcome@${empId}`); // Standardized temp password
    }
  }, [draft, setValue]);

  const onSubmit = (data: FacultyAccessDTO) => {
    dispatch(saveAccess(data));
    dispatch(completeOnboarding());
    
    // SUCCESS: Navigate to Directory
    alert("🎉 Faculty Member Successfully Activated!");
    history.push('/admin/faculty/directory');
  };

  return (
    <form id="faculty-step7-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="text-center space-y-2 mb-10">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <Fingerprint size={32} />
        </div>
        <h3 className="text-xl font-black text-slate-900">Generate System Identity</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Final Lifecycle Handshake</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Credential Box */}
        <div className="space-y-6 bg-slate-900 p-8 rounded-[2rem] text-white shadow-2xl">
          <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
            <KeyRound size={16} /> Portal Credentials
          </h4>
          
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Official Username</label>
            <input 
              {...register('username')} 
              className="w-full bg-slate-800 border-2 border-slate-700 p-3 rounded-xl text-sm font-bold text-indigo-300 outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Temporary Password</label>
            <div className="relative">
              <input 
                type="text"
                {...register('password')} 
                className="w-full bg-slate-800 border-2 border-slate-700 p-3 rounded-xl text-sm font-bold text-emerald-400 outline-none focus:border-indigo-500 transition-all"
              />
              <ShieldCheck className="absolute right-4 top-3 text-slate-500" size={18} />
            </div>
            <p className="text-[9px] text-slate-500 mt-2 italic font-bold">* Teacher will be forced to change password on first login.</p>
          </div>
        </div>

        {/* Permissions & Actions */}
        <div className="space-y-6 py-2">
          <div className="p-5 bg-white border-2 border-slate-100 rounded-2xl shadow-sm">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">System Access Role (RBAC)</label>
            <select 
              {...register('systemRole')} 
              className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-black text-slate-900 outline-none focus:border-indigo-500"
            >
              <option value="teacher">Standard Faculty</option>
              <option value="hod">Department Head (HOD)</option>
              <option value="coordinator">Academic Coordinator</option>
              <option value="principal">School Principal</option>
              <option value="hr_admin">HR Administrator</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-colors">
              <input type="checkbox" {...register('sendWelcomeEmail')} className="w-5 h-5 rounded-lg text-emerald-600" />
              <div>
                <p className="text-sm font-black text-emerald-900 flex items-center gap-2">Send Welcome Email <Mail size={14}/></p>
                <p className="text-[10px] font-bold text-emerald-600">Auto-send login credentials to their personal email.</p>
              </div>
            </label>

            <label className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer opacity-60">
              <input type="checkbox" {...register('isAccountActive')} className="w-5 h-5 rounded-lg text-slate-600" />
              <div>
                <p className="text-sm font-black text-slate-900">Activate Account Instantly</p>
                <p className="text-[10px] font-bold text-slate-500">Uncheck to park the account until joining date.</p>
              </div>
            </label>
          </div>
        </div>

      </div>
    </form>
  );
};

export default Step7Access;