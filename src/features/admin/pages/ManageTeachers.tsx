// admin/pages/ManageTeachers.tsx

import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { fetchTeachers, Teacher } from '../data/teacherData';
import { Search, Eye, MoreVertical, Plus } from 'lucide-react';

const ManageTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const loadData = async () => {
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
    const styles: Record<string, string> = {
      Active: 'bg-green-100 text-green-700 border-green-200',
      Invited: 'bg-blue-100 text-blue-700 border-blue-200',
      'On Leave': 'bg-orange-100 text-orange-700 border-orange-200',
      Offboarded: 'bg-slate-100 text-slate-600 border-slate-200',
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <AdminLayout 
      pageTitle="Staff Directory" 
      pageDescription="Manage onboarding, profiles, and staff lifecycle."
      headerActions={
        <button
          onClick={() => history.push('/admin/teachers/new-appointment')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-md"
        >
          <Plus size={16} /> New Appointment
        </button>
      }
    >
      <div className="mb-6 flex items-center bg-white border border-slate-200 rounded-lg px-3 py-2 w-full sm:w-64 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        <Search size={18} className="text-slate-400" />
        <input type="text" placeholder="Search staff..." className="bg-transparent border-none outline-none text-sm w-full ml-2 text-slate-700" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">Teacher ID</th>
                <th className="px-6 py-4 font-semibold">Profile</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">System Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Loading directory...</td></tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 font-mono">{teacher.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{teacher.name}</p>
                      <p className="text-xs text-slate-400 uppercase font-black">{teacher.department}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 font-medium">{teacher.phone}</p>
                      <p className="text-xs text-slate-500">{teacher.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusBadge(teacher.status)}`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition" title="View Profile">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ManageTeachers;