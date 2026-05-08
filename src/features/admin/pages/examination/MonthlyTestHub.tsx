import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../store/store';
import { setActiveTest, createNewTest, MonthlyTestConfig } from '../../../../store/slices/monthlyTestSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import {
  Plus, Search, Filter, BookOpen, Calendar,
  ChevronRight, Award, X, AlertCircle
} from 'lucide-react';

// Mock Lists for the Form
const CLASSES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SUBJECTS = [
  { id: 'SUB-SCI', name: 'Science' },
  { id: 'SUB-MAT', name: 'Mathematics' },
  { id: 'SUB-ENG', name: 'English' }
];

const MonthlyTestHub: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { tests, selectedClassId } = useSelector((state: RootState) => state.monthlyTest);

  // Local State
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeClassFilter, setActiveClassFilter] = useState(selectedClassId || 'Class 10');

  // Form State for New Test
  const [newTest, setNewTest] = useState({
    title: '',
    subjectId: 'SUB-SCI',
    date: new Date().toISOString().split('T')[0],
    maxMarks: 20,
    passingMarks: 8
  });

  // Handle Create Test Submission
  const handleCreateTest = (e: React.FormEvent) => {
    e.preventDefault();

    if (Number(newTest.passingMarks) > Number(newTest.maxMarks)) {
      alert("Error: Passing Marks cannot be greater than Max Marks!");
      return; // Form ko aage badhne se rok dega
    }

    const subjectName = SUBJECTS.find(s => s.id === newTest.subjectId)?.name || 'Unknown';
    const testId = `MTEST-${Math.floor(Math.random() * 10000)}`;

    const config: MonthlyTestConfig = {
      id: testId,
      title: newTest.title,
      classId: activeClassFilter,
      subjectId: newTest.subjectId,
      subjectName: subjectName,
      date: newTest.date,
      maxMarks: Number(newTest.maxMarks),
      passingMarks: Number(newTest.passingMarks),
      status: 'draft'
    };

    // Dummy students list (real app mein ye backend se aayega class ke basis pe)
    const mockStudents = [
      { id: 'STU-001', rollNo: 1, name: 'Rahul Sharma' },
      { id: 'STU-002', rollNo: 2, name: 'Aarti Singh' },
      { id: 'STU-003', rollNo: 3, name: 'Karan Patel' },
      { id: 'STU-004', rollNo: 4, name: 'Priya Verma' },
    ];

    dispatch(createNewTest({ config, students: mockStudents }));
    setIsCreateModalOpen(false);

    // Reset Form
    setNewTest({ ...newTest, title: '' });
  };

  // Navigate to Data Entry Page
  const handleTestClick = (testId: string) => {
    dispatch(setActiveTest(testId));
    history.push(`/admin/examination/monthly/entry`);
  };

  // Filtered Tests
  const filteredTests = tests.filter(t =>
    t.classId === activeClassFilter &&
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.subjectName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AdminLayout
      pageTitle="Monthly Tests & Quizzes"
      pageDescription="Create and track formative assessments, unit tests, and quizzes."
      breadcrumbs={[{ label: 'Examination', path: '/admin/examination/marks-hub' }, { label: 'Monthly Tests' }]}
      headerActions={
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 shadow-md shadow-blue-900/20"
        >
          <Plus size={16} /> Create New Test
        </button>
      }
    >

      {/* 1. FILTER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
          {CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => setActiveClassFilter(cls)}
              className={`px-4 py-2 text-xs font-black whitespace-nowrap rounded-lg transition-all border ${activeClassFilter === cls
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
            >
              {cls}
            </button>
          ))}
        </div>

        <div className="w-full md:w-72 relative shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search test name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 2. TEST GRID */}
      {filteredTests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2">No Tests Found</h3>
          <p className="text-sm font-bold text-slate-500 mb-6 max-w-sm">There are no monthly tests created for {activeClassFilter} yet. Click the button above to create one.</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-black text-sm hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Plus size={16} /> Create Test
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <div
              key={test.id}
              onClick={() => handleTestClick(test.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group flex flex-col overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border ${test.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                    {test.status === 'completed' ? 'Evaluated' : 'Draft'}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <Calendar size={12} /> {new Date(test.date).toLocaleDateString('en-GB')}
                  </span>
                </div>

                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight mb-2">
                  {test.title}
                </h3>

                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <BookOpen size={14} className="text-blue-500" /> {test.subjectName}
                </p>
              </div>

              <div className="p-4 bg-slate-50 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Max Marks</p>
                  <p className="text-sm font-black text-slate-900">{test.maxMarks}</p>
                </div>
                <div className="h-8 w-px bg-slate-200"></div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Passing</p>
                  <p className="text-sm font-black text-slate-900">{test.passingMarks}</p>
                </div>
                <button className="w-8 h-8 rounded-full bg-white border border-slate-200 text-slate-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white transition-all shadow-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. CREATE TEST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award size={20} className="text-blue-600" /> Create Monthly Test
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTest} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Test Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Chapter 4 Science Quiz"
                  value={newTest.title}
                  onChange={e => setNewTest({ ...newTest, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Subject</label>
                  <select
                    value={newTest.subjectId}
                    onChange={e => setNewTest({ ...newTest, subjectId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm appearance-none"
                  >
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Date</label>
                  <input
                    required
                    type="date"
                    value={newTest.date}
                    onChange={e => setNewTest({ ...newTest, date: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-blue-500" />
                  <span className="text-xs font-black text-blue-900 uppercase tracking-widest">Marking Configuration</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Max Marks</label>
                    <input
                      required
                      type="number" min="1"
                      value={newTest.maxMarks}
                      onChange={e => setNewTest({ ...newTest, maxMarks: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black focus:border-blue-500 outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Passing Marks</label>
                    <input
                      required
                      type="number" min="1"
                      value={newTest.passingMarks}
                      onChange={e => setNewTest({ ...newTest, passingMarks: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black focus:border-blue-500 outline-none shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-blue-600 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
                  Generate Evaluation Sheet <ChevronRight size={16} />
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default MonthlyTestHub;