import React from 'react';
import { Monitor, Smartphone, LogOut, ShieldAlert } from 'lucide-react';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onConfirmLogout }) => {
  if (!isOpen) return null;

  const sessions = [
    { id: 1, device: "Windows PC - Chrome", ip: "192.168.1.45", time: "Active Now", icon: <Monitor size={20} />, isCurrent: true },
    { id: 2, device: "iPhone 14 Pro - Safari", ip: "103.45.22.11", time: "Last active 2 hours ago", icon: <Smartphone size={20} />, isCurrent: false },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><ShieldAlert size={20}/></div>
          <h2 className="text-xl font-bold text-slate-800">Account Security</h2>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4 font-medium">Active Sessions</p>
          <div className="space-y-3 mb-8">
            {sessions.map(s => (
              <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg border ${s.isCurrent ? 'border-blue-200 bg-blue-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="text-slate-500">{s.icon}</div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.device} {s.isCurrent && <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full ml-2">Current</span>}</p>
                    <p className="text-xs text-slate-500">{s.ip} • {s.time}</p>
                  </div>
                </div>
                {!s.isCurrent && (
                  <button className="text-xs text-red-600 font-semibold hover:underline">Revoke</button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">
              Cancel
            </button>
            <button onClick={onConfirmLogout} className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2">
              <LogOut size={18} /> Logout Current Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;