import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
import { startAttendanceSession } from '../../../../store/slices/studentAttendanceSlice';
import TeacherLayout from '../../components/layout/TeacherLayout';
import Breadcrumbs from '../../components/shared/Breadcrumbs';

import ClassSelectionBoard from '../../components/attendance/ClassSelectionBoard';
import ActiveAttendanceSession from '../../components/attendance/ActiveAttendanceSession'; 
import PostSubmissionLockScreen from '../../components/attendance/PostSubmissionLockScreen'; 

const StudentDailyAttendanceHub: React.FC = () => {
  const dispatch = useDispatch();
  const { activeClassId, activeSectionId, sessions } = useSelector((state: RootState) => state.studentAttendance);

  const handleSelectClass = (classId: string, sectionId: string) => {
    dispatch(startAttendanceSession({ classId, sectionId }));
  };

  const sessionKey = activeClassId && activeSectionId ? `${activeClassId}-${activeSectionId}` : null;
  const activeSession = sessionKey ? sessions[sessionKey] : null;
  
  let currentView = 'GATEWAY';
  if (activeSession) {
    if (activeSession.status === 'IN_PROGRESS') currentView = 'ACTIVE_SESSION';
    else if (activeSession.status === 'SUBMITTED' || activeSession.status === 'LOCKED') currentView = 'POST_SUBMISSION';
  }

  // 🟢 DYNAMIC BREADCRUMBS (Professional Detail)
  const breadcrumbItems = [{ label: 'Class Attendance' }];
  if (currentView !== 'GATEWAY') {
    breadcrumbItems.push({ label: `Class ${activeClassId}-${activeSectionId}` });
  }

  return (
    <TeacherLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-4 lg:space-y-6">
        <Breadcrumbs items={breadcrumbItems} />

        {currentView === 'GATEWAY' && (
          <div className="mb-4">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900">Daily Official Register</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Select a class to begin the official attendance session.</p>
          </div>
        )}

        {currentView === 'GATEWAY' && <ClassSelectionBoard onSelectClass={handleSelectClass} />}
        {currentView === 'ACTIVE_SESSION' && <ActiveAttendanceSession />}
        {currentView === 'POST_SUBMISSION' && <PostSubmissionLockScreen />}
      </div>
    </TeacherLayout>
  );
};

export default StudentDailyAttendanceHub;