import React from 'react';
import { X, PackagePlus, Monitor } from 'lucide-react';

const IssueAssetModal: React.FC<{ isOpen: boolean; onClose: () => void; assetName: string }> = ({ isOpen, onClose, assetName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20"><PackagePlus size={20}/></div>
             <h2 className="text-xl font-bold text-slate-900">Issue Item</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={24}/></button>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="p-4 bg-slate-100 rounded-xl flex items-center gap-3 border border-slate-200">
            <Monitor size={18} className="text-slate-500"/>
            <span className="font-bold text-slate-800">{assetName}</span>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assign To Staff / Room</label>
            <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10 outline-none" placeholder="Enter Staff ID or Room No." />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Expected Return Date</label>
            <input type="date" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none" />
          </div>

          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-900/10 hover:bg-blue-600 transition-all">
            Update Registry & Issue
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueAssetModal;