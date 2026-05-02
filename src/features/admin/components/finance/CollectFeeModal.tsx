import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, Printer } from 'lucide-react';


interface CollectFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: { name: string; id: string; due: number };
}

const CollectFeeModal: React.FC<CollectFeeModalProps> = ({ isOpen, onClose, student }) => {
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [amount, setAmount] = useState(student.due);

  if (!isOpen) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic: Validate amount <= due, then send to Ledger
    setStep('success');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden ring-1 ring-slate-900/5">
        {step === 'input' ? (
          <form onSubmit={handlePayment}>
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-2xl"><Wallet size={24}/></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-none">Collect Payment</h2>
                  <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">Invoice: #INV-2026-089</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={24}/></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-900/40 uppercase mb-1">Paying Student</p>
                <p className="text-lg font-bold text-blue-900">{student.name}</p>
                <p className="text-xs text-blue-700 font-medium">{student.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount Received (₹)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-xl font-black focus:ring-4 focus:ring-blue-500/5 outline-none" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Payment Mode</label>
                  <select className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none">
                    <option>UPI / Online</option>
                    <option>Cash</option>
                    <option>Bank Cheque</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-3">
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3">
                  Confirm & Post to Ledger
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-12 text-center flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <CheckCircle2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2">Payment Verified</h2>
            <p className="text-slate-500 font-medium mb-8">Transaction ID: TXN-902341 has been recorded and the student's dashboard has been updated.</p>
            <div className="flex gap-4 w-full">
              <button className="flex-1 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
                <Printer size={18}/> Print Receipt
              </button>
              <button onClick={onClose} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm">
                Close Desk
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectFeeModal;