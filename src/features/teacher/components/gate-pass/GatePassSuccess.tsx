import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { navToGateway } from '../../../../store/slices/gatePassSlice';
import { CheckCircle, Download, Share2, ArrowLeft, Ticket } from 'lucide-react';

const GatePassSuccess: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedStudentId, formData } = useSelector((state: RootState) => state.gatePass);
  const student = useSelector((state: RootState) => state.student.records[selectedStudentId!]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in-95 duration-500 py-10">
      
      <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
        <CheckCircle size={40} />
      </div>

      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900">Gate Pass Issued</h2>
        <p className="text-slate-500 font-bold mt-2">The security gate has been notified.</p>
      </div>

      {/* THE PASS CARD */}
      <div className="w-full max-w-sm bg-white border-2 border-slate-100 rounded-[32px] overflow-hidden shadow-2xl relative">
        <div className="bg-rose-600 p-6 text-white text-center flex flex-col items-center">
           <Ticket size={32} className="mb-2 opacity-50" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em]">Official Gate Pass</p>
           <h3 className="text-2xl font-black">{student?.firstName} {student?.lastName}</h3>
        </div>
        
        <div className="p-8 space-y-4">
          <div className="flex justify-between border-b border-slate-50 pb-3">
             <span className="text-[10px] font-black uppercase text-slate-400">Reason</span>
             <span className="text-xs font-black text-slate-800">{formData.reason}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-3">
             <span className="text-[10px] font-black uppercase text-slate-400">Transport</span>
             <span className="text-xs font-black text-slate-800">{formData.transportMode}</span>
          </div>
          <div className="flex justify-between border-b border-slate-50 pb-3">
             <span className="text-[10px] font-black uppercase text-slate-400">Exit Time</span>
             <span className="text-xs font-black text-slate-800">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>

        {/* MOCK QR CODE */}
        <div className="p-6 bg-slate-50 flex flex-col items-center border-t border-dashed border-slate-200">
           <div className="w-24 h-24 bg-slate-200 rounded-xl mb-3 flex items-center justify-center text-[10px] font-black text-slate-400">QR CODE</div>
           <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">#GP-{Date.now().toString().slice(-6)}</p>
        </div>
      </div>

      <div className="flex flex-col w-full max-w-sm gap-3 pt-4">
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg">
          <Download size={18} /> Download PDF
        </button>
        <button onClick={() => dispatch(navToGateway())} className="w-full bg-white border-2 border-slate-200 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
          <ArrowLeft size={18} /> Issue Another
        </button>
      </div>

    </div>
  );
};

export default GatePassSuccess;