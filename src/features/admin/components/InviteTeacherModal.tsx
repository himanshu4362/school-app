import React, { useState } from 'react';
import { X, Mail, Send } from 'lucide-react';

interface InviteTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteTeacherModal: React.FC<InviteTeacherModalProps> = ({ isOpen, onClose }) => {
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    // Simulate API call to send email invite
    setTimeout(() => {
      setIsSending(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Mail size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Invite New Teacher</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSendInvite} className="p-6 space-y-4">
          <p className="text-sm text-slate-500 mb-4">
            An official invitation link will be sent to the candidate's email. They will use this link to set up their password and complete their profile.
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (As per Resume)</label>
            <input required type="text" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="e.g. John Doe" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input required type="email" className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition" placeholder="john.doe@example.com" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Department</label>
            <select required className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 transition bg-white">
              <option value="">Select Department</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Computer Science">Computer Science</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium">
              Cancel
            </button>
            <button type="submit" disabled={isSending} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-70">
              {isSending ? 'Sending...' : <><Send size={16} /> Send Invite</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteTeacherModal;