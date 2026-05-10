import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    UserMinus, AlertTriangle, CheckCircle2, XCircle,
    Clock, FileText, Lock, ShieldAlert, X, Plus, Trash2,
    Banknote, ShieldCheck, UserCheck, BookOpen, Calendar as CalendarIcon, Link as LinkIcon
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import {
    initiateSeparation, beginClearanceProcess, updateClearanceStatus,
    generateFnF, approveFnF, completeSeparation
} from '../../../../store/slices/hrSlice';
import AdminLayout from '../../components/layout/AdminLayout';

// ==========================================
// MOCK DATA (Enhanced for the Principal's Dossier)
// ==========================================
const MOCK_ACTIVE_STAFF = [
    {
        id: 'EMP-001', name: 'Ravi Verma', role: 'Senior Teacher (Science)',
        joinDate: '2021-04-01', subjects: ['Physics (Class 10)', 'Chemistry (Class 9)'],
        documents: [{ name: 'Original Contract', type: 'PDF' }, { name: 'Resignation Letter', type: 'PDF' }]
    },
    {
        id: 'EMP-002', name: 'Anjali Desai', role: 'Teacher (English)',
        joinDate: '2023-06-15', subjects: ['English Lit (Class 11)', 'Grammar (Class 8)'],
        documents: [{ name: 'Joining Report', type: 'PDF' }]
    },
];

const SeparationHub: React.FC = () => {
    const dispatch = useDispatch();
    const { separations, validationErrors } = useSelector((state: RootState) => state.hr);

    // Core State
    const [selectedSeparationId, setSelectedSeparationId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'PIPELINE' | 'DOSSIER'>('PIPELINE'); // 🔴 NEW: The Dual-View

    // Initiation Modal
    const [isInitiateOpen, setIsInitiateOpen] = useState(false);
    const [initStaffId, setInitStaffId] = useState('');
    const [initReason, setInitReason] = useState<any>('RESIGNATION');
    const [initLWD, setInitLWD] = useState('');
    const [initHasDependencies, setInitHasDependencies] = useState(false);

    // Clearance Modal
    const [clearanceTarget, setClearanceTarget] = useState<any>(null);
    const [clearanceRemarks, setClearanceRemarks] = useState('');
    const [clearanceAction, setClearanceAction] = useState<'CLEARED' | 'REJECTED' | 'ESCALATED' | 'PENDING'>('CLEARED');

    // FnF Worksheet State
    const [fnfProRata, setFnfProRata] = useState<number>(0);
    const [fnfLeaveEncashment, setFnfLeaveEncashment] = useState<number>(0);
    const [fnfDeductions, setFnfDeductions] = useState<any[]>([]);

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    const activeSeparations = Object.values(separations);
    const activeRecord = separations[selectedSeparationId];
    const activeStaff = MOCK_ACTIVE_STAFF.find(s => s.id === activeRecord?.staffId);

    // Calculate Tenure for the Dossier
    const calculateTenure = (joinDate: string, lastDay: string) => {
        const start = new Date(joinDate);
        const end = new Date(lastDay);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        return `${years} Years, ${months} Months (${diffDays} Total Days)`;
    };

    // ==========================================
    // HANDLERS
    // ==========================================
    const handleInitiate = () => {
        if (!initStaffId || !initLWD) return;
        dispatch(initiateSeparation({
            staffId: initStaffId, reason: initReason, lastWorkingDay: initLWD,
            adminId: 'ADMIN-HR', hasActiveDependencies: initHasDependencies
        }));
        setIsInitiateOpen(false);
        setInitStaffId(''); setInitLWD(''); setInitHasDependencies(false);
    };

    const handleUpdateClearance = () => {
        if (!clearanceTarget || !activeRecord) return;
        dispatch(updateClearanceStatus({
            staffId: activeRecord.staffId, department: clearanceTarget.department,
            status: clearanceAction, remarks: clearanceRemarks, adminId: 'ADMIN-DEPT-HEAD'
        }));
        setClearanceTarget(null); setClearanceRemarks('');
    };

    const handleGenerateFnF = () => {
        if (!activeRecord) return;
        dispatch(generateFnF({
            staffId: activeRecord.staffId, proRataSalary: fnfProRata,
            leaveEncashment: fnfLeaveEncashment, deductions: fnfDeductions
        }));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SEPARATION_INITIATED': return 'bg-slate-100 text-slate-700 border-slate-300';
            case 'NOTICE_PERIOD': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'CLEARANCE_PENDING': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'FNF_PENDING_APPROVAL': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'FNF_APPROVED': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
            case 'SEPARATED': return 'bg-slate-900 text-slate-300 border-slate-700';
            default: return 'bg-slate-100 text-slate-500';
        }
    };

    return (
        <AdminLayout pageTitle="Separation Engine & FnF" pageDescription="Manage offboarding, departmental clearances, and Final Settlements." breadcrumbs={[{ label: 'HR Hub' }, { label: 'Separations' }]}>

            {/* ERROR GUARDRAIL BANNER */}
            {validationErrors.length > 0 && (
                <div className="mb-6 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl flex items-start gap-3 shadow-sm animate-in slide-in-from-top-2">
                    <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Action Blocked</h4>
                        <ul className="mt-1 space-y-1">
                            {validationErrors.map((err, idx) => <li key={idx} className="text-xs font-bold text-rose-700">{err.message}</li>)}
                        </ul>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-160px)]">

                {/* ========================================== */}
                {/* LEFT COLUMN: ACTIVE PIPELINE */}
                {/* ========================================== */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">

                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <UserMinus size={16} className="text-rose-600" /> Active Pipeline
                            </h3>
                            <button onClick={() => setIsInitiateOpen(true)} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors flex items-center gap-1 shadow-md">
                                <Plus size={12} /> Initiate
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl divide-y divide-slate-100">
                            {activeSeparations.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-xs font-bold">No active separations.</div>
                            ) : (
                                activeSeparations.map(sep => {
                                    const staff = MOCK_ACTIVE_STAFF.find(s => s.id === sep.staffId);
                                    return (
                                        <div key={sep.staffId} onClick={() => setSelectedSeparationId(sep.staffId)} className={`p-4 cursor-pointer transition-all ${selectedSeparationId === sep.staffId ? 'bg-rose-50 border-l-4 border-rose-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className={`text-sm font-black ${selectedSeparationId === sep.staffId ? 'text-rose-900' : 'text-slate-900'}`}>{staff?.name || sep.staffId}</p>
                                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{sep.reason}</p>
                                                </div>
                                                {sep.accessRevokedAt && <span title="Access Revoked">
                                                    <Lock size={12} className="text-rose-600" />
                                                </span>}
                                            </div>
                                            <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusBadge(sep.status)}`}>
                                                {sep.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* ========================================== */}
                {/* RIGHT COLUMN: DUAL-VIEW COMMAND CENTER */}
                {/* ========================================== */}
                <div className="lg:col-span-8 h-full flex flex-col">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-y-auto custom-scrollbar">

                        {!activeRecord ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <ShieldCheck size={48} className="text-slate-200 mb-4" />
                                <h2 className="text-xl font-black text-slate-900">Pipeline Tracker</h2>
                                <p className="text-sm font-bold text-slate-500 mt-2">Select a record from the pipeline to process clearances and FnF.</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in duration-300 flex flex-col h-full">

                                {/* HEADER & TABS */}
                                <div className="flex justify-between items-start mb-4 shrink-0">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900">{activeStaff?.name}</h2>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">ID: {activeRecord.staffId} | {activeStaff?.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border ${getStatusBadge(activeRecord.status)}`}>
                                            {activeRecord.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-6 border-b border-slate-200 shrink-0">
                                    <button onClick={() => setActiveTab('PIPELINE')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'PIPELINE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                        <ShieldCheck size={16} /> Action Pipeline
                                    </button>
                                    <button onClick={() => setActiveTab('DOSSIER')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'DOSSIER' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                        <UserCheck size={16} /> Executive Dossier
                                    </button>
                                </div>

                                {/* ========================================== */}
                                {/* TAB 1: THE PIPELINE VIEW */}
                                {/* ========================================== */}
                                {activeTab === 'PIPELINE' && (
                                    <div className="flex-1 space-y-8 pb-8">
                                        {/* VISUALIZER */}
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <div className={`flex flex-col items-center gap-1 ${['SEPARATION_INITIATED', 'NOTICE_PERIOD', 'CLEARANCE_PENDING', 'FNF_PENDING_APPROVAL', 'FNF_APPROVED', 'SEPARATED'].includes(activeRecord.status) ? 'text-indigo-600' : ''}`}><div className="w-4 h-4 rounded-full bg-current"></div> Initiation</div>
                                            <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
                                            <div className={`flex flex-col items-center gap-1 ${['CLEARANCE_PENDING', 'FNF_PENDING_APPROVAL', 'FNF_APPROVED', 'SEPARATED'].includes(activeRecord.status) ? 'text-amber-600' : ''}`}><div className="w-4 h-4 rounded-full bg-current"></div> Clearance</div>
                                            <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
                                            <div className={`flex flex-col items-center gap-1 ${['FNF_PENDING_APPROVAL', 'FNF_APPROVED', 'SEPARATED'].includes(activeRecord.status) ? 'text-purple-600' : ''}`}><div className="w-4 h-4 rounded-full bg-current"></div> FnF Draft</div>
                                            <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
                                            <div className={`flex flex-col items-center gap-1 ${['FNF_APPROVED', 'SEPARATED'].includes(activeRecord.status) ? 'text-emerald-600' : ''}`}><div className="w-4 h-4 rounded-full bg-current"></div> Approved</div>
                                            <div className="flex-1 h-0.5 bg-slate-200 mx-2"></div>
                                            <div className={`flex flex-col items-center gap-1 ${['SEPARATED'].includes(activeRecord.status) ? 'text-slate-900' : ''}`}><div className="w-4 h-4 rounded-full bg-current"></div> Separated</div>
                                        </div>

                                        {/* STATE: NOTICE PERIOD */}
                                        {activeRecord.status === 'NOTICE_PERIOD' && (
                                            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center">
                                                <Clock className="mx-auto text-blue-500 mb-3" size={32} />
                                                <h3 className="text-base font-black text-blue-900 mb-2">Serving Notice Period</h3>
                                                <p className="text-xs font-bold text-blue-700 mb-4">Teacher is serving notice until {activeRecord.lastWorkingDay}.</p>
                                                <button onClick={() => dispatch(beginClearanceProcess(activeRecord.staffId))} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm">
                                                    Begin Clearance Process Early
                                                </button>
                                            </div>
                                        )}

                                        {/* STATE: CLEARANCE PENDING */}
                                        {['CLEARANCE_PENDING', 'FNF_PENDING_APPROVAL', 'FNF_APPROVED', 'SEPARATED'].includes(activeRecord.status) && (
                                            <div>
                                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Departmental Clearance Matrix (No Dues)</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {activeRecord.clearanceMatrix.map((item, idx) => (
                                                        <div key={idx} className={`p-4 rounded-xl border-2 flex justify-between items-center ${item.status === 'CLEARED' ? 'bg-emerald-50 border-emerald-200' : item.status === 'REJECTED' || item.status === 'ESCALATED' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{item.department} Dept</p>
                                                                <p className={`text-[10px] font-bold uppercase mt-1 ${item.status === 'CLEARED' ? 'text-emerald-600' : item.status === 'PENDING' ? 'text-amber-500' : 'text-rose-600'}`}>{item.status}</p>
                                                                {item.remarks && <p className="text-[9px] font-medium text-slate-500 italic mt-1 max-w-[200px] truncate">"{item.remarks}"</p>}
                                                            </div>

                                                            {activeRecord.status === 'CLEARANCE_PENDING' && (
                                                                <button onClick={() => setClearanceTarget(item)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest transition-colors">
                                                                    Update
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* STATE: FNF GENERATION WORKSHEET */}
                                        {activeRecord.status === 'CLEARANCE_PENDING' && (activeRecord.clearanceMatrix.every(c => c.status === 'CLEARED') || activeRecord.reason === 'ABSCONDED') && (
                                            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800">
                                                <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2"><CheckCircle2 size={16} /> Clearance Complete. Generate FnF.</h3>

                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Pro-Rata Base Salary (₹)</label>
                                                        <input type="number" value={fnfProRata || ''} onChange={e => setFnfProRata(Number(e.target.value))} className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-black outline-none focus:border-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Leave Encashment (₹)</label>
                                                        <input type="number" value={fnfLeaveEncashment || ''} onChange={e => setFnfLeaveEncashment(Number(e.target.value))} className="w-full mt-1 p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-black outline-none focus:border-indigo-500" />
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Evidenced Deductions (-)</label>
                                                        <button onClick={() => setFnfDeductions([...fnfDeductions, { id: crypto.randomUUID(), amount: 0, reason: '', remarks: '' }])} className="text-[9px] text-indigo-400 font-bold hover:text-indigo-300 flex items-center gap-1"><Plus size={10} /> Add Deduction</button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {fnfDeductions.map((deduction, idx) => (
                                                            <div key={deduction.id} className="flex gap-2 items-start bg-slate-800 p-2 rounded-lg border border-slate-700">
                                                                <input type="number" placeholder="Amt" value={deduction.amount || ''} onChange={e => { const newD = [...fnfDeductions]; newD[idx].amount = Number(e.target.value); setFnfDeductions(newD); }} className="w-24 p-2 bg-slate-900 border border-slate-700 rounded text-xs font-bold outline-none" />
                                                                <input type="text" placeholder="Reason (e.g. Unserved Notice)" value={deduction.reason} onChange={e => { const newD = [...fnfDeductions]; newD[idx].reason = e.target.value; setFnfDeductions(newD); }} className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs font-bold outline-none" />
                                                                <input type="text" placeholder="Remarks/Evidence Link" value={deduction.remarks} onChange={e => { const newD = [...fnfDeductions]; newD[idx].remarks = e.target.value; setFnfDeductions(newD); }} className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded text-xs font-bold outline-none" />
                                                                <button onClick={() => setFnfDeductions(fnfDeductions.filter(d => d.id !== deduction.id))} className="p-2 text-rose-400 hover:bg-slate-700 rounded"><Trash2 size={14} /></button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-slate-700 flex justify-between items-center">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Net Payable Preview</p>
                                                        <h3 className="text-2xl font-black text-emerald-400">{formatCurrency((fnfProRata + fnfLeaveEncashment) - fnfDeductions.reduce((sum, d) => sum + d.amount, 0))}</h3>
                                                    </div>
                                                    <button onClick={handleGenerateFnF} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-md">
                                                        <FileText size={16} /> Lock & Generate FnF Draft
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* STATE: FNF REVIEW & APPROVAL */}
                                        {['FNF_PENDING_APPROVAL', 'FNF_APPROVED', 'SEPARATED'].includes(activeRecord.status) && activeRecord.fnfDetails && (
                                            <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl">
                                                <div className="flex justify-between items-center mb-4 border-b border-purple-200 pb-4">
                                                    <h3 className="text-sm font-black text-purple-900 uppercase tracking-widest">FnF Settlement Statement</h3>
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${activeRecord.status === 'FNF_PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                        {activeRecord.status === 'FNF_PENDING_APPROVAL' ? 'Pending Principal Sign-off' : 'Approved'}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-6 text-sm font-bold text-slate-700">
                                                    <p className="flex justify-between"><span>Pro-Rata Salary:</span> <span>{formatCurrency(activeRecord.fnfDetails.proRataSalary)}</span></p>
                                                    <p className="flex justify-between"><span>Leave Encashment:</span> <span>{formatCurrency(activeRecord.fnfDetails.leaveEncashment)}</span></p>
                                                    {activeRecord.fnfDetails.deductions.map(d => (
                                                        <div key={d.id} className="flex justify-between text-rose-600 pl-4 border-l-2 border-rose-200">
                                                            <div>
                                                                <span>- {d.reason}</span>
                                                                <p className="text-[9px] font-medium text-slate-500 italic">Evid: {d.remarks}</p>
                                                            </div>
                                                            <span>-{formatCurrency(d.amount)}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-purple-100 shadow-sm">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Final Net Payable</p>
                                                        <h3 className="text-3xl font-black text-purple-900">{formatCurrency(activeRecord.fnfDetails.netPayable)}</h3>
                                                    </div>

                                                    {activeRecord.status === 'FNF_PENDING_APPROVAL' && (
                                                        <button onClick={() => dispatch(approveFnF({ staffId: activeRecord.staffId, principalId: 'PRIN-001' }))} className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-md">
                                                            <CheckCircle2 size={16} /> Approve Settlement
                                                        </button>
                                                    )}
                                                    {activeRecord.status === 'FNF_APPROVED' && (
                                                        <button onClick={() => dispatch(completeSeparation(activeRecord.staffId))} className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 shadow-md">
                                                            <Banknote size={16} /> Disburse & Archive
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ========================================== */}
                                {/* TAB 2: THE EXECUTIVE DOSSIER (Principal View) */}
                                {/* ========================================== */}
                                {activeTab === 'DOSSIER' && (
                                    <div className="flex-1 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-2 text-indigo-600 mb-2"><CalendarIcon size={18} /></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Employment Tenure</p>
                                                <h4 className="text-lg font-black text-slate-900">{calculateTenure(activeStaff?.joinDate || '2023-01-01', activeRecord.lastWorkingDay)}</h4>
                                                <p className="text-xs font-bold text-slate-500 mt-1">Joined: {activeStaff?.joinDate || 'N/A'}</p>
                                            </div>

                                            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                                <div className="flex items-center gap-2 text-emerald-600 mb-2"><BookOpen size={18} /></div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic History</p>
                                                <div className="mt-2 space-y-1">
                                                    {activeStaff?.subjects?.map((sub, i) => (
                                                        <span key={i} className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-1 rounded mr-2 mb-2">{sub}</span>
                                                    )) || <span className="text-xs font-bold text-slate-500">No subjects assigned.</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-slate-200 rounded-2xl overflow-hidden">
                                            <div className="bg-slate-50 border-b border-slate-200 p-4">
                                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Document Vault</h3>
                                            </div>
                                            <div className="p-4 space-y-3 bg-white">
                                                {activeStaff?.documents?.map((doc, idx) => (
                                                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors cursor-pointer">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center"><FileText size={16} /></div>
                                                            <div>
                                                                <p className="text-xs font-black text-slate-900">{doc.name}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{doc.type}</p>
                                                            </div>
                                                        </div>
                                                        <LinkIcon size={16} className="text-slate-300" />
                                                    </div>
                                                )) || <p className="text-xs font-bold text-slate-500 p-2">No documents found.</p>}

                                                {/* Always show the Separation Record as a document */}
                                                <div className="flex justify-between items-center p-3 bg-rose-50 border border-rose-100 rounded-lg transition-colors cursor-pointer">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-rose-200 text-rose-700 rounded flex items-center justify-center"><AlertTriangle size={16} /></div>
                                                        <div>
                                                            <p className="text-xs font-black text-rose-900">Official Separation Initiation Log</p>
                                                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">SYSTEM GENERATED • {new Date(activeRecord.initiatedOn).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <LinkIcon size={16} className="text-rose-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL 1: INITIATE SEPARATION (WITH GUARDRAILS) */}
            {/* ========================================== */}
            {isInitiateOpen && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-rose-100 bg-rose-600 text-white flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <UserMinus size={16} /> Initiate Separation Pipeline
                            </h3>
                            <button onClick={() => setIsInitiateOpen(false)} className="text-rose-200 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Select Staff Member</label>
                                <select value={initStaffId} onChange={e => setInitStaffId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500">
                                    <option value="">-- Select Active Staff --</option>
                                    {MOCK_ACTIVE_STAFF.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Separation Reason</label>
                                <select value={initReason} onChange={e => setInitReason(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500">
                                    <option value="RESIGNATION">Resignation (Standard Notice)</option>
                                    <option value="TERMINATION">Termination (Instant Lockout)</option>
                                    <option value="ABSCONDED">Absconded (Emergency Lockout)</option>
                                    <option value="CONTRACT_END">Contract End</option>
                                </select>
                                {(initReason === 'TERMINATION' || initReason === 'ABSCONDED') && (
                                    <p className="text-[10px] font-bold text-rose-600 uppercase mt-2 flex items-center gap-1"><ShieldAlert size={12} /> Warning: This will instantly revoke system access.</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Last Working Day (LWD)</label>
                                <input type="date" value={initLWD} onChange={e => setInitLWD(e.target.value)} style={{ colorScheme: 'light' }} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500" />
                            </div>

                            {/* 🔴 THE DEPENDENCY BLOCKER TEST */}
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mt-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" checked={initHasDependencies} onChange={e => setInitHasDependencies(e.target.checked)} className="w-4 h-4 text-amber-600 focus:ring-amber-600 border-amber-300 rounded" />
                                    <div className="text-xs font-bold text-amber-900">
                                        [TEST] Simulate Active Timetable Dependencies?
                                        <p className="text-[9px] text-amber-700 font-medium mt-0.5">Check this to see the system block the separation.</p>
                                    </div>
                                </label>
                            </div>

                            <button onClick={handleInitiate} disabled={!initStaffId || !initLWD} className="w-full bg-rose-600 text-white p-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-4 shadow-md">
                                Trigger Offboarding Pipeline
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* ========================================== */}
            {/* MODAL 2: CLEARANCE UPDATER (REVERSIBLE) */}
            {/* ========================================== */}
            {clearanceTarget && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{clearanceTarget.department} Clearance</h3>
                            <button onClick={() => setClearanceTarget(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Update Status</label>
                                <select value={clearanceAction} onChange={e => setClearanceAction(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                                    <option value="CLEARED">✅ Cleared (No Dues)</option>
                                    <option value="PENDING">⏳ Pending Review (Revert)</option>
                                    <option value="REJECTED">❌ Rejected (Outstanding Dues)</option>
                                    <option value="ESCALATED">⚠️ Escalated to Management</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Audit Remarks (Mandatory for Reject/Escalate)</label>
                                <textarea value={clearanceRemarks} onChange={e => setClearanceRemarks(e.target.value)} rows={3} placeholder="e.g. Missing 2 library books." className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-indigo-500"></textarea>
                            </div>

                            <button onClick={handleUpdateClearance} disabled={['REJECTED', 'ESCALATED'].includes(clearanceAction) && !clearanceRemarks} className="w-full bg-slate-900 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all shadow-md">
                                Update Clearance Record
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

        </AdminLayout>
    );
};

export default SeparationHub;