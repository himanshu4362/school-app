import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FileText, Download, Printer, Search, Filter, CheckCircle2, UserCheck, CreditCard } from 'lucide-react';

const ReportingCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'HR' | 'Finance' | 'Academic'>('HR');

  const HRDocs = [
    { id: 'LTR-902', name: 'Dr. Arvind Sharma', type: 'Appointment Letter', date: 'May 02, 2026', status: 'Generated' },
    { id: 'EXP-104', name: 'Meera Reddy', type: 'Experience Certificate', date: 'Apr 28, 2026', status: 'Signed' },
  ];

  return (
    <AdminLayout 
      pageTitle="Document & Reporting Hub" 
      pageDescription="Central repository for all system-generated official documents and certificates."
    >
      {/* 1. Category Switcher */}
      <div className="flex gap-2 mb-8 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {(['HR', 'Finance', 'Academic'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab} Records
          </button>
        ))}
      </div>

      {/* 2. Live Document Feed */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4 bg-slate-50/30">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input placeholder="Search by recipient or document ID..." className="w-full pl-10 pr-4 py-2 text-sm bg-transparent outline-none font-medium" />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold hover:bg-white transition-all"><Filter size={14}/> Advanced Audit</button>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b">
              <th className="px-8 py-5 text-left">Recipient & ID</th>
              <th className="px-8 py-5 text-left">Document Type</th>
              <th className="px-8 py-5 text-left">Issuance Date</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {HRDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      {activeTab === 'HR' ? <UserCheck size={18}/> : activeTab === 'Finance' ? <CreditCard size={18}/> : <FileText size={18}/>}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{doc.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 uppercase">{doc.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-600 italic underline underline-offset-4 decoration-slate-200">{doc.type}</span>
                </td>
                <td className="px-8 py-5 font-medium text-slate-500">{doc.date}</td>
                <td className="px-8 py-5">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 rounded-lg transition-all" title="Print"><Printer size={16}/></button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10">
                      <Download size={14}/> Download PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default ReportingCenter;