import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wallet, Plus, X, Save, AlertCircle, Receipt, ShieldCheck } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertFeeComponent, clearFinanceErrors } from '../../../../store/slices/financeSlice';
import { FeeComponentSchema, FeeComponent } from '../../../../types/finance/finance.schema';
import AdminLayout from '../../components/layout/AdminLayout';

const FeeMasterHub: React.FC = () => {
  const dispatch = useDispatch();
  const { feeComponents, validationErrors } = useSelector((state: RootState) => state.finance);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FeeComponent>({
    // THE FIX: Omit ID to prevent silent validation failures
    resolver: zodResolver(FeeComponentSchema.omit({ id: true })) as any,
    defaultValues: { 
      status: 'active', 
      defaultAmount: 0,
      isTaxable: false,
      isRefundable: false,
      type: 'TUITION',
      billingCycle: 'MONTHLY'
    }
  });

  const onSubmit = (data: FeeComponent) => {
    const newComponent: FeeComponent = { ...data, id: crypto.randomUUID() };
    dispatch(upsertFeeComponent(newComponent));
    
    // Only close if there are no Redux validation errors (like duplicate names)
    setTimeout(() => {
      setIsDrawerOpen(false);
      reset();
    }, 100);
  };

  const onError = (formErrors: any) => {
    console.warn("Fee Form Validation Failed:", formErrors);
  };

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <AdminLayout 
      pageTitle="Fee Structure Master" 
      pageDescription="Define the fundamental billing components and invoicing cycles."
      breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Fee Master' }]}
    >
      {/* REDUX ERROR BANNER (For Duplicate Names) */}
      {validationErrors?.length > 0 && (
        <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <h4 className="text-xs font-black text-rose-900 uppercase tracking-widest mb-1">Financial Guardrail Blocked Save</h4>
            <ul className="list-disc pl-4 space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i} className="text-sm font-bold text-rose-700">{err.message}</li>
              ))}
            </ul>
          </div>
          <button onClick={() => dispatch(clearFinanceErrors())} className="text-rose-400 hover:text-rose-700 bg-white p-1 rounded-lg"><X size={16}/></button>
        </div>
      )}

      {/* HEADER ACTION */}
      <div className="flex justify-end mb-6">
        <button onClick={() => setIsDrawerOpen(true)} className="bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all">
          <Plus size={18}/> Define New Fee Component
        </button>
      </div>

      {/* FEE COMPONENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.values(feeComponents).length === 0 ? (
          <div className="col-span-full py-20 border-2 border-dashed border-slate-200 rounded-3xl text-center flex flex-col items-center justify-center bg-slate-50/50">
            <Wallet size={48} className="text-slate-300 mb-4"/>
            <h3 className="text-lg font-black text-slate-900">No Fee Components Defined</h3>
            <p className="text-sm font-bold text-slate-500 mt-2 max-w-md">You cannot generate student invoices until you define your billable items.</p>
          </div>
        ) : (
          Object.values(feeComponents).map(fee => (
            <div key={fee.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-blue-100 text-blue-700 mb-2 inline-block">
                    {fee.type.replace('_', ' ')}
                  </span>
                  <h4 className="text-base font-black text-slate-900 leading-tight">{fee.name}</h4>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-emerald-600">{formatCurrency(fee.defaultAmount)}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{fee.billingCycle.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex gap-2">
                {fee.isTaxable && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
                    <Receipt size={12}/> Taxable
                  </span>
                )}
                {fee.isRefundable ? (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                    <ShieldCheck size={12}/> Refundable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200">
                    Non-Refundable
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PORTAL DRAWER: NEW FEE COMPONENT */}
      {isDrawerOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[9999] flex justify-end p-2 sm:p-4">
          <div className="bg-white w-full max-w-md h-full shadow-2xl rounded-2xl overflow-hidden flex flex-col animate-in slide-in-from-right-8">
            
            <div className="p-6 border-b border-slate-100 flex justify-between bg-slate-50 items-center">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Wallet size={16} className="text-indigo-600"/> Define Fee Component
              </h3>
              <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-rose-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit, onError)} className="p-6 flex-1 overflow-y-auto space-y-6">
              
              {/* Component Name */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Component Name *</label>
                <input {...register('name')} placeholder="e.g., Class 10 Annual Tuition" className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                {errors.name && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.name.message as string}</p>}
              </div>

              {/* Type & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category Type *</label>
                  <select {...register('type')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500">
                     <option value="TUITION">Tuition Fee</option>
                     <option value="TRANSPORT">Transport Fee</option>
                     <option value="HOSTEL">Hostel Fee</option>
                     <option value="EXAM">Examination Fee</option>
                     <option value="LIBRARY">Library Fee</option>
                     <option value="LATE_FINE">Late Fine</option>
                     <option value="OTHER">Other/Misc</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Default Amount (₹) *</label>
                  <input type="number" {...register('defaultAmount', { valueAsNumber: true })} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                  {errors.defaultAmount && <p className="text-xs text-rose-500 mt-1 font-bold">{errors.defaultAmount.message as string}</p>}
                </div>
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Billing Cycle *</label>
                <select {...register('billingCycle')} className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-indigo-500">
                    <option value="MONTHLY">Monthly (12 times a year)</option>
                    <option value="QUARTERLY">Quarterly (4 times a year)</option>
                    <option value="YEARLY">Yearly (Annual Fee)</option>
                    <option value="ONE_TIME">One-Time (Admission/Security)</option>
                </select>
              </div>

              {/* Accounting Rules */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2">Accounting Rules</p>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('isRefundable')} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"/>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Refundable</p>
                    <p className="text-xs text-slate-500 font-medium">Can be refunded if student withdraws (e.g., Security Deposit).</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('isTaxable')} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"/>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Taxable Component</p>
                    <p className="text-xs text-slate-500 font-medium">Subject to GST/Tax calculations on the final invoice.</p>
                  </div>
                </label>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest mt-8 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
                <Save size={18}/> Save to Ledger Catalog
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
};

export default FeeMasterHub;