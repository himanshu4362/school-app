import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { RootState } from '../../../../store/store';
import { setActiveExamId, setSelectedClassId, setSelectedSubjectId } from '../../../../store/slices/examinationSlice';
import AdminLayout from '../../components/layout/AdminLayout';
import { BookOpen, CheckCircle, Clock, AlertCircle, ChevronRight, Search, Filter, Award } from 'lucide-react';

const MOCK_CLASSES = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const MarksEntryHub: React.FC = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const { exams, activeExamId, selectedClassId, classSubjectsData } = useSelector((state: RootState) => state.examination);
  const [searchQuery, setSearchQuery] = useState('');

  // Active exam details nikalna
  const activeExam = exams.find(e => e.id === activeExamId);

  // Subject click handler (Level 3 Table par le jaane ke liye)
  const handleSubjectClick = (subjectId: string) => {
    dispatch(setSelectedSubjectId(subjectId)); // 🔴 Changed from selectSubject
    // Level 3 page par navigate karenge
    history.push('/admin/examination/evaluate');
  };

  return (
    <AdminLayout
      pageTitle="Marks & Evaluation Hub"
      pageDescription="Track and manage student grades, exams, and teacher evaluations."
      breadcrumbs={[{ label: 'Examination' }, { label: 'Marks Hub' }]}
    >

      {/* 1. EXAM SELECTOR (Level 1) */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 md:p-8 text-white mb-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-blue-300 mb-1 flex items-center gap-2">
            <Award size={14} /> Active Examination Period
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <select
              value={activeExamId || ''}
              onChange={(e) => dispatch(setActiveExamId(e.target.value))}
              className="text-2xl font-black bg-transparent border-b-2 border-blue-400 focus:border-white outline-none cursor-pointer pb-1 appearance-none pr-8"
            >
              {exams.map(ex => (
                <option key={ex.id} value={ex.id} className="text-slate-900 text-sm font-bold">{ex.name}</option>
              ))}
            </select>
          </div>
          <p className="text-sm font-medium text-blue-200 mt-3">
            Select a class below to track evaluation status for {activeExam?.name}.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-sm">
          <div className="text-center px-4 border-r border-white/20">
            <p className="text-3xl font-black">68%</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Evaluated</p>
          </div>
          <div className="text-center px-4">
            <p className="text-3xl font-black text-amber-300">12</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Pending</p>
          </div>
        </div>
      </div>

      {/* 2. CLASS FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">

        {/* Class Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          <Filter size={16} className="text-slate-400 mr-2 shrink-0" />
          {MOCK_CLASSES.map(cls => (
            <button
              key={cls}
              onClick={() => dispatch(setSelectedClassId(cls))}
              className={`px-4 py-2 text-xs font-black whitespace-nowrap rounded-lg transition-all border ${selectedClassId === cls
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
            >
              {cls}
            </button>
          ))}
        </div>

        {/* Subject Search */}
        <div className="w-full md:w-72 relative shrink-0">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subject or teacher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 3. SUBJECT MATRIX (Level 2 Tracking) */}
      {!selectedClassId ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-black text-slate-900 mb-2">Select a Class</h3>
          <p className="text-sm font-bold text-slate-500">Please select a class from the filter above to view subject evaluation status.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classSubjectsData
            .filter(sub => sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) || sub.teacherName.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((subject) => {

              // Status Styling Logic
              const isSubmitted = subject.status === 'submitted';
              const isDraft = subject.status === 'draft';
              const isPending = subject.status === 'pending';

              return (
                <div key={subject.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group overflow-hidden flex flex-col">

                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {subject.subjectName}
                      </h3>
                      <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1.5 ${isSubmitted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                        {isSubmitted && <CheckCircle size={10} />}
                        {isDraft && <Clock size={10} />}
                        {isPending && <AlertCircle size={10} />}
                        {subject.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                      Assigned to: <span className="text-slate-900">{subject.teacherName}</span>
                    </p>
                  </div>

                  {/* Card Footer Action */}
                  <div className="p-4 bg-slate-50 flex-1 flex flex-col justify-end">
                    {subject.lastUpdated && (
                      <p className="text-[10px] font-bold text-slate-400 mb-3 flex items-center gap-1">
                        <Clock size={10} /> Last updated: {subject.lastUpdated}
                      </p>
                    )}
                    <button
                      onClick={() => handleSubjectClick(subject.id)}
                      className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isSubmitted
                          ? 'bg-slate-900 text-white hover:bg-slate-800'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                    >
                      {isSubmitted ? 'Review & Lock Marks' : 'Enter / Edit Marks'}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      )}

    </AdminLayout>
  );
};

export default MarksEntryHub;