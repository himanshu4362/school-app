import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../store/store';
import { updateStudentMark, openStudentReport } from '../../../../store/slices/examinationSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import StudentReportDrawer from './StudentReportDrawer'; // Level 4 Drawer Import
import { 
  ArrowLeft, Save, Lock, Search, Filter, 
  MoreVertical, Award, Eye, User, AlertCircle 
} from 'lucide-react';

const EvaluationTable: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  const { 
    currentEvaluationList, 
    selectedClassId, 
    selectedSubjectId, 
    activeExamId, 
    exams,
    classSubjectsData
  } = useSelector((state: RootState) => state.examination);

  const [searchQuery, setSearchQuery] = useState('');

  const activeExam = exams.find(e => e.id === activeExamId);
  const activeSubject = classSubjectsData.find(s => s.id === selectedSubjectId);

  // Fallback UI agar kisi ne bina subject select kiye page open kar liya
  if (!selectedClassId || !selectedSubjectId) {
    return (
      <AdminLayout 
        pageTitle="Evaluation Error" 
        pageDescription="Please select a subject first."
        breadcrumbs={[{ label: 'Examination' }]}
      >
        <div className="flex flex-col items-center justify-center h-[60vh] bg-white rounded-2xl border border-slate-200 shadow-sm">
          <AlertCircle size={48} className="text-rose-400 mb-4" />
          <h2 className="text-xl font-black text-slate-900">No Subject Selected</h2>
          <p className="text-sm font-bold text-slate-500 mb-6">Please select a class and subject from the Marks Hub first.</p>
          <button 
            onClick={() => history.push('/admin/examination/marks-hub')}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 transition-all shadow-md"
          >
            Go back to Marks Hub
          </button>
        </div>
      </AdminLayout>
    );
  }

  // Marks Handle Logic
  const handleMarkChange = (studentId: string, field: 'theoryMarks' | 'internalMarks', value: string) => {
    let numericValue = value === '' ? null : Number(value);
    
    // Enforcing Max Limits (Theory: 80, Internal: 20)
    if (numericValue !== null) {
      if (field === 'theoryMarks' && numericValue > 80) numericValue = 80;
      if (field === 'internalMarks' && numericValue > 20) numericValue = 20;
      if (numericValue < 0) numericValue = 0;
    }

    dispatch(updateStudentMark({ studentId, field, value: numericValue as any }));
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-slate-50 text-slate-400 border-slate-200';
    if (grade.includes('A')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (grade.includes('B')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (grade.includes('C')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <AdminLayout 
      pageTitle="Evaluation Entry" 
      pageDescription="Enter and verify student marks."
      breadcrumbs={[
        { label: 'Examination', path: '/admin/examination/marks-hub' }, 
        { label: 'Marks Hub', path: '/admin/examination/marks-hub' },
        { label: 'Evaluation' }
      ]}
      headerActions={
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Save size={16} /> Save Draft
          </button>
          <button className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 shadow-md">
            <Lock size={16} /> Approve & Lock
          </button>
        </div>
      }
    >
      
      {/* 1. CONTEXT BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => history.push('/admin/examination/marks-hub')}
            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-200"
            title="Back to Hub"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-black uppercase tracking-widest rounded border border-purple-200">
                {activeExam?.name}
              </span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded border border-blue-200">
                {selectedClassId}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{activeSubject?.subjectName}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Assigned Teacher</p>
            <p className="text-sm font-black text-slate-900 flex items-center justify-end gap-1.5">
              <User size={14} className="text-blue-500" /> {activeSubject?.teacherName}
            </p>
          </div>
          <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Max Marks</p>
            <p className="text-sm font-black text-slate-900">80 + 20 <span className="text-slate-400 font-bold">(100)</span></p>
          </div>
        </div>
      </div>

      {/* 2. TABLE CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="w-full md:w-80 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student by name or roll no..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 shadow-sm">
          <Filter size={14} /> Advanced Filters
        </button>
      </div>

      {/* 3. EVALUATION MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-16">Roll</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-64">Student Profile</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-600 w-32 bg-blue-50/50">Theory <span className="text-slate-400">/80</span></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-purple-600 w-32 bg-purple-50/50">Internal <span className="text-slate-400">/20</span></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 w-24">Total <span className="text-slate-400">/100</span></th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-24">Grade</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentEvaluationList
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.toString().includes(searchQuery))
                .map((student) => (
                <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors group">
                  
                  <td className="px-6 py-4 text-xs font-black text-slate-400">
                    {student.rollNo.toString().padStart(2, '0')}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div 
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => dispatch(openStudentReport(student.studentId))}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-black text-xs border border-slate-200 group-hover:border-blue-300 transition-colors">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{student.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.studentId}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 bg-blue-50/20">
                    <input 
                      type="number" 
                      min="0" max="80"
                      value={student.theoryMarks === null ? '' : student.theoryMarks}
                      onChange={(e) => handleMarkChange(student.studentId, 'theoryMarks', e.target.value)}
                      className="w-16 p-2 text-sm font-black text-center bg-white border border-blue-200 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300 placeholder:font-medium"
                      placeholder="--"
                    />
                  </td>

                  <td className="px-6 py-4 bg-purple-50/20">
                    <input 
                      type="number" 
                      min="0" max="20"
                      value={student.internalMarks === null ? '' : student.internalMarks}
                      onChange={(e) => handleMarkChange(student.studentId, 'internalMarks', e.target.value)}
                      className="w-16 p-2 text-sm font-black text-center bg-white border border-purple-200 rounded-lg outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-slate-300 placeholder:font-medium"
                      placeholder="--"
                    />
                  </td>

                  <td className="px-6 py-4 text-sm font-black text-slate-900">
                    {student.total !== null ? student.total : <span className="text-slate-300">--</span>}
                  </td>

                  <td className="px-6 py-4">
                    {student.grade ? (
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-lg border flex items-center justify-center w-10 ${getGradeColor(student.grade)}`}>
                        {student.grade}
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold text-sm">--</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    {/* FIXED: Wrapped Award icon in a span to handle the title prop safely */}
                    {student.rank && student.rank <= 3 && (
                      <span title={`Rank ${student.rank}`}>
                        <Award size={18} className={
                          student.rank === 1 ? 'text-amber-500' : 
                          student.rank === 2 ? 'text-slate-400' : 'text-amber-700'
                        } />
                      </span>
                    )}
                    
                    <button 
                      onClick={() => dispatch(openStudentReport(student.studentId))}
                      className="p-1.5 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all"
                      title="View Full Report"
                    >
                      <Eye size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* 4. STUDENT REPORT DRAWER (Level 4 Integration) */}
      <StudentReportDrawer />
      
    </AdminLayout>
  );
};

export default EvaluationTable;