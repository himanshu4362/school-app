import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { Search, Filter, Download, UserPlus, MoreVertical, ShieldAlert, GraduationCap, Truck, Heart } from 'lucide-react';
import { useHistory } from 'react-router';

const StudentDirectory: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const history = useHistory()

  const headerActions = (
    <>
      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
        <Download size={16} /> Export
      </button>
      <button
       onClick={() => history.push('/admin/students/enroll')}
       className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm">
        <UserPlus size={16} /> New Admission
      </button>
    </>
  );

  return (
    <AdminLayout 
      pageTitle="Student Directory" 
      pageDescription="Master records of all enrolled students and their academic standing."
      headerActions={headerActions}
    >
      {/* 1. Quick Search & Toggle */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by name, ID, or Parent..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 outline-none" />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-700'}`}
        >
          <Filter size={18} /> {showFilters ? 'Hide Filters' : 'Advanced Filters'}
        </button>
      </div>

      {/* 2. Expanded Filter Drawer */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Academic Year</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none"><option>2025-2026</option></select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Blood Group</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none"><option>All Groups</option><option>A+</option><option>O+</option><option>B+</option></select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Bus Route</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none"><option>All Routes</option><option>Route 04 - City Center</option><option>Route 09 - Sector 4</option></select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Fee Status</label>
            <select className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm outline-none"><option>All</option><option>Fully Paid</option><option>Defaulters</option></select>
          </div>
        </div>
      )}

      {/* 3. The Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Student Profile</th>
                <th className="px-6 py-4">ID & House</th>
                <th className="px-6 py-4">Medical / Bus</th>
                <th className="px-6 py-4">Fee Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50 group transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center font-bold text-slate-600">AP</div>
                    <div><p className="font-bold text-slate-900 leading-none">Aarav Patel</p><p className="text-xs text-slate-500 mt-1">Class 10-A</p></div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-mono text-xs text-slate-600">DPS/24/1042</p>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600 uppercase mt-1"><GraduationCap size={12}/> Nehru House</div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-rose-600 text-xs font-medium"><Heart size={14}/> B+ Positive</div>
                    <div className="flex items-center gap-2 text-slate-500 text-xs"><Truck size={14}/> Route 04</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20">Paid</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-slate-900 rounded-lg transition-colors"><MoreVertical size={18}/></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default StudentDirectory;