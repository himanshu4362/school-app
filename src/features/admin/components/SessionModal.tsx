import React from 'react';
import { Monitor, Smartphone, LogOut, ShieldCheck, Globe, Clock, X } from 'lucide-react';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onConfirmLogout }) => {
  if (!isOpen) return null;

  const sessions = [
    { id: 1, device: "Windows 11 • Chrome", location: "Jamshedpur, IN", ip: "192.168.1.45", time: "Active Now", icon: <Monitor size={18} />, isCurrent: true },
    { id: 2, device: "iPhone 14 Pro • Safari", location: "Jamshedpur, IN", ip: "103.45.22.11", time: "2 hours ago", icon: <Smartphone size={18} />, isCurrent: false },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-all duration-300">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Security Header */}
        <div className="relative p-8 bg-slate-900 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"><X size={20}/></button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/20"><ShieldCheck size={28}/></div>
            <div>
              <h2 className="text-2xl font-bold">Account Security</h2>
              <p className="text-slate-400 text-sm">Review active sessions on other devices.</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="space-y-4 mb-10">
            {sessions.map(s => (
              <div key={s.id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${s.isCurrent ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50/30 border-slate-100 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${s.isCurrent ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200'}`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{s.device}</p>
                      {s.isCurrent && <span className="px-2 py-0.5 bg-blue-600 text-[9px] font-black text-white rounded-full uppercase tracking-tighter">Current</span>}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] font-medium text-slate-500">
                      <span className="flex items-center gap-1"><Globe size={12}/> {s.location}</span>
                      <span className="flex items-center gap-1"><Clock size={12}/> {s.time}</span>
                    </div>
                  </div>
                </div>
                {!s.isCurrent && <button className="text-xs font-black text-rose-600 hover:underline uppercase tracking-widest">Revoke</button>}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={onConfirmLogout} className="w-full py-4 bg-rose-600 text-white rounded-2xl font-bold text-sm hover:bg-rose-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-600/20">
              <LogOut size={20} /> Logout All Sessions
            </button>
            <button onClick={onClose} className="w-full py-4 bg-white text-slate-500 rounded-2xl font-bold text-sm hover:text-slate-900 transition-colors">
              Continue Working
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;