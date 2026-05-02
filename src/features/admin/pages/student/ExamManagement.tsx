import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Plus, Calendar, BookOpen, Download } from 'lucide-react';

// Functional Data Variable
const mockExams = [
  { id: 'EX-2026-01', title: 'Term 1 Finals', type: 'Main', startDate: '2026-05-15', status: 'Scheduled', classes: ['Grade 9', 'Grade 10'] },
  { id: 'EX-2026-02', title: 'Unit Test - Science', type: 'Unit', startDate: '2026-05-10', status: 'Pending Results', classes: ['Grade 11'] },
];

const ExamManagement: React.FC = () => {
  return (
    <AdminLayout 
      pageTitle="Exam Management" 
      pageDescription="Schedule examinations and manage academic grading cycles."
      headerActions={
        <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus size={16} /> Schedule Exam
        </button>
      }
    >
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-6 py-4">Exam Details</th>
              <th className="px-6 py-4">Classes</th>
              <th className="px-6 py-4">Start Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {mockExams.map((exam) => (
              <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{exam.title}</div>
                  <div className="text-xs text-slate-500">{exam.type} Examination</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {exam.classes.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-slate-100 rounded text-xs">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 flex items-center gap-2 text-slate-600">
                  <Calendar size={14} /> {exam.startDate}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${exam.status === 'Scheduled' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                    {exam.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-blue-600 font-bold hover:underline">View Marksheets</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default ExamManagement;