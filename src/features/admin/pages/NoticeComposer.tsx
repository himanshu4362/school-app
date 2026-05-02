import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Send, Users, ShieldAlert, Image as ImageIcon } from 'lucide-react';

const NoticeComposer: React.FC = () => {
  return (
    <AdminLayout pageTitle="Publish Announcement" pageDescription="Broadcast official updates to portals and mobile apps.">
      <div className="max-w-4xl bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <form className="p-8 lg:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Target Audience</label>
                <div className="flex gap-2">
                  {['All', 'Parents', 'Teachers', 'Staff'].map(role => (
                    <button key={role} type="button" className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold hover:bg-blue-600 hover:text-white transition-all">{role}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notice Title</label>
                <input className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="e.g. Annual Sports Day Meet 2026" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Priority Level</label>
                <select className="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold outline-none ring-1 ring-slate-100">
                  <option>Normal</option>
                  <option>High Priority</option>
                  <option>Emergency/Urgent</option>
                </select>
              </div>
              <div className="p-6 border-2 border-dashed border-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors cursor-pointer">
                <ImageIcon size={24} className="mb-2"/>
                <span className="text-xs font-bold">Attach Official PDF/Banner</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter">
              <ShieldAlert size={14}/> Push to Mobile App Enabled
            </div>
            <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-900/10">
              Publish Notice <Send size={18}/>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};
export default NoticeComposer;