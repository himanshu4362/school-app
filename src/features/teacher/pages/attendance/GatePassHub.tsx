import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Home, ChevronRight, LogOut } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { navToGateway, navToStudentSelection, navToDetailsForm } from '../../../../store/slices/gatePassSlice';
import TeacherLayout from '../../components/layout/TeacherLayout';

import ExitClassSelector from '../../components/gate-pass/ExitClassSelector';
import ExitStudentSelector from '../../components/gate-pass/ExitStudentSelector';
import GatePassForm from '../../components/gate-pass/GatePassForm';
import VideoConsentCapture from '../../components/gate-pass/VideoConsentCapture';
import GatePassSuccess from '../../components/gate-pass/GatePassSuccess';

const GatePassHub: React.FC = () => {
  const dispatch = useDispatch();
  
  const { currentStage, activeClassId, activeSectionId } = useSelector((state: RootState) => state.gatePass);
  const globalStudents = useSelector((state: RootState) => state.student.records);

  const classRoster = useMemo(() => {
    return Object.values(globalStudents)
      .filter(s => s.classId === activeClassId && s.sectionId === activeSectionId && s.status === 'ACTIVE')
      .sort((a, b) => parseInt(a.rollNumber) - parseInt(b.rollNumber));
  }, [globalStudents, activeClassId, activeSectionId]);

  // Interactive Breadcrumbs
  const renderBreadcrumbs = () => (
    <div className="flex flex-wrap items-center gap-y-2 gap-x-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 mb-6 bg-slate-50 w-full lg:w-fit px-4 py-3 rounded-xl border border-slate-200 leading-relaxed">
      <button className="flex items-center gap-1 hover:text-rose-600 transition-colors whitespace-nowrap"><Home size={14}/> Dashboard</button>
      <ChevronRight size={14} className="text-slate-300 shrink-0" />
      
      <button onClick={() => dispatch(navToGateway())} className={`hover:text-rose-600 transition-colors whitespace-nowrap ${currentStage === 'GATEWAY' ? 'text-rose-600' : ''}`}>
        Gate Pass
      </button>

      {activeClassId && (
        <>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <button onClick={() => dispatch(navToStudentSelection({ classId: activeClassId, sectionId: activeSectionId! }))} className={`hover:text-rose-600 transition-colors whitespace-nowrap ${currentStage === 'SELECT_STUDENT' ? 'text-rose-600' : ''}`}>
            Class {activeClassId}-{activeSectionId}
          </button>
        </>
      )}

      {currentStage === 'FILL_DETAILS' && (
        <>
          <ChevronRight size={14} className="text-slate-300 shrink-0" />
          <span className="text-rose-600 whitespace-nowrap">Incident Details</span>
        </>
      )}
    </div>
  );

  return (
    <TeacherLayout>
      <div className="w-full max-w-[1400px] mx-auto p-4 lg:p-8 flex flex-col h-full space-y-4 lg:space-y-6">
        
        {renderBreadcrumbs()}

        {currentStage === 'GATEWAY' && (
          <div className="mb-2">
            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 flex items-center gap-3">
              <LogOut className="text-rose-600" size={28} />
              Issue Gate Pass
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Authorize temporary early departure during school hours.</p>
          </div>
        )}

        {/* Routing directly from the new Gate Pass actions */}
        {currentStage === 'GATEWAY' && <ExitClassSelector onSelectClass={(c, s) => dispatch(navToStudentSelection({ classId: c, sectionId: s }))} />}
        {currentStage === 'SELECT_STUDENT' && <ExitStudentSelector classRoster={classRoster} onSelectStudent={(id) => dispatch(navToDetailsForm(id))} />}
        
        {currentStage === 'FILL_DETAILS' && <GatePassForm />}
        {currentStage === 'VIDEO_CONSENT' && <VideoConsentCapture />}
        {currentStage === 'SUCCESS' && <GatePassSuccess />}

      </div>
    </TeacherLayout>
  );
};

export default GatePassHub;