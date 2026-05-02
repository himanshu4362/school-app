import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { ArrowUpCircle, ArrowDownCircle, AlertCircle, FileText } from 'lucide-react';

const FinanceMaster: React.FC = () => {
  return (
    <AdminLayout pageTitle="Financial Ledger" pageDescription="Centralized cash flow: Fee collections and staff payroll.">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-emerald-100 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2"><ArrowUpCircle size={20}/> <span className="text-xs font-bold uppercase tracking-wider">Monthly Inflow</span></div>
          <p className="text-3xl font-bold text-slate-900">₹ 45,20,000</p>
          <p className="text-xs text-slate-500 mt-2">Student Fees & Transport</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-rose-100 shadow-sm">
          <div className="flex items-center gap-3 text-rose-600 mb-2"><ArrowDownCircle size={20}/> <span className="text-xs font-bold uppercase tracking-wider">Monthly Outflow</span></div>
          <p className="text-3xl font-bold text-slate-900">₹ 18,50,000</p>
          <p className="text-xs text-slate-500 mt-2">Staff Salaries & Vendors</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-amber-100 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 mb-2"><AlertCircle size={20}/> <span className="text-xs font-bold uppercase tracking-wider">Outstanding Dues</span></div>
          <p className="text-3xl font-bold text-slate-900">₹ 4,12,000</p>
          <p className="text-xs text-slate-500 mt-2">Pending from 42 Students</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center font-bold text-sm text-slate-700">
          <span>RECENT DISBURSEMENTS</span>
          <button className="flex items-center gap-2 text-blue-600 hover:underline"><FileText size={14}/> View Full Ledger</button>
        </div>
        <table className="w-full text-sm">
          <thead className="text-slate-400 uppercase text-[10px] tracking-widest border-b">
            <tr><th className="px-6 py-3 text-left">Entity</th><th className="px-6 py-3 text-left">Type</th><th className="px-6 py-3 text-left">Amount</th><th className="px-6 py-3 text-right">Reference</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             <tr className="hover:bg-slate-50"><td className="px-6 py-4 font-medium">Dr. Arvind Sharma</td><td className="px-6 py-4">Payroll</td><td className="px-6 py-4 text-rose-600 font-bold">- ₹65,000</td><td className="px-6 py-3 text-right text-slate-400 font-mono">#TXN-4029</td></tr>
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default FinanceMaster;