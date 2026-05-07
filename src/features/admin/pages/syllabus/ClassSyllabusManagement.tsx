import React, { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonIcon } from '@ionic/react';
import { History, GitCompare, Plus, AlertCircle, FileText } from 'lucide-react';
import AdminLayout from "../../components/AdminLayout";

const ClassSyllabusManagement: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();
  const history = useHistory();
  const [selectedSubject, setSelectedSubject] = useState('Science');

  const historyLogs = [
    { id: 'LOG-001', date: '2026-05-01', user: 'Admin', action: 'Added Chapter 5 Topics', syllabusId: 'SYL-10-SCI-V2' },
    { id: 'LOG-002', date: '2026-04-15', user: 'Principal', action: 'Removed outdated lab work', syllabusId: 'SYL-10-SCI-V1' },
  ];

  return (
    <AdminLayout 
      pageTitle={`${classId} Management`} 
      headerActions={
        <button 
          onClick={() => history.push(`/admin/academic/syllabus/define/${classId}/${selectedSubject}`)}
          className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg"
        >
          <Plus size={18} /> Modify Syllabus
        </button>
      }
    >
      {/* Subject Selector */}
      <div className="mb-8">
        <IonSegment value={selectedSubject} onIonChange={e => setSelectedSubject(e.detail.value as string)} className="bg-white rounded-2xl p-1 shadow-sm">
          {['Science', 'Math', 'English', 'History'].map(sub => (
            <IonSegmentButton key={sub} value={sub}>
              <IonLabel className="font-bold">{sub}</IonLabel>
            </IonSegmentButton>
          ))}
        </IonSegment>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content: Current Syllabus View */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black">Active Syllabus Structure</h3>
              <span className="text-[10px] font-mono bg-slate-100 px-3 py-1 rounded-full uppercase">ID: SYL-10-SCI-V2</span>
            </div>
            {/* List of chapters would go here */}
            <p className="text-slate-500 italic">No chapters defined for this version yet. Click "Modify" to begin.</p>
          </div>

          {/* Base Syllabus Comparison */}
          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100 ring-1 ring-blue-900/5">
            <h4 className="flex items-center gap-2 text-blue-900 font-black mb-4"><GitCompare size={20}/> Comparison with NCERT Base</h4>
            <div className="p-4 bg-white rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">NCERT 2026 Core Syllabus</p>
                <p className="text-xs text-slate-500">14 Chapters • 80 Marks Theory</p>
              </div>
              <button className="text-blue-600 text-xs font-black uppercase hover:underline">View Base Content</button>
            </div>
          </div>
        </div>

        {/* Sidebar: History Logs */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h4 className="flex items-center gap-2 text-slate-900 font-black mb-6"><History size={18}/> Change History</h4>
            <div className="space-y-4">
              {historyLogs.map(log => (
                <div 
                  key={log.id} 
                  onClick={() => history.push(`/admin/academic/syllabus/history/${log.id}`)}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-300 cursor-pointer transition-all group"
                >
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600">{log.action}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{log.date}</span>
                    <span className="text-[10px] text-blue-500 font-black">{log.user}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ClassSyllabusManagement;