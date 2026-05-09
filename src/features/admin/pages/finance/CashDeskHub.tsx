import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Wallet, Search, CreditCard, Banknote, ShieldAlert, 
  LockKeyhole, Unlock, CheckCircle2, History, AlertCircle, X,
  Plus
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import { openCashSession, closeCashSession, recordPayment } from '../../../../store/slices/financeSlice';
import { PaymentTransaction } from '../../../../types/finance/finance.schema';
import AdminLayout from '../../components/layout/AdminLayout';

// Mock Data 
const MOCK_CLASSES = ['Class 9', 'Class 10', 'Class 11'];
const MOCK_SECTIONS = ['A', 'B', 'C'];
const MOCK_STUDENTS = [
  { id: 'STU-001', name: 'Rahul Sharma', parentName: 'Rajesh Sharma', classId: 'Class 10', sectionId: 'A', rollNo: 12 },
  { id: 'STU-002', name: 'Rahul Sharma', parentName: 'Vikram Sharma', classId: 'Class 10', sectionId: 'B', rollNo: 45 },
  { id: 'STU-003', name: 'Aarti Singh', parentName: 'Amit Singh', classId: 'Class 10', sectionId: 'A', rollNo: 3 },
  { id: 'STU-004', name: 'Karan Patel', parentName: 'Suresh Patel', classId: 'Class 9', sectionId: 'B', rollNo: 21 },
];

const CashDeskHub: React.FC = () => {
  const dispatch = useDispatch();
  const { activeSessionId, sessions, invoices, transactions } = useSelector((state: RootState) => state.finance);
  const activeSession = activeSessionId ? sessions[activeSessionId] : null;

  // Session Management State
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [isClosingDrawerOpen, setIsClosingDrawerOpen] = useState(false);
  const [declaredCash, setDeclaredCash] = useState<number>(0);

  // Advanced POS Search State
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  // Payment Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER'>('CASH');
  const [bankRef, setBankRef] = useState('');

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // Advanced Filtering Logic
  const searchedStudents = useMemo(() => {
    // Only show dropdown if at least one filter is active
    if (!searchQuery && !selectedClass && !selectedSection) return [];
    
    return MOCK_STUDENTS.filter(s => {
      const matchClass = !selectedClass || s.classId === selectedClass;
      const matchSection = !selectedSection || s.sectionId === selectedSection;
      const matchSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSection && matchSearch;
    });
  }, [searchQuery, selectedClass, selectedSection]);

  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
  const pendingInvoices = Object.values(invoices).filter(inv => inv.studentId === selectedStudentId && (inv.status === 'UNPAID' || inv.status === 'PARTIAL'));
  const selectedInvoice = pendingInvoices.find(inv => inv.id === selectedInvoiceId);
  const sessionTransactions = Object.values(transactions).filter(t => t.sessionId === activeSessionId).reverse();

  const handleOpenSession = () => dispatch(openCashSession({ adminId: 'ADMIN-XYZ', openingBalance }));
  
  const handleCloseSession = () => {
    dispatch(closeCashSession({ declaredCash }));
    setIsClosingDrawerOpen(false); setDeclaredCash(0); setSelectedStudentId(''); setSelectedInvoiceId('');
  };

  const handleProcessPayment = () => {
    if (!selectedStudent || !selectedInvoiceId || paymentAmount <= 0) return;
    if (paymentAmount > (selectedInvoice!.totalAmount - selectedInvoice!.amountPaid)) {
      alert("Payment amount cannot exceed pending dues."); return;
    }

    const newPayment: PaymentTransaction = {
      id: `TXN-${Date.now()}`, invoiceId: selectedInvoiceId, studentId: selectedStudentId,
      sessionId: activeSessionId, amount: paymentAmount, method: paymentMethod,
      paidBy: selectedStudent.parentName, bankReference: paymentMethod !== 'CASH' ? bankRef : undefined,
      paymentDate: new Date().toISOString(), status: 'SUCCESS'
    };

    dispatch(recordPayment(newPayment));
    setSelectedInvoiceId(''); setPaymentAmount(0); setBankRef('');
    alert("Payment Successful! Receipt generated in Ledger.");
  };

  // LOCKED STATE VIEW
  if (!activeSessionId) {
    return (
      <AdminLayout pageTitle="Cash Desk (POS)" pageDescription="Secure front-office payment collection portal." breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Cash Desk' }]}>
        <div className="flex flex-col items-center justify-center h-[60vh] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
              <LockKeyhole size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Register is Locked</h2>
            <p className="text-sm font-bold text-slate-500 mb-8">You must open a cash session to process payments and issue receipts.</p>
            <div className="text-left space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Starting Cash Drawer Balance (₹)</label>
                <input type="number" value={openingBalance} onChange={e => setOpeningBalance(Number(e.target.value))} className="w-full p-4 bg-white border-2 border-slate-200 rounded-xl text-lg font-black outline-none focus:border-indigo-500 text-slate-900"/>
              </div>
              <button onClick={handleOpenSession} className="w-full bg-indigo-600 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 shadow-md">
                <Unlock size={18}/> Open Register
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // ACTIVE POS VIEW
  return (
    <AdminLayout pageTitle="Cash Desk (POS)" pageDescription="Secure front-office payment collection portal." breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Cash Desk' }]}>
      
      {/* TOP STATUS BAR */}
      <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl mb-6 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Unlock size={18}/>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Session</p>
            <p className="text-sm font-bold">ID: {activeSessionId.split('-')[0]}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expected Cash In Drawer</p>
            <p className="text-xl font-black text-emerald-400">{formatCurrency(activeSession!.expectedCash)}</p>
          </div>
          <div className="w-px h-8 bg-slate-700 hidden md:block"></div>
          <button onClick={() => setIsClosingDrawerOpen(true)} className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-sm flex items-center gap-2">
            <LockKeyhole size={14}/> Close Register
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
        
        {/* LEFT: POINT OF SALE (POS) FORM */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-6 shrink-0">
              <CreditCard size={20} className="text-blue-600"/> Payment Terminal
            </h3>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
              
              {/* 1. ADVANCED LOCATOR */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">1. Locate Account</label>
                
                <div className="flex gap-2 mb-3">
                  <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-1/2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500">
                    <option value="">All Classes</option>
                    {MOCK_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-1/2 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500">
                    <option value="">All Sections</option>
                    {MOCK_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
                  </select>
                </div>

                <div className="relative">
                  <input type="text" placeholder="Search student name or parent..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                </div>
                
                {/* Search Results Dropdown */}
                {searchedStudents.length > 0 && !selectedStudentId && (
                  <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white relative z-10 w-full max-h-48 overflow-y-auto custom-scrollbar">
                    {searchedStudents.map(s => (
                      <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setSearchQuery(''); }} className="p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-black text-slate-900">{s.name} <span className="text-slate-400 font-bold text-[10px]">(Roll: {s.rollNo})</span></p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.classId}-{s.sectionId} | Parent: {s.parentName}</p>
                        </div>
                        <Plus size={16} className="text-indigo-600"/>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. INVOICE SELECTION & PAYMENT (Only shows when student is selected) */}
              {selectedStudent && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-xl border border-indigo-100 mb-6">
                    <div>
                      <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active Account</p>
                      <p className="text-sm font-black text-indigo-900">{selectedStudent.name} <span className="text-xs font-bold text-indigo-600">({selectedStudent.classId}-{selectedStudent.sectionId})</span></p>
                    </div>
                    <button onClick={() => { setSelectedStudentId(''); setSelectedInvoiceId(''); }} className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Change Account</button>
                  </div>

                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">2. Select Pending Dues</label>
                  {pendingInvoices.length === 0 ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800">
                      <CheckCircle2 size={18}/> <p className="text-xs font-bold">This account has no pending dues.</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {pendingInvoices.map(inv => {
                        const pendingAmount = inv.totalAmount - inv.amountPaid;
                        return (
                          <div key={inv.id} onClick={() => { setSelectedInvoiceId(inv.id); setPaymentAmount(pendingAmount); }} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedInvoiceId === inv.id ? 'border-indigo-600 bg-white shadow-md' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-black text-slate-900">{inv.invoiceNumber}</p>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${inv.status === 'UNPAID' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{inv.status}</span>
                              </div>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Due: {inv.dueDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-black text-rose-600">{formatCurrency(pendingAmount)}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Amount</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedInvoiceId && (
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Tendered Amount (₹)</label>
                        <input type="number" value={paymentAmount || ''} onChange={e => setPaymentAmount(Number(e.target.value))} className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-lg font-black outline-none focus:border-indigo-500 text-indigo-700"/>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Payment Method</label>
                          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                            <option value="CASH">Cash (Physical Drawer)</option>
                            <option value="UPI">UPI / QR Code (Bank)</option>
                            <option value="CARD">Credit/Debit Card (Bank)</option>
                            <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                          </select>
                        </div>
                        {paymentMethod !== 'CASH' && (
                          <div className="animate-in fade-in">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Bank / Txn Reference</label>
                            <input type="text" value={bankRef} onChange={e => setBankRef(e.target.value)} placeholder="e.g. UPI/1234..." className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
                          </div>
                        )}
                      </div>

                      <button onClick={handleProcessPayment} disabled={paymentAmount <= 0} className="w-full bg-emerald-600 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-md mt-4">
                        <CheckCircle2 size={18}/> Process Payment & Print
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: SESSION HISTORY */}
        <div className="lg:col-span-4 h-full flex flex-col">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4 shrink-0">
              <History size={18} className="text-slate-600"/> Session Transactions
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {sessionTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Banknote size={32} className="text-slate-200 mb-2"/>
                  <p className="text-xs font-bold text-slate-400">No transactions in this session yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionTransactions.map(txn => (
                    <div key={txn.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex justify-between items-center hover:border-slate-300 transition-colors">
                      <div>
                        <p className="text-xs font-black text-slate-900">{txn.id}</p>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{txn.method} | {txn.paidBy.split(' ')[0]}</p>
                      </div>
                      <span className="text-sm font-black text-emerald-600">+{formatCurrency(txn.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CLOSING DRAWER MODAL */}
      {isClosingDrawerOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-400"/> End of Shift Reconciliation
              </h3>
              <button onClick={() => setIsClosingDrawerOpen(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">System Expected Cash</span>
                <span className="text-2xl font-black text-slate-900">{formatCurrency(activeSession!.expectedCash)}</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <AlertCircle size={12}/> Physically Counted Cash (Declared) *
                </label>
                <input 
                  type="number" value={declaredCash || ''} onChange={e => setDeclaredCash(Number(e.target.value))}
                  className="w-full p-4 bg-white border-2 border-rose-200 rounded-xl text-xl font-black outline-none focus:border-rose-500 text-rose-700"
                  placeholder="Count notes in drawer..."
                />
              </div>

              {declaredCash > 0 && (
                <div className={`p-4 rounded-xl border flex justify-between items-center ${declaredCash === activeSession!.expectedCash ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                   <span className="text-xs font-black uppercase tracking-widest">Variance</span>
                   <span className="text-lg font-black">{formatCurrency(declaredCash - activeSession!.expectedCash)}</span>
                </div>
              )}

              <button 
                onClick={handleCloseSession} disabled={declaredCash <= 0}
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex justify-center items-center gap-2 shadow-md"
              >
                <LockKeyhole size={18}/> Finalize & Lock Register
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
};

export default CashDeskHub;