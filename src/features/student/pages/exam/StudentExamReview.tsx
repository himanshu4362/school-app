import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../../store/store';
import { CheckCircle, XCircle, Clock, Trophy, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useHistory } from 'react-router-dom';

const StudentExamReview: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  
  const { title, subject, questions } = useSelector((state: RootState) => state.quizBuilder);
  const { responses, startTime, endTime, violations } = useSelector((state: RootState) => state.studentAttempt);

  const results = useMemo(() => {
    let earnedMarks = 0;
    let totalMarks = 0;
    let totalTimeSeconds = 0;

    const detailedReview = questions.map(q => {
      totalMarks += q.marks;
      const response = responses[q.id];
      const correctOption = q.options.find(o => o.isCorrect);
      
      const isCorrect = response?.selectedOptionId === correctOption?.id;
      if (isCorrect) earnedMarks += q.marks;
      if (response?.timeSpentSeconds) totalTimeSeconds += response.timeSpentSeconds;

      return {
        question: q,
        response,
        isCorrect,
        correctOption,
        studentSelectedText: q.options.find(o => o.id === response?.selectedOptionId)?.text || 'Unanswered'
      };
    });

    const percentage = totalMarks > 0 ? Math.round((earnedMarks / totalMarks) * 100) : 0;
    const minutesTaken = Math.floor(totalTimeSeconds / 60);
    const secondsTaken = totalTimeSeconds % 60;

    return { earnedMarks, totalMarks, percentage, minutesTaken, secondsTaken, detailedReview };
  }, [questions, responses]);

  return (
    <div className="w-full max-w-[1000px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER ACTIONS */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => history.push('/student/exams')} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* RESULT HERO CARD */}
      <div className="bg-slate-900 rounded-[40px] p-8 lg:p-12 relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>
        
        <div className="z-10 text-center md:text-left">
          <h1 className="text-3xl lg:text-5xl font-black tracking-tight mb-2">{title}</h1>
          <p className="text-emerald-200 font-bold uppercase tracking-widest text-xs">{subject} • Automated Result</p>
          
          {violations.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 bg-rose-500/20 text-rose-300 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-rose-500/30">
              <AlertTriangle size={14}/> {violations.length} Security Violations Logged
            </div>
          )}
        </div>

        <div className="z-10 flex gap-4 text-center">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[32px] min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1"><Trophy size={14}/> Final Score</p>
            <p className="text-4xl font-black mt-2 text-emerald-400">{results.percentage}%</p>
            <p className="text-xs font-bold text-slate-400 mt-1">{results.earnedMarks} / {results.totalMarks} Marks</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[32px] min-w-[140px]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1"><Clock size={14}/> Time Taken</p>
            <p className="text-3xl font-black mt-2">{results.minutesTaken}m {results.secondsTaken}s</p>
          </div>
        </div>
      </div>

      {/* DETAILED QUESTION REVIEW */}
      <h3 className="text-lg font-black text-slate-800 mt-8 mb-4">Detailed Breakdown</h3>
      <div className="space-y-4">
        {results.detailedReview.map((item, index) => (
          <div key={item.question.id} className={`bg-white rounded-[32px] p-6 border-2 transition-all ${item.isCorrect ? 'border-emerald-100 shadow-sm' : 'border-rose-100 shadow-sm'}`}>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${item.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {item.isCorrect ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {index + 1}</p>
                  <p className={`text-sm font-black ${item.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.isCorrect ? `+${item.question.marks} Marks` : '0 Marks'}
                  </p>
                </div>
              </div>
              <div className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-200 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Clock size={12}/> {item.response?.timeSpentSeconds || 0}s spent
              </div>
            </div>

            <div className="text-sm font-bold text-slate-800 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100" dangerouslySetInnerHTML={{ __html: item.question.promptHtml }} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border-2 border-slate-100 bg-slate-50">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Answer</p>
                <p className={`text-sm font-bold ${item.isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.studentSelectedText}
                </p>
              </div>
              {!item.isCorrect && (
                <div className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Correct Answer</p>
                  <p className="text-sm font-bold text-emerald-800">{item.correctOption?.text}</p>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default StudentExamReview;