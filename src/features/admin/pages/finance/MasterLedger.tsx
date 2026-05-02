import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { ArrowUpRight, ArrowDownRight, Printer, Filter } from 'lucide-react';

// Master Data Variable (Inflow and Outflow)
const transactionHistory = [
  { id: 'TXN-9001', entity: 'Aarav Patel (Student)', type: 'Fee Collection', amount: 45000, category: 'Inflow', date: '2026-05-02', status: 'Completed' },
  { id: 'TXN-9002', entity: 'Dr. Arvind Sharma (Teacher)', type: 'Monthly Salary', amount: -65000, category: 'Outflow', date: '2026-05-01', status: 'Completed' },
  { id: 'TXN-9003', entity: 'Utility Corp', type: 'Electricity Bill', amount: -12000, category: 'Outflow', date: '2026-04-30', status: 'Pending' },
];

const MasterLedger: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Master Ledger" 
      pageDescription="Consolidated view of school revenue and expenditures."
      headerActions={
        <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm">
          <Printer size={16} /> Print Report
        </button>
      }
    >
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b flex justify-between bg-slate-50/50">
          <h3 className="font-bold text-slate-700 text-sm">All Transactions</h3>
          <button className="text-xs text-slate-500 flex items-center gap-1 hover:text-slate-900"><Filter size={14}/> Advanced Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase tracking-wider border-b">
                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                <th className="px-6 py-4 font-semibold">Entity & Type</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactionHistory.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{txn.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{txn.entity}</p>
                    <p className="text-xs text-slate-500">{txn.type}</p>
                  </td>
                  <td className={`px-6 py-4 font-bold ${txn.category === 'Inflow' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <div className="flex items-center gap-1">
                      {txn.category === 'Inflow' ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
                      ₹{Math.abs(txn.amount).toLocaleString('en-IN')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{txn.date}</td>
                  <td className="px-6 py-4">
                     <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${txn.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{txn.status}</span>
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

export default MasterLedger;