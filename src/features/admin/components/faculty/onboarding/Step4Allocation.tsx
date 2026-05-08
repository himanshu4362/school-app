import React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextFacultyStep, saveAllocation } from '../../../../../store/slices/facultySlice';
import { FacultyAllocationDTO, FacultyAllocationSchema } from '../../../../../types/faculty/faculty.schema';
import { BookOpen, Users, Plus, Trash2, LayoutTemplate } from 'lucide-react';

// Mock DB Data
const MOCK_CLASSES = [
  { id: 'cls-8a', name: 'Class 8 - Section A' },
  { id: 'cls-9a', name: 'Class 9 - Section A' },
  { id: 'cls-10a', name: 'Class 10 - Section A' },
  { id: 'cls-11sci', name: 'Class 11 - Science' }
];

const MOCK_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science'];

const Step4Allocation: React.FC = () => {
  const dispatch = useDispatch();
  const existingData = useSelector((state: RootState) => state.faculty.onboardingDraft.academicAllocation);

  const { register, control, handleSubmit, formState: { errors } } = useForm<FacultyAllocationDTO>({
    resolver: zodResolver(FacultyAllocationSchema) as any,
    defaultValues: existingData || {
      isClassTeacher: false,
      teachingAssignments: [{ classId: '', subject: '' }] // Start with one empty row
    }
  });

  // This allows us to dynamically add/remove teaching assignment rows!
  const { fields, append, remove } = useFieldArray({
    control,
    name: "teachingAssignments"
  });

  // Watch the toggle to conditionally show the Class Teacher dropdown
  const isClassTeacher = useWatch({ control, name: 'isClassTeacher' });

  const onSubmit = (data: FacultyAllocationDTO) => {
    dispatch(saveAllocation(data));
    dispatch(nextFacultyStep());
  };

  return (
    <form id="faculty-step4-form" onSubmit={handleSubmit(onSubmit as any)} className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Class Teacher Role */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-indigo-500" /> Class Monitor Assignment
            </h3>
            <p className="text-[10px] font-bold text-slate-500 mt-1">Is this faculty member taking attendance and ownership of a specific class?</p>
          </div>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" {...register('isClassTeacher')} className="sr-only peer" />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Conditionally reveal this dropdown if the toggle is ON */}
        {isClassTeacher && (
          <div className="pt-4 border-t border-slate-200 animate-in slide-in-from-top-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Assign as Class Teacher For</label>
            <select 
              {...register('classTeacherSectionId')} 
              className="w-full max-w-md p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            >
              <option value="">-- Select Class --</option>
              {MOCK_CLASSES.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Teaching Subject Workload (Dynamic Array) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <BookOpen size={16} className="text-emerald-500" /> Subject Workload Allocation
          </h3>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
            {fields.length} Assignments
          </span>
        </div>
        
        {errors.teachingAssignments?.root && (
          <p className="text-[10px] font-bold text-rose-500 bg-rose-50 p-2 rounded border border-rose-100">
            {errors.teachingAssignments.root.message}
          </p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative group">
              <div className="flex-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Target Class</label>
                <select 
                  {...register(`teachingAssignments.${index}.classId` as const)} 
                  className={`w-full p-2.5 text-sm font-bold bg-slate-50 border-2 rounded-xl outline-none ${errors.teachingAssignments?.[index]?.classId ? 'border-rose-400' : 'border-transparent focus:border-emerald-500 bg-slate-50'}`}
                >
                  <option value="">-- Select Class --</option>
                  {MOCK_CLASSES.map(cls => <option key={cls.id} value={cls.id}>{cls.name}</option>)}
                </select>
              </div>

              <div className="flex-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Subject</label>
                <select 
                  {...register(`teachingAssignments.${index}.subject` as const)} 
                  className={`w-full p-2.5 text-sm font-bold bg-slate-50 border-2 rounded-xl outline-none ${errors.teachingAssignments?.[index]?.subject ? 'border-rose-400' : 'border-transparent focus:border-emerald-500 bg-slate-50'}`}
                >
                  <option value="">-- Select Subject --</option>
                  {MOCK_SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>

              {/* Only allow deletion if there is more than 1 row */}
              {fields.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => remove(index)}
                  className="mt-5 p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Row Button */}
        <button 
          type="button" 
          onClick={() => append({ classId: '', subject: '' })}
          className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          <Plus size={16} /> Add Another Class/Subject
        </button>
      </div>

    </form>
  );
};

export default Step4Allocation;