import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { CheckCircle2, AlertCircle, Banknote } from 'lucide-react';

const TeacherPayroll: React.FC = () => {
  // Dynamic state to simulate "Doing something"
  const [payrollData, setPayrollData] = useState([
    { id: 'TCH-001', name: 'Dr. Arvind Sharma', base: 65000, deductions: 0, status: 'Paid' },
    { id: 'TCH-002', name: 'Meera Reddy', base: 55000, deductions: 1500, status: 'Pending' },
  ]);

  const handleProcessSalary = (id: string) => {
    setPayrollData(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'Paid' } : item
    ));
    alert(`Salary processed for ${id}`);
  };

  return (
    <AdminLayout pageTitle="Payroll Command" pageDescription="Verify attendance-based deductions and authorize payments.">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black">
            <tr>
              <th className="px-6 py-4 text-left">Staff Member</th>
              <th className="px-6 py-4 text-left">Net Amount</th>
              <th className="px-6 py-4 text-left">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payrollData.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">{staff.name}</p>
                  <p className="text-[10px] font-mono text-slate-400">{staff.id}</p>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-slate-700 text-lg">
                  ₹{(staff.base - staff.deductions).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    staff.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>{staff.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  {staff.status === 'Pending' ? (
                    <button 
                      onClick={() => handleProcessSalary(staff.id)}
                      className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-600 transition-all flex items-center gap-2 ml-auto"
                    >
                      <Banknote size={14}/> Release Funds
                    </button>
                  ) : (
                    <div className="text-emerald-600 flex items-center gap-1 justify-end font-bold text-xs"><CheckCircle2 size={14}/> Voucher Generated</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default TeacherPayroll;