import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ShieldCheck, FileText, CheckCircle2, UserCircle2, BookOpen, GraduationCap, Clock } from 'lucide-react';

interface VerificationRequest {
  id: string;
  name: string;
  dept: string;
  submittedDate: string;
  documents: { name: string; type: string; status: 'Verified' | 'Pending' | 'Rejected' }[];
  experience: string;
}

const mockRequests: VerificationRequest[] = [
  {
    id: 'VR-902',
    name: 'Neha Singh',
    dept: 'Biology',
    submittedDate: 'Oct 30, 2026',
    experience: '5 Years - CBSE International',
    documents: [
      { name: 'Masters Degree', type: 'PDF', status: 'Verified' },
      { name: 'B.Ed Certificate', type: 'PDF', status: 'Pending' },
      { name: 'Identity Proof (Aadhar)', type: 'Image', status: 'Pending' }
    ]
  }
];

const TeacherVerification: React.FC = () => {
  const [selected, setSelected] = useState(mockRequests[0]);
  const handleFinalApprove = (id: string) => {
    // Logic: Post to /api/teachers/approve
    alert(`Credentials for ${id} verified. Teacher is now ACTIVE.`);
    // In a real app, you would filter the list or update the local state
  };

  return (
    <AdminLayout
      pageTitle="Staff Onboarding Desk"
      pageDescription="Verify credentials and assign academic responsibilities to new joiners."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Pending Approval</h3>
          {mockRequests.map(req => (
            <div
              key={req.id}
              onClick={() => setSelected(req)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${selected.id === req.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white border-slate-200 hover:border-blue-300'
                }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selected.id === req.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                  {req.id}
                </span>
                <span className={`text-[10px] font-medium ${selected.id === req.id ? 'text-blue-100' : 'text-slate-400'}`}>{req.submittedDate}</span>
              </div>
              <p className="font-bold text-lg">{req.name}</p>
              <p className={`text-sm ${selected.id === req.id ? 'text-blue-100' : 'text-slate-500'}`}>{req.dept} Department</p>
            </div>
          ))}
        </div>

        {/* Detailed Review Panel */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden flex flex-col ring-1 ring-slate-900/5">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300">
                  <UserCircle2 size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">{selected.name}</h2>
                  <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><GraduationCap size={16} /> {selected.experience}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-colors">Reject Profile</button>
                <button
                  onClick={() => handleFinalApprove(selected.id)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  <ShieldCheck size={18} /> Final Approve
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Document Checklist */}
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={14} /> Document Checklist
              </h4>
              <div className="space-y-3">
                {selected.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                        {doc.status === 'Verified' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{doc.type} File</p>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity underline">Review</button>
                  </div>
                ))}
              </div>
            </section>

            {/* Responsibility Assignment */}
            <section>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <BookOpen size={14} /> Academic Assignment
              </h4>
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-blue-900/40 uppercase mb-1">Assign Primary Class</label>
                  <select className="w-full bg-white border-none rounded-xl p-3 text-sm font-bold shadow-sm ring-1 ring-blue-200 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Select Class</option>
                    <option>Class 11 - Science</option>
                    <option>Class 12 - Science</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-blue-900/40 uppercase mb-1">Subject Expertise</label>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-blue-700 ring-1 ring-blue-200 shadow-sm cursor-pointer">+ Add Subject</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default TeacherVerification;