import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  TrendingDown, Banknote, Search, Filter, Eye, X, 
  Calendar as CalendarIcon, PieChart, ArrowUpRight, 
  Plus, Landmark, FileText, CheckCircle2, Building2
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import { recordExpense, disbursePayrollRun } from '../../../../store/slices/financeSlice';
import { ExpenseTransaction } from '../../../../types/finance/finance.schema';
import AdminLayout from '../../components/layout/AdminLayout';

const ExpensePassbookHub: React.FC = () => {
  const dispatch = useDispatch();
  const { expenses, payrollRuns, activeSessionId } = useSelector((state: RootState) => state.finance);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  
  // Modals State
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isDisburseModalOpen, setIsDisburseModalOpen] = useState(false);
  const [inspectingExpense, setInspectingExpense] = useState<any | null>(null);

  // Form State: General Expense
  const [expCategory, setExpCategory] = useState<'UTILITIES' | 'INFRASTRUCTURE' | 'VENDOR' | 'MISC'>('UTILITIES');
  const [expPaidTo, setExpPaidTo] = useState('');
  const [expAmount, setExpAmount] = useState<number>(0);
  const [expMethod, setExpMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'UPI'>('BANK_TRANSFER');
  const [expBankRef, setExpBankRef] = useState('');
  const [expDesc, setExpDesc] = useState('');

  // Form State: Payroll Disbursement
  const [selectedPayrollId, setSelectedPayrollId] = useState('');
  const [disburseBankRef, setDisburseBankRef] = useState('');

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // ==========================================
  // DERIVED DATA & ANALYTICS
  // ==========================================
  const allExpenses = Object.values(expenses).sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
  
  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      if (categoryFilter !== 'ALL' && exp.category !== categoryFilter) return false;
      if (searchQuery && !exp.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) && !exp.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allExpenses, categoryFilter, searchQuery]);

  const totalOutflow = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const categoryBreakdown = filteredExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const payrollAmount = categoryBreakdown['PAYROLL'] || 0;
  const opsAmount = totalOutflow - payrollAmount;
  const payrollPct = totalOutflow > 0 ? (payrollAmount / totalOutflow) * 100 : 0;
  const opsPct = totalOutflow > 0 ? (opsAmount / totalOutflow) * 100 : 0;

  // Find all payrolls waiting to be paid out
  const approvedPayrolls = Object.values(payrollRuns).filter(run => run.status === 'APPROVED');
  const selectedPayrollRecord = approvedPayrolls.find(r => r.id === selectedPayrollId);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleRecordExpense = () => {
    if (!expPaidTo || expAmount <= 0) return;
    
    // ANTI-FRAUD: If paying cash, ensure desk is open.
    if (expMethod === 'CASH' && !activeSessionId) {
      alert("You cannot log a CASH expense because your Cash Register is locked. Open your Cash Desk session first.");
      return;
    }

    const newExpense: ExpenseTransaction = {
      id: `EXP-${Date.now()}`,
      category: expCategory,
      paidTo: expPaidTo,
      referenceId: expMethod !== 'CASH' ? expBankRef : null,
      amount: expAmount,
      method: expMethod,
      bankReference: expMethod !== 'CASH' ? expBankRef : undefined,
      expenseDate: new Date().toISOString(),
      description: expDesc || `${expCategory} Payment`,
      status: 'CLEARED',
      recordedByUserId: 'ADMIN-XYZ',
    };

    dispatch(recordExpense(newExpense));
    setIsExpenseModalOpen(false);
    setExpPaidTo(''); setExpAmount(0); setExpBankRef(''); setExpDesc('');
  };

  const handleDisbursePayroll = () => {
    if (!selectedPayrollRecord || !disburseBankRef) return;
    dispatch(disbursePayrollRun({
      payrollRunId: selectedPayrollRecord.id,
      bankReference: disburseBankRef,
      adminId: 'ADMIN-XYZ',
      staffName: `Staff ID: ${selectedPayrollRecord.staffId}` // In a real app, pull the actual name
    }));
    setIsDisburseModalOpen(false);
    setSelectedPayrollId(''); setDisburseBankRef('');
  };

  return (
    <AdminLayout pageTitle="Master Expense Passbook" pageDescription="Global ledger for all outgoing payments, vendor bills, and salary disbursements." breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Expense Passbook' }]}>
      
      {/* KPI DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute -right-6 -top-6 text-slate-800 opacity-50"><TrendingDown size={120} /></div>
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2"><Landmark size={14}/> Total Outflows</p>
            <h2 className="text-4xl font-black mb-4 text-rose-400">{formatCurrency(totalOutflow)}</h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded">
              <ArrowUpRight size={12} className="inline"/> Money leaving accounts
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-center">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><PieChart size={16} className="text-indigo-600"/> Expenditure Distribution</h3>
          </div>
          <div className="h-6 w-full rounded-full flex overflow-hidden mb-3 bg-slate-100">
             <div style={{ width: `${payrollPct}%` }} className="bg-blue-500 h-full transition-all duration-500"></div>
             <div style={{ width: `${opsPct}%` }} className="bg-rose-500 h-full transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-sm">
            <div>
              <p className="font-black text-blue-700 flex items-center gap-1">Payroll & Salaries</p>
              <p className="text-xs font-bold text-slate-500">{formatCurrency(payrollAmount)} ({payrollPct.toFixed(1)}%)</p>
            </div>
            <div className="text-right">
              <p className="font-black text-rose-700 flex items-center gap-1 justify-end">Ops & Vendors</p>
              <p className="text-xs font-bold text-slate-500">{formatCurrency(opsAmount)} ({opsPct.toFixed(1)}%)</p>
            </div>
          </div>
        </div>
      </div>

      {/* THE IMMUTABLE EXPENSE TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-340px)]">
        
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 justify-between items-center shrink-0">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <input type="text" placeholder="Search Vendor or Ref ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-indigo-500"/>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            </div>
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200">
              <Filter size={14} className="text-slate-400 ml-2"/>
              <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 outline-none p-1">
                <option value="ALL">All Categories</option>
                <option value="PAYROLL">Payroll</option>
                <option value="UTILITIES">Utilities</option>
                <option value="VENDOR">Vendors</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button onClick={() => setIsDisburseModalOpen(true)} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-colors flex items-center gap-2">
               <Landmark size={14}/> Disburse Payroll
             </button>
             <button onClick={() => setIsExpenseModalOpen(true)} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-rose-700 transition-colors flex items-center gap-2 shadow-sm">
               <Plus size={14}/> Log Expense
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredExpenses.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <TrendingDown size={40} className="text-slate-200 mb-3"/>
              <h4 className="text-base font-black text-slate-900">No Expenses Found</h4>
              <p className="text-xs font-bold text-slate-500">The school has not logged any outflows yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Date & Time</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Expense Ref</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Paid To</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Category</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Amount (₹)</th>
                  <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(exp => {
                  const dateObj = new Date(exp.expenseDate);
                  return (
                    <tr key={exp.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-xs font-bold text-slate-900">{dateObj.toLocaleDateString()}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs font-black text-slate-900 font-mono">{exp.id}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 w-32 truncate">{exp.description}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-xs font-bold text-slate-900">{exp.paidTo}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 inline-block rounded text-[9px] font-black uppercase tracking-widest ${exp.category === 'PAYROLL' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-sm font-black text-rose-600">-{formatCurrency(exp.amount)}</span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <span className="text-[10px] font-bold text-slate-600 uppercase">{exp.method}</span>
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
      {/* MODAL 1: PAYROLL DISBURSEMENT GATEWAY */}
      {/* ========================================== */}
      {isDisburseModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-indigo-100 bg-indigo-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Landmark size={16} className="text-indigo-400"/> Salary Disbursement Gateway
              </h3>
              <button onClick={() => setIsDisburseModalOpen(false)} className="text-indigo-300 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Select Approved Payroll Run</label>
                <select value={selectedPayrollId} onChange={e => setSelectedPayrollId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500">
                  <option value="">-- Select Pending Payout --</option>
                  {approvedPayrolls.map(run => (
                    <option key={run.id} value={run.id}>Staff ID: {run.staffId} | {run.monthYear} | {formatCurrency(run.netPayable)}</option>
                  ))}
                </select>
                {approvedPayrolls.length === 0 && <p className="text-xs text-rose-500 mt-2 font-bold">No approved payrolls waiting for disbursement.</p>}
              </div>

              {selectedPayrollRecord && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Amount to Transfer</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(selectedPayrollRecord.netPayable)}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Bank Transfer / NEFT Reference *</label>
                <input type="text" value={disburseBankRef} onChange={e => setDisburseBankRef(e.target.value)} placeholder="e.g. N1234567890" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"/>
              </div>

              <button onClick={handleDisbursePayroll} disabled={!selectedPayrollRecord || !disburseBankRef} className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-2">
                <CheckCircle2 size={18}/> Disburse Funds
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ========================================== */}
      {/* MODAL 2: GENERAL EXPENSE LOGGER */}
      {/* ========================================== */}
      {isExpenseModalOpen && createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-rose-100 bg-rose-900 text-white flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <TrendingDown size={16} className="text-rose-400"/> Log Operational Expense
              </h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-rose-300 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Expense Category</label>
                  <select value={expCategory} onChange={e => setExpCategory(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500">
                    <option value="UTILITIES">Utilities (Power/Water)</option>
                    <option value="INFRASTRUCTURE">Infrastructure</option>
                    <option value="VENDOR">Vendor Payment</option>
                    <option value="MISC">Miscellaneous</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Total Amount (₹)</label>
                  <input type="number" value={expAmount || ''} onChange={e => setExpAmount(Number(e.target.value))} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-rose-700 outline-none focus:border-rose-500"/>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Paid To (Vendor/Entity)</label>
                <input type="text" value={expPaidTo} onChange={e => setExpPaidTo(e.target.value)} placeholder="e.g. State Electricity Board" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Payment Method</label>
                  <select value={expMethod} onChange={e => setExpMethod(e.target.value as any)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500">
                    <option value="BANK_TRANSFER">Bank NEFT/RTGS</option>
                    <option value="CASH">Cash (Petty Cash)</option>
                    <option value="CHEQUE">Company Cheque</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Txn Reference</label>
                  <input type="text" value={expBankRef} onChange={e => setExpBankRef(e.target.value)} disabled={expMethod === 'CASH'} placeholder={expMethod === 'CASH' ? 'N/A' : 'Ref No...'} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-rose-500 disabled:bg-slate-50 disabled:opacity-50"/>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Description / Notes</label>
                <textarea value={expDesc} onChange={e => setExpDesc(e.target.value)} rows={2} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-rose-500"></textarea>
              </div>

              <button onClick={handleRecordExpense} disabled={!expPaidTo || expAmount <= 0} className="w-full bg-rose-600 text-white p-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-rose-700 disabled:opacity-50 transition-all flex justify-center items-center gap-2 mt-4">
                <FileText size={18}/> Log Official Expense
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </AdminLayout>
  );
};

export default ExpensePassbookHub;