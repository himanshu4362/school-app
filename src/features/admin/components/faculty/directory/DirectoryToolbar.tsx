import React from 'react';
import { Search, Filter, LayoutGrid, List, Plus, Download } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../store/store';
import { toggleViewMode, updateSearch, setFilter } from '../../../../../store/slices/facultyDirectorySlice';

const DirectoryToolbar: React.FC = () => {
  const dispatch = useDispatch();
  const { viewMode, searchQuery, filters } = useSelector((state: RootState) => state.facultyDirectory);

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 mb-6">
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        
        {/* 1. Search Engine */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-3 text-slate-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => dispatch(updateSearch(e.target.value))}
            placeholder="Search by Name, ID, or Phone..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl text-sm font-bold transition-all outline-none"
          />
        </div>

        {/* 2. View Toggle & Actions */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button 
              onClick={() => dispatch(toggleViewMode())}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => dispatch(toggleViewMode())}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List size={18} />
            </button>
          </div>
          
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
        <select 
          value={filters.department}
          onChange={(e) => dispatch(setFilter({ key: 'department', value: e.target.value }))}
          className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer hover:text-indigo-600"
        >
          <option value="">All Departments</option>
          <option value="dept-sci">Science</option>
          <option value="dept-hum">Humanities</option>
        </select>

        <select 
          value={filters.workload}
          onChange={(e) => dispatch(setFilter({ key: 'workload', value: e.target.value }))}
          className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer hover:text-indigo-600"
        >
          <option value="">All Workloads</option>
          <option value="balanced">Balanced</option>
          <option value="high_load">High Load</option>
        </select>

        <select 
          value={filters.status}
          onChange={(e) => dispatch(setFilter({ key: 'status', value: e.target.value }))}
          className="bg-transparent text-[11px] font-black uppercase tracking-widest text-slate-500 outline-none cursor-pointer hover:text-indigo-600"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>
    </div>
  );
};

export default DirectoryToolbar;