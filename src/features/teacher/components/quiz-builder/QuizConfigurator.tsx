import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { updateConfig, setBasicInfo, navToStage } from '../../../../store/slices/quizBuilderSlice';
import { Settings, Shield, Clock, Eye, ChevronRight } from 'lucide-react';

const QuizConfigurator: React.FC = () => {
  const dispatch = useDispatch();
  const state = useSelector((state: RootState) => state.quizBuilder);
  const { config } = state;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full animate-in fade-in zoom-in-95 duration-300 pb-12 space-y-6">
      
      {/* HEADER INFO */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><Settings size={20}/> Exam Metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Title</label>
            {/*   FIXED: Added bg-slate-50 */}
            <input type="text" value={state.title} onChange={e => dispatch(setBasicInfo({...state, title: e.target.value}))} className="w-full mt-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="e.g. Mid-Term Science Practical" />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
            {/*   FIXED: Added bg-slate-50 */}
            <input type="text" value={state.subject} onChange={e => dispatch(setBasicInfo({...state, subject: e.target.value}))} className="w-full mt-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="e.g. Science" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TIMING CONFIG */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Clock size={16}/> Timing Rules</h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50">
              <input type="radio" name="timing" checked={config.timingMode === 'FLEXIBLE_DURATION'} onChange={() => dispatch(updateConfig({ timingMode: 'FLEXIBLE_DURATION' }))} className="mt-1" />
              <div>
                <p className="text-sm font-black text-slate-800">Flexible Duration</p>
                <p className="text-[10px] font-bold text-slate-400">Student can start anytime, but has X minutes to finish.</p>
              </div>
            </label>
            
            {config.timingMode === 'FLEXIBLE_DURATION' && (
              <div className="pl-8 flex items-center gap-3">
                {/*   FIXED: Added bg-slate-50 */}
                <input type="number" value={config.durationMinutes} onChange={e => dispatch(updateConfig({ durationMinutes: parseInt(e.target.value)||0 }))} className="w-20 bg-slate-50 border-2 border-slate-200 rounded-lg px-3 py-2 text-center font-bold text-slate-700 outline-none focus:border-blue-500" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* SECURITY CONFIG */}
        <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Shield size={16}/> Proctoring Security</h2>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 p-3 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50">
              <input type="radio" name="security" checked={config.securityMode === 'STRICT_PROCTORED'} onChange={() => dispatch(updateConfig({ securityMode: 'STRICT_PROCTORED' }))} className="mt-1" />
              <div>
                <p className="text-sm font-black text-slate-800">Strict Proctored</p>
                <p className="text-[10px] font-bold text-slate-400">Detects app switching and logs violation events.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border-2 border-slate-100 rounded-xl cursor-pointer hover:bg-slate-50">
              <input type="radio" name="security" checked={config.securityMode === 'NORMAL_OPEN'} onChange={() => dispatch(updateConfig({ securityMode: 'NORMAL_OPEN' }))} className="mt-1" />
              <div>
                <p className="text-sm font-black text-slate-800">Open Book</p>
                <p className="text-[10px] font-bold text-slate-400">Low restriction. App switching is allowed.</p>
              </div>
            </label>
          </div>
        </div>

        {/* RESULTS & SHUFFLING */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Eye size={16}/> Result Publication</h2>
             {/*   FIXED: Added bg-slate-50 */}
             <select value={config.resultMode} onChange={e => dispatch(updateConfig({ resultMode: e.target.value as any }))} className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500">
                <option value="MANUAL_HOLD">Manual Publish (Held by Teacher)</option>
                <option value="AUTO_INSTANT">Auto-Publish Instantly on Submit</option>
             </select>
           </div>
           <div>
             <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Settings size={16}/> Exam Integrity Options</h2>
             <div className="space-y-3">
               <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                 <span className="text-xs font-bold text-slate-700">Shuffle Questions</span>
                 <input type="checkbox" checked={config.shuffleQuestions} onChange={e => dispatch(updateConfig({ shuffleQuestions: e.target.checked }))} className="w-4 h-4" />
               </label>
               <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl cursor-pointer">
                 <span className="text-xs font-bold text-slate-700">Shuffle Options within MCQ</span>
                 <input type="checkbox" checked={config.shuffleOptions} onChange={e => dispatch(updateConfig({ shuffleOptions: e.target.checked }))} className="w-4 h-4" />
               </label>
             </div>
           </div>
        </div>

      </div>

      <button onClick={() => dispatch(navToStage('BUILDER'))} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-[24px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3">
        Next: Build Question Bank <ChevronRight size={20} />
      </button>

    </div>
  );
};

export default QuizConfigurator;