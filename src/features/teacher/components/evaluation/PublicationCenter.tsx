import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { requestVerification, publishResult } from '../../../../store/slices/evaluationSlice';
import { Send, CheckCircle, ShieldAlert, BookOpen } from 'lucide-react';

const PublicationCenter: React.FC = () => {
  const dispatch = useDispatch();
  const { assignedExams } = useSelector((state: RootState) => state.evaluation);

  // Filter only exams that are past the drafting phase
  const publicationExams = Object.values(assignedExams).filter(e => 
    ['PREPARED', 'VERIFIED', 'PUBLISHED'].includes(e.status)
  );

  return (
    <div className="flex-1 flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800">Publication & Verification Desk</h2>
          <p className="text-sm font-bold text-slate-500">Request HOD approval and publish immutable snapshots to the Parent Portal.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {publicationExams.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 font-bold bg-white rounded-3xl border border-slate-200">
            No exams are currently prepared for publication.
          </div>
        ) : (
          publicationExams.map(exam => (
            <div key={exam.id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col">
              
              <div className="flex justify-between items-start mb-4">
                <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-2xl flex items-center justify-center">
                  <BookOpen size={24} />
                </div>
                <div className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${
                  exam.status === 'PREPARED' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  exam.status === 'VERIFIED' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-emerald-100 text-emerald-700 border-emerald-200'
                }`}>
                  {exam.status}
                </div>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="text-xl font-black text-slate-800 leading-tight">{exam.title}</h3>
                <p className="text-sm font-bold text-slate-500 mt-1">Class {exam.classId}-{exam.sectionId} • {exam.subject}</p>
              </div>

              {exam.status === 'PREPARED' && (
                <button 
                  onClick={() => dispatch(requestVerification(exam.id))}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                >
                  <ShieldAlert size={16} /> Request HOD Verification
                </button>
              )}

              {exam.status === 'VERIFIED' && (
                <button 
                  onClick={() => dispatch(publishResult(exam.id))}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <Send size={16} /> Publish Immutable Snapshot
                </button>
              )}

              {exam.status === 'PUBLISHED' && (
                <button disabled className="w-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <CheckCircle size={16} /> Published & Locked
                </button>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PublicationCenter;