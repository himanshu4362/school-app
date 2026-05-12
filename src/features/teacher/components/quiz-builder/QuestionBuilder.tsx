import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { 
  addQuestion, updateQuestionPrompt, updateQuestionMarks, 
  addOptionToQuestion, updateOption, removeOption, removeQuestion,
  navToStage, publishImmutableSnapshot 
} from '../../../../store/slices/quizBuilderSlice';
import { Plus, Trash2, CheckCircle, Bold, Italic, Underline, Lock } from 'lucide-react';

const QuestionBuilder: React.FC = () => {
  const dispatch = useDispatch();
  const { questions } = useSelector((state: RootState) => state.quizBuilder);

  const insertFormatting = (qId: string, currentText: string, tag: 'b'|'i'|'u') => {
    dispatch(updateQuestionPrompt({ id: qId, promptHtml: currentText + `<${tag}></${tag}>` }));
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300 pb-12 space-y-6">
      
      {/* FIXED: Mobile Responsive Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-black text-slate-800">Question Bank</h2>
        <button onClick={() => dispatch(addQuestion('MCQ_SINGLE'))} className="w-full sm:w-auto bg-slate-900 text-white px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md hover:bg-slate-800 transition-colors">
          <Plus size={16} /> Add MCQ Question
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-white p-4 sm:p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
            
            {/* FIXED: Moved from absolute positioning to flex layout for Mobile */}
            <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Question {index + 1}</p>
              <div className="flex items-center gap-2">
                 <input 
                   type="number" 
                   value={q.marks} 
                   onChange={e => dispatch(updateQuestionMarks({ id: q.id, marks: parseFloat(e.target.value)||0 }))} 
                   className="w-16 h-8 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-700 outline-none focus:border-blue-500" 
                   title="Marks" 
                 />
                 <button onClick={() => dispatch(removeQuestion(q.id))} className="w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors">
                   <Trash2 size={16}/>
                 </button>
              </div>
            </div>
            
            {/* FIXED: Dark Mode Textarea */}
            <div className="border-2 border-slate-200 rounded-xl overflow-hidden mb-6 flex flex-col">
              <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex gap-2">
                <button onClick={() => insertFormatting(q.id, q.promptHtml, 'b')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600"><Bold size={14}/></button>
                <button onClick={() => insertFormatting(q.id, q.promptHtml, 'i')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600"><Italic size={14}/></button>
                <button onClick={() => insertFormatting(q.id, q.promptHtml, 'u')} className="p-1.5 rounded hover:bg-slate-200 text-slate-600"><Underline size={14}/></button>
              </div>
              <textarea 
                value={q.promptHtml} 
                onChange={e => dispatch(updateQuestionPrompt({ id: q.id, promptHtml: e.target.value }))}
                placeholder="Type your question here..."
                className="w-full h-24 p-4 bg-slate-50 text-sm font-bold text-slate-700 outline-none resize-none"
              />
            </div>

            {/* OPTIONS BUILDER */}
            <div className="space-y-3">
              {q.options.map((opt, optIndex) => (
                <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${opt.isCorrect ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                  
                  <button 
                    onClick={() => dispatch(updateOption({ qId: q.id, optId: opt.id, text: opt.text, isCorrect: !opt.isCorrect }))}
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${opt.isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-slate-300 text-transparent hover:border-emerald-300'}`}
                  >
                    <CheckCircle size={14} />
                  </button>
                  
                  <input 
                    type="text" 
                    value={opt.text}
                    onChange={e => dispatch(updateOption({ qId: q.id, optId: opt.id, text: e.target.value, isCorrect: opt.isCorrect }))}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none"
                  />
                  
                  <button onClick={() => dispatch(removeOption({ qId: q.id, optId: opt.id }))} className="text-slate-400 hover:text-rose-500 p-1"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
            
            <button onClick={() => dispatch(addOptionToQuestion(q.id))} className="mt-4 text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-1 hover:text-blue-800 w-max">
              <Plus size={14} /> Add Option
            </button>

          </div>
        ))}

        {questions.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-slate-300 bg-white rounded-[32px] text-slate-400 font-bold">
            No questions yet. Click "Add MCQ Question" to start building your test.
          </div>
        )}
      </div>

      {/* FIXED: Mobile Responsive Footer Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-4 mt-8">
        <button onClick={() => dispatch(navToStage('CONFIG'))} className="w-full sm:w-auto px-6 py-4 sm:py-5 rounded-[24px] border-2 border-slate-200 bg-white text-slate-500 font-black uppercase tracking-widest hover:bg-slate-50">Back to Settings</button>
        <button onClick={() => dispatch(publishImmutableSnapshot())} className="w-full sm:flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 sm:py-5 rounded-[24px] font-black uppercase tracking-[0.2em] active:sclae-90 duration-200 linear shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3">
          <Lock size={18} /> Publish Snapshot
        </button>
      </div>

    </div>
  );
};

export default QuestionBuilder;