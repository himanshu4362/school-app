import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { 
  BookOpen, TrendingUp, CreditCard, Banknote, 
  Search, Filter, Eye, X, Building2, Calendar as CalendarIcon, 
  PieChart, ArrowDownRight, ShieldAlert, CheckCircle2, Receipt, FileText,
  AlertCircle
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';

const RevenuePassbookHub: React.FC = () => {
  const { transactions, invoices } = useSelector((state: RootState) => state.finance);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_month'>('all');
  
  // Inspection State
  const [inspectingTxn, setInspectingTxn] = useState<any | null>(null);
  const [modalView, setModalView] = useState<'RECEIPT' | 'INVOICE'>('RECEIPT'); // NEW: View Toggle

  // ==========================================
  // FINANCIAL ANALYTICS ENGINE
  // ==========================================
  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const allTxns = Object.values(transactions).sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());

  const filteredTxns = useMemo(() => {
    const now = new Date();
    return allTxns.filter(txn => {
      const txnDate = new Date(txn.paymentDate);
      if (dateFilter === 'today' && txnDate.toDateString() !== now.toDateString()) return false;
      if (dateFilter === 'this_month' && (txnDate.getMonth() !== now.getMonth() || txnDate.getFullYear() !== now.getFullYear())) return false;
      if (methodFilter !== 'ALL' && txn.method !== methodFilter) return false;
      if (searchQuery && !txn.id.toLowerCase().includes(searchQuery.toLowerCase()) && !txn.paidBy.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allTxns, dateFilter, methodFilter, searchQuery]);

  const totalRevenue = filteredTxns.reduce((sum, txn) => sum + txn.amount, 0);
  
  const methodBreakdown = filteredTxns.reduce((acc, txn) => {
    acc[txn.method] = (acc[txn.method] || 0) + txn.amount;
    return acc;
  }, {} as Record<string, number>);

  const cashAmount = methodBreakdown['CASH'] || 0;
  const digitalAmount = totalRevenue - cashAmount;

  const cashPct = totalRevenue > 0 ? (cashAmount / totalRevenue) * 100 : 0;
  const digitalPct = totalRevenue > 0 ? (digitalAmount / totalRevenue) * 100 : 0;

  // Helper to get linked invoice data
  const linkedInvoice = inspectingTxn ? invoices[inspectingTxn.invoiceId] : null;

  return (
    <AdminLayout 
      pageTitle="Master Revenue Passbook" 
      pageDescription="Global, immutable ledger of all incoming financial payments and analytics."
      breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Revenue Passbook' }]}
    >
      
      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-slate-800 opacity-50"><TrendingUp size={120} /></div>
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2"><BookOpen size={14}/> Total Inflows</p>
            <h2 className="text-4xl font-black mb-4">{formatCurrency(totalRevenue)}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
              <ArrowDownRight size={12} className="inline"/> Based on current filters
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><PieChart size={16} className="text-indigo-600"/> Collection Distribution</h3>
          </div>
          <div className="h-6 w-full rounded-full flex overflow-hidden mb-3 bg-slate-100">
             <div style={{ width: `${digitalPct}%` }} className="bg-indigo-500 h-full transition-all duration-500"></div>
             <div style={{ width: `${cashPct}%` }} className="bg-emerald-500 h-full transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-black text-indigo-700 flex items-center gap-1"><CreditCard size={14}/> Digital (Bank)</p>
              <p className="text-xs font-bold text-slate-500">{formatCurrency(digitalAmount)} ({digitalPct.toFixed(1)}%)</p>
            </div>
            <div className="text-right">
              <p className="font-black text-emerald-700 flex items-center gap-1 justify-end"><Banknote size={14}/> Physical Cash</p>
              <p className="text-xs font-bold text-slate-500">{formatCurrency(cashAmount)} ({cashPct.toFixed(1)}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* IMMUTABLE PASSBOOK TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-340px)]">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 justify-between items-center shrink-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input type="text" placeholder="Search Txn ID or Parent..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500"/>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
              <Filter size={14} className="text-slate-400 ml-2"/>
              <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 outline-none p-1">
                <option value="ALL">All Methods</option>
                <option value="CASH">Cash Only</option>
                <option value="UPI">UPI Only</option>
                <option value="CARD">Cards Only</option>
              </select>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
              <CalendarIcon size={14} className="text-slate-400 ml-2"/>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value as any)} className="bg-transparent text-xs font-bold text-slate-700 outline-none p-1">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="this_month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredTxns.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <BookOpen size={40} className="text-slate-200 mb-3"/>
              <h4 className="text-base font-black text-slate-900">No Payments Found</h4>
              <p className="text-xs font-bold text-slate-500">No transactions match your current filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Date & Time</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Transaction Ref</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Tendered By</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Method</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount (₹)</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTxns.map(txn => {
                  const dateObj = new Date(txn.paymentDate);
                  return (
                    <tr key={txn.id} className="hover:bg-indigo-50/30 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-xs font-bold text-slate-900">{dateObj.toLocaleDateString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs font-black text-slate-900 font-mono">{txn.id}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 flex items-center gap-1">
                          Inv: <span className="text-indigo-600 cursor-pointer hover:underline">{invoices[txn.invoiceId]?.invoiceNumber || txn.invoiceId}</span>
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs font-bold text-slate-900">{txn.paidBy}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 inline-block rounded text-[9px] font-black uppercase tracking-widest ${txn.method === 'CASH' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                          {txn.method}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-black text-emerald-600">+{formatCurrency(txn.amount)}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button onClick={() => { setInspectingTxn(txn); setModalView('RECEIPT'); }} className="p-1.5 text-slate-400 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded transition-all shadow-sm" title="Inspect Digital Receipt">
                          <Eye size={14}/>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* DRILL-DOWN MODAL: Receipt & Linked Invoice */}
      {/* ========================================== */}
      {inspectingTxn && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl shadow-2xl rounded-sm overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* ACTION BAR */}
            <div className="p-4 bg-slate-800 text-white flex justify-between items-center shrink-0 print:hidden">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldAlert size={16} className="text-emerald-400"/> Document Inspector
                </h3>
                
                {/* VIEW TOGGLE */}
                <div className="flex bg-slate-700 rounded-lg p-1">
                  <button 
                    onClick={() => setModalView('RECEIPT')} 
                    className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${modalView === 'RECEIPT' ? 'bg-slate-900 text-emerald-400 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    <Receipt size={14}/> Payment Receipt
                  </button>
                  <button 
                    onClick={() => setModalView('INVOICE')} 
                    className={`px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${modalView === 'INVOICE' ? 'bg-slate-900 text-blue-400 shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    <FileText size={14}/> Original Invoice
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-black uppercase tracking-widest transition-colors">
                  Print
                </button>
                <button onClick={() => setInspectingTxn(null)} className="text-slate-300 hover:text-white p-1"><X size={20}/></button>
              </div>
            </div>
            
            {/* PRINTABLE A4 AREA */}
            <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar bg-white text-slate-900" id="printable-area">
              
              <div className="flex flex-col items-center border-b-4 border-slate-900 pb-6 mb-6">
                 <div className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center mb-3">
                   <Building2 size={32} />
                 </div>
                 <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wider">DPS Ranchi</h1>
                 <p className="text-xs font-bold text-slate-500 mt-1">MAIN CAMPUS, RANCHI, JHARKHAND 834004</p>
              </div>

              {modalView === 'RECEIPT' ? (
                // --- RECEIPT VIEW ---
                <div>
                  <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest">Official Payment Receipt</h2>
                  
                  <div className="border-2 border-slate-900 rounded-sm overflow-hidden mb-8">
                    <div className="grid grid-cols-2 bg-slate-50 border-b-2 border-slate-900">
                      <div className="p-4 border-r-2 border-slate-900">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt Number</p>
                        <p className="text-sm font-black font-mono">{inspectingTxn.id}</p>
                      </div>
                      <div className="p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-sm font-black">{new Date(inspectingTxn.paymentDate).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3 text-sm font-bold">
                        <p className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Received From:</span> <span>{inspectingTxn.paidBy}</span>
                        </p>
                        <p className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Payment Method:</span> <span className="uppercase">{inspectingTxn.method}</span>
                        </p>
                        {inspectingTxn.bankReference && (
                          <p className="flex justify-between border-b border-slate-200 pb-2">
                            <span className="text-slate-500">Bank Reference ID:</span> <span className="font-mono">{inspectingTxn.bankReference}</span>
                          </p>
                        )}
                        <p className="flex justify-between border-b border-slate-200 pb-2">
                          <span className="text-slate-500">Applied to Invoice:</span> <span className="text-indigo-600">{linkedInvoice?.invoiceNumber || inspectingTxn.invoiceId}</span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 p-6 flex justify-between items-center border-t-2 border-slate-900">
                      <span className="text-sm font-black uppercase tracking-widest text-emerald-800">Total Amount Received</span>
                      <span className="text-3xl font-black text-emerald-700">{formatCurrency(inspectingTxn.amount)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                // --- INVOICE VIEW ---
                <div>
                  <h2 className="text-2xl font-black text-center mb-8 uppercase tracking-widest">Original Fee Invoice</h2>
                  {linkedInvoice ? (
                    <>
                      <div className="grid grid-cols-2 gap-0 border-2 border-slate-900 mb-8 rounded-sm overflow-hidden">
                        <div className="p-4 border-r-2 border-slate-900 bg-slate-50">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Document Details</h4>
                          <div className="space-y-2 text-sm font-bold">
                            <p className="flex justify-between"><span>Invoice No:</span> <span>{linkedInvoice.invoiceNumber}</span></p>
                            <p className="flex justify-between"><span>Issue Date:</span> <span>{linkedInvoice.issueDate}</span></p>
                            <p className="flex justify-between text-rose-600"><span>Due Date:</span> <span>{linkedInvoice.dueDate}</span></p>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Student Information</h4>
                          <div className="space-y-2 text-sm font-bold">
                            <p className="flex justify-between"><span>Student ID:</span> <span>{linkedInvoice.studentId}</span></p>
                            <p className="flex justify-between"><span>Billed To:</span> <span>{inspectingTxn.paidBy}</span></p>
                          </div>
                        </div>
                      </div>

                      <div className="border-2 border-slate-900 rounded-sm overflow-hidden mb-8">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-100 border-b-2 border-slate-900">
                            <tr>
                              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 w-3/4">Description of Fees</th>
                              <th className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-700 text-right w-1/4">Amount</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {linkedInvoice.items.map((item: any, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 text-sm font-bold text-slate-900">{item.name}</td>
                                <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-slate-50 border-t-2 border-slate-900">
                            <tr>
                              <td className="px-4 py-4 text-sm font-black text-slate-900 text-right uppercase tracking-widest">Total Invoice Amount</td>
                              <td className="px-4 py-4 text-lg font-black text-slate-900 text-right">{formatCurrency(linkedInvoice.totalAmount)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8 border-2 border-dashed border-rose-200 rounded-lg text-rose-500">
                      <AlertCircle className="mx-auto mb-2" />
                      <p className="font-bold text-sm">Original invoice data could not be located in the ledger.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
};

export default RevenuePassbookHub;