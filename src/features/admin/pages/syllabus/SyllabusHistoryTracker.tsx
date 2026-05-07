import React from 'react';
import { useParams } from 'react-router-dom';
import { GitCommit, PlusCircle, MinusCircle, User } from 'lucide-react';
import AdminLayout from "../../components/AdminLayout";

const SyllabusHistoryTracker: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();

  const diffData = [
    { type: 'removed', content: 'Chapter 4: Advanced Organic Chemistry (Moved to Term 2)', id: 'CH-04' },
    { type: 'added', content: 'Chapter 5: Environmental Chemistry (New NCERT requirement)', id: 'CH-05' },
    { type: 'added', content: 'Topic: Micro-plastics in Oceans (Outcome: Policy Awareness)', id: 'T-05.1' },
  ];

  return (
    <AdminLayout pageTitle="Change Comparison" pageDescription={`Audit for Log ID: ${logId}`}>
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden ring-1 ring-slate-900/5">
        <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-2xl"><GitCommit /></div>
            <div>
              <p className="text-xs font-black text-blue-400 uppercase">Version Update</p>
              <h2 className="text-xl font-bold">SYL-10-SCI-V2</h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold flex items-center gap-2"><User size={14}/> Principal Admin</p>
            <p className="text-[10px] text-slate-400 font-mono uppercase">May 01, 2026 • 12:45 PM</p>
          </div>
        </div>

        <div className="p-8 space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Line Diff (Changes)</h4>
          {diffData.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-4 p-5 rounded-2xl border ${
                item.type === 'added' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}
            >
              {item.type === 'added' ? <PlusCircle size={20} /> : <MinusCircle size={20} />}
              <span className="font-mono text-xs font-bold w-16 opacity-50">{item.id}</span>
              <p className="text-sm font-bold">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SyllabusHistoryTracker;