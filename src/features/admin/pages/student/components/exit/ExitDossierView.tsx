import React from 'react';
import { Calendar as CalendarIcon, Banknote, BookOpen, MapPin, FileText, Link as LinkIcon } from 'lucide-react';
import { StudentExitRecord } from '../../../../../../types/student/exit.schema';

interface Props {
  activeRecord: StudentExitRecord;
  activeStudent: any;
}

export const ExitDossierView: React.FC<Props> = ({ activeRecord, activeStudent }) => {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const calculateTenure = (joinDate: string, lastDay: string) => {
    const start = new Date(joinDate);
    const end = new Date(lastDay);
    const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    return `${years} Years, ${months} Months`;
  };

  return (
    <div className="flex-1 space-y-6 pb-8 animate-in fade-in">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <CalendarIcon size={16} className="text-indigo-600 mb-2"/>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total Tenure</p>
          <h4 className="text-sm font-black text-slate-900">{calculateTenure(activeStudent?.joinDate || '2016-04-01', activeRecord.effectiveExitDate)}</h4>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <Banknote size={16} className="text-emerald-600 mb-2"/>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Lifetime Revenue</p>
          <h4 className="text-sm font-black text-slate-900">{formatCurrency(activeStudent?.totalFeesPaid || 0)}</h4>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <BookOpen size={16} className="text-amber-600 mb-2"/>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Highest Class</p>
          <h4 className="text-sm font-black text-slate-900">{activeStudent?.classId}</h4>
        </div>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <MapPin size={16} className="text-rose-600 mb-2"/>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Exit Type</p>
          <h4 className="text-sm font-black text-slate-900">{activeRecord.exitType}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* INBOUND VAULT */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 p-4"><h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inbound Vault</h3></div>
          <div className="p-4 space-y-3 bg-white">
            <div className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center"><FileText size={16}/></div>
                <div><p className="text-xs font-black text-slate-900">Birth Certificate</p><p className="text-[10px] font-bold text-slate-400 uppercase">PDF</p></div>
              </div>
              <LinkIcon size={16} className="text-slate-300"/>
            </div>
          </div>
        </div>

        {/* OUTBOUND VAULT */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-purple-50 border-b border-purple-100 p-4"><h3 className="text-sm font-black text-purple-900 uppercase tracking-widest">Outbound Vault</h3></div>
          <div className="p-4 space-y-3 bg-white">
            {activeRecord.issuedDocuments.length === 0 ? (
              <p className="text-xs font-bold text-slate-500 italic">No documents generated yet.</p>
            ) : (
              activeRecord.issuedDocuments.map(doc => (
                <div key={doc.id} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded flex items-center justify-center"><FileText size={16}/></div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{doc.documentName || doc.documentType.replace('_', ' ')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase font-mono">{doc.serialNumber} • v{doc.version}</p>
                    </div>
                  </div>
                  <LinkIcon size={16} className="text-slate-300"/>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};