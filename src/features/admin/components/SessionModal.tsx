import React from "react";
import {
  Monitor,
  Smartphone,
  LogOut,
  ShieldCheck,
  Globe,
  Clock,
  X,
  CircleDot,
} from "lucide-react";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
}

const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  const sessions = [
    {
      id: 1,
      device: "Windows 11 • Chrome",
      location: "Jamshedpur, IN",
      ip: "192.168.1.45",
      time: "Active now",
      icon: <Monitor size={18} />,
      isCurrent: true,
    },
    {
      id: 2,
      device: "iPhone 14 Pro • Safari",
      location: "Jamshedpur, IN",
      ip: "103.45.22.11",
      time: "2 hours ago",
      icon: <Smartphone size={18} />,
      isCurrent: false,
    },
  ];

  const currentSession = sessions.filter((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
      <div className="w-full max-w-xl rounded-[28px] bg-white/80 backdrop-blur-2xl border border-white/30 shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="relative px-8 py-7 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
              <ShieldCheck size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Session Management
              </h2>
              <p className="text-sm text-slate-400">
                Monitor and control your active sessions
              </p>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="px-8 py-7 space-y-8">

          {/* CURRENT SESSION */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              This Device
            </p>

            {currentSession.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-5 rounded-2xl bg-blue-50 border border-blue-100 shadow-sm"
              >
                <div className="flex gap-4 items-center">
                  <div className="p-3 bg-blue-600 text-white rounded-xl shadow">
                    {s.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm">
                        {s.device}
                      </p>
                      <CircleDot size={10} className="text-green-500" />
                    </div>

                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                      <span className="flex items-center gap-1">
                        <Globe size={12} /> {s.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {s.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1">
                      IP: {s.ip}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] px-3 py-1 bg-blue-600 text-white rounded-full font-bold uppercase tracking-widest">
                  Active
                </span>
              </div>
            ))}
          </div>

          {/* OTHER SESSIONS */}
          <div>
            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
              Other Sessions
            </p>

            <div className="space-y-3">
              {otherSessions.map((s) => (
                <div
                  key={s.id}
                  className="group flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all"
                >
                  <div className="flex gap-4 items-center">
                    <div className="p-3 rounded-xl bg-slate-100 text-slate-500 group-hover:bg-white border border-slate-200 transition">
                      {s.icon}
                    </div>

                    <div>
                      <p className="font-semibold text-sm text-slate-900">
                        {s.device}
                      </p>

                      <div className="text-xs text-slate-500 mt-1 flex gap-3">
                        <span className="flex items-center gap-1">
                          <Globe size={12} /> {s.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} /> {s.time}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1">
                        IP: {s.ip}
                      </p>
                    </div>
                  </div>

                  <button className="opacity-0 group-hover:opacity-100 text-xs font-bold text-rose-600 hover:underline transition">
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="pt-2 space-y-3">
            <button
              onClick={onConfirmLogout}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.01] active:scale-[0.98] transition"
            >
              <LogOut size={18} />
              Logout All Devices
            </button>

            <button
              onClick={onClose}
              className="w-full py-4 text-sm font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              Continue Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionModal;