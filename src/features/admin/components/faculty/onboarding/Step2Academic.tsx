import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextFacultyStep, saveAcademic } from '../../../../../store/slices/facultySlice';
import { FacultyAcademicDTO, FacultyAcademicSchema } from '../../../../../types/faculty/faculty.schema';
import { GraduationCap, Award, BookOpen, Globe } from 'lucide-react';

const COMMON_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'History', 'Geography', 'Economics', 'Accounts', 'Business Studies', 'Hindi'];
const COMMON_LANGUAGES = ['English', 'Hindi', 'Sanskrit', 'French', 'German', 'Regional Language'];

const Step2Academic: React.FC = () => {
  const dispatch = useDispatch();
  
  // Pull existing draft data if they hit "Back"
  const existingData = useSelector((state: RootState) => state.faculty.onboardingDraft.academic);

  const { register, handleSubmit, formState: { errors } } = useForm<FacultyAcademicDTO>({
    resolver: zodResolver(FacultyAcademicSchema),
    mode: 'onChange',
    defaultValues: existingData || {
      subjectExpertise: [],
      languagesKnown: [],
      yearsOfExperience: 0
    }
  });

  const onSubmit = (data: FacultyAcademicDTO) => {
    // Save to Redux Draft State
    dispatch(saveAcademic(data));
    // Move to next step
    dispatch(nextFacultyStep());
  };

  return (
    <form id="faculty-step2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">
      
      {/* Educational Qualifications */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <GraduationCap size={16} className="text-indigo-500" /> Educational Qualifications
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Highest Qualification <span className="text-rose-500">*</span></label>
            <input 
              type="text" 
              {...register('highestQualification')} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.highestQualification ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
              placeholder="e.g. M.Sc. Physics, B.Ed." 
            />
            {errors.highestQualification && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.highestQualification.message}</p>}
          </div>
          
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Award size={12}/> Additional Certifications (Optional)
            </label>
            <input 
              type="text" 
              {...register('certifications')} 
              className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" 
              placeholder="e.g. CTET Qualified, NET" 
            />
          </div>
        </div>
      </div>

      {/* Professional Experience */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2 mt-4">
          <Award size={16} className="text-indigo-500" /> Professional Experience
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Total Years of Experience <span className="text-rose-500">*</span></label>
            <input 
              type="number" 
              min="0"
              step="0.5"
              {...register('yearsOfExperience', { valueAsNumber: true })} 
              className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none transition-all ${errors.yearsOfExperience ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-indigo-500'}`} 
            />
            {errors.yearsOfExperience && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.yearsOfExperience.message}</p>}
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Previous Institution (Optional)</label>
            <input 
              type="text" 
              {...register('previousInstitution')} 
              className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500 transition-all" 
              placeholder="Name of last school worked at" 
            />
          </div>
        </div>
      </div>

      {/* Subject Expertise & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        
        {/* Subjects Checklist */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-500"/> Subject Expertise <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {COMMON_SUBJECTS.map((subject) => (
              <label key={subject} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={subject} 
                  {...register('subjectExpertise')} 
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{subject}</span>
              </label>
            ))}
          </div>
          {errors.subjectExpertise && <p className="text-[10px] font-bold text-rose-500 mt-3">{errors.subjectExpertise.message}</p>}
        </div>

        {/* Languages Checklist */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Globe size={14} className="text-emerald-500"/> Languages Known
          </label>
          <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
            {COMMON_LANGUAGES.map((lang) => (
              <label key={lang} className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  value={lang} 
                  {...register('languagesKnown')} 
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{lang}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

    </form>
  );
};

export default Step2Academic;