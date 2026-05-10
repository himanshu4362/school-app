import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, X, ShieldCheck, UserCheck, AlertTriangle, CheckCircle2, FileText, Download, Banknote, UploadCloud } from 'lucide-react';

import { RootState } from '../../../../store/store';
import { beginClearance, updateClearance, completeFinanceSettlement, issueDocument, finalizeExit, clearExitErrors } from '../../../../store/slices/studentExitSlice';
import AdminLayout from '../../components/layout/AdminLayout';

import { ExitPipelineSidebar } from './components/exit/ExitPipelineSidebar';
import { ExitInitiationWizard } from './components/exit/ExitInitiationWizard';
import { ExitDossierView } from './components/exit/ExitDossierView';

// 🔴 UPGRADED MOCK DATA (Roll Numbers and Parent Names)
const MOCK_ACTIVE_STUDENTS = [
  { id: 'STU-001', rollNumber: '101', name: 'Rahul Sharma', classId: 'Class 10', sectionId: 'A', parentName: 'Rajesh Sharma', joinDate: '2016-04-01', totalFeesPaid: 450000 },
  { id: 'STU-002', rollNumber: '205', name: 'Aarti Singh', classId: 'Class 12', sectionId: 'Science', parentName: 'Vikram Singh', joinDate: '2022-06-15', totalFeesPaid: 120000 },
  { id: 'STU-003', rollNumber: '042', name: 'Karan Patel', classId: 'Class 8', sectionId: 'B', parentName: 'Amit Patel', joinDate: '2020-04-01', totalFeesPaid: 280000 },
  { id: 'STU-004', rollNumber: '102', name: 'Priya Verma', classId: 'Class 10', sectionId: 'A', parentName: 'Sanjay Verma', joinDate: '2016-04-01', totalFeesPaid: 450000 },
];

const StudentExitHub: React.FC = () => {
  const dispatch = useDispatch();
  const { exitRecords, validationErrors } = useSelector((state: RootState) => state.studentExit);

  // Layout State
  const [selectedExitId, setSelectedExitId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'PIPELINE' | 'DOSSIER'>('PIPELINE');
  const [isInitiating, setIsInitiating] = useState(false);

  // Modals State
  const [clearanceTarget, setClearanceTarget] = useState<any>(null);
  const [clearanceAction, setClearanceAction] = useState<'CLEARED' | 'REJECTED' | 'WAIVED' | 'PENDING'>('CLEARED');
  const [clearanceRemarks, setClearanceRemarks] = useState('');

  const [isFinanceOpen, setIsFinanceOpen] = useState(false);
  const [financeAction, setFinanceAction] = useState<'CLEARED' | 'WAIVED'>('CLEARED');
  const [financeRemarks, setFinanceRemarks] = useState('');

  const [isDocOpen, setIsDocOpen] = useState(false);
  const [docUploadMode, setDocUploadMode] = useState<'SYSTEM' | 'UPLOAD'>('SYSTEM');
  const [docType, setDocType] = useState<any>('TRANSFER_CERTIFICATE');
  const [docIsDuplicate, setDocIsDuplicate] = useState(false);
  const [customDocName, setCustomDocName] = useState('');
  const [customFile, setCustomFile] = useState<File | null>(null);

  const activeExits = Object.values(exitRecords).filter(r => !['ALUMNI', 'ARCHIVED'].includes(r.status));
  const activeRecord = exitRecords[selectedExitId];
  const activeStudent = MOCK_ACTIVE_STUDENTS.find(s => s.id === activeRecord?.studentId);

  // Handlers
  const handleUpdateClearance = () => {
    dispatch(updateClearance({ studentId: activeRecord.studentId, department: clearanceTarget.department, status: clearanceAction, remarks: clearanceRemarks, adminId: 'ADMIN-SUPER' }));
    setClearanceTarget(null); setClearanceRemarks('');
  };

  const handleFinanceSettlement = () => {
    dispatch(completeFinanceSettlement({ studentId: activeRecord.studentId, isWaived: financeAction === 'WAIVED', remarks: financeRemarks, adminId: 'ADMIN-SUPER' }));
    setIsFinanceOpen(false); setFinanceRemarks('');
  };

  const handleIssueDocument = () => {
    let finalDocName = docType.replace('_', ' ');
    let finalDocType = docType;

    if (docUploadMode === 'UPLOAD') {
       if (!customDocName || !customFile) { alert("Provide a name and file."); return; }
       finalDocName = customDocName;
       finalDocType = 'UPLOADED_PHYSICAL';
    }

    dispatch(issueDocument({
      studentId: activeRecord.studentId, documentType: finalDocType, documentName: finalDocName,
      fileUrl: docUploadMode === 'UPLOAD' ? URL.createObjectURL(customFile!) : 'https://vault.school.edu/sys-gen.pdf', 
      adminId: 'ADMIN-SUPER', isDuplicate: docIsDuplicate
    }));
    setIsDocOpen(false); setDocIsDuplicate(false); setCustomDocName(''); setCustomFile(null);
  };

  return (
    <AdminLayout pageTitle="Exit & Alumni Hub" pageDescription="Manage the exit pipeline and issue final documents." breadcrumbs={[{ label: 'Student Hub' }, { label: 'Exit Pipeline' }]}>
      
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl flex items-start justify-between shadow-sm">
          <div className="flex gap-3">
            <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20}/>
            <div>
              <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Policy Violation</h4>
              <ul className="mt-1 space-y-1">{validationErrors.map((err, idx) => <li key={idx} className="text-xs font-bold text-rose-700">{err.message}</li>)}</ul>
            </div>
          </div>
          <button onClick={() => dispatch(clearExitErrors())} className="text-rose-400 hover:text-rose-700"><X size={20}/></button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-auto lg:h-[calc(100vh-160px)]">
        
        <div className="lg:col-span-4">
          <ExitPipelineSidebar 
            activeExits={activeExits} selectedExitId={selectedExitId} isInitiating={isInitiating}
            mockStudents={MOCK_ACTIVE_STUDENTS}
            onSelectExit={(id) => { setSelectedExitId(id); setIsInitiating(false); }}
            onNewExit={() => { setIsInitiating(true); setSelectedExitId(''); }}
          />
        </div>

        <div className="lg:col-span-8 h-full flex flex-col">
          <div className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            
            {isInitiating ? (
               <ExitInitiationWizard mockStudents={MOCK_ACTIVE_STUDENTS} exitRecords={exitRecords} onComplete={(id) => { setIsInitiating(false); setSelectedExitId(id); }} />
            ) : !activeRecord ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <ShieldCheck size={48} className="text-slate-200 mb-4"/>
                <h2 className="text-xl font-black text-slate-900">Pipeline Tracker</h2>
                <p className="text-sm font-bold text-slate-500 mt-2">Select a student from the pipeline on the left, or initiate a new exit.</p>
              </div>
            ) : (
              <div className="animate-in fade-in flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">{activeStudent?.name}</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase mt-1">ID: {activeRecord.studentId} | {activeStudent?.classId}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-3 py-1.5 rounded-lg text-xs font-black uppercase border bg-slate-100">{activeRecord.status.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div className="flex gap-4 mb-6 border-b border-slate-200">
                  <button onClick={() => setActiveTab('PIPELINE')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 flex items-center gap-2 ${activeTab === 'PIPELINE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}><ShieldCheck size={16}/> Pipeline</button>
                  <button onClick={() => setActiveTab('DOSSIER')} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 flex items-center gap-2 ${activeTab === 'DOSSIER' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}><UserCheck size={16}/> Dossier</button>
                </div>

                {activeTab === 'DOSSIER' ? (
                  <ExitDossierView activeRecord={activeRecord} activeStudent={activeStudent} />
                ) : (
                  <div className="flex-1 space-y-8 pb-8">
                    
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className={`w-3 h-3 rounded-full ${['EXIT_INITIATED', 'EXIT_PENDING', 'CLEARANCE_PENDING', 'FINANCE_SETTLEMENT_PENDING', 'DOCUMENT_ISSUANCE_PENDING'].includes(activeRecord.status) ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                      <div className="flex-1 h-1 bg-slate-200 mx-1"></div>
                      <div className={`w-3 h-3 rounded-full ${['CLEARANCE_PENDING', 'FINANCE_SETTLEMENT_PENDING', 'DOCUMENT_ISSUANCE_PENDING'].includes(activeRecord.status) ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                      <div className="flex-1 h-1 bg-slate-200 mx-1"></div>
                      <div className={`w-3 h-3 rounded-full ${['FINANCE_SETTLEMENT_PENDING', 'DOCUMENT_ISSUANCE_PENDING'].includes(activeRecord.status) ? 'bg-rose-500' : 'bg-slate-300'}`}></div>
                      <div className="flex-1 h-1 bg-slate-200 mx-1"></div>
                      <div className={`w-3 h-3 rounded-full ${['DOCUMENT_ISSUANCE_PENDING'].includes(activeRecord.status) ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                    </div>

                    {['EXIT_INITIATED', 'EXIT_PENDING'].includes(activeRecord.status) && (
                      <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center">
                        <AlertTriangle className="mx-auto text-blue-500 mb-3" size={32}/>
                        <h3 className="text-base font-black text-blue-900 mb-2">Student Exit Initiated</h3>
                        <button onClick={() => dispatch(beginClearance(activeRecord.studentId))} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase">Begin Clearances</button>
                      </div>
                    )}

                    {['CLEARANCE_PENDING', 'FINANCE_SETTLEMENT_PENDING', 'DOCUMENT_ISSUANCE_PENDING'].includes(activeRecord.status) && (
                      <div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 border-b border-slate-200 pb-2">Operational Clearance</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {activeRecord.clearanceMatrix.filter(c => c.department !== 'FINANCE').map((item, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border-2 flex justify-between items-start ${item.status === 'CLEARED' ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200'}`}>
                              <div>
                                <p className="text-xs font-black text-slate-900 uppercase">{item.department}</p>
                                <p className="text-[10px] font-bold uppercase mt-0.5">{item.status}</p>
                              </div>
                              {/* 🔴 THIS BUTTON TRIGGERS THE MODAL */}
                              {activeRecord.status === 'CLEARANCE_PENDING' && (
                                <button onClick={() => setClearanceTarget(item)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-[9px] font-black transition-colors">Edit</button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {['FINANCE_SETTLEMENT_PENDING', 'DOCUMENT_ISSUANCE_PENDING'].includes(activeRecord.status) && (
                      <div className={`p-6 rounded-2xl border-2 ${activeRecord.clearanceMatrix.find(c => c.department === 'FINANCE')?.status === 'PENDING' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-sm font-black text-rose-900 uppercase flex items-center gap-2"><Banknote size={16}/> Finance Lock</h3>
                           <span className="px-2 py-1 rounded text-[10px] font-black uppercase bg-slate-100">{activeRecord.clearanceMatrix.find(c => c.department === 'FINANCE')?.status}</span>
                        </div>
                        {activeRecord.status === 'FINANCE_SETTLEMENT_PENDING' && <button onClick={() => setIsFinanceOpen(true)} className="px-6 py-2 bg-rose-600 text-white rounded-lg text-xs font-black uppercase">Review Settlement</button>}
                      </div>
                    )}

                    {activeRecord.status === 'DOCUMENT_ISSUANCE_PENDING' && (
                      <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-purple-200 pb-4">
                          <h3 className="text-sm font-black text-purple-900 uppercase flex items-center gap-2"><FileText size={16}/> Outbound Vault</h3>
                          <button onClick={() => setIsDocOpen(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-purple-700">Generate / Upload Doc</button>
                        </div>
                        <div className="space-y-3 mb-6">
                          {activeRecord.issuedDocuments.map(doc => (
                            <div key={doc.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-purple-100 shadow-sm">
                              <div>
                                <p className="text-xs font-black text-slate-900">{doc.documentName}</p>
                                <p className="text-[10px] font-bold text-slate-400 mt-0.5 font-mono">{doc.serialNumber} • v{doc.version}</p>
                              </div>
                              <button className="p-2 text-purple-600 rounded"><Download size={16}/></button>
                            </div>
                          ))}
                        </div>
                        <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center">
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Finalize</p><h3 className="text-sm font-black">Release Seat</h3></div>
                          <button onClick={() => dispatch(finalizeExit({ studentId: activeRecord.studentId }))} className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase flex items-center gap-2 transition-colors"><CheckCircle2 size={16}/> Complete</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 🔴 FULLY RESTORED MODALS SECTION */}
      {/* ========================================== */}

      {/* MODAL 1: CLEARANCE UPDATER */}
      {clearanceTarget && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{clearanceTarget.department} Clearance</h3>
              <button onClick={() => setClearanceTarget(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Update Status</label>
                <select value={clearanceAction} onChange={e => setClearanceAction(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                  <option value="CLEARED">✅ Cleared (No Dues)</option>
                  <option value="PENDING">⏳ Pending Review (Revert)</option>
                  <option value="REJECTED">❌ Rejected (Outstanding Dues)</option>
                  <option value="WAIVED">⚠️ Waived by Authority</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Audit Remarks</label>
                <textarea value={clearanceRemarks} onChange={e => setClearanceRemarks(e.target.value)} rows={3} placeholder="e.g. Missing library book, parent agreed to pay." className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none"></textarea>
              </div>
              <button onClick={handleUpdateClearance} disabled={['REJECTED', 'WAIVED'].includes(clearanceAction) && !clearanceRemarks} className="w-full bg-slate-900 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all">
                Update Clearance Record
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 2: FINANCE OVERRIDE */}
      {isFinanceOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-rose-800">Finance Ledger Clearance</h3>
              <button onClick={() => setIsFinanceOpen(false)} className="text-rose-400 hover:text-rose-600"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Finance Action</label>
                <select value={financeAction} onChange={e => setFinanceAction(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                  <option value="CLEARED">✅ Ledger Clear (Zero Dues)</option>
                  <option value="WAIVED">⚠️ Waive Remaining Dues</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Audit Remarks</label>
                <textarea value={financeRemarks} onChange={e => setFinanceRemarks(e.target.value)} rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none"></textarea>
              </div>
              <button onClick={handleFinanceSettlement} disabled={financeAction === 'WAIVED' && !financeRemarks} className="w-full bg-rose-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50">
                Unlock Final Documents
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL 3: DOCUMENT UPLOAD / GENERATION */}
      {isDocOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-purple-100 bg-purple-50 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-purple-800">Add to Document Vault</h3>
              <button onClick={() => setIsDocOpen(false)} className="text-purple-400 hover:text-purple-600"><X size={20}/></button>
            </div>
            
            <div className="flex border-b border-slate-200">
              <button onClick={() => setDocUploadMode('SYSTEM')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${docUploadMode === 'SYSTEM' ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50/50' : 'text-slate-400'}`}>System Generated</button>
              <button onClick={() => setDocUploadMode('UPLOAD')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest ${docUploadMode === 'UPLOAD' ? 'border-b-2 border-purple-600 text-purple-700 bg-purple-50/50' : 'text-slate-400'}`}>Physical Scan</button>
            </div>

            <div className="p-6 space-y-4">
              {docUploadMode === 'SYSTEM' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Document Type</label>
                    <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                      <option value="TRANSFER_CERTIFICATE">Transfer Certificate (TC / SLC)</option>
                      <option value="MIGRATION">Migration Certificate</option>
                      <option value="CHARACTER_CERT">Character / Conduct Certificate</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <input type="checkbox" checked={docIsDuplicate} onChange={e => setDocIsDuplicate(e.target.checked)} className="w-4 h-4 text-purple-600 rounded"/>
                    <span className="text-xs font-bold">Issue as Duplicate</span>
                  </label>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Document Name</label>
                    <input type="text" value={customDocName} onChange={e => setCustomDocName(e.target.value)} placeholder="e.g. Signed TC Scan" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none"/>
                  </div>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50">
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-500">{customFile ? customFile.name : "Click to upload file"}</p>
                    <input type="file" className="hidden" accept="image/*,.pdf" onChange={e => setCustomFile(e.target.files?.[0] || null)} />
                  </label>
                </>
              )}
              <button onClick={handleIssueDocument} className="w-full bg-purple-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700">
                {docUploadMode === 'SYSTEM' ? 'Generate Document' : 'Upload to Vault'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </AdminLayout>
  );
};

export default StudentExitHub;