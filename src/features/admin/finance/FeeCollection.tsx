import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Search, Filter, CheckCircle, Clock, AlertCircle, Receipt } from 'lucide-react';

interface FeeRecord {
  id: string;
  studentName: string;
  grade: string;
  amount: number;
  dueDate: string;
  status: 'Paid' | 'Partial' | 'Overdue';
  method?: string;
}

const mockFees: FeeRecord[] = [
  { id: 'FEE-201', studentName: 'Aarav Patel', grade: '10-A', amount: 45000, dueDate: 'Oct 01, 2026', status: 'Paid', method: 'UPI' },
  { id: 'FEE-202', studentName: 'Isha Sharma', grade: '10-A', amount: 45000, dueDate: 'Oct 05, 2026', status: 'Partial' },
  { id: 'FEE-203', studentName: 'Rohan Gupta', grade: '9-C', amount: 42000, dueDate: 'Sept 20, 2026', status: 'Overdue' },
];

const FeeCollection: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Fee Management" 
      pageDescription="Monitor tuition inflows and manage payment verification."
      headerActions={
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm flex items-center gap-2">
          <Receipt size={16} /> Collect New Fee
        </button>
      }
    >
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by student or invoice..." className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none border-slate-200" />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none">
              <option>All Statuses</option>
              <option>Overdue</option>
              <option>Partial</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 transition font-medium">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/80 text-slate-500 font-medium uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Invoice Amount</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{fee.studentName}</p>
                    <p className="text-xs text-slate-500">Grade {fee.grade}</p>
                  </td>
                  <td className="px-6 py-4 font-mono font-medium text-slate-700">
                    ₹{fee.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {fee.dueDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ring-1 ring-inset
                      ${fee.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                        fee.status === 'Partial' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 
                        'bg-rose-50 text-rose-700 ring-rose-600/20'}`}
                    >
                      {fee.status === 'Paid' && <CheckCircle size={12} />}
                      {fee.status === 'Partial' && <Clock size={12} />}
                      {fee.status === 'Overdue' && <AlertCircle size={12} />}
                      {fee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 hover:text-blue-800 font-bold text-xs">Verify Payment</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FeeCollection;