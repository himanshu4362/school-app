import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { closeStudentReport } from '../../../../store/slices/examinationSlice';
import { X, Printer, Mail, Award, BookOpen, TrendingUp, User, Activity } from 'lucide-react';

const StudentReportDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const { 
    isDrawerOpen, 
    selectedStudentForDrawer, 
    currentEvaluationList, 
    activeExamId, 
    exams 
  } = useSelector((state: RootState) => state.examination);

  const activeExam = exams.find(e => e.id === activeExamId);
  const student = currentEvaluationList.find(s => s.studentId === selectedStudentForDrawer);

  // Close drawer on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeStudentReport());
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [dispatch]);

  // Mocking full report card data combining current entry with other subjects
  const reportCard = [
    { subject: 'Science', theory: student?.theoryMarks ?? 0, internal: student?.internalMarks ?? 0, total: student?.total ?? 0 },
    { subject: 'Mathematics', theory: 75, internal: 19, total: 94 },
    { subject: 'English', theory: 68, internal: 18, total: 86 },
    { subject: 'Social Studies', theory: 70, internal: 17, total: 87 },
  ];

  const grandTotal = reportCard.reduce((acc, curr) => acc + curr.total, 0);
  const percentage = (grandTotal / 400) * 100;

  return (
    <>
      {/* Backdrop */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => dispatch(closeStudentReport())}
        />
      )}

      {/* Slide-over Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[500px] bg-slate-50 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out border-l border-slate-200
        ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg border-2 border-blue-200">
              {student?.name.charAt(0) || 'S'}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{student?.name || 'Student Report'}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                Roll No: {student?.rollNo.toString().padStart(2, '0')} <span className="w-1 h-1 rounded-full bg-slate-300"></span> ID: {student?.studentId}
              </p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeStudentReport())}
            className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          
          {/* Exam Context */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <BookOpen size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Examination</p>
                <p className="text-sm font-bold text-slate-900">{activeExam?.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
              <span className="text-xs font-black text-emerald-600">Evaluated</span>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <Activity size={20} className="mx-auto text-blue-500 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage</p>
              <p className="text-lg font-black text-slate-900">{percentage.toFixed(1)}%</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <TrendingUp size={20} className="mx-auto text-emerald-500 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</p>
              <p className="text-lg font-black text-slate-900">{student?.grade || '--'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
              <Award size={20} className="mx-auto text-amber-500 mb-2" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rank</p>
              <p className="text-lg font-black text-slate-900">#{student?.rank || '--'}</p>
            </div>
          </div>

          {/* Full Report Card Table */}
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-3 px-1">Subject Wise Breakdown</h3>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Subject</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 text-right">Th. (80)</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 text-right">Int. (20)</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-900 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reportCard.map((row, idx) => (
                    <tr key={idx} className={row.subject === 'Science' ? 'bg-blue-50/30' : ''}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700 flex items-center gap-2">
                        {row.subject === 'Science' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                        {row.subject}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-600 text-right">{row.theory || '--'}</td>
                      <td className="px-4 py-3 text-xs font-medium text-slate-600 text-right">{row.internal || '--'}</td>
                      <td className="px-4 py-3 text-xs font-black text-slate-900 text-right">{row.total || '--'}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="px-4 py-3 text-xs font-black text-slate-600 text-right uppercase tracking-widest">Grand Total</td>
                    <td className="px-4 py-3 text-sm font-black text-blue-600 text-right">{grandTotal} <span className="text-[10px] text-slate-400">/ 400</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-white shrink-0 flex gap-3">
          <button className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center gap-2 shadow-sm">
            <Printer size={16} /> Print Report
          </button>
          <button className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md">
            <Mail size={16} /> Send to Parent
          </button>
        </div>

      </div>
    </>
  );
};

export default StudentReportDrawer;