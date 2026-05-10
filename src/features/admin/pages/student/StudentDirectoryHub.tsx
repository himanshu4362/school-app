import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Search, Filter, GraduationCap, Archive, MoreVertical, FileText, ArrowRightCircle, Wallet } from 'lucide-react';
import { useHistory } from 'react-router-dom';

import { RootState } from '../../../../store/store';
import { setDirectoryTab, setFilters, toggleSelection, selectAll, clearSelection } from '../../../../store/slices/studentSlice';
import AdminLayout from '../../components/layout/AdminLayout';

const MOCK_CLASSES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const MOCK_SECTIONS = ['A', 'B', 'Science', 'Commerce'];

const StudentDirectoryHub: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { records, activeTab, searchQuery, filterClass, filterSection, selectedIds } = useSelector((state: RootState) => state.student);

  // ==========================================
  // SMART FILTERING ENGINE
  // ==========================================
  const filteredStudents = useMemo(() => {
    return Object.values(records).filter(student => {
      // 1. Tab State Filter (Tri-State Segregation)
      if (activeTab === 'ACTIVE' && !['ACTIVE', 'EXIT_PENDING'].includes(student.status)) return false;
      if (activeTab === 'ALUMNI' && student.status !== 'ALUMNI') return false;
      if (activeTab === 'ARCHIVED' && student.status !== 'ARCHIVED') return false;

      // 2. Dropdown Filters
      if (filterClass && student.classId !== filterClass) return false;
      if (filterSection && student.sectionId !== filterSection) return false;

      // 3. Global Search (Name, Roll, Parent, Phone)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const searchString = `${student.firstName} ${student.lastName} ${student.rollNumber} ${student.parentName} ${student.parentPhone}`.toLowerCase();
        if (!searchString.includes(q)) return false;
      }

      return true;
    });
  }, [records, activeTab, searchQuery, filterClass, filterSection]);

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      dispatch(clearSelection());
    } else {
      dispatch(selectAll(filteredStudents.map(s => s.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-800';
      case 'EXIT_PENDING': return 'bg-amber-100 text-amber-800';
      case 'ALUMNI': return 'bg-purple-100 text-purple-800';
      case 'ARCHIVED': return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <AdminLayout pageTitle="Student Directory" pageDescription="Master database of all active scholars, alumni, and archived records." breadcrumbs={[{ label: 'Students & Alumni' }, { label: 'Active Directory' }]}>
      
      {/* ========================================== */}
      {/* TRI-STATE TABS */}
      {/* ========================================== */}
      <div className="flex gap-4 mb-6 border-b border-slate-200">
        <button onClick={() => dispatch(setDirectoryTab('ACTIVE'))} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ACTIVE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Users size={16}/> Active Scholars
        </button>
        <button onClick={() => dispatch(setDirectoryTab('ALUMNI'))} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ALUMNI' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <GraduationCap size={16}/> Alumni Network
        </button>
        <button onClick={() => dispatch(setDirectoryTab('ARCHIVED'))} className={`pb-3 text-sm font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === 'ARCHIVED' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
          <Archive size={16}/> Archived Vault
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        
        {/* ========================================== */}
        {/* TOP TOOLBAR (Search & Filters) */}
        {/* ========================================== */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, roll, or parent phone..." 
              value={searchQuery}
              onChange={(e) => dispatch(setFilters({ search: e.target.value, classId: filterClass, sectionId: filterSection }))}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-40">
              <Filter className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <select 
                value={filterClass} 
                onChange={(e) => dispatch(setFilters({ search: searchQuery, classId: e.target.value, sectionId: filterSection }))}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Classes</option>
                {MOCK_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="relative flex-1 md:w-40">
              <select 
                value={filterSection} 
                onChange={(e) => dispatch(setFilters({ search: searchQuery, classId: filterClass, sectionId: e.target.value }))}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 appearance-none"
              >
                <option value="">All Sections</option>
                {MOCK_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* BULK ACTION BANNER */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex justify-between items-center shrink-0">
            <span className="text-xs font-black text-indigo-800 uppercase tracking-widest">{selectedIds.length} Students Selected</span>
            <button className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-700">
               Bulk Action Options
            </button>
          </div>
        )}

        {/* ========================================== */}
        {/* DATA GRID */}
        {/* ========================================== */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="p-4 border-b border-slate-200 w-12">
                  <input 
                    type="checkbox" 
                    checked={filteredStudents.length > 0 && selectedIds.length === filteredStudents.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="p-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="p-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class & Section</th>
                <th className="p-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Contact</th>
                <th className="p-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-4 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-3 opacity-20"/>
                    <p className="text-sm font-bold">No students found matching current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className={`hover:bg-slate-50 transition-colors ${selectedIds.includes(student.id) ? 'bg-indigo-50/50' : ''}`}>
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(student.id)}
                        onChange={() => dispatch(toggleSelection(student.id))}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-black text-slate-900">{student.firstName} {student.lastName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Roll: {student.rollNumber} • {student.admissionNumber}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-900">{student.classId}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Section {student.sectionId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-xs font-bold text-slate-900">{student.parentName}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{student.parentPhone}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${getStatusBadge(student.status)}`}>
                        {student.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {/* ACTION HUB (The Gateways) */}
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Profile Dossier">
                          <FileText size={16}/>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Open Finance Ledger">
                          <Wallet size={16}/>
                        </button>
                        {activeTab === 'ACTIVE' && (
                          <button 
                            onClick={() => history.push('/admin/student/exits')}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Trigger Offboarding Pipeline"
                          >
                            <ArrowRightCircle size={16}/>
                          </button>
                        )}
                      </div>
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

export default StudentDirectoryHub;