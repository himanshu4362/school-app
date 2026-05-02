import React from 'react';
import AdminLayout from '../../components/AdminLayout';
import { BookOpen, CheckCircle2, Clock, Plus } from 'lucide-react';

const mockSyllabus = [
  { id: 'SYL-101', subject: 'Physics', grade: 'Grade 12', totalChapters: 15, completed: 9, lastUpdated: '2 hours ago' },
  { id: 'SYL-102', subject: 'Biology', grade: 'Grade 11', totalChapters: 12, completed: 11, lastUpdated: 'Yesterday' },
  { id: 'SYL-103', subject: 'Computer Science', grade: 'Grade 10', totalChapters: 8, completed: 4, lastUpdated: '3 days ago' },
];

const SyllabusManager: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Curriculum Progress" 
      pageDescription="Monitor syllabus completion and chapter-wise academic tracking."
      headerActions={<button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> Define Syllabus</button>}
    >
      <div className="grid grid-cols-1 gap-6">
        {mockSyllabus.map(item => {
          const percentage = Math.round((item.completed / item.totalChapters) * 100);
          return (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ring-1 ring-slate-900/5 group hover:border-blue-400 transition-all">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{item.subject}</h3>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase tracking-widest">{item.grade}</span>
                  </div>
                  <p className="text-sm text-slate-500 flex items-center gap-1.5"><Clock size={14}/> Last update by Subject Teacher: {item.lastUpdated}</p>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter mb-2">
                      <span className="text-slate-400">Course Completion</span>
                      <span className={percentage > 80 ? 'text-emerald-600' : 'text-blue-600'}>{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/50">
                      <div className={`h-full transition-all duration-1000 ${percentage > 80 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 md:border-l md:border-slate-100 md:pl-8">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{item.completed}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Chapters Finished</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-300">{item.totalChapters - item.completed}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Remaining</p>
                  </div>
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <BookOpen size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};
export default SyllabusManager;