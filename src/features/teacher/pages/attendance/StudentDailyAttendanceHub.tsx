import React, { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Save, CheckCircle, AlertTriangle, Calendar, Filter, LayoutList, Smartphone } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { 
  setInstructionalDayType, updateStudentStatus, markAllPresent, commitOfficialRegister,
  setClassContext, InstructionalDayType, StudentDailyStatus 
} from '../../../../store/slices/studentAttendanceSlice';
import TeacherLayout from '../../components/layout/TeacherLayout';
import Breadcrumbs from '../../components/shared/Breadcrumbs';

// Import our new extracted components
import AttendanceGridView from '../../components/attendance/AttendanceGridView';
import AttendanceRapidView from '../../components/attendance/AttendanceRapidView';

const StudentDailyAttendanceHub: React.FC = () => {
  const dispatch = useDispatch();
  
  const { selectedDate, instructionalDayType, classId, sectionId, sessions } = useSelector((state: RootState) => state.studentAttendance);
  const globalStudents = useSelector((state: RootState) => state.student.records); 

  // Get isolated session state for this specific class
  const sessionKey = `${classId}-${sectionId}`;
  const currentSession = sessions[sessionKey] || { draftRegister: {}, isSubmitted: false };
  const { draftRegister, isSubmitted } = currentSession;

  const [viewMode, setViewMode] = useState<'GRID' | 'SERIAL'>('GRID');
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  const classRoster = useMemo(() => {
    return Object.values(globalStudents)
      .filter(s => s.classId === classId && s.sectionId === sectionId && s.status === 'ACTIVE')
      .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
  }, [globalStudents, classId, sectionId]);

  useEffect(() => { setCurrentStudentIndex(0); }, [classId, sectionId]);

  const handleStatusChange = (studentId: string, status: StudentDailyStatus, autoAdvance: boolean = false) => {
    dispatch(updateStudentStatus({ studentId, status }));
    if (autoAdvance && viewMode === 'SERIAL' && currentStudentIndex < classRoster.length - 1) {
      setTimeout(() => setCurrentStudentIndex(prev => prev + 1), 200); 
    }
  };

  const markedCount = Object.keys(draftRegister).length;
  const isComplete = markedCount === classRoster.length && classRoster.length > 0;
  const presentCount = Object.values(draftRegister).filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
  const absentCount = Object.values(draftRegister).filter(r => r.status === 'ABSENT').length;

  return (
    <TeacherLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-4 lg:space-y-6">
        <Breadcrumbs items={[{ label: 'Class Attendance' }]} />

        {/* HEADER CONTROLS */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 lg:gap-6 mb-2">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
              <Users className="text-blue-600" size={28} />
              Daily Official Register
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">{selectedDate}</span>
            </div>
            
            <div className="relative">
              <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={`${classId}-${sectionId}`}
                onChange={(e) => {
                  const [c, s] = e.target.value.split('-');
                  dispatch(setClassContext({ classId: c, sectionId: s }));
                }}
                className="pl-9 pr-4 py-2.5 bg-white border-2 border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl outline-none"
              >
                <option value="10-A">Class 10-A (My Homeroom)</option>
                <option value="10-B">Class 10-B (Proxy)</option>
                <option value="9-A">Class 9-A (Proxy)</option>
              </select>
            </div>
          </div>
        </div>

        {instructionalDayType === 'HOLIDAY' ? (
          <div className="flex-1 bg-white rounded-[32px] border border-orange-200 flex flex-col items-center justify-center p-8 bg-orange-50/30">
            <AlertTriangle size={48} className="text-orange-400 mb-4" />
            <h2 className="text-xl font-black text-orange-900 mb-2">Official Holiday</h2>
          </div>
        ) : (
          <>
            {/* STATS & TOGGLE */}
            <div className="bg-white rounded-[32px] border border-slate-200 p-4 lg:p-6 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex gap-4 lg:gap-6 overflow-x-auto w-full lg:w-auto">
                <div className="text-center min-w-[70px]">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strength</p>
                  <p className="text-xl lg:text-2xl font-black text-slate-800">{classRoster.length}</p>
                </div>
                <div className="text-center min-w-[70px]">
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Present</p>
                  <p className="text-xl lg:text-2xl font-black text-emerald-700">{presentCount}</p>
                </div>
                <div className="text-center min-w-[70px]">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Absent</p>
                  <p className="text-xl lg:text-2xl font-black text-rose-700">{absentCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full lg:w-auto">
                <button onClick={() => setViewMode('GRID')} className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${viewMode === 'GRID' ? 'bg-white shadow-sm' : 'text-slate-500'}`}><LayoutList size={16} className="inline mr-2"/> Grid</button>
                <button onClick={() => setViewMode('SERIAL')} className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${viewMode === 'SERIAL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500'}`}><Smartphone size={16} className="inline mr-2"/> Rapid</button>
              </div>
            </div>

            {/* RENDER DYNAMIC VIEW */}
            <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col relative">
              {viewMode === 'GRID' ? (
                <AttendanceGridView classRoster={classRoster} draftRegister={draftRegister} isSubmitted={isSubmitted} classId={classId} sectionId={sectionId} onStatusChange={handleStatusChange} />
              ) : (
                <AttendanceRapidView classRoster={classRoster} draftRegister={draftRegister} isSubmitted={isSubmitted} currentStudentIndex={currentStudentIndex} setCurrentStudentIndex={setCurrentStudentIndex} onStatusChange={handleStatusChange} />
              )}

              {/* STICKY FOOTER */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center z-20 shrink-0">
                <button onClick={() => dispatch(markAllPresent(classRoster.map(s => s.id)))} disabled={isSubmitted} className="hidden sm:flex text-xs font-black text-slate-500 hover:text-blue-600 disabled:opacity-50 uppercase tracking-widest items-center gap-2"><CheckCircle size={14}/> Mark All Present</button>
                <button onClick={() => dispatch(commitOfficialRegister())} disabled={!isComplete || isSubmitted || classRoster.length === 0} className={`px-6 sm:px-8 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all ${isSubmitted ? 'bg-slate-200 text-slate-400' : !isComplete ? 'bg-blue-300 text-white' : 'bg-blue-600 text-white shadow-lg'}`}>
                  <Save size={16} /> {isSubmitted ? 'Submitted' : 'Submit Register'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </TeacherLayout>
  );
};

export default StudentDailyAttendanceHub;