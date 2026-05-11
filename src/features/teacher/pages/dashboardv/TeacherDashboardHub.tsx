import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { Clock, Play, CheckCircle2, AlertTriangle, BookOpen, Coffee, LayoutDashboard } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { claimSession } from '../../../../store/slices/executionSlice';

// --- MOCK CONSTANTS FOR PROTOTYPING ---
const LOGGED_IN_TEACHER_ID = 'EMP-001'; // Ravi Verma
const CURRENT_DAY = 'Monday';
const CURRENT_DATE = new Date().toISOString().split('T')[0]; // "2026-05-11"

const PERIOD_TIMES: Record<string, { start: string, end: string }> = {
  1: { start: '08:00', end: '08:45' },
  2: { start: '08:45', end: '09:30' },
  3: { start: '09:30', end: '10:15' },
  4: { start: '10:15', end: '11:00' },
  'RECESS': { start: '11:00', end: '11:30' },
  5: { start: '11:30', end: '12:15' },
  6: { start: '12:15', end: '13:00' },
  7: { start: '13:00', end: '13:45' },
  8: { start: '13:45', end: '14:30' }
};

const TeacherDashboardHub: React.FC = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  // 1. Pull Global State
  const { timetable, allocations, subjects } = useSelector((state: RootState) => state.academic);
  const { sessions, policies } = useSelector((state: RootState) => state.execution);

  // 2. Simulated System Clock (To test time-window policies)
  const [simulatedTime, setSimulatedTime] = useState('08:30');

  // 3. Derive Today's Schedule for this specific Teacher
  const todaysSchedule = useMemo(() => {
    // A. Find all allocations for this teacher
    const myAllocationIds = allocations.filter(a => a.facultyId === LOGGED_IN_TEACHER_ID).map(a => a.id);
    
    // B. Find Monday's timetable slots that use my allocations
    const myPeriods = timetable.filter(t => t.dayOfWeek.toUpperCase() === CURRENT_DAY.toUpperCase() && myAllocationIds.includes(t.allocationId));
    
    // C. Map them into the Timeline structure
    return [1, 2, 3, 4, 'RECESS', 5, 6, 7, 8].map(pNum => {
      if (pNum === 'RECESS') return { type: 'BREAK', periodNumber: 'RECESS' };

      const scheduledClass = myPeriods.find(p => p.periodNumber === pNum);
      if (!scheduledClass) return { type: 'LEISURE', periodNumber: pNum };

      const allocation = allocations.find(a => a.id === scheduledClass.allocationId);
      const subject = subjects[allocation!.subjectId];

      return {
        type: 'CLASS',
        periodNumber: pNum,
        timetablePeriodId: scheduledClass.id,
        allocation,
        subject
      };
    });
  }, [timetable, allocations, subjects]);

  // 4. Time Window Evaluation Engine
  const evaluateSessionState = (periodNumber: number | string, timetablePeriodId?: string, allocationId?: string) => {
    if (periodNumber === 'RECESS' || !timetablePeriodId || !allocationId) return null;

    // Deterministic Session ID for today
    const sessionId = `SESSION-${CURRENT_DATE}-${timetablePeriodId}`;
    const existingSession = sessions[sessionId];

    if (existingSession) return existingSession; // It's already claimed, return Redux state

    // Otherwise, evaluate based on the Simulated Clock
    const pTimes = PERIOD_TIMES[periodNumber];
    
    // Convert HH:MM to comparable minutes
    const timeToMins = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const currentMins = timeToMins(simulatedTime);
    const startMins = timeToMins(pTimes.start) - 5; // Policy: Open 5 mins early
    const endMins = timeToMins(pTimes.end) + policies.lateStartThresholdMinutes; // Policy: Grace period

    if (currentMins < startMins) return { status: 'UPCOMING' };
    if (currentMins >= startMins && currentMins <= endMins) return { status: 'ACTIVE' };
    return { status: 'MISSED' }; // The time window has officially closed
  };

  // 5. Action: Claiming the Session Lock
  const handleStartClass = (timetablePeriodId: string, allocationId: string, subjectName: string, className: string, sectionName: string) => {
    const sessionId = `SESSION-${CURRENT_DATE}-${timetablePeriodId}`;
    
    // Check if it exists. If not, we officially initiate it.
    if (!sessions[sessionId]) {
      dispatch(claimSession({
        session: {
          id: sessionId,
          version: 1,
          allocationId,
          timetablePeriodId,
          date: CURRENT_DATE,
          originalTeacherId: LOGGED_IN_TEACHER_ID,
          activeDeviceSessionId: navigator.userAgent, // Mock device ID
          subjectNameSnapshot: subjectName,
          classNameSnapshot: className,
          sectionNameSnapshot: sectionName,
          periodNameSnapshot: `Period ${timetablePeriodId}`,
          status: 'UPCOMING',
          attendanceSnapshot: {},
          syllabusCoverage: [],
          resourcesUsed: [],
          lateStartFlag: false,
          syncStatus: 'DRAFT',
          interruptionReason: 'NONE', 
          escalationFlags: []
        },
        deviceId: navigator.userAgent,
        currentTime: new Date().toISOString()
      }));
    }

    // Route to Strike 3: The Execution Cockpit (Next step!)
    history.push(`/teacher/execution/cockpit/${sessionId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* HEADER */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><LayoutDashboard size={20}/></div>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">Execution Engine</h1>
            <p className="text-[10px] text-slate-400 font-bold">Ravi Verma • {CURRENT_DAY}, {CURRENT_DATE}</p>
          </div>
        </div>

        {/* 🧪 SIMULATED SYSTEM CLOCK */}
        <div className="bg-slate-800 border border-slate-700 p-2 rounded-xl flex items-center gap-3">
          <Clock size={16} className="text-emerald-400"/>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Time:</span>
          <input 
            type="time" 
            value={simulatedTime} 
            onChange={(e) => setSimulatedTime(e.target.value)}
            className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm font-bold text-emerald-400 outline-none"
          />
        </div>
      </header>

      {/* TIMELINE BODY */}
      <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Today's Timeline</h2>
            <p className="text-sm font-bold text-slate-500 mt-1">Review your scheduled sessions and launch active classes.</p>
          </div>
        </div>

        <div className="space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
          
          {todaysSchedule.map((slot, index) => {
            const times = PERIOD_TIMES[slot.periodNumber as string];
            
            if (slot.type === 'BREAK' || slot.type === 'LEISURE') {
              return (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 bg-slate-100 text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {slot.type === 'BREAK' ? <Coffee size={18}/> : <Clock size={18}/>}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-2xl bg-white border border-slate-200 shadow-sm opacity-60">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{times?.start} - {times?.end}</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-600 uppercase">{slot.type}</h3>
                  </div>
                </div>
              );
            }

            // It's a real class. Evaluate its state machine logic.
            const sessionState = evaluateSessionState(slot.periodNumber, slot.timetablePeriodId, slot.allocation?.id);
            const isMissed = sessionState?.status === 'MISSED';
            const isActive = sessionState?.status === 'ACTIVE';
            const isDraft = sessionState?.status === 'IN_PROGRESS';
            const isCompleted = sessionState?.status === 'COMPLETED';

            return (
              <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                {/* TIMELINE NODE */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors
                  ${isCompleted ? 'bg-emerald-500 text-white' : isDraft ? 'bg-blue-500 text-white' : isMissed ? 'bg-rose-500 text-white' : isActive ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-slate-300'}`}
                >
                  {isCompleted ? <CheckCircle2 size={20}/> : isMissed ? <AlertTriangle size={20}/> : <BookOpen size={20}/>}
                </div>

                {/* CARD CONTENT */}
                <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 rounded-2xl border-2 shadow-sm transition-all
                  ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-indigo-100' : isDraft ? 'bg-blue-50 border-blue-200' : isMissed ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{times?.start} - {times?.end} • P{slot.periodNumber}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest 
                      ${isCompleted ? 'bg-emerald-100 text-emerald-700' : isDraft ? 'bg-blue-100 text-blue-700' : isMissed ? 'bg-rose-100 text-rose-700' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {sessionState?.status}
                    </span>
                  </div>
                  
                  <h3 className={`text-lg font-black mb-1 ${isMissed ? 'text-rose-900' : 'text-slate-900'}`}>{slot.subject?.name}</h3>
                  <p className="text-xs font-bold text-slate-500 mb-4">{slot.allocation?.classId} - Section {slot.allocation?.sectionId}</p>

                  {/* DYNAMIC ACTION BUTTONS */}
                  {isActive && (
                    <button onClick={() => handleStartClass(slot.timetablePeriodId!, slot.allocation!.id, slot.subject!.name, slot.allocation!.classId, slot.allocation!.sectionId)} 
                            className="w-full bg-indigo-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 shadow-md">
                      <Play size={16}/> Start Session
                    </button>
                  )}
                  
                  {isDraft && (
                    <button onClick={() => history.push(`/teacher/execution/cockpit/SESSION-${CURRENT_DATE}-${slot.timetablePeriodId}`)} 
                            className="w-full bg-blue-600 text-white p-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-md">
                      <Play size={16}/> Resume Draft Session
                    </button>
                  )}

                  {isMissed && (
                    <div className="text-[10px] font-bold text-rose-600 bg-rose-100 p-2 rounded-lg text-center flex items-center justify-center gap-2">
                       <AlertTriangle size={14}/> Time window expired. Needs Admin override.
                    </div>
                  )}

                  {isCompleted && (
                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 p-2 rounded-lg text-center flex items-center justify-center gap-2">
                       <CheckCircle2 size={14}/> Session data committed securely.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboardHub;