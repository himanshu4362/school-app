import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextStep, saveGuardians } from '../../../../../store/slices/applicationSlice';
import { Users, Plus, Trash2 } from 'lucide-react';

const GuardianSchema = z.object({
  relation: z.enum(['father', 'mother', 'guardian', 'other']),
  fullName: z.string().min(2, "Name required"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Valid 10-digit mobile required"),
  email: z.string().email("Invalid email").optional().or(z.literal('')),
  occupation: z.string().optional(),
  isPrimaryContact: z.boolean(), 
});
const Step2Schema = z.object({
  guardians: z.array(GuardianSchema).min(1, "At least one guardian is required")
});

type Step2Data = z.infer<typeof Step2Schema>;

const Step2Guardians: React.FC = () => {
  const dispatch = useDispatch();
  const existingGuardians = useSelector((state: RootState) => state.application.guardians);

  const { register, control, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(Step2Schema),
    mode: 'onChange',
    defaultValues: {
      // If we already saved guardians, load them. Otherwise, default to one empty 'father' block.
      guardians: existingGuardians || [{ relation: 'father', fullName: '', mobile: '', email: '', occupation: '', isPrimaryContact: true }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "guardians"
  });

  const onSubmit = (data: Step2Data) => {
    dispatch(saveGuardians(data.guardians));
    dispatch(nextStep());
  };

  return (
    <form id="step2-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in fade-in duration-300">
      
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <Users size={18} className="text-blue-500"/> Parent / Guardian Details
        </h3>
        <button 
          type="button" 
          onClick={() => append({ relation: 'mother', fullName: '', mobile: '', email: '', occupation: '', isPrimaryContact: false })}
          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest rounded-lg border border-blue-200 hover:bg-blue-100 flex items-center gap-1 transition-colors"
        >
          <Plus size={14} /> Add Guardian
        </button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl relative group">
          
          {/* Header & Remove Button */}
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">Guardian {index + 1}</h4>
            {fields.length > 1 && (
              <button type="button" onClick={() => remove(index)} className="text-rose-400 hover:text-rose-600 p-1">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Relation */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Relation</label>
              <select {...register(`guardians.${index}.relation`)} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500">
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="guardian">Local Guardian</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Full Name <span className="text-rose-500">*</span></label>
              <input type="text" {...register(`guardians.${index}.fullName`)} className={`w-full p-2.5 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.guardians?.[index]?.fullName ? 'border-rose-400' : 'border-slate-200'}`} placeholder="Legal Name" />
            </div>

            {/* Mobile */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Mobile Number <span className="text-rose-500">*</span></label>
              <input type="tel" maxLength={10} {...register(`guardians.${index}.mobile`)} className={`w-full p-2.5 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.guardians?.[index]?.mobile ? 'border-rose-400' : 'border-slate-200'}`} placeholder="10-digit mobile" />
              {errors.guardians?.[index]?.mobile && <p className="text-[9px] font-bold text-rose-500 mt-1">{errors.guardians[index]?.mobile?.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Email Address</label>
              <input type="email" {...register(`guardians.${index}.email`)} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Optional" />
            </div>

            {/* Occupation */}
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Occupation</label>
              <input type="text" {...register(`guardians.${index}.occupation`)} className="w-full p-2.5 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="e.g., Engineer, Business" />
            </div>

            {/* Primary Contact Toggle */}
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id={`primary-${index}`} {...register(`guardians.${index}.isPrimaryContact`)} className="w-4 h-4 text-blue-600 rounded border-slate-300 cursor-pointer" />
              <label htmlFor={`primary-${index}`} className="text-xs font-bold text-slate-700 cursor-pointer">
                Primary Contact (Receives SMS/Emails)
              </label>
            </div>
          </div>
        </div>
      ))}
    </form>
  );
};

export default Step2Guardians;