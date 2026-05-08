import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextFacultyStep, savePayroll } from '../../../../../store/slices/facultySlice';
import { FacultyPayrollDTO, FacultyPayrollSchema } from '../../../../../types/faculty/faculty.schema';
import { IndianRupee, Landmark, ShieldAlert } from 'lucide-react';

const Step5Payroll: React.FC = () => {
  const dispatch = useDispatch();
  
  // Pull existing draft data if they hit "Back"
  const existingData = useSelector((state: RootState) => state.faculty.onboardingDraft.payroll);

  const { register, handleSubmit, formState: { errors } } = useForm<FacultyPayrollDTO>({
    resolver: zodResolver(FacultyPayrollSchema) as any,
    mode: 'onChange',
    defaultValues: existingData || {}
  });

  const onSubmit = (data: FacultyPayrollDTO) => {
    dispatch(savePayroll(data));
    dispatch(nextFacultyStep());
  };

  return (
    <form id="faculty-step5-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Base Compensation */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <IndianRupee size={16} className="text-emerald-500" /> Compensation Structure
        </h3>
        
        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-1.5 block">Monthly Base Salary (₹) <span className="text-rose-500">*</span></label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-slate-400 font-bold">₹</span>
              </div>
              <input 
                type="number" 
                {...register('baseSalary', { valueAsNumber: true })} 
                className={`w-full pl-8 p-4 text-lg font-black bg-white border-2 rounded-xl outline-none transition-all ${errors.baseSalary ? 'border-rose-400 focus:border-rose-500 text-rose-600' : 'border-emerald-200 focus:border-emerald-500 text-emerald-900'}`} 
                placeholder="0.00" 
              />
            </div>
            {errors.baseSalary && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.baseSalary.message}</p>}
          </div>
          
          <div className="flex-1 w-full text-xs font-bold text-emerald-700 bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
            <p className="mb-1 flex items-center gap-1.5"><ShieldAlert size={14}/> <strong>Note on Deductions:</strong></p>
            <p className="text-emerald-600/80 leading-relaxed">This base salary will be used by the Payroll Engine to calculate daily wages for LWP (Leave Without Pay) and late-mark deductions.</p>
          </div>
        </div>
      </div>

      {/* 2. Banking Details */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 mt-4">
          <Landmark size={16} className="text-indigo-500" /> Direct Deposit / Banking
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Bank Name <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              {...register('bankName')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.bankName ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
              placeholder="e.g. State Bank of India" 
            />
            {errors.bankName && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.bankName.message}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Account Number <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              {...register('accountNumber')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.accountNumber ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
              placeholder="Enter account number" 
            />
            {errors.accountNumber && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.accountNumber.message}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">IFSC Code <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              {...register('ifscCode')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none uppercase transition-all ${errors.ifscCode ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
              placeholder="e.g. SBIN0001234" 
            />
            {errors.ifscCode && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.ifscCode.message}</p>}
          </div>
        </div>
      </div>

      {/* 3. Tax & Compliance Identifiers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 block">PAN Number (Tax ID)</label>
          <input 
            type="text" 
            maxLength={10}
            {...register('panNumber')} 
            className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 uppercase" 
            placeholder="ABCDE1234F" 
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1.5 block">UAN Number (Provident Fund)</label>
          <input 
            type="text" 
            maxLength={12}
            {...register('uanNumber')} 
            className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500" 
            placeholder="12-digit UAN" 
          />
        </div>
      </div>

    </form>
  );
};

export default Step5Payroll;