import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { syncResponse, submitExam, terminateExam } from '../../../../store/slices/studentAttemptSlice';
import ProctoringGuard from '../../components/exam/ProctoringGuard';
import { Clock, AlertCircle, ChevronRight, ChevronLeft, Send } from 'lucide-react';

const ExamHall: React.FC = () => {
  const dispatch = useDispatch();
  const { questions, config, title } = useSelector((state: RootState) => state.quizBuilder);
  const { currentStatus } = useSelector((state: RootState) => state.studentAttempt);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.durationMinutes * 60);
  const [showSecurityWarning, setShowSecurityWarning] = useState(false);

  const currentQuestion = questions[currentIndex];

  // Timer Engine
  useEffect(() => {
    if (currentStatus === 'ACTIVE' && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      dispatch(submitExam());
    }
  }, [timeLeft, currentStatus, dispatch]);

  const handleOptionSelect = (optionId: string) => {
    dispatch(syncResponse({ 
      questionId: currentQuestion.id, 
      optionId: optionId, 
      timeIncr: 1 // Simulation: adding 1 second per selection action
    }));
  };

  if (currentStatus === 'SUBMITTED') {
    return <div className="p-12 text-center font-black">Exam Submitted Successfully.</div>;
  }

  return (
    <div className="fixed inset-0 bg-slate-50 z-[999] flex flex-col font-sans select-none">
      <ProctoringGuard 
        isStrict={config.securityMode === 'STRICT_PROCTORED'} 
        onSecurityBreach={() => setShowSecurityWarning(true)} 
      />

      {/* HEADER: Progress & Timer */}
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</span>
          <span className="text-sm font-black text-slate-800">Q{currentIndex + 1} of {questions.length}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${timeLeft < 300 ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 text-slate-600'}`}>
          <Clock size={16} />
          <span className="font-black text-sm tabular-nums">
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* QUESTION AREA */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-2xl bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm">
          <div 
            className="text-lg font-bold text-slate-800 mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentQuestion.promptHtml || "<i>Question text not provided.</i>" }} 
          />

          <div className="space-y-3">
            {currentQuestion.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => handleOptionSelect(opt.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 font-bold transition-all flex items-center gap-4 ${
                  // Logic to find if selected from Redux state
                  false ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER NAVIGATION */}
      <div className="bg-white border-t p-6 flex justify-between items-center gap-4">
        <button 
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          className="flex-1 py-4 border-2 rounded-2xl font-black uppercase tracking-widest text-slate-400 disabled:opacity-30 flex items-center justify-center gap-2"
        >
          <ChevronLeft size={18}/> Prev
        </button>
        
        {currentIndex === questions.length - 1 ? (
          <button 
            onClick={() => dispatch(submitExam())}
            className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
          >
            <Send size={18}/> Finish Exam
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIndex(i => i + 1)}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
          >
            Next Question <ChevronRight size={18}/>
          </button>
        )}
      </div>

      {/* SECURITY MODAL */}
      {showSecurityWarning && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 text-center">
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Security Breach</h2>
            <p className="text-slate-500 font-bold mb-8">You navigated away from the exam. In strict mode, this is a violation. Do you want to submit now or terminate?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => dispatch(submitExam())} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">Submit Current Progress</button>
              <button onClick={() => dispatch(terminateExam())} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black uppercase tracking-widest">Terminate Attempt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamHall;