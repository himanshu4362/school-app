import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { Search, Filter, Download, UserPlus, MoreVertical, AlertCircle, ShieldAlert } from 'lucide-react';

// Deep Data Model reflecting real-world requirements
interface StudentRecord {
  id: string;
  enrollmentNo: string;
  name: string;
  grade: string;
  section: string;
  parentName: string;
  contact: string;
  status: 'Enrolled' | 'Pending Verification' | 'Suspended';
  flags: {
    medical?: string;
    feeDefaulter?: boolean;
    disciplinary?: boolean;
  };
  avatar?: string;
}

const mockStudents: StudentRecord[] = [
  {
    id: 'STU-24-001',
    enrollmentNo: 'DPS/24/1042',
    name: 'Aarav Patel',
    grade: '10',
    section: 'A',
    parentName: 'Rajesh Patel',
    contact: '+91 98765 00001',
    status: 'Enrolled',
    flags: { feeDefaulter: true }
  },
  {
    id: 'STU-24-002',
    enrollmentNo: 'DPS/24/1043',
    name: 'Isha Sharma',
    grade: '10',
    section: 'A',
    parentName: 'Vikram Sharma',
    contact: '+91 98765 00002',
    status: 'Enrolled',
    flags: { medical: 'Severe Peanut Allergy' }
  },
  {
    id: 'STU-24-003',
    enrollmentNo: 'Pending',
    name: 'Kabir Singh',
    grade: '11',
    section: 'Science',
    parentName: 'Anita Singh',
    contact: '+91 98765 00003',
    status: 'Pending Verification',
    flags: {}
  },
  {
    id: 'STU-24-004',
    enrollmentNo: 'DPS/23/0891',
    name: 'Rohan Gupta',
    grade: '9',
    section: 'C',
    parentName: 'Sunil Gupta',
    contact: '+91 98765 00004',
    status: 'Suspended',
    flags: { disciplinary: true, feeDefaulter: true }
  }
];

const StudentDirectory: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <IonPage>
      <IonContent>
        <div className="flex min-h-screen bg-slate-50/50">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

          <div className="flex-1 flex flex-col min-w-0">
            <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

            <main className="flex-1 p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
              
              {/* Premium Page Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
                  <p className="text-slate-500 text-sm mt-1">Manage enrollments, academic profiles, and guardian linkage.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                    <Download size={16} />
                    Export
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
                    <UserPlus size={16} />
                    New Admission
                  </button>
                </div>
              </div>

              {/* Advanced Toolbar */}
              <div className="bg-white p-4 rounded-t-xl border border-slate-200 border-b-0 flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, enrollment no, or parent..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <select className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none hover:bg-slate-50 cursor-pointer">
                    <option>All Grades</option>
                    <option>Grade 9</option>
                    <option>Grade 10</option>
                    <option>Grade 11</option>
                  </select>
                  <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                    <Filter size={16} />
                    More Filters
                  </button>
                </div>
              </div>

              {/* Data-Dense Table */}
              <div className="bg-white border border-slate-200 rounded-b-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-500">
                      <tr>
                        <th className="px-6 py-3.5 font-medium border-b border-slate-200">Student Info</th>
                        <th className="px-6 py-3.5 font-medium border-b border-slate-200">Enrollment No.</th>
                        <th className="px-6 py-3.5 font-medium border-b border-slate-200">Guardian & Contact</th>
                        <th className="px-6 py-3.5 font-medium border-b border-slate-200">Status</th>
                        <th className="px-6 py-3.5 font-medium border-b border-slate-200">Alerts</th>
                        <th className="px-6 py-3.5 font-medium border-b border-slate-200 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mockStudents.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs ring-1 ring-slate-900/5">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">{student.name}</div>
                                <div className="text-slate-500 text-xs mt-0.5">Class {student.grade} - {student.section}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-slate-600">{student.enrollmentNo}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-slate-900">{student.parentName}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{student.contact}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ring-1 ring-inset
                              ${student.status === 'Enrolled' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 
                                student.status === 'Pending Verification' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' : 
                                'bg-rose-50 text-rose-700 ring-rose-600/20'}`}
                            >
                              {student.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {student.flags.medical && (
                                <span title={`Medical Alert: ${student.flags.medical}`} className="cursor-help text-rose-500 bg-rose-50 p-1 rounded">
                                  <AlertCircle size={16} />
                                </span>
                              )}
                              {student.flags.feeDefaulter && (
                                <span title="Fee Defaulter" className="cursor-help text-amber-500 bg-amber-50 p-1 rounded">
                                  <ShieldAlert size={16} />
                                </span>
                              )}
                              {student.flags.disciplinary && (
                                <span title="Disciplinary Flag" className="cursor-help text-slate-700 bg-slate-100 p-1 rounded">
                                  <AlertCircle size={16} />
                                </span>
                              )}
                              {Object.keys(student.flags).length === 0 && <span className="text-slate-300">-</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-slate-400 hover:text-slate-900 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Footer */}
                <div className="bg-slate-50/50 border-t border-slate-200 px-6 py-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500">Showing 1 to 4 of 2,543 students</p>
                  <div className="flex gap-1">
                    <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-white disabled:opacity-50" disabled>Prev</button>
                    <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-white">Next</button>
                  </div>
                </div>
              </div>

            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default StudentDirectory;