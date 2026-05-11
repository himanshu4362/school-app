import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ClipboardCheck, Save, Search, AlertCircle } from 'lucide-react';
import { RootState } from '../../../../store/store';
import TeacherLayout from '../../components/layout/TeacherLayout';
import Breadcrumbs from '../../components/shared/Breadcrumbs';

// Mock Constants
const LOGGED_IN_TEACHER_ID = 'EMP-001'; 
const MOCK_EXAMS = [
  { id: 'EXAM-1', name: 'Monthly Test - August', maxMarks: 20 },
  { id: 'EXAM-2', name: 'Term 1 Final', maxMarks: 80 }
];

const TeacherMarksEntryHub: React.FC = () => {
  const [selectedAllocation, setSelectedAllocation] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [marksData, setMarksData] = useState<Record<string, number | ''>>({});

  // Global Data
  const allocations = useSelector((state: RootState) => state.academic.allocations);
  const subjects = useSelector((state: RootState) => state.academic.subjects);
  const allStudents = useSelector((state: RootState) => state.student.records);

  // Derive Teacher's Subjects
  const myAllocations = useMemo(() => {
    return allocations.filter(a => a.facultyId === LOGGED_IN_TEACHER_ID);
  }, [allocations]);

  // Derive Roster based on selected allocation
  const currentRoster = useMemo(() => {
    if (!selectedAllocation) return [];
    const allocation = myAllocations.find(a => a.id === selectedAllocation);
    if (!allocation) return [];

    return Object.values(allStudents).filter(student => 
      student.classId === allocation.classId &&
      student.sectionId === allocation.sectionId &&
      student.status === 'ACTIVE'
    ).sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
  }, [selectedAllocation, myAllocations, allStudents]);

  // Handlers
  const handleMarkChange = (studentId: string, value: string) => {
    const activeExam = MOCK_EXAMS.find(e => e.id === selectedExam);
    const maxMarks = activeExam ? activeExam.maxMarks : 100;
    
    let numericValue = parseInt(value);
    if (value === '') {
      setMarksData(prev => ({ ...prev, [studentId]: '' }));
      return;
    }
    
    if (!isNaN(numericValue) && numericValue >= 0 && numericValue <= maxMarks) {
      setMarksData(prev => ({ ...prev, [studentId]: numericValue }));
    }
  };

  const handleSave = () => {
    if (window.confirm("Are you sure you want to commit these marks to the Admin evaluation table?")) {
      alert("Marks successfully submitted!");
      // In a real app, dispatch to Redux here
    }
  };

  const activeExamDetails = MOCK_EXAMS.find(e => e.id === selectedExam);

  return (
    <TeacherLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto w-full flex flex-col h-full">
        
        {/* BREADCRUMBS ADDED HERE */}
        <Breadcrumbs items={[
          { label: 'Examinations', path: '/teacher/examinations' },
          { label: 'Marks Entry' }
        ]} />

        {/* HEADER */}
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <ClipboardCheck className="text-blue-600" size={28} />
              Marks Entry Hub
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-1">Select an allocation and exam to input student grades.</p>
          </div>
          
          {currentRoster.length > 0 && selectedExam && (
            <button onClick={handleSave} className="hidden md:flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg">
              <Save size={16} /> Submit Marks
            </button>
          )}
        </div>

        {/* CONTROLS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Allocation Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">1. Select Class & Subject</label>
            <select 
              value={selectedAllocation} 
              onChange={(e) => { setSelectedAllocation(e.target.value); setMarksData({}); }}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="">-- Choose Allocation --</option>
              {myAllocations.map(alloc => (
                <option key={alloc.id} value={alloc.id}>
                  Class {alloc.classId}-{alloc.sectionId} • {subjects[alloc.subjectId]?.name || alloc.subjectId}
                </option>
              ))}
            </select>
          </div>

          {/* Exam Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">2. Select Examination</label>
            <select 
              value={selectedExam} 
              onChange={(e) => setSelectedExam(e.target.value)}
              disabled={!selectedAllocation}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">-- Choose Exam --</option>
              {MOCK_EXAMS.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} (Max: {exam.maxMarks})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* DATA GRID */}
        {!selectedAllocation || !selectedExam ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 p-8 text-center">
            <AlertCircle size={40} className="text-slate-300 mb-3" />
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Waiting for Selection</h3>
            <p className="text-xs font-bold text-slate-400">Please select a class and an examination from the menus above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            
            {/* Grid Toolbar */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search student..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold w-64 outline-none focus:border-blue-500"
                />
              </div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Max Marks: <span className="text-blue-600">{activeExamDetails?.maxMarks}</span>
              </div>
            </div>

            {/* Student List */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="bg-slate-900 text-white p-4 w-20 text-center text-[10px] font-black uppercase tracking-widest">Roll</th>
                    <th className="bg-slate-900 text-white p-4 text-[10px] font-black uppercase tracking-widest">Student Name</th>
                    <th className="bg-slate-900 text-white p-4 w-32 text-center text-[10px] font-black uppercase tracking-widest">ID Number</th>
                    <th className="bg-slate-900 text-white p-4 w-48 text-right pr-8 text-[10px] font-black uppercase tracking-widest">Marks Obtained</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRoster.filter(s => 
                    s.firstName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    s.lastName.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((student, index) => (
                    <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="p-4 border-b border-slate-100 text-center font-black text-slate-500">{student.rollNumber}</td>
                      <td className="p-4 border-b border-slate-100">
                        <p className="text-sm font-black text-slate-800">{student.firstName} {student.lastName}</p>
                      </td>
                      <td className="p-4 border-b border-slate-100 text-center">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{student.id}</span>
                      </td>
                      <td className="p-4 border-b border-slate-100 text-right pr-6">
                        <input 
                          type="number"
                          min="0"
                          max={activeExamDetails?.maxMarks}
                          value={marksData[student.id] !== undefined ? marksData[student.id] : ''}
                          onChange={(e) => handleMarkChange(student.id, e.target.value)}
                          className="w-24 p-2 text-center bg-white border-2 border-slate-200 rounded-xl text-sm font-black text-blue-700 outline-none focus:border-blue-500 focus:bg-blue-50 transition-all placeholder:text-slate-300 placeholder:font-normal"
                          placeholder="---"
                        />
                      </td>
                    </tr>
                  ))}
                  {currentRoster.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs font-bold text-slate-400">No active students found in this section.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Submit Button */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 md:hidden">
               <button onClick={handleSave} className="w-full flex justify-center items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest">
                <Save size={16} /> Submit Marks
              </button>
            </div>

          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

export default TeacherMarksEntryHub;