import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { nextStep, saveAddress } from '../../../../../store/slices/applicationSlice';
import { MapPin, Home } from 'lucide-react';

const AddressSchema = z.object({
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Valid 6-digit Pincode required"),
});

const Step3Schema = z.object({
  isSameAsCurrent: z.boolean(),
  currentAddress: AddressSchema,
  permanentAddress: AddressSchema,
});

type Step3Data = z.infer<typeof Step3Schema>;

const Step3Address: React.FC = () => {
  const dispatch = useDispatch();
  const { currentAddress, permanentAddress } = useSelector((state: RootState) => state.application);

  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(Step3Schema),
    mode: 'onChange',
    defaultValues: {
      isSameAsCurrent: false,
      currentAddress: currentAddress || { line1: '', line2: '', city: '', state: '', pincode: '' },
      permanentAddress: permanentAddress || { line1: '', line2: '', city: '', state: '', pincode: '' },
    }
  });

  // Watch the checkbox and current address to auto-fill permanent address
  const isSame = useWatch({ control, name: 'isSameAsCurrent' });
  const currentAddrData = useWatch({ control, name: 'currentAddress' });

  useEffect(() => {
    if (isSame) {
      setValue('permanentAddress', currentAddrData, { shouldValidate: true });
    }
  }, [isSame, currentAddrData, setValue]);

  const onSubmit = (data: Step3Data) => {
    dispatch(saveAddress({
      current: data.currentAddress,
      permanent: data.permanentAddress
    }));
    dispatch(nextStep());
  };

  return (
    <form id="step3-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-300">
      
      {/* CURRENT ADDRESS */}
      <div className="space-y-6">
        <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          <MapPin size={16} className="text-blue-500" /> Current Residential Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Address Line 1 <span className="text-rose-500">*</span></label>
            <input type="text" {...register('currentAddress.line1')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.currentAddress?.line1 ? 'border-rose-400' : 'border-slate-200'}`} placeholder="House/Flat No., Building Name, Street" />
            {errors.currentAddress?.line1 && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.currentAddress.line1.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Address Line 2</label>
            <input type="text" {...register('currentAddress.line2')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500" placeholder="Area, Landmark, Sector (Optional)" />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">City <span className="text-rose-500">*</span></label>
            <input type="text" {...register('currentAddress.city')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.currentAddress?.city ? 'border-rose-400' : 'border-slate-200'}`} placeholder="e.g. Jamshedpur" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">State <span className="text-rose-500">*</span></label>
              <input type="text" {...register('currentAddress.state')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.currentAddress?.state ? 'border-rose-400' : 'border-slate-200'}`} placeholder="e.g. Jharkhand" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pincode <span className="text-rose-500">*</span></label>
              <input type="text" maxLength={6} {...register('currentAddress.pincode')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.currentAddress?.pincode ? 'border-rose-400' : 'border-slate-200'}`} placeholder="6-digit code" />
              {errors.currentAddress?.pincode && <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.currentAddress.pincode.message}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* TOGGLE: Same as Current */}
      <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-200 rounded-xl cursor-pointer">
        <input type="checkbox" id="same-address" {...register('isSameAsCurrent')} className="w-4 h-4 text-blue-600 rounded border-blue-300 focus:ring-blue-500 cursor-pointer" />
        <label htmlFor="same-address" className="cursor-pointer text-sm font-bold text-blue-900 select-none flex-1">
          Permanent address is the same as Current address
        </label>
      </div>

      {/* PERMANENT ADDRESS */}
      {!isSame && (
        <div className="space-y-6 pt-2 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Home size={16} className="text-purple-500" /> Permanent Address
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-90">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Address Line 1</label>
              <input type="text" {...register('permanentAddress.line1')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.permanentAddress?.line1 ? 'border-rose-400' : 'border-slate-200'}`} />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Address Line 2</label>
              <input type="text" {...register('permanentAddress.line2')} className="w-full p-3 text-sm font-bold bg-white border-2 border-slate-200 rounded-xl outline-none" />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">City</label>
              <input type="text" {...register('permanentAddress.city')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.permanentAddress?.city ? 'border-rose-400' : 'border-slate-200'}`} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">State</label>
                <input type="text" {...register('permanentAddress.state')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.permanentAddress?.state ? 'border-rose-400' : 'border-slate-200'}`} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">Pincode</label>
                <input type="text" maxLength={6} {...register('permanentAddress.pincode')} className={`w-full p-3 text-sm font-bold bg-white border-2 rounded-xl outline-none ${errors.permanentAddress?.pincode ? 'border-rose-400' : 'border-slate-200'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

    </form>
  );
};

export default Step3Address;