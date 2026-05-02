import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Megaphone, Plus, Calendar, Eye, Users } from 'lucide-react';
import { useHistory } from 'react-router';

const NoticeBoard: React.FC = () => {
  const history = useHistory();
  const notices = [
    { id: 1, title: "Summer Vacation Schedule 2026", audience: "All", date: "02 May, 2026", views: 2450, priority: "High" },
    { id: 2, title: "Staff Meeting: Curriculum Review", audience: "Teachers", date: "01 May, 2026", views: 142, priority: "Medium" },
    { id: 3, title: "Fee Reminder: Quarter 1 Dues", audience: "Parents", date: "28 April, 2026", views: 980, priority: "Urgent" },
  ];

  return (
    <AdminLayout 
      pageTitle="Notice Board" 
      pageDescription="Broadcast announcements and official news to the school community."
      headerActions={
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-md">
          <Plus size={18} /> Compose Notice
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        {notices.map(notice => (
          <div key={notice.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-all cursor-pointer group shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex gap-4 items-start">
              <div className={`p-3 rounded-xl shrink-0 ${
                notice.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
              }`}>
                <Megaphone size={24} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{notice.title}</h3>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                    notice.priority === 'Urgent' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}>{notice.priority}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5"><Users size={14} /> Audience: {notice.audience}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={14} /> {notice.date}</span>
                  <span className="flex items-center gap-1.5"><Eye size={14} /> {notice.views} seen</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50">Edit</button>
              <button className="flex-1 md:flex-none px-4 py-2 bg-slate-50 text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-100">Pin to Top</button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default NoticeBoard;