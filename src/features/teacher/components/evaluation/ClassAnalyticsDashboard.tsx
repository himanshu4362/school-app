import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { BarChart3, TrendingUp, AlertTriangle, Users, CheckCircle } from 'lucide-react';

const ClassAnalyticsDashboard: React.FC = () => {
  const { activeExamId, assignedExams } = useSelector((state: RootState) => state.evaluation);
  const globalStudents = useSelector((state: RootState) => state.student.records);
  
  if (!activeExamId) return <div className="p-12 text-center">Select an exam to view analytics.</div>;
  
  const exam = assignedExams[activeExamId];

  // 🟢 Analytics Engine (Calculating stats from the raw marksData payload)
  const stats = useMemo(() => {
    let totalScore = 0;
    let maxPossibleClassScore = 0;
    let highestScore = 0;
    let passedCount = 0;
    let failedCount = 0;
    let absentMedicalCount = 0;

    const roster = Object.values(globalStudents).filter(s => s.classId === exam.classId && s.sectionId === exam.sectionId && s.status === 'ACTIVE');
    const totalMaxMarks = exam.components.reduce((sum, c) => sum + c.maxMarks, 0);

    roster.forEach(student => {
      let studentTotal = 0;
      let hasValidMark = false;

      exam.components.forEach(comp => {
        const val = exam.marksData?.[student.id]?.[comp.id];
        if (typeof val === 'number') {
          studentTotal += val;
          hasValidMark = true;
        } else if (val === 'ABSENT' || val === 'MEDICAL') {
          absentMedicalCount++;
        }
      });

      if (hasValidMark) {
        totalScore += studentTotal;
        maxPossibleClassScore += totalMaxMarks;
        if (studentTotal > highestScore) highestScore = studentTotal;
        
        // Assuming 33% is passing criteria
        if ((studentTotal / totalMaxMarks) * 100 >= 33) passedCount++;
        else failedCount++;
      }
    });

    const averagePercentage = maxPossibleClassScore > 0 ? ((totalScore / maxPossibleClassScore) * 100).toFixed(1) : 0;

    return { totalStudents: roster.length, averagePercentage, highestScore, passedCount, failedCount, absentMedicalCount, totalMaxMarks };
  }, [exam, globalStudents]);

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      <div className="bg-slate-900 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20 -mr-20 -mt-20"></div>
        <div className="z-10 text-center md:text-left">
          <h2 className="text-2xl lg:text-4xl font-black">{exam.title} Insights</h2>
          <p className="text-blue-200 font-bold mt-2 text-sm uppercase tracking-widest">Class {exam.classId}-{exam.sectionId} • {exam.subject}</p>
        </div>
        <div className="z-10 flex items-center gap-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class Average</p>
            <p className="text-4xl font-black text-emerald-400">{stats.averagePercentage}%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
          <TrendingUp size={24} className="text-blue-500 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Highest Score</p>
          <p className="text-2xl font-black text-slate-800">{stats.highestScore} <span className="text-xs text-slate-400">/ {stats.totalMaxMarks}</span></p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
          <CheckCircle size={24} className="text-emerald-500 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Passed</p>
          <p className="text-2xl font-black text-emerald-600">{stats.passedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
          <AlertTriangle size={24} className="text-rose-500 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Attention Required</p>
          <p className="text-2xl font-black text-rose-600">{stats.failedCount} Failed</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
          <Users size={24} className="text-amber-500 mb-2" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Absent / Medical</p>
          <p className="text-2xl font-black text-amber-600">{stats.absentMedicalCount}</p>
        </div>
      </div>

    </div>
  );
};

export default ClassAnalyticsDashboard;