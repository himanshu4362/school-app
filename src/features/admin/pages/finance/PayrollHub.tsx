import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, Calculator, FileCheck, CheckCircle2, 
  Calendar, LockKeyhole, FileText, Search
} from 'lucide-react';

import { RootState } from '../../../../store/store';
import { upsertSalaryStructure, generateDraftPayroll, approvePayrollRun } from '../../../../store/slices/financeSlice';
import AdminLayout from '../../components/layout/AdminLayout';

// ==========================================
// MOCK HR DATA 
// ==========================================
const MOCK_STAFF = [
  { id: 'EMP-001', name: 'Ravi Verma', role: 'Senior Teacher (Science)', department: 'Academic', baseSalary: 45000, attendanceThisMonth: { lates: 3, absences: 1 } },
  { id: 'EMP-002', name: 'Anjali Desai', role: 'Teacher (English)', department: 'Academic', baseSalary: 38000, attendanceThisMonth: { lates: 0, absences: 0 } },
  { id: 'EMP-003', name: 'Priya Sharma', role: 'Teacher (Math)', department: 'Academic', baseSalary: 42000, attendanceThisMonth: { lates: 5, absences: 2 } },
  { id: 'EMP-004', name: 'Amit Kumar', role: 'Front Desk Admin', department: 'Administration', baseSalary: 25000, attendanceThisMonth: { lates: 1, absences: 0 } },
];

const PENALTY_POLICY = { lateFine: 200, absenceFine: 1000 };

const PayrollHub: React.FC = () => {
  const dispatch = useDispatch();
  const { salaryStructures, payrollRuns } = useSelector((state: RootState) => state.finance);

  // Core State
  const [selectedMonth, setSelectedMonth] = useState('2026-05');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // 🔴 NEW: Interactive Worksheet State
  const [worksheetAllowances, setWorksheetAllowances] = useState<number>(0);
  const [worksheetDeductions, setWorksheetDeductions] = useState<number>(0);
  const [worksheetPenalty, setWorksheetPenalty] = useState<number>(0);

  // Auto-Hydrate Master Salary Structures for Mock Data
  useEffect(() => {
    MOCK_STAFF.forEach(staff => {
      if (!salaryStructures[staff.id]) {
        dispatch(upsertSalaryStructure({
          id: crypto.randomUUID(), staffId: staff.id, baseSalary: staff.baseSalary,
          components: [
            { id: crypto.randomUUID(), name: 'Travel & Housing', type: 'ALLOWANCE', amount: 2000 },
            { id: crypto.randomUUID(), name: 'Professional Tax', type: 'DEDUCTION', amount: 250 }
          ]
        }));
      }
    });
  }, [dispatch, salaryStructures]);

  const selectedStaff = MOCK_STAFF.find(s => s.id === selectedStaffId);
  const staffStructure = selectedStaffId ? salaryStructures[selectedStaffId] : null;
  const existingPayrollRun = payrollRuns[`${selectedStaffId}_${selectedMonth}`];

  // 🔴 NEW: Auto-populate worksheet when a staff is selected
  useEffect(() => {
    if (selectedStaff && staffStructure && !existingPayrollRun) {
      const baseAllowances = staffStructure.components.filter(c => c.type === 'ALLOWANCE').reduce((sum, c) => sum + c.amount, 0);
      const baseDeductions = staffStructure.components.filter(c => c.type === 'DEDUCTION').reduce((sum, c) => sum + c.amount, 0);
      const calcPenalty = (selectedStaff.attendanceThisMonth.lates * PENALTY_POLICY.lateFine) + (selectedStaff.attendanceThisMonth.absences * PENALTY_POLICY.absenceFine);
      
      setWorksheetAllowances(baseAllowances);
      setWorksheetDeductions(baseDeductions);
      setWorksheetPenalty(calcPenalty);
    }
  }, [selectedStaffId, selectedMonth, selectedStaff, staffStructure, existingPayrollRun]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const filteredStaff = MOCK_STAFF.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()));

  // Live Worksheet Math
  const liveNetPay = staffStructure ? (staffStructure.baseSalary + worksheetAllowances) - (worksheetDeductions + worksheetPenalty) : 0;

  const handleGenerateDraft = () => {
    if (!selectedStaffId) return;
    dispatch(generateDraftPayroll({
      staffId: selectedStaffId,
      monthYear: selectedMonth,
      finalAllowances: worksheetAllowances,
      finalDeductions: worksheetDeductions,
      finalPenalty: worksheetPenalty
    }));
  };

  const handleApprovePayroll = () => {
    if (existingPayrollRun && existingPayrollRun.status === 'DRAFT') {
      if(window.confirm(`LOCK PAYROLL: Are you sure you want to approve the salary slip for ${selectedStaff?.name}? This action is irreversible.`)) {
        dispatch(approvePayrollRun(existingPayrollRun.id));
      }
    }
  };

  return (
    <AdminLayout pageTitle="Payroll Run & Disbursements" pageDescription="Manage monthly payroll worksheets, ad-hoc allowances, and deductions." breadcrumbs={[{ label: 'Finance Hub' }, { label: 'Payroll' }]}>
      
      {/* TOP CONTROL BAR */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-wrap justify-between items-center mb-6 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-md">
            <Calendar size={18}/>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Payroll Cycle</p>
            <h2 className="text-sm font-black text-slate-900">Monthly Processing</h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500">Select Processing Month:</label>
          <input 
            type="month" value={selectedMonth} onChange={e => {setSelectedMonth(e.target.value); setSelectedStaffId('');}}
            className="bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2 text-sm font-bold outline-none focus:border-blue-500 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-220px)]">
        
        {/* LEFT COLUMN: STAFF DIRECTORY */}
        <div className="lg:col-span-4 flex flex-col gap-6 h-full">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            
            <div className="relative mb-4 shrink-0">
              <input type="text" placeholder="Search by name or Employee ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-slate-400"/>
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl divide-y divide-slate-100">
              {filteredStaff.map(staff => {
                const run = payrollRuns[`${staff.id}_${selectedMonth}`];
                return (
                  <div key={staff.id} onClick={() => setSelectedStaffId(staff.id)} className={`p-4 cursor-pointer transition-all flex justify-between items-center ${selectedStaffId === staff.id ? 'bg-slate-900 text-white shadow-inner' : 'hover:bg-slate-50 text-slate-900'}`}>
                    <div>
                      <p className="text-sm font-black">{staff.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${selectedStaffId === staff.id ? 'text-slate-400' : 'text-slate-500'}`}>{staff.id} • {staff.department}</p>
                    </div>
                    {run ? (
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest border ${run.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-500 border-amber-500/30'}`}>
                        {run.status}
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest ${selectedStaffId === staff.id ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                        UNPROCESSED
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ENTERPRISE PAYROLL WORKSHEET */}
        <div className="lg:col-span-8 h-full flex flex-col">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden relative">
            
            {!selectedStaff ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50">
                <p className="text-sm font-bold text-slate-400">Select an employee from the directory to open their worksheet.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Header Profile */}
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">{selectedStaff.name}</h2>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{selectedStaff.role}</p>
                  </div>
                  {existingPayrollRun && (
                    <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 shadow-sm ${existingPayrollRun.status === 'APPROVED' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                      {existingPayrollRun.status === 'APPROVED' ? <LockKeyhole size={16}/> : <FileText size={16}/>}
                      <span className="text-xs font-black uppercase tracking-widest">{existingPayrollRun.status} Record</span>
                    </div>
                  )}
                </div>

                {/* THE WORKSHEET (Data Grid) */}
                <div className="flex-1 overflow-y-auto p-6 bg-white">
                  <div className="grid grid-cols-2 gap-8">
                    
                    {/* EARNINGS COLUMN */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Earnings (+)</h3>
                      
                      <div className="flex justify-between items-center mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-xs font-bold text-slate-700">Contractual Base Pay</span>
                        <span className="text-sm font-black text-slate-900">{formatCurrency(staffStructure?.baseSalary || 0)}</span>
                      </div>

                      <div className="mb-4">
                        <label className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                          <span>Total Allowances & Bonuses</span>
                          <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Editable</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input 
                            type="number" disabled={!!existingPayrollRun}
                            value={existingPayrollRun ? existingPayrollRun.totalAllowances : worksheetAllowances} 
                            onChange={e => setWorksheetAllowances(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-black text-emerald-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">Default policy allocation: {formatCurrency(staffStructure?.components.filter(c => c.type === 'ALLOWANCE').reduce((sum, c) => sum + c.amount, 0) || 0)}</p>
                      </div>
                    </div>

                    {/* DEDUCTIONS COLUMN */}
                    <div>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Deductions (-)</h3>
                      
                      <div className="mb-4">
                        <label className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                          <span>Statutory Deductions (Tax, PF)</span>
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">Editable</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input 
                            type="number" disabled={!!existingPayrollRun}
                            value={existingPayrollRun ? existingPayrollRun.totalDeductions : worksheetDeductions} 
                            onChange={e => setWorksheetDeductions(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-black text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="mb-4 bg-rose-50/50 p-4 rounded-xl border border-rose-100">
                        <div className="flex justify-between text-[10px] font-bold text-rose-800 mb-3 uppercase tracking-widest border-b border-rose-200 pb-2">
                          <span>Attendance Flags:</span>
                          <span>Lates: {selectedStaff.attendanceThisMonth.lates} | Absences: {selectedStaff.attendanceThisMonth.absences}</span>
                        </div>
                        <label className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                          <span>Leave & Attendance Penalty</span>
                          <span className="text-[9px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase">Override Allowed</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                          <input 
                            type="number" disabled={!!existingPayrollRun}
                            value={existingPayrollRun ? existingPayrollRun.attendancePenalty : worksheetPenalty} 
                            onChange={e => setWorksheetPenalty(Number(e.target.value))}
                            className="w-full pl-8 pr-4 py-2 bg-white border border-rose-300 rounded-lg text-sm font-black text-rose-700 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200"
                          />
                        </div>
                        <p className="text-[10px] font-medium text-slate-500 mt-2">Adjust penalty to waive fines or enforce custom deductions.</p>
                      </div>

                    </div>
                  </div>
                </div>

                {/* BOTTOM ACTION BAR */}
                <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Final Net Payable</p>
                    <h2 className="text-3xl font-black text-slate-900">
                      {existingPayrollRun ? formatCurrency(existingPayrollRun.netPayable) : formatCurrency(liveNetPay)}
                    </h2>
                  </div>

                  <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                    {!existingPayrollRun && (
                      <button onClick={handleGenerateDraft} className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md border border-slate-700">
                        <Calculator size={16}/> Save Draft Record
                      </button>
                    )}

                    {existingPayrollRun?.status === 'DRAFT' && (
                      <button onClick={handleApprovePayroll} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md">
                        <CheckCircle2 size={16}/> Lock & Approve Payout
                      </button>
                    )}

                    {existingPayrollRun?.status === 'APPROVED' && (
                      <div className="px-6 py-3 bg-slate-100 border border-slate-200 text-emerald-700 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        <LockKeyhole size={16}/> Approved & Immutable
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default PayrollHub;