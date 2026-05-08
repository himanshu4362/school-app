import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextFacultyStep, saveEmployment } from '../../../../../store/slices/facultySlice';
import { FacultyEmploymentDTO, FacultyEmploymentSchema } from '../../../../../types/faculty/faculty.schema';
import { Briefcase, Building2, CalendarDays, Clock, UserCheck } from 'lucide-react';

// --- MOCK DATABASE ENTITIES ---
// In a real production app, these would be fetched from your backend APIs
const MOCK_DEPARTMENTS = [
  { id: 'dept-sci', name: 'Science & Mathematics' },
  { id: 'dept-hum', name: 'Humanities & Languages' },
  { id: 'dept-com', name: 'Commerce & Accounts' },
  { id: 'dept-pe', name: 'Physical Education' },
  { id: 'dept-admin', name: 'School Administration' }
];

const MOCK_DESIGNATIONS = [
  { id: 'desg-prin', name: 'Principal' },
  { id: 'desg-hod', name: 'Head of Department (HOD)' },
  { id: 'desg-pgt', name: 'Post Graduate Teacher (PGT)' },
  { id: 'desg-tgt', name: 'Trained Graduate Teacher (TGT)' },
  { id: 'desg-prt', name: 'Primary Teacher (PRT)' },
  { id: 'desg-coord', name: 'Academic Coordinator' }
];

const Step3Employment: React.FC = () => {
  const dispatch = useDispatch();
  
  const existingData = useSelector((state: RootState) => state.faculty.onboardingDraft.employment);

  const { register, handleSubmit, formState: { errors } } = useForm<FacultyEmploymentDTO>({
    resolver: zodResolver(FacultyEmploymentSchema) as any, // Bypass strict inference if needed
    mode: 'onChange',
    defaultValues: existingData || {
      employmentType: 'full_time',
      workShift: 'general'
    }
  });

  const onSubmit = (data: FacultyEmploymentDTO) => {
    dispatch(saveEmployment(data));
    dispatch(nextFacultyStep());
  };

  return (
    <form id="faculty-step3-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Core Employment Identity */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <Briefcase size={16} className="text-indigo-500" /> Contract & Timeline
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Employee ID <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              {...register('employeeId')} 
              className={`w-full p-3 text-sm font-bold bg-slate-50 border-2 rounded-xl outline-none uppercase transition-all ${errors.employeeId ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
              placeholder="e.g. TCH-2026-001" 
            />
            {errors.employeeId && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.employeeId.message}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <CalendarDays size={12}/> Date of Joining <span className="text-rose-500">*</span>
            </label>
            <input 
              type="date" 
              {...register('joiningDate')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.joiningDate ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
            />
            {errors.joiningDate && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.joiningDate.message as string}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Probation End Date</label>
            <input 
              type="date" 
              {...register('probationEndDate')} 
              className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" 
            />
          </div>
        </div>
      </div>

      {/* 2. Organizational Deployment */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 mt-4">
          <Building2 size={16} className="text-indigo-500" /> Organizational Deployment
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <label className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1.5 block">Department <span className="text-rose-500">*</span></label>
            <select 
              {...register('departmentId')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.departmentId ? 'border-rose-400' : 'border-indigo-200 focus:border-indigo-500'}`}
            >
              <option value="">-- Select Department --</option>
              {MOCK_DEPARTMENTS.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
            {errors.departmentId && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.departmentId.message}</p>}
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <label className="text-[10px] font-black text-indigo-800 uppercase tracking-widest mb-1.5 block">Designation / Role <span className="text-rose-500">*</span></label>
            <select 
              {...register('designationId')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.designationId ? 'border-rose-400' : 'border-indigo-200 focus:border-indigo-500'}`}
            >
              <option value="">-- Select Designation --</option>
              {MOCK_DESIGNATIONS.map(desg => (
                <option key={desg.id} value={desg.id}>{desg.name}</option>
              ))}
            </select>
            {errors.designationId && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.designationId.message}</p>}
          </div>
        </div>
      </div>

      {/* 3. Operations & Shift */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <UserCheck size={12}/> Employment Type
          </label>
          <select {...register('employmentType')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500">
            <option value="full_time">Full Time Regular</option>
            <option value="contract">Contractual</option>
            <option value="probation">On Probation</option>
            <option value="part_time">Part Time / Visiting</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Clock size={12}/> Work Shift
          </label>
          <select {...register('workShift')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500">
            <option value="morning">Morning Shift</option>
            <option value="general">General Shift (Day)</option>
            <option value="evening">Evening Shift</option>
          </select>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Reporting Manager (Optional)</label>
          <select {...register('reportingManagerId')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500">
            <option value="">-- No Direct Manager --</option>
            <option value="mgr-001">Dr. Sharma (Principal)</option>
            <option value="mgr-002">Mr. Verma (Science HOD)</option>
          </select>
        </div>
      </div>

    </form>
  );
};

export default Step3Employment;