import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Megaphone, Plus, Pin, Clock } from 'lucide-react';

const NoticeBoard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const notices = [
    { id: 1, title: "Diwali Holidays Announcement", audience: "All", priority: "High", date: "Oct 24, 2026", isPinned: true },
    { id: 2, title: "Term 1 Report Cards Available", audience: "Parents", priority: "Normal", date: "Oct 22, 2026", isPinned: false },
    { id: 3, title: "Staff Meeting: Setup for Annual Function", audience: "Teachers", priority: "High", date: "Oct 20, 2026", isPinned: false },
  ];

  return (
    <IonPage>
      <IonContent>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className="flex-1 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Notice Board</h1>
                  <p className="text-slate-500 text-sm">Publish announcements across student, parent, and teacher portals.</p>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                  <Plus size={16} /> Create Notice
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices.map(notice => (
                  <div key={notice.id} className={`bg-white p-5 rounded-xl border shadow-sm relative transition hover:shadow-md ${notice.isPinned ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100'}`}>
                    {notice.isPinned && <Pin size={16} className="absolute top-4 right-4 text-blue-600 fill-blue-600/20" />}
                    
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wider">{notice.audience}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${notice.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{notice.priority}</span>
                    </div>
                    
                    <h3 className="font-bold text-slate-800 text-lg mb-2 pr-6 leading-tight">{notice.title}</h3>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
                      <Clock size={14} /> Published on {notice.date}
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NoticeBoard;