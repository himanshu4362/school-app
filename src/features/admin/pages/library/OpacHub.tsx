import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, BookMarked, UserCheck, ShieldAlert, X, BookOpen, Clock } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { reserveTitle, clearLibraryErrors, registerBorrower } from '../../../../store/slices/librarySlice';
import AdminLayout from '../../components/layout/AdminLayout';

// 🔴 Safe Fallback Data
const ACTIVE_GRADES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const MOCK_ACTIVE_STUDENTS = [
  { id: 'STU-001', rollNumber: '101', firstName: 'Rahul', lastName: 'Sharma', classId: 'Class 10', sectionId: 'A' },
  { id: 'STU-002', rollNumber: '205', firstName: 'Aarti', lastName: 'Singh', classId: 'Class 12', sectionId: 'Science' },
  { id: 'STU-003', rollNumber: '042', firstName: 'Karan', lastName: 'Patel', classId: 'Class 8', sectionId: 'B' },
  { id: 'STU-004', rollNumber: '102', firstName: 'Priya', lastName: 'Verma', classId: 'Class 10', sectionId: 'A' },
];

const OpacHub: React.FC = () => {
  const dispatch = useDispatch();
  const { titles, copies, borrowers, reservations, transactions, validationErrors } = useSelector((state: RootState) => state.library);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [studentClassFilter, setStudentClassFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [activeBorrowerId, setActiveBorrowerId] = useState<string | null>(null);

  useEffect(() => {
    MOCK_ACTIVE_STUDENTS.forEach(student => {
      if (!borrowers[student.id]) {
        dispatch(registerBorrower({
          id: student.id, borrowerType: 'STUDENT', linkedEntityId: `${student.firstName} ${student.lastName}`,
          status: 'ACTIVE', maxBooksAllowed: 3, maxDaysAllowed: 14, finePerDay: 5, totalPendingFines: 0
        }));
      }
    });
  }, [dispatch, borrowers]);

  const activeBorrower = activeBorrowerId ? borrowers[activeBorrowerId] : null;
  const activeStudentInfo = MOCK_ACTIVE_STUDENTS.find(s => s.id === activeBorrowerId);

  const activeIssues = useMemo(() => {
    if (!activeBorrowerId) return [];
    return transactions
      .filter(t => t.borrowerId === activeBorrowerId && t.type === 'ISSUE')
      .filter(t => !transactions.some(ret => 
        (ret.type === 'RETURN' || ret.type === 'LOST_DECLARED') && ret.copyId === t.copyId && new Date(ret.timestamp) > new Date(t.timestamp)
      ));
  }, [transactions, activeBorrowerId]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch && !studentClassFilter) return [];
    
    return MOCK_ACTIVE_STUDENTS.filter(s => {
      if (studentClassFilter && s.classId !== studentClassFilter) return false;
      if (studentSearch) {
        const q = studentSearch.toLowerCase();
        return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) || s.rollNumber.includes(q);
      }
      return true;
    });
  }, [studentSearch, studentClassFilter]);

  const searchResults = useMemo(() => {
    return Object.values(titles).filter(title => {
      if (categoryFilter && title.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return title.title.toLowerCase().includes(q) || title.author.toLowerCase().includes(q) || (title.isbn && title.isbn.includes(q));
      }
      return true;
    });
  }, [titles, searchQuery, categoryFilter]);

  const getInventoryStats = (titleId: string) => {
    const titleCopies = Object.values(copies).filter(c => c.titleId === titleId);
    const available = titleCopies.filter(c => c.status === 'AVAILABLE').length;
    const waitlist = reservations.filter(r => r.titleId === titleId && !r.assignedCopyId).length;
    return { total: titleCopies.length, available, waitlist };
  };

  const handleReserve = (titleId: string) => {
    if (!activeBorrowerId) return alert("Please search and select a student first.");
    dispatch(reserveTitle({ titleId, borrowerId: activeBorrowerId }));
  };

  const categories = Array.from(new Set(Object.values(titles).map(t => t.category)));

  return (
    <AdminLayout pageTitle="Catalog & Student Portal" pageDescription="Search students, view their active issues, and reserve books." breadcrumbs={[{ label: 'Library Hub' }, { label: 'OPAC Portal' }]}>
      
      {validationErrors.length > 0 && (
        <div className="mb-6 bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl flex items-start justify-between shadow-sm">
          <div className="flex gap-3">
            <ShieldAlert className="text-rose-600 shrink-0 mt-0.5" size={20}/>
            <div>
              <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest">Action Blocked</h4>
              <ul className="mt-1 space-y-1">{validationErrors.map((err, idx) => <li key={idx} className="text-xs font-bold text-rose-700">{err.message}</li>)}</ul>
            </div>
          </div>
          <button onClick={() => dispatch(clearLibraryErrors())} className="text-rose-400 hover:text-rose-700"><X size={20}/></button>
        </div>
      )}

      {/* 1. STUDENT IDENTITY SEARCH */}
      <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-3xl mb-6 shadow-sm">
        {!activeBorrowerId ? (
          <div>
            <h3 className="text-sm font-black text-indigo-900 uppercase tracking-widest flex items-center gap-2 mb-4">
              <UserCheck size={16}/> 1. Identify Student
            </h3>
            
            <div className="flex flex-col md:flex-row gap-4 relative">
              <select 
                value={studentClassFilter} 
                onChange={e => setStudentClassFilter(e.target.value)}
                className="w-full md:w-1/3 p-4 bg-white border border-indigo-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 shadow-sm transition-all"
              >
                <option value="">All Classes</option>
                {ACTIVE_GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </select>

              <div className="relative flex-1">
                <Search className="absolute left-4 top-4 text-indigo-400" size={20} />
                <input 
                  type="text" placeholder="Search by Name or Roll Number..." 
                  value={studentSearch} onChange={e => setStudentSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-indigo-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 shadow-sm transition-all"
                />
              </div>

              {(studentSearch || studentClassFilter) && (
                <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-64 overflow-y-auto custom-scrollbar">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs font-bold text-slate-400">No students found matching filters.</div>
                  ) : (
                    filteredStudents.map(s => (
                      <div 
                        key={s.id} onClick={() => { setActiveBorrowerId(s.id); setStudentSearch(''); setStudentClassFilter(''); }}
                        className="p-4 border-b border-slate-100 last:border-0 hover:bg-indigo-50 cursor-pointer flex justify-between items-center transition-colors"
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900">{s.firstName} {s.lastName}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Roll: {s.rollNumber} • {s.classId}-{s.sectionId}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 animate-in fade-in">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md"><UserCheck size={24}/></div>
                <div>
                  <h4 className="text-lg font-black text-indigo-900">{activeStudentInfo?.firstName} {activeStudentInfo?.lastName}</h4>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-0.5">
                    {activeBorrowerId} • Roll: {activeStudentInfo?.rollNumber} • {activeStudentInfo?.classId}
                  </p>
                </div>
             </div>
             
             <div className="flex gap-4 w-full md:w-auto">
               <div className="bg-white px-4 py-3 rounded-xl border border-indigo-100 flex-1 md:flex-none text-center shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Holdings</p>
                  <p className="text-sm font-black text-indigo-700">{activeIssues.length} / {activeBorrower?.maxBooksAllowed}</p>
               </div>
               <div className="bg-white px-4 py-3 rounded-xl border border-rose-100 flex-1 md:flex-none text-center shadow-sm">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Fines</p>
                  <p className="text-sm font-black text-rose-600">₹{activeBorrower?.totalPendingFines}</p>
               </div>
             </div>

             <button onClick={() => setActiveBorrowerId(null)} className="text-[10px] font-black text-indigo-400 hover:text-indigo-700 uppercase tracking-widest underline underline-offset-4">
               Change Student
             </button>
          </div>
        )}
      </div>

      {/* 2. OPAC SEARCH ENGINE */}
      <div className={`transition-opacity duration-300 ${!activeBorrowerId ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={20} />
            <input 
              type="text" placeholder="Search Catalog by Title, Author, or ISBN..." 
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-base font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="w-full md:w-64">
             <select 
                value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-indigo-500 appearance-none"
             >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {searchResults.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
               <BookMarked size={48} className="mb-4 opacity-50"/>
               <h3 className="text-lg font-black text-slate-500">No books found in catalog.</h3>
            </div>
          ) : (
            searchResults.map(title => {
              const stats = getInventoryStats(title.id);
              const userHasReservation = reservations.some(r => r.titleId === title.id && r.borrowerId === activeBorrowerId && !r.assignedCopyId);

              return (
                <div key={title.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:border-indigo-300 hover:shadow-md transition-all">
                  <div className="flex p-5 gap-5">
                    <div className="w-24 shrink-0">
                      <img src={title.thumbnailUrl || 'https://images.unsplash.com/photo-1543005128-d1b1502c6fd7?q=80&w=200&auto=format&fit=crop'} alt="cover" className="w-full h-36 object-cover rounded-xl shadow-sm border border-slate-100" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest inline-block mb-2">{title.category}</p>
                        <h4 className="text-base font-black text-slate-900 leading-tight mb-1 line-clamp-2">{title.title}</h4>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">By {title.author}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-t border-slate-100 p-5 mt-auto">
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Total</p>
                         <p className="text-sm font-black text-slate-800">{stats.total}</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-sm">
                         <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">Shelf</p>
                         <p className="text-sm font-black text-emerald-600">{stats.available}</p>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-amber-100 shadow-sm">
                         <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-0.5">Waitlist</p>
                         <p className="text-sm font-black text-amber-600">{stats.waitlist}</p>
                      </div>
                    </div>

                    {stats.total === 0 ? (
                      <button disabled className="w-full bg-slate-100 text-slate-400 p-3 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2">
                         <ShieldAlert size={16}/> Not Procured Yet
                      </button>
                    ) : userHasReservation ? (
                      <button disabled className="w-full bg-amber-100 text-amber-700 border border-amber-200 p-3 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2">
                         <Clock size={16}/> Waitlisted
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleReserve(title.id)} 
                        className={`w-full p-3 rounded-xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 shadow-sm transition-all ${stats.available > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-black'}`}
                      >
                        {stats.available > 0 ? <><BookOpen size={16}/> Reserve from Shelf</> : <><Clock size={16}/> Join Waitlist Queue</>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default OpacHub;