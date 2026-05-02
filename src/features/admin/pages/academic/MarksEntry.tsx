import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Save, ChevronLeft, Search } from 'lucide-react';

const MarksEntry: React.FC = () => {
  const [students, setStudents] = useState([
    { id: 'ST-101', name: 'Aarav Patel', roll: '22', marks: 85, total: 100, comments: 'Good progress' },
    { id: 'ST-102', name: 'Isha Sharma', roll: '23', marks: 42, total: 100, comments: 'Needs improvement' },
  ]);

  const updateMarks = (index: number, value: string) => {
    const newStudents = [...students];
    newStudents[index].marks = parseInt(value) || 0;
    setStudents(newStudents);
  };

  return (
    <AdminLayout 
      pageTitle="Marks Management" 
      pageDescription="Monthly Test - Grade 10-A (Mathematics). Use this sheet to enter or override scores."
      headerActions={<button className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 shadow-lg shadow-emerald-600/20"><Save size={18}/> Save Changes</button>}
    >
      <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b">
            <tr>
              <th className="px-6 py-5 text-left font-black text-slate-400 uppercase text-[10px] tracking-widest">Roll & Student</th>
              <th className="px-6 py-5 text-left font-black text-slate-400 uppercase text-[10px] tracking-widest">Score (Out of 100)</th>
              <th className="px-6 py-5 text-left font-black text-slate-400 uppercase text-[10px] tracking-widest">Teacher Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-bold">
            {students.map((student, idx) => (
              <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 text-xs">#{student.roll}</span>
                    <div>
                      <p className="text-slate-900">{student.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">{student.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="number" 
                    value={student.marks}
                    onChange={(e) => updateMarks(idx, e.target.value)}
                    className={`w-20 px-3 py-2 rounded-lg border-2 outline-none transition-all ${
                      student.marks < 33 ? 'border-rose-100 bg-rose-50 text-rose-600' : 'border-slate-100 bg-slate-50 text-slate-900 focus:border-blue-500'
                    }`}
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    className="w-full px-3 py-2 bg-transparent border-b border-transparent focus:border-blue-200 outline-none text-slate-500 font-medium italic placeholder:text-slate-200" 
                    placeholder="Enter short remark..."
                    defaultValue={student.comments}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};
export default MarksEntry;