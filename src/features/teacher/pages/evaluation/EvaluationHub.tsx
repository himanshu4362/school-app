import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { navToTab, viewExamAnalytics } from '../../../../store/slices/evaluationSlice';
import TeacherLayout from '../../components/layout/TeacherLayout';
import { BookOpenCheck, Inbox, Send, BarChart3 } from 'lucide-react';

import EvaluationInbox from '../../components/evaluation/EvaluationInbox';
import ActiveEvaluationSession from '../../components/evaluation/ActiveEvaluationSession';
import PublicationCenter from '../../components/evaluation/PublicationCenter';
import ClassAnalyticsDashboard from '../../components/evaluation/ClassAnalyticsDashboard';
import CreateMonthlyTestForm from '../../components/evaluation/CreateMonthlyTestForm';

const EvaluationHub: React.FC = () => {
  const dispatch = useDispatch();
  const { currentStage, activeExamId, assignedExams } = useSelector((state: RootState) => state.evaluation);

  // 🟢 Top Navigation Tabs
  const renderTabs = () => (
    <div className="flex bg-slate-100 p-1 rounded-xl w-full max-w-2xl mb-6 shadow-inner">
      <button 
        onClick={() => dispatch(navToTab('INBOX'))}
        className={`flex-1 py-3 px-4 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${['INBOX', 'EVALUATION_SESSION'].includes(currentStage) ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <Inbox size={16} /> Evaluation Inbox
      </button>
      <button 
        onClick={() => dispatch(navToTab('PUBLICATION_REQUEST'))}
        className={`flex-1 py-3 px-4 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentStage === 'PUBLICATION_REQUEST' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <Send size={16} /> Publish Results
      </button>
      <button 
        onClick={() => dispatch(navToTab('ANALYTICS'))}
        className={`flex-1 py-3 px-4 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${currentStage === 'ANALYTICS' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
      >
        <BarChart3 size={16} /> Analytics
      </button>
    </div>
  );

  return (
    <TeacherLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full">
        
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
              <BookOpenCheck className="text-blue-600" size={28} />
              Evaluation & Result Engine
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Manage academic grading and immutable snapshots.</p>
          </div>
        </div>

        {renderTabs()}

        {/* 🟢 Routing Engine */}
        {currentStage === 'INBOX' && <EvaluationInbox />}
        {currentStage === 'EVALUATION_SESSION' && <ActiveEvaluationSession />}
        {currentStage === 'PUBLICATION_REQUEST' && <PublicationCenter />}
        
        {currentStage === 'ANALYTICS' && (
          activeExamId ? <ClassAnalyticsDashboard /> : (
            <div className="flex-1 bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <BarChart3 size={48} className="text-slate-300 mb-4" />
              <h3 className="text-xl font-black text-slate-700">Select an Exam for Analytics</h3>
              <p className="text-slate-500 font-bold mt-2 max-w-md">To view class insights, go back to the Inbox, click on an exam, and then select 'View Analytics' (if available).</p>
            </div>
          )
        )}

        {currentStage === 'CREATE_TEST' && <CreateMonthlyTestForm />}

      </div>
    </TeacherLayout>
  );
};

export default EvaluationHub;