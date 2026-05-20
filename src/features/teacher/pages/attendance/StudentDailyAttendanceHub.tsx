import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Calendar, ChevronRight, Home } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { navToGateway, navToPreFlight } from '../../../../store/slices/studentAttendanceSlice';
import TeacherLayout from '../../components/layout/TeacherLayout';

import ClassSelectionBoard from '../../components/attendance/ClassSelectionBoard';
import PreFlightScreen from '../../components/attendance/PreFlightScreen';
import ActiveAttendanceSession from '../../components/attendance/ActiveAttendanceSession'; 
import PostSubmissionLockScreen from '../../components/attendance/PostSubmissionLockScreen'; 

const StudentDailyAttendanceHub: React.FC = () => {
  const dispatch = useDispatch();
  
  const { currentStage, activeClassId, activeSectionId, selectedDate, sessions } = useSelector((state: RootState) => state.studentAttendance);
  const globalStudents = useSelector((state: RootState) => state.student.records);

  // Derive Roster Data
  const classRoster = useMemo(() => {
    return Object.values(globalStudents)
      .filter(s => s.classId === activeClassId && s.sectionId === activeSectionId && s.status === 'ACTIVE')
      .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
  }, [globalStudents, activeClassId, activeSectionId]);

  const sessionKey = activeClassId && activeSectionId ? `${activeClassId}-${activeSectionId}` : null;
  const currentSession = sessionKey ? sessions[sessionKey] : null;
  const markedCount = currentSession ? Object.keys(currentSession.draftRegister).length : 0;

  //   INTERACTIVE BREADCRUMB BUILDER
  //   INTERACTIVE BREADCRUMB BUILDER (FIXED WRAPPING)
  const renderBreadcrumbs = () => (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-6 bg-slate-50 w-full lg:w-fit px-4 py-3 rounded-xl border border-slate-200 leading-relaxed">
      <button className="flex items-center gap-1 hover:text-blue-600 transition-colors whitespace-nowrap"><Home size={14}/> Dashboard</button>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      
      <button 
        onClick={() => dispatch(navToGateway())} 
        className={`hover:text-blue-600 transition-colors whitespace-nowrap ${currentStage === 'GATEWAY' ? 'text-blue-600' : ''}`}
      >
        Class Select
      </button>

      {activeClassId && (
        <>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <button 
            onClick={() => dispatch(navToPreFlight({ classId: activeClassId, sectionId: activeSectionId! }))}
            className={`hover:text-blue-600 transition-colors whitespace-nowrap ${(currentStage === 'PRE_FLIGHT' || currentStage === 'POST_SUBMISSION') ? 'text-blue-600' : ''}`}
          >
            Class {activeClassId}-{activeSectionId}
          </button>
        </>
      )}

      {currentStage === 'ACTIVE' && (
        <>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <span className="text-emerald-500 whitespace-nowrap">Live Session</span>
        </>
      )}
    </div>
  );
  
  return (
    <TeacherLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-4 lg:space-y-6">
        
        {renderBreadcrumbs()}

        {/* HEADER */}
        {currentStage === 'GATEWAY' && (
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
                <Users className="text-blue-600" size={28} />
                Daily Official Register
              </h1>
              <p className="mt-1 text-sm font-semibold text-slate-500">Select a class to begin the attendance session.</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl flex items-center gap-2 shrink-0">
              <Calendar size={16} className="text-slate-400" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">{selectedDate}</span>
            </div>
          </div>
        )}

        {/* ROUTER VIEWS */}
        {currentStage === 'GATEWAY' && <ClassSelectionBoard onSelectClass={(c, s) => dispatch(navToPreFlight({ classId: c, sectionId: s }))} />}
        
        {currentStage === 'PRE_FLIGHT' && activeClassId && (
          <PreFlightScreen classId={activeClassId} sectionId={activeSectionId!} classRoster={classRoster} sessionStatus={currentSession?.status || 'PENDING'} markedCount={markedCount} />
        )}
        
        {currentStage === 'ACTIVE' && <ActiveAttendanceSession />}
        
        {currentStage === 'POST_SUBMISSION' && <PostSubmissionLockScreen />}
        
      </div>
    </TeacherLayout>
  );
};

export default StudentDailyAttendanceHub;