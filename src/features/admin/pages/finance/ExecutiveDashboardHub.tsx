import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  BarChart3, TrendingUp, TrendingDown, Scale, 
  AlertCircle, Wallet, CreditCard, Banknote, Landmark
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import AdminLayout from '../../components/layout/AdminLayout';

const ExecutiveDashboardHub: React.FC = () => {
  const { invoices, transactions, expenses } = useSelector((state: RootState) => state.finance);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  // ==========================================
  // MASTER FINANCIAL AGGREGATION ENGINE
  // ==========================================
  const financials = useMemo(() => {
    // 1. Total Realized Revenue (Money in the bank/drawer)
    const totalRevenue = Object.values(transactions)
      .filter(t => t.status === 'SUCCESS')
      .reduce((sum, t) => sum + t.amount, 0);

    // 2. Total Cleared Expenses (Money out)
    const totalExpenses = Object.values(expenses)
      .filter(e => e.status === 'CLEARED')
      .reduce((sum, e) => sum + e.amount, 0);

    // 3. Net Profit / Cash Flow
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // 4. Accounts Receivable (Money stuck/pending from parents)
    const pendingDues = Object.values(invoices)
      .filter(i => i.status === 'UNPAID' || i.status === 'PARTIAL')
      .reduce((sum, i) => sum + (i.totalAmount - i.amountPaid), 0);

    // 5. Expense Breakdown by Category
    const expenseBreakdown = Object.values(expenses).reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    return { totalRevenue, totalExpenses, netProfit, profitMargin, pendingDues, expenseBreakdown };
  }, [invoices, transactions, expenses]);

  return (
    <AdminLayout 
      pageTitle="Executive Finance Dashboard" 
      pageDescription="Real-time Profit & Loss (P&L), Cash Flow, and Accounts Receivable."
      breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Executive P&L' }]}
    >
      
      {/* ========================================== */}
      {/* THE MASTER P&L HUD (Heads Up Display) */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        
        {/* Total Inflows */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><TrendingUp size={20}/></div>
            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">Inflows</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Realized Revenue</p>
            <h2 className="text-3xl font-black text-slate-900">{formatCurrency(financials.totalRevenue)}</h2>
          </div>
        </div>

        {/* Total Outflows */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><TrendingDown size={20}/></div>
            <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-black uppercase tracking-widest">Outflows</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Expenses & Payroll</p>
            <h2 className="text-3xl font-black text-slate-900">{formatCurrency(financials.totalExpenses)}</h2>
          </div>
        </div>

        {/* Net Cash Flow / Profit */}
        <div className={`p-6 rounded-3xl shadow-sm flex flex-col justify-between text-white ${financials.netProfit >= 0 ? 'bg-slate-900' : 'bg-rose-600'}`}>
          <div className="flex justify-between items-start mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${financials.netProfit >= 0 ? 'bg-slate-800 text-emerald-400' : 'bg-rose-500 text-white'}`}><Scale size={20}/></div>
            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${financials.netProfit >= 0 ? 'bg-slate-800 text-slate-300' : 'bg-rose-700 text-rose-100'}`}>P&L Status</span>
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${financials.netProfit >= 0 ? 'text-slate-400' : 'text-rose-200'}`}>Net Cash Flow (Profit)</p>
            <div className="flex items-end gap-3">
              <h2 className="text-3xl font-black">{formatCurrency(financials.netProfit)}</h2>
              <span className={`text-sm font-bold mb-1 ${financials.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-200'}`}>
                {financials.profitMargin.toFixed(1)}% Margin
              </span>
            </div>
          </div>
        </div>

        {/* Accounts Receivable (Danger Zone) */}
        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center"><AlertCircle size={20}/></div>
            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-[9px] font-black uppercase tracking-widest">Stuck Funds</span>
          </div>
          <div>
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">Accounts Receivable (Pending Dues)</p>
            <h2 className="text-3xl font-black text-amber-900">{formatCurrency(financials.pendingDues)}</h2>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* ========================================== */}
        {/* EXPENSE CATEGORY BREAKDOWN */}
        {/* ========================================== */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <BarChart3 size={16} className="text-indigo-600"/> Expenditure Breakdown
          </h3>
          
          {financials.totalExpenses === 0 ? (
            <div className="py-12 text-center text-slate-400 font-bold text-sm">No expenses logged yet.</div>
          ) : (
            <div className="space-y-5">
              {Object.entries(financials.expenseBreakdown).map(([category, amount]) => {
                const pct = ((amount / financials.totalExpenses) * 100).toFixed(1);
                return (
                  <div key={category}>
                    <div className="flex justify-between text-xs font-black text-slate-700 mb-2 uppercase tracking-widest">
                      <span>{category}</span>
                      <span>{formatCurrency(amount)} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* QUICK LEDGER SNAPSHOT */}
        {/* ========================================== */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col justify-center relative overflow-hidden">
           <div className="absolute -right-10 -bottom-10 opacity-10"><Landmark size={250}/></div>
           <div className="relative z-10">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-700 pb-4">Ledger Health Check</h3>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Wallet className="text-blue-400"/>
                    <span className="text-sm font-bold">Total Invoices Generated</span>
                  </div>
                  <span className="text-xl font-black">{Object.keys(invoices).length}</span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-emerald-400"/>
                    <span className="text-sm font-bold">Total Successful Payments</span>
                  </div>
                  <span className="text-xl font-black">{Object.keys(transactions).length}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-3">
                    <Banknote className="text-rose-400"/>
                    <span className="text-sm font-bold">Total Disbursed Expenses</span>
                  </div>
                  <span className="text-xl font-black">{Object.keys(expenses).length}</span>
                </div>
              </div>
           </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default ExecutiveDashboardHub;