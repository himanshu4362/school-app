import React from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import { IonProgressBar } from '@ionic/react';
import { Target, AlertOctagon, BookOpen } from 'lucide-react';

const ClassSyllabusAnalytics: React.FC = () => {
  const { classId } = useParams<{ classId: string }>();

  // MOCK DATA: Detailed breakdown for the specific class
  const classData = {
    overallProgress: 0.42,
    subjects: [
      { name: 'Mathematics', progress: 0.65, color: 'success', teacher: 'Ravi Verma' },
      { name: 'Chemistry', progress: 0.50, color: 'primary', teacher: 'Dr. Arora' },
      { name: 'Physics', progress: 0.15, color: 'danger', teacher: 'Neha Singh' }, // The bottleneck
      { name: 'English', progress: 0.80, color: 'success', teacher: 'A. Sharma' },
    ]
  };

  return (
    <AdminLayout 
      pageTitle={`${classId} Analytics Report`} 
      pageDescription="Detailed subject pacing and bottleneck identification."
      breadcrumbs={[
        { label: 'Academic Hub' },
        { label: 'Syllabus', path: '/admin/academic/syllabus' },
        { label: 'Analytics', path: '/admin/academic/syllabus/analytics' },
        { label: classId }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MVP POWER FEATURE: The Intervention Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-lg">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Overall Pacing</h3>
            <p className="text-5xl font-black mb-4">{(classData.overallProgress * 100).toFixed(0)}%</p>
            <IonProgressBar value={classData.overallProgress} color="primary" className="h-2 rounded-full opacity-80" />
          </div>

          {/* Actionable insight: Highlighting the bottleneck automatically */}
          <div className="bg-rose-50 border border-rose-200 p-6 rounded-[2rem] shadow-sm">
            <div className="flex items-center gap-2 text-rose-700 mb-4">
              <AlertOctagon size={20} />
              <h3 className="font-black uppercase tracking-wider text-sm">Intervention Required</h3>
            </div>
            <p className="text-sm font-bold text-slate-800 mb-2">
              Physics is severely lagging behind the master schedule (15%).
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Assigned Faculty: <span className="font-black text-slate-900">Neha Singh</span>
            </p>
            <button className="mt-4 w-full py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-700 transition">
              Schedule Faculty Review
            </button>
          </div>
        </div>

        {/* Subject-by-Subject Breakdown */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Target size={16}/> Subject Execution Matrix
          </h3>
          
          <div className="space-y-8">
            {classData.subjects.map((sub, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen size={16} className="text-slate-400" /> {sub.name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">Faculty: {sub.teacher}</p>
                  </div>
                  <span className={`text-lg font-black ${
                    sub.color === 'danger' ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {(sub.progress * 100).toFixed(0)}%
                  </span>
                </div>
                <IonProgressBar value={sub.progress} color={sub.color} className="h-3 rounded-full" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default ClassSyllabusAnalytics;