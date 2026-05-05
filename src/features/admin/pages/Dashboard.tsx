import React from 'react';
import AdminLayout from '../components/AdminLayout';
import DashboardStats from '../components/DashboardStats';
import AttendanceChart from '../components/AttendanceChart';
import FinanceChart from '../components/FinanceChart';
import DailyAlerts from '../components/DailyAlerts';
import RecentActivity from '../components/RecentActivity';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const Dashboard: React.FC = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const holidays = [1, 15, 25]; // Simulated holiday dates for current month
  return (
    <AdminLayout
      pageTitle="System Overview"
      pageDescription="Real-time operational health of Delhi Public School."
    >
      <DashboardStats />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AttendanceChart />
        <FinanceChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1"><DailyAlerts /></div>
        <div className="lg:col-span-2"><RecentActivity /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Full Month Calendar Engine */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden ring-1 ring-slate-900/5">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div>
              <h3 className="text-2xl font-black text-slate-900">May 2026</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Institutional Schedule</p>
            </div>
            <div className="flex gap-2">
              <button className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"><ChevronLeft size={20} /></button>
              <button className="p-3 bg-white rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-7 gap-4 text-center mb-6">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {days.map(day => {
                const isHoliday = holidays.includes(day);
                return (
                  <div key={day} className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all cursor-pointer border ${isHoliday ? 'bg-rose-50 border-rose-100' : 'bg-slate-50/50 border-transparent hover:border-blue-300 hover:bg-white hover:shadow-lg'
                    }`}>
                    <span className={`text-sm font-black ${isHoliday ? 'text-rose-600' : 'text-slate-600'}`}>{day}</span>
                    {isHoliday && <div className="h-1 w-1 bg-rose-500 rounded-full mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Star size={14} /> Upcoming Festivals
            </h4>
            <div className="space-y-6 relative z-10">
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/10">
                  <p className="text-xs font-black">15</p>
                  <p className="text-[8px] uppercase font-bold text-slate-400">May</p>
                </div>
                <div>
                  <p className="text-sm font-bold">Buddha Purnima</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Gazetted Holiday</p>
                </div>
              </div>
              <div className="flex gap-4 opacity-60">
                <div className="h-12 w-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center">
                  <p className="text-xs font-black">28</p>
                  <p className="text-[8px] uppercase font-bold text-slate-400">May</p>
                </div>
                <div>
                  <p className="text-sm font-bold">Investiture Ceremony</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black">Institutional Event</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
export default Dashboard;