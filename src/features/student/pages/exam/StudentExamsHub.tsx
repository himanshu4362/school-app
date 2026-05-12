import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { startExam } from '../../../../store/slices/studentAttemptSlice';
import StudentLayout from '../../components/layout/StudentLayout';
import ExamHall from './ExamHall';
import { ClipboardList, Clock, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import StudentExamReview from './StudentExamReview';

const StudentExamsHub: React.FC = () => {
  const dispatch = useDispatch();
  
  // We grab the exam the teacher built, and the student's current status
  const { title, subject, config, questions } = useSelector((state: RootState) => state.quizBuilder);
  const { currentStatus } = useSelector((state: RootState) => state.studentAttempt);

  if (currentStatus === 'ACTIVE') {
    return <ExamHall />;
  }

  if (currentStatus === 'SUBMITTED' || currentStatus === 'TERMINATED') {
    return (
      <StudentLayout>
         <StudentExamReview />
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-6">
        
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
            <ClipboardList className="text-blue-600" size={28} />
            My Examinations
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-500">View upcoming assessments and past results.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* EXAM CARD */}
          {questions.length > 0 ? (
            <div className="bg-white rounded-[32px] p-6 border-2 border-slate-100 shadow-sm flex flex-col hover:border-blue-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Clock size={12}/> Pending
                </div>
                {config.securityMode === 'STRICT_PROCTORED' && (
                  <div className="text-rose-500 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest" title="Strict Proctoring Enabled">
                    <Shield size={14}/> Proctored
                  </div>
                )}
              </div>
              
              <div className="mb-6 flex-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">{title || 'Untitled Exam'}</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">{subject || 'General'} • {questions.length} Questions</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 mb-6 grid grid-cols-2 gap-2 text-center border border-slate-100">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                  <p className="text-sm font-black text-slate-700">{config.durationMinutes} Mins</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Marks</p>
                  <p className="text-sm font-black text-slate-700">{questions.reduce((sum, q) => sum + q.marks, 0)}</p>
                </div>
              </div>

              {currentStatus === 'NOT_STARTED' ? (
                <button 
                  onClick={() => dispatch(startExam('EXAM-001'))}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Start Examination <ArrowRight size={16} />
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Exam Completed
                </button>
              )}
            </div>
          ) : (
            <div className="col-span-full p-12 text-center bg-white border-2 border-dashed border-slate-200 rounded-[32px]">
              <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
              <h3 className="text-xl font-black text-slate-700">You are all caught up!</h3>
              <p className="text-slate-500 font-bold mt-2">No exams are currently scheduled for you. Enjoy your day, Himanshu.</p>
            </div>
          )}

        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentExamsHub;