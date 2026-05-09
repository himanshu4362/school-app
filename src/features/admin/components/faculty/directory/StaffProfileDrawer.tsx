import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, User, Briefcase, GraduationCap, Calendar, IndianRupee, ShieldCheck, History, Mail, Phone, MapPin } from 'lucide-react';
import { RootState } from '../../../../../store/store';
import { closeProfile } from '../../../../../store/slices/facultyDirectorySlice';

const TABS = [
  { id: 'identity', label: 'Identity', icon: <User size={14} /> },
  { id: 'employment', label: 'Employment', icon: <Briefcase size={14} /> },
  { id: 'academic', label: 'Academic', icon: <GraduationCap size={14} /> },
  { id: 'attendance', label: 'Attendance', icon: <Calendar size={14} /> },
  { id: 'payroll', label: 'Payroll', icon: <IndianRupee size={14} /> },
  { id: 'vault', label: 'Vault', icon: <ShieldCheck size={14} /> },
  { id: 'timeline', label: 'Timeline', icon: <History size={14} /> },
];

const StaffProfileDrawer: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('identity');
  
  const { selectedEmployeeId, staff } = useSelector((state: RootState) => state.facultyDirectory);
  const employee = staff.find(s => s.id === selectedEmployeeId);

  if (!selectedEmployeeId) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={() => dispatch(closeProfile())} />

      {/* Drawer Panel */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 transform ${selectedEmployeeId ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* HEADER: Identity Summary */}
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
              {employee?.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{employee?.fullName}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{employee?.employeeId} • {employee?.primarySubject}</p>
              <div className="mt-2 flex gap-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase tracking-tighter">Active</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-black uppercase tracking-tighter">{employee?.workloadStatus}</span>
              </div>
            </div>
          </div>
          <button onClick={() => dispatch(closeProfile())} className="p-2 text-slate-400 hover:bg-slate-200 rounded-xl transition-all">
            <X size={20} />
          </button>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar bg-white sticky top-0 z-10">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab.id ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: The 7 Systems */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
          
          {activeTab === 'identity' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <Section title="Contact Details" icon={<Mail />}>
                <DataRow label="Email" value={employee?.email} />
                <DataRow label="Mobile" value={employee?.mobile} />
              </Section>
              <Section title="Personal Information" icon={<User />}>
                <DataRow label="Gender" value="Male" />
                <DataRow label="Date of Birth" value="Sept 30, 1990" />
                <DataRow label="Blood Group" value="O+" />
              </Section>
              <Section title="Residential Address" icon={<MapPin />}>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">Jamshedpur, Jharkhand, India</p>
              </Section>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
              <Section title="Job Details" icon={<Briefcase />}>
                <DataRow label="Department" value="Science" />
                <DataRow label="Designation" value="PGT Physics" />
                <DataRow label="Joining Date" value="May 08, 2026" />
                <DataRow label="Employment Type" value="Full Time" />
              </Section>
            </div>
          )}

          {/* Placeholders for future logic-heavy tabs */}
          {['academic', 'attendance', 'payroll', 'vault', 'timeline'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
              <div className="p-5 bg-slate-100 rounded-full mb-4">
                {TABS.find(t => t.id === activeTab)?.icon}
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">System Integration Pending</h4>
              <p className="text-xs font-bold text-slate-400 mt-1">This module will populate once the Attendance/Payroll logic is finalized.</p>
            </div>
          )}
        </div>

        {/* QUICK ACTIONS FOOTER */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-md hover:bg-slate-800 transition-all">Edit Profile</button>
          <button className="px-5 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all">Actions</button>
        </div>

      </div>
    </>
  );
};

// --- SMALL UI HELPERS ---
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="space-y-3">
    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
      <span className="p-1 bg-indigo-50 rounded">{icon}</span> {title}
    </h3>
    <div className="grid grid-cols-1 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
      {children}
    </div>
  </div>
);

const DataRow: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="flex justify-between items-center border-b border-slate-100 last:border-0 pb-2 last:pb-0">
    <span className="text-[11px] font-bold text-slate-400">{label}</span>
    <span className="text-sm font-black text-slate-800">{value || 'N/A'}</span>
  </div>
);

export default StaffProfileDrawer;