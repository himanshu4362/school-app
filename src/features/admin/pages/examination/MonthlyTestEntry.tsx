import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../store/store';
import { updateTestMark, toggleAbsent } from '../../../../store/slices/monthlyTestSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { ArrowLeft, Save, CheckCircle, AlertCircle, Search, UserX, UserCheck } from 'lucide-react';

const MonthlyTestEntry: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  const { activeTestId, tests, testResults } = useSelector((state: RootState) => state.monthlyTest);
  const [searchQuery, setSearchQuery] = useState('');

  // Find Active Test Details
  const activeTest = tests.find(t => t.id === activeTestId);
  const studentResults = activeTestId ? testResults[activeTestId] : [];

  // Fallback if accessed directly without selecting a test
  if (!activeTest || !studentResults) {
    return (
      <AdminLayout pageTitle="Marks Entry Error" breadcrumbs={[{ label: 'Monthly Tests' }]}>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle size={48} className="text-rose-400 mb-4" />
          <h2 className="text-xl font-black text-slate-900">No Test Selected</h2>
          <button 
            onClick={() => history.push('/admin/examination/monthly-tests')}
            className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </AdminLayout>
    );
  }

  // STRICT VALIDATION HANDLER
  const handleMarkChange = (studentId: string, value: string) => {
    // 1. Agar field khali kar di toh null set karo
    if (value === '') {
      dispatch(updateTestMark({ testId: activeTest.id, studentId, marks: null }));
      return;
    }

    // 2. Strict Number Check (Sirf digits allow karega)
    if (!/^\d*$/.test(value)) return;

    let numericValue = Number(value);

    // 3. Max Limit Validation (Full marks se zyada nahi daal sakte)
    if (numericValue > activeTest.maxMarks) {
      numericValue = activeTest.maxMarks;
    }

    dispatch(updateTestMark({ testId: activeTest.id, studentId, marks: numericValue }));
  };

  // Status Badge Logic
  const getStatusBadge = (marks: number | null, isAbsent: boolean) => {
    if (isAbsent) return <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-md border border-rose-200">ABSENT</span>;
    if (marks === null) return <span className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-md border border-slate-200">PENDING</span>;
    if (marks >= activeTest.passingMarks) return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-md border border-emerald-200">PASS</span>;
    return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-md border border-amber-200">FAIL</span>;
  };

  return (
    <AdminLayout 
      pageTitle="Test Evaluation" 
      breadcrumbs={[
        { label: 'Monthly Tests', path: '/admin/examination/monthly-tests' }, 
        { label: 'Evaluation Entry' }
      ]}
      headerActions={
        <button 
          onClick={() => history.push('/admin/examination/monthly-tests')}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-sm hover:bg-emerald-700 flex items-center gap-2 shadow-md"
        >
          <Save size={16} /> Save & Lock Marks
        </button>
      }
    >
      
      {/* 1. TEST CONTEXT BANNER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => history.push('/admin/examination/monthly-tests')}
            className="p-2.5 bg-slate-50 text-slate-500 rounded-xl hover:bg-blue-50 hover:text-blue-600 border border-slate-200 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded border border-blue-200">
                {activeTest.classId}
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900">{activeTest.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <div className="text-center px-4 border-r border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Max Marks</p>
            <p className="text-xl font-black text-blue-600">{activeTest.maxMarks}</p>
          </div>
          <div className="text-center px-4">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Passing</p>
            <p className="text-xl font-black text-slate-900">{activeTest.passingMarks}</p>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR */}
      <div className="mb-4 w-full md:w-80 relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search student..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 shadow-sm"
        />
      </div>

      {/* 3. MARKS ENTRY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-20">Roll No</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Student Name</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-blue-600 w-48 bg-blue-50/50">Marks Obtained</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 w-32">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentResults
                .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.toString().includes(searchQuery))
                .map((student) => (
                <tr key={student.studentId} className={`hover:bg-slate-50/50 transition-colors ${student.isAbsent ? 'bg-rose-50/20' : ''}`}>
                  
                  <td className="px-6 py-4 text-xs font-black text-slate-400">
                    {student.rollNo.toString().padStart(2, '0')}
                  </td>
                  
                  <td className="px-6 py-4">
                    <p className={`text-sm font-black ${student.isAbsent ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {student.name}
                    </p>
                  </td>

                  <td className="px-6 py-4 bg-blue-50/20">
                    <div className="relative">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        disabled={student.isAbsent}
                        value={student.marksObtained === null ? '' : student.marksObtained}
                        onChange={(e) => handleMarkChange(student.studentId, e.target.value)}
                        className={`w-24 p-2 text-sm font-black text-center border rounded-lg outline-none transition-all
                          ${student.isAbsent 
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' 
                            : 'bg-white border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-300'
                          }`}
                        placeholder="--"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        / {activeTest.maxMarks}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {getStatusBadge(student.marksObtained, student.isAbsent)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => dispatch(toggleAbsent({ testId: activeTest.id, studentId: student.studentId }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ml-auto transition-all ${
                        student.isAbsent 
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                          : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      {student.isAbsent ? <UserCheck size={14} /> : <UserX size={14} />}
                      {student.isAbsent ? 'Mark Present' : 'Mark Absent'}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </AdminLayout>
  );
};

export default MonthlyTestEntry;