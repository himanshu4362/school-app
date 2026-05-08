import React from 'react';
import { useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { CalendarDays, Clock, CheckCircle2, AlertCircle, Edit3 } from 'lucide-react';

const TimetableOverview: React.FC = () => {
  const history = useHistory();

  // MOCK DATA: High-level overview
  const classes = [
    { id: 'C10', name: 'Class 10', status: 'Active', color: 'emerald', lastUpdated: '2 days ago' },
    { id: 'C12', name: 'Class 12', status: 'Active', color: 'emerald', lastUpdated: '1 week ago' },
    { id: 'C9', name: 'Class 9', status: 'Drafting', color: 'blue', lastUpdated: '4 hours ago' },
    { id: 'C11', name: 'Class 11', status: 'Incomplete', color: 'amber', lastUpdated: 'Needs Action' },
  ];

  return (
    <AdminLayout 
      pageTitle="Master Timetable Hub" 
      pageDescription="Monitor scheduling statuses across all classes."
      breadcrumbs={[
        { label: 'Academic Hub' }, 
        { label: 'Timetable' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div 
            key={cls.id}
            onClick={() => history.push(`/admin/academic/timetable/manage/${cls.id}`)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer ring-1 ring-slate-900/5 relative overflow-hidden"
          >
            {/* Status Indicator Bar (Top Edge) */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${
              cls.color === 'emerald' ? 'bg-emerald-500' : 
              cls.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
            }`} />

            <div className="flex justify-between items-start mb-6 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 text-white rounded-xl shadow-md">
                  <CalendarDays size={24} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{cls.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{cls.id}</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border
                ${cls.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  cls.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                  'bg-blue-50 text-blue-700 border-blue-200'}`}
              >
                {cls.status === 'Active' ? <CheckCircle2 size={12}/> : 
                 cls.status === 'Incomplete' ? <AlertCircle size={12}/> : <Edit3 size={12}/>}
                {cls.status}
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={14} />
                <span className="text-xs font-medium">Updated: {cls.lastUpdated}</span>
              </div>
              <span className="text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                Open Dashboard →
              </span>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default TimetableOverview;