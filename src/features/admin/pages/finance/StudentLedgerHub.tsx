import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  User, Receipt, FileText, CheckCircle2, AlertCircle, 
  Plus, Calendar, CreditCard, Search, Filter, History, 
  ArrowRightLeft, Eye, X, Building2, UserCircle, BadgePercent
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import { generateStudentInvoice, applyInvoiceConcession } from '../../../../store/slices/financeSlice';
import { FeeInvoice, InvoiceItem } from '../../../../types/finance/finance.schema';
import AdminLayout from '../../components/layout/AdminLayout';

const MOCK_CLASSES = ['Class 9', 'Class 10', 'Class 11'];
const MOCK_SECTIONS = ['A', 'B', 'C'];

const MOCK_STUDENTS = [
  { id: 'STU-001', name: 'Rahul Sharma', parentName: 'Rajesh Sharma', classId: 'Class 10', sectionId: 'A', rollNo: 12 },
  { id: 'STU-002', name: 'Rahul Sharma', parentName: 'Vikram Sharma', classId: 'Class 10', sectionId: 'B', rollNo: 45 },
  { id: 'STU-003', name: 'Aarti Singh', parentName: 'Amit Singh', classId: 'Class 10', sectionId: 'A', rollNo: 3 },
  { id: 'STU-004', name: 'Karan Patel', parentName: 'Suresh Patel', classId: 'Class 9', sectionId: 'B', rollNo: 21 },
];

const StudentLedgerHub: React.FC = () => {
  const dispatch = useDispatch();
  const { feeComponents, invoices, transactions } = useSelector((state: RootState) => state.finance);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<string>('');

  const [dateFilter, setDateFilter] = useState<'all' | '3m' | '6m' | '1y' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [inspectingEntry, setInspectingEntry] = useState<any | null>(null);
  
  const [isConcessionModalOpen, setIsConcessionModalOpen] = useState(false);
  const [concessionTarget, setConcessionTarget] = useState<any>(null);
  const [concessionAmount, setConcessionAmount] = useState<number>(0);
  const [concessionReason, setConcessionReason] = useState('');

  const activeComponents = Object.values(feeComponents).filter(c => c.status === 'active');
  const selectedStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentId);
  const liveTotal = selectedComponentIds.reduce((sum, id) => sum + (feeComponents[id]?.defaultAmount || 0), 0);

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
      const matchClass = !selectedClass || s.classId === selectedClass;
      const matchSection = !selectedSection || s.sectionId === selectedSection;
      const matchSearch = !searchQuery || 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchClass && matchSection && matchSearch;
    });
  }, [selectedClass, selectedSection, searchQuery]);

  const studentLedgerTimeline = useMemo(() => {
    if (!selectedStudentId) return [];
    
    const liveInvoices = Object.values(invoices)
      .filter(inv => inv.studentId === selectedStudentId)
      .map(inv => ({
        id: inv.invoiceNumber,
        originalId: inv.id, 
        type: 'INVOICE' as const, // TS Fix
        date: inv.issueDate,
        amount: inv.totalAmount, 
        description: 'Generated Invoice',
        status: inv.status,
        details: { items: inv.items, subTotal: inv.subTotal, concession: inv.concession }
      }));

    const livePayments = Object.values(transactions)
      .filter(txn => txn.studentId === selectedStudentId)
      .map(txn => ({
        id: txn.id,
        type: 'PAYMENT' as const, // TS Fix
        date: new Date(txn.paymentDate).toISOString().split('T')[0],
        amount: txn.amount,
        description: 'Payment Received',
        status: txn.status,
        details: { method: txn.method, paidBy: txn.paidBy, bankRef: txn.bankReference }
      }));

    const combined = [...liveInvoices, ...livePayments];
    
    const now = new Date();
    return combined.filter(entry => {
      const entryDate = new Date(entry.date);
      if (dateFilter === '3m') return (now.getTime() - entryDate.getTime()) <= 90 * 24 * 60 * 60 * 1000;
      if (dateFilter === '6m') return (now.getTime() - entryDate.getTime()) <= 180 * 24 * 60 * 60 * 1000;
      if (dateFilter === '1y') return (now.getTime() - entryDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
      if (dateFilter === 'custom' && customStartDate && customEndDate) {
        return entryDate >= new Date(customStartDate) && entryDate <= new Date(customEndDate);
      }
      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  }, [invoices, transactions, selectedStudentId, dateFilter, customStartDate, customEndDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleToggleComponent = (id: string) => {
    setSelectedComponentIds(prev => prev.includes(id) ? prev.filter(cId => cId !== id) : [...prev, id]);
  };

  const handleGenerateInvoice = () => {
    if (!selectedStudentId || selectedComponentIds.length === 0 || !dueDate) return;

    const items: InvoiceItem[] = selectedComponentIds.map(id => {
      const comp = feeComponents[id];
      return { id: crypto.randomUUID(), componentId: comp.id, name: comp.name, amount: comp.defaultAmount, isTaxable: comp.isTaxable };
    });

    const newInvoice: FeeInvoice = {
      id: crypto.randomUUID(),
      studentId: selectedStudentId,
      academicYearId: 'AY-2026-27',
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      status: 'UNPAID',
      items: items,
      subTotal: 0, 
      totalAmount: 0, 
      amountPaid: 0, 
      concession: null 
    };

    dispatch(generateStudentInvoice(newInvoice));
    setSelectedComponentIds([]); setDueDate('');
  };

  const handleApplyConcession = () => {
    if (!concessionTarget || concessionAmount <= 0 || !concessionReason) return;
    
    dispatch(applyInvoiceConcession({
      invoiceId: concessionTarget.originalId,
      amount: concessionAmount,
      reason: concessionReason,
      adminId: 'ADMIN-XYZ'
    }));

    setIsConcessionModalOpen(false);
    setConcessionAmount(0);
    setConcessionReason('');
    setConcessionTarget(null);
  };

  return (
    <AdminLayout 
      pageTitle="Student Financial Ledger" 
      pageDescription="Manage individual student accounts, view transaction history, and issue invoices."
      breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Student Ledger' }]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)]">
        
        {/* LEFT COLUMN: Student Selection & Invoicing */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col max-h-[50%]">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 shrink-0">
              <Search size={16} className="text-indigo-600"/> 1. Locate Account
            </h3>
            
            <div className="flex gap-2 mb-3 shrink-0">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500">
                <option value="">All Classes</option>
                {MOCK_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500">
                <option value="">All Sections</option>
                {MOCK_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
              </select>
            </div>
            
            <div className="relative mb-3 shrink-0">
              <input 
                type="text" placeholder="Search by name or parent..." 
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl">
              {filteredStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs font-bold">No students match.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredStudents.map(student => (
                    <div 
                      key={student.id} onClick={() => setSelectedStudentId(student.id)}
                      className={`p-3 cursor-pointer transition-colors ${selectedStudentId === student.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                    >
                      <p className={`text-sm font-black ${selectedStudentId === student.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {student.name} <span className="text-slate-400 font-bold text-[10px]">(Roll: {student.rollNo})</span>
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        P: <span className="text-slate-700">{student.parentName}</span> | {student.classId}-{student.sectionId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-4 shrink-0">
              <FileText size={16} className="text-emerald-600"/> 2. Issue Invoice
            </h3>
            
            {!selectedStudentId ? (
              <div className="flex-1 flex items-center justify-center text-center p-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs font-bold text-slate-400">Select an account above.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2 mb-4">
                  {activeComponents.map(comp => (
                    <label key={comp.id} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedComponentIds.includes(comp.id) ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedComponentIds.includes(comp.id)} onChange={() => handleToggleComponent(comp.id)} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-600 border-slate-300"/>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{comp.name}</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{comp.billingCycle}</p>
                        </div>
                      </div>
                      <p className="text-xs font-black text-slate-900">{formatCurrency(comp.defaultAmount)}</p>
                    </label>
                  ))}
                </div>

                <div className="shrink-0 space-y-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date</label>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={{ colorScheme: 'light' }} className="w-full p-2 bg-white text-slate-900 border-2 border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"/>
                  </div>
                  <button 
                    onClick={handleGenerateInvoice} disabled={selectedComponentIds.length === 0 || !dueDate}
                    className="w-full bg-indigo-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
                  >
                    <Plus size={14}/> Issue {formatCurrency(liveTotal)} Invoice
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Professional Financial Ledger */}
        <div className="lg:col-span-8 h-full flex flex-col">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-start mb-6 shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mb-1">
                  <History size={20} className="text-blue-600"/> Master Ledger
                </h3>
                {selectedStudent ? (
                  <p className="text-xs font-bold text-slate-500">Account: <span className="text-slate-900">{selectedStudent.name}</span> (Parent: {selectedStudent.parentName})</p>
                ) : (
                  <p className="text-xs font-bold text-slate-400">Select a student to view their ledger.</p>
                )}
              </div>
              
              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                <Filter size={14} className="text-slate-400 ml-2"/>
                <select value={dateFilter} onChange={e => setDateFilter(e.target.value as any)} className="bg-transparent text-xs font-bold text-slate-700 outline-none p-1">
                  <option value="all">All History</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="1y">Last 1 Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            {dateFilter === 'custom' && (
              <div className="flex gap-4 mb-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 shrink-0">
                <div className="flex-1"><input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ colorScheme: 'light' }} className="w-full text-xs font-bold p-2 bg-white text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-blue-500"/></div>
                <div className="flex-1"><input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ colorScheme: 'light' }} className="w-full text-xs font-bold p-2 bg-white text-slate-900 rounded-lg border border-slate-200 outline-none focus:border-blue-500"/></div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {!selectedStudentId ? (
                <div className="h-full flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                  <ArrowRightLeft size={40} className="text-slate-300 mb-3"/>
                  <p className="text-sm font-bold text-slate-500">Awaiting account selection.</p>
                </div>
              ) : studentLedgerTimeline.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={40} className="text-emerald-300 mb-3"/>
                  <h4 className="text-base font-black text-slate-900">No Transactions Found</h4>
                  <p className="text-xs font-bold text-slate-500">Adjust filters or issue an invoice.</p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Date & Ref</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Description</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Debit (Inv)</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Credit (Pay)</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentLedgerTimeline.map(entry => (
                        <tr key={entry.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-xs font-bold text-slate-900">{entry.date}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{entry.id}</p>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-xs font-bold text-slate-900">{entry.description}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{entry.type}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {entry.type === 'INVOICE' ? (
                              <div>
                                <span className="text-sm font-black text-rose-600">{formatCurrency(entry.amount)}</span>
                                {/* 🔴 THE FIX: Bypassing strict TS checking using 'as any' safely */}
                                {(entry.details as any).concession && <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Discounted</p>}
                              </div>
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {entry.type === 'PAYMENT' ? <span className="text-sm font-black text-emerald-600">{formatCurrency(entry.amount)}</span> : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-1 inline-block rounded text-[9px] font-black uppercase tracking-widest ${
                              entry.status === 'SUCCESS' || entry.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 
                              entry.status === 'UNPAID' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {entry.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            {entry.type === 'INVOICE' && entry.status === 'UNPAID' && (
                               <button 
                                 onClick={() => { setConcessionTarget(entry); setIsConcessionModalOpen(true); }} 
                                 className="px-3 py-1 bg-amber-100 text-amber-700 rounded text-[10px] font-black uppercase tracking-widest hover:bg-amber-200 transition-colors"
                               >
                                 Waiver
                               </button>
                            )}
                            <button onClick={() => setInspectingEntry(entry)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 rounded transition-all shadow-sm" title="View Details">
                              <Eye size={14}/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* INSPECTION MODAL */}
      {inspectingEntry && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl shadow-2xl rounded-sm overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="p-4 bg-slate-800 text-white flex justify-between items-center shrink-0 print:hidden">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                {inspectingEntry.type === 'INVOICE' ? <FileText size={16}/> : <Receipt size={16}/>}
                Document Viewer
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-black uppercase tracking-widest transition-colors">Print Document</button>
                <button onClick={() => setInspectingEntry(null)} className="text-slate-300 hover:text-white p-1"><X size={20}/></button>
              </div>
            </div>

            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar bg-white text-slate-900" id="printable-invoice">
              <div className="flex flex-col items-center border-b-4 border-blue-700 pb-6 mb-6">
                 <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3">
                   <Building2 size={32} />
                 </div>
                 <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">DPS Ranchi</h1>
                 <p className="text-xs font-bold text-slate-500 mt-1">MAIN CAMPUS, RANCHI, JHARKHAND 834004</p>
              </div>

              <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest">
                {inspectingEntry.type === 'INVOICE' ? 'Official Fee Invoice' : 'Payment Receipt'}
              </h2>

              <div className="grid grid-cols-2 gap-0 border-2 border-slate-900 mb-8 rounded-sm overflow-hidden">
                <div className="p-4 border-r-2 border-slate-900 bg-slate-50">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Document Details</h4>
                  <div className="space-y-2 text-sm font-bold">
                    <p className="flex justify-between"><span>Reference No:</span> <span className="text-slate-900">{inspectingEntry.id}</span></p>
                    <p className="flex justify-between"><span>Date:</span> <span className="text-slate-900">{inspectingEntry.date}</span></p>
                    <p className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                      <span>Status:</span> 
                      <span className={`uppercase font-black ${inspectingEntry.status === 'PAID' || inspectingEntry.status === 'SUCCESS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {inspectingEntry.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Student Information</h4>
                  <div className="space-y-2 text-sm font-bold">
                    <p className="flex justify-between"><span>Student Name:</span> <span className="text-slate-900">{selectedStudent?.name}</span></p>
                    <p className="flex justify-between"><span>Parent Name:</span> <span className="text-slate-900">{selectedStudent?.parentName}</span></p>
                    <p className="flex justify-between"><span>Class/Roll:</span> <span className="text-slate-900">{selectedStudent?.classId} / {selectedStudent?.rollNo}</span></p>
                  </div>
                </div>
              </div>

              {inspectingEntry.type === 'INVOICE' && inspectingEntry.details?.items && (
                <div className="border-2 border-slate-900 rounded-sm overflow-hidden mb-8">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 border-b-2 border-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 w-3/4">Description of Fees</th>
                        <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 text-right w-1/4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {inspectingEntry.details.items.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900">{item.name}</td>
                          <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t-2 border-slate-900">
                      <tr>
                        <td className="px-4 py-4 text-sm font-black text-slate-900 text-right uppercase tracking-widest">Subtotal</td>
                        <td className="px-4 py-4 text-sm font-black text-slate-900 text-right">{formatCurrency(inspectingEntry.details.subTotal)}</td>
                      </tr>
                      {/* 🔴 THE FIX: Bypassing strict TS checking using 'as any' safely */}
                      {(inspectingEntry.details as any).concession && (
                        <tr>
                          <td className="px-4 py-2 text-xs font-black text-emerald-600 text-right uppercase tracking-widest">Concession: {(inspectingEntry.details as any).concession.reason}</td>
                          <td className="px-4 py-2 text-sm font-black text-emerald-600 text-right">-{formatCurrency((inspectingEntry.details as any).concession.amount)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="px-4 py-4 text-sm font-black text-slate-900 text-right uppercase tracking-widest border-t border-slate-300">Total Amount Due</td>
                        <td className="px-4 py-4 text-lg font-black text-slate-900 text-right border-t border-slate-300">{formatCurrency(inspectingEntry.amount)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}

      {/* APPLY CONCESSION MODAL */}
      {isConcessionModalOpen && concessionTarget && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-amber-100 bg-amber-500 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <BadgePercent size={16}/> Apply Scholarship / Concession
              </h3>
              <button onClick={() => setIsConcessionModalOpen(false)} className="text-amber-100 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 flex justify-between items-center">
                <span className="text-xs font-black text-amber-800 uppercase tracking-widest">Current Invoice Total</span>
                <span className="text-xl font-black text-amber-900">{formatCurrency(concessionTarget.amount)}</span>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Discount Amount (₹)</label>
                <input 
                  type="number" 
                  value={concessionAmount || ''} 
                  onChange={e => setConcessionAmount(Number(e.target.value))} 
                  className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-lg font-black outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Reason / Authorization</label>
                <select 
                  value={concessionReason} 
                  onChange={e => setConcessionReason(e.target.value)} 
                  className="w-full p-3.5 bg-white border-2 border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-amber-500"
                >
                  <option value="">-- Select Reason --</option>
                  <option value="Staff Child Discount">Staff Child Discount (50%)</option>
                  <option value="Merit Scholarship">Merit Scholarship</option>
                  <option value="RTE Quota">RTE Government Quota (100%)</option>
                  <option value="Principal Special Approval">Principal's Special Waiver</option>
                </select>
              </div>

              <button 
                onClick={handleApplyConcession} 
                disabled={concessionAmount <= 0 || !concessionReason || concessionAmount > concessionTarget.amount} 
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-2 shadow-md"
              >
                <CheckCircle2 size={18}/> Apply Credit Note to Ledger
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </AdminLayout>
  );
};

export default StudentLedgerHub;