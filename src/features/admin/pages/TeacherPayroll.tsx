import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { CheckCircle2 } from 'lucide-react';

const TeacherPayroll: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const mockPayroll = [
    { id: 'TCH-001', name: 'Dr. Arvind Sharma', base: 65000, deductions: 0, net: 65000, status: 'Paid' },
    { id: 'TCH-002', name: 'Meera Reddy', base: 55000, deductions: 1500, net: 53500, status: 'Pending' },
    { id: 'TCH-003', name: 'Sanjay Gupta', base: 58000, deductions: 4000, net: 54000, status: 'Pending' },
  ];

  return (
    <IonPage>
      <IonContent>
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            
            <main className="flex-1 p-4 md:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Payroll Management</h1>
                  <p className="text-slate-500 text-sm">Review deductions and process monthly salaries.</p>
                </div>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition flex items-center gap-2">
                  <CheckCircle2 size={16} /> Process Pending (₹1,07,500)
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                      <th className="px-6 py-4 font-semibold">Teacher</th>
                      <th className="px-6 py-4 font-semibold">Base Salary</th>
                      <th className="px-6 py-4 font-semibold">Leave Deductions</th>
                      <th className="px-6 py-4 font-semibold">Net Payable</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayroll.map((record, idx) => (
                      <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">{record.name}</p>
                          <p className="text-xs text-slate-500">{record.id}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">₹{record.base.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-sm text-red-500">-₹{record.deductions.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-800">₹{record.net.toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${record.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default TeacherPayroll;