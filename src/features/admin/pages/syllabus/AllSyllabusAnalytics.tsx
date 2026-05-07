import React from 'react';
import { useHistory } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { Activity, ChevronRight, AlertTriangle } from 'lucide-react';
import { IonProgressBar } from '@ionic/react';

const AllSyllabusAnalytics: React.FC = () => {
  const history = useHistory();

  // MOCK DATA: High-level overview of all classes
  const classesOverview = [
    { id: 'C10', name: 'Class 10', progress: 0.78, status: 'On Track', color: 'success' },
    { id: 'C12', name: 'Class 12', progress: 0.42, status: 'At Risk', color: 'danger', issue: 'Physics lagging by 2 weeks' },
    { id: 'C9', name: 'Class 9', progress: 0.85, status: 'Ahead', color: 'primary' },
    { id: 'C11', name: 'Class 11', progress: 0.60, status: 'On Track', color: 'success' },
  ];

  return (
    <AdminLayout 
      pageTitle="School-Wide Analytics" 
      pageDescription="Macro-level view of curriculum completion across all grades."
      breadcrumbs={[
        { label: 'Academic Hub' },
        { label: 'Syllabus', path: '/admin/academic/syllabus' },
        { label: 'Analytics' }
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classesOverview.map((cls) => (
          <div 
            key={cls.id}
            onClick={() => history.push(`/admin/academic/syllabus/analytics/${cls.id}`)}
            className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between h-full"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-600"><Activity size={18}/></div>
                  <h3 className="text-xl font-black text-slate-900">{cls.name}</h3>
                </div>
                <span className="text-xl font-black text-slate-900">{(cls.progress * 100).toFixed(0)}%</span>
              </div>
              
              <IonProgressBar value={cls.progress} color={cls.color} className="h-2 rounded-full mb-4" />
            </div>

            <div>
              {cls.status === 'At Risk' ? (
                <div className="flex items-start gap-2 p-3 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold border border-rose-100 mb-4">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{cls.issue}</span>
                </div>
              ) : (
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Status: {cls.status}</p>
              )}

              <button className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl text-sm font-bold flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-700 transition">
                Deep Dive <ChevronRight size={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AllSyllabusAnalytics;