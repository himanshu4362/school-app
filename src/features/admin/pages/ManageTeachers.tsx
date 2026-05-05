import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { fetchTeachers, Teacher } from '../data/teacherData';
import { Search, Eye, MoreVertical, Plus } from 'lucide-react';

const ManageTeachers: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTeachers();
        setTeachers(data);
      } catch (error) {
        console.error("Failed to fetch teachers", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700 border border-green-200';
      case 'Invited': return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'On Leave': return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'Offboarded': return 'bg-slate-100 text-slate-600 border border-slate-200';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
                  <h1 className="text-2xl font-bold text-slate-800">Staff Directory</h1>
                  <p className="text-slate-500 text-sm">Manage onboarding, profiles, and staff lifecycle.</p>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-64 focus-within:ring-2 focus-within:ring-blue-100">
                    <Search size={18} className="text-slate-400" />
                    <input type="text" placeholder="Search staff..." className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700" />
                  </div>
                  
                  {/* ✅ KEY CHANGE: This button now starts the REAL Appointment Pipeline */}
                  <button
                    onClick={() => history.push('/admin/teachers/new-appointment')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shrink-0 shadow-md"
                  >
                    <Plus size={16} /> New Appointment
                  </button>
                </div>
              </div>

              {/* The table remains the same, showing the status of teachers in the pipeline */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                        <th className="px-6 py-4 font-semibold">Teacher ID</th>
                        <th className="px-6 py-4 font-semibold">Profile</th>
                        <th className="px-6 py-4 font-semibold">Contact</th>
                        <th className="px-6 py-4 font-semibold">System Status</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading directory...</td></tr>
                      ) : (
                        teachers.map((teacher) => (
                          <tr key={teacher.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-slate-600">{teacher.id}</td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-800">{teacher.name}</p>
                              <p className="text-xs text-slate-500">{teacher.department}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-slate-700">{teacher.phone}</p>
                              <p className="text-xs text-slate-500">{teacher.email}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1.5 rounded-md text-xs font-semibold ${getStatusBadge(teacher.status)}`}>
                                {teacher.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Profile">
                                  <Eye size={18} />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition" title="More Actions">
                                  <MoreVertical size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </main>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ManageTeachers;