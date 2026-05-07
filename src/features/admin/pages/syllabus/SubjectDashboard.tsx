import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { GitCommit, History, BookOpen, AlertCircle, Edit3, User } from 'lucide-react';

const SubjectDashboard: React.FC = () => {
  const { classId, subjectId } = useParams<{ classId: string, subjectId: string }>();
  const history = useHistory();

  // MOCK DATA: Git-like history log
  const auditTrail = [
    { id: 'v2.1', action: 'Added Chapter: Environmental Chem', user: 'Dr. Arora', date: '2 hours ago', type: 'addition' },
    { id: 'v2.0', action: 'Removed Topic: Old Lab Manuals', user: 'Principal', date: '1 day ago', type: 'deletion' },
    { id: 'v1.0', action: 'Initial Curriculum Base Loaded', user: 'System', date: 'May 01, 2026', type: 'base' },
  ];

  return (
    <AdminLayout 
      pageTitle={`${subjectId} Dashboard`} 
      pageDescription={`Curriculum control center for ${classId}.`}
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: 'Syllabus', path: '/admin/academic/syllabus' },
        { label: classId, path: `/admin/academic/syllabus/manage/${classId}` },
        { label: subjectId }
      ]}
    >
      
      {/* THE GATEWAY: Launch Editor Button */}
      <div className="mb-8 bg-blue-600 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between text-white shadow-xl shadow-blue-900/20">
        <div>
          <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
            <Edit3 size={24}/> Curriculum Editor
          </h2>
          <p className="text-blue-100 font-medium max-w-md">
            Enter the visual builder to add chapters, define topic outcomes, and automatically calculate academic hours.
          </p>
        </div>
        <button 
          onClick={() => history.push(`/admin/academic/syllabus/editor/${classId}/${subjectId}`)}
          className="mt-6 md:mt-0 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
        >
          Launch Editor Sandbox
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Base Syllabus Reference */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-lg">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <BookOpen size={16}/> Base Reference (NCERT Standard)
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/10 border border-white/10 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">Unit 1: Chemical Substances</p>
                  <p className="text-xs text-slate-400 mt-1">25 Marks • 40 Periods</p>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-mono text-slate-300">Mandatory</span>
              </div>
              <div className="p-4 bg-white/10 border border-white/10 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">Unit 2: World of Living</p>
                  <p className="text-xs text-slate-400 mt-1">25 Marks • 50 Periods</p>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-lg text-xs font-mono text-slate-300">Mandatory</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-blue-100">
                Any modifications made in the Editor will be tracked against this base standard. Deletions require Principal approval.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Audit Trail (Git-like) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <History size={16}/> Audit Trail
          </h3>
          
          <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
            {auditTrail.map((log, idx) => (
              <div key={idx} className="relative pl-6">
                {/* Timeline Dot */}
                <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center
                  ${log.type === 'addition' ? 'bg-emerald-500' : 
                    log.type === 'deletion' ? 'bg-rose-500' : 'bg-slate-800'}`}
                >
                </div>
                
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {log.action}
                    </p>
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-white px-1.5 rounded shadow-sm border border-slate-100">
                      {log.id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-tighter">
                      <User size={10}/> {log.user}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">{log.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors">
            View Complete History
          </button>
        </div>

      </div>
    </AdminLayout>
  );
};

export default SubjectDashboard;