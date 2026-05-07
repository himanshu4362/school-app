import React from 'react';
import { useLocation } from 'react-router-dom';
import { IonProgressBar, IonBadge } from '@ionic/react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ArrowLeft, Target, Calendar } from 'lucide-react';
import AdminLayout from "../../components/AdminLayout";

const SyllabusCompletionDetail: React.FC = () => {
  const query = new URLSearchParams(useLocation().search);
  const className = query.get('class') || "Grade 10";

  const data = [
    { name: 'Completed', value: 75, color: '#10b981' },
    { name: 'In Progress', value: 15, color: '#3b82f6' },
    { name: 'Pending', value: 10, color: '#e2e8f0' },
  ];

  const subjectData = [
    { subject: 'Science', completion: 85 },
    { subject: 'Math', completion: 40 },
    { subject: 'English', completion: 90 },
    { subject: 'History', completion: 65 },
  ];

  return (
    <AdminLayout pageTitle={`${className} Syllabus Audit`} pageDescription="In-depth analysis of curriculum progress vs academic calendar.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Progress Snapshot */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-6">Overall Progress</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center mt-4">
            <p className="text-4xl font-black text-slate-900">75%</p>
            <p className="text-xs font-bold text-emerald-600 uppercase">On Track</p>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-400 uppercase mb-8">Subject-wise Completion</h3>
          <div className="space-y-8">
            {subjectData.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="font-bold text-slate-700">{item.subject}</span>
                  <IonBadge color={item.completion > 70 ? "success" : "warning"}>{item.completion}%</IonBadge>
                </div>
                <IonProgressBar value={item.completion / 100} className="h-2 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SyllabusCompletionDetail;