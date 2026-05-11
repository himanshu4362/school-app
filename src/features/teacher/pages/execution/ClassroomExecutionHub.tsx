import React, { useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Save, CheckCircle, AlertOctagon, UserCheck, UserX, BookOpen, Clock } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { updateDraftPayload, commitSession, interruptSession } from '../../../../store/slices/executionSlice';
import { AttendanceStatus, CoverageStatus } from '../../../../types/execution/execution.schema';

const MOCK_SYLLABUS_TOPICS = [
  { id: 'TOPIC-1', name: 'Introduction to Core Concepts' },
  { id: 'TOPIC-2', name: 'Advanced Formulations & Equations' },
  { id: 'TOPIC-3', name: 'Practical Applications & Lab Prep' },
];

const ClassroomExecutionHub: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const history = useHistory();
  const dispatch = useDispatch();

  const allStudents = useSelector((state: RootState) => state.student.records);

  const session = useSelector((state: RootState) => state.execution.sessions[sessionId]);
  useEffect(() => {
    if (!session || (session.status !== 'IN_PROGRESS' && session.status !== 'COMPLETED')) {
      history.replace('/teacher');
    }
  }, [session, history]);

  const classRoster = useMemo(() => {
    if (!session) return [];
    
    return Object.values(allStudents).filter(student => 
      student.classId === session.classNameSnapshot &&
      student.sectionId === session.sectionNameSnapshot &&
      student.status === 'ACTIVE' // Security Check: Never show Exited/Alumni students in daily attendance
    );
  }, [allStudents, session]);


  if (!session) return null;

  const isLocked = session.status === 'COMPLETED';

  // --- HANDLERS FOR DRAFTING ---
  const handleAttendanceToggle = (studentId: string, currentStatus: AttendanceStatus) => {
    if (isLocked) return;
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : currentStatus === 'ABSENT' ? 'LATE' : 'PRESENT';

    dispatch(updateDraftPayload({
      sessionId,
      attendance: { ...session.attendanceSnapshot, [studentId]: newStatus }
    }));
  };

  const handleSyllabusChange = (
    topicId: string,
    status: CoverageStatus
  ) => {
    if (isLocked) return;

    const existing = [...session.syllabusCoverage];

    const index = existing.findIndex(t => t.topicId === topicId);

    if (index >= 0) {
      existing[index] = { ...existing[index], status };
    } else {
      existing.push({ topicId, status });
    }

    dispatch(updateDraftPayload({
      sessionId,
      syllabusCoverage: existing
    }));
  };

  const handleHomeworkChange = (text: string) => {
    if (isLocked) return;

    dispatch(updateDraftPayload({
      sessionId,
      homeworkAssigned: text
    }));
  };

  // --- HANDLERS FOR EXECUTION LAWS ---
  const handleCommit = () => {
    if (window.confirm("Are you sure? Committing will lock this session and transmit it to the Admin portal.")) {
      dispatch(commitSession({ sessionId, commitTime: new Date().toISOString() }));
      alert("Session Successfully Committed!");
      history.push('/teacher');
    }
  };

  const handleInterrupt = () => {
    if (window.confirm("Is this an emergency or technical failure? This will abort the active session.")) {
      dispatch(interruptSession({ sessionId, reason: 'EMERGENCY', time: new Date().toISOString() }));
      history.push('/teacher');
    }
  };

  // Calculations for UI
  const presentCount = Object.values(session.attendanceSnapshot).filter(s => s === 'PRESENT' || s === 'LATE').length;
  const totalCount = classRoster.length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* COCKPIT HEADER */}
      <header className={`p-4 sticky top-0 z-50 flex justify-between items-center shadow-md transition-colors ${isLocked ? 'bg-emerald-900' : 'bg-slate-900'} text-white`}>
        <div className="flex items-center gap-4">
          <button onClick={() => history.push('/teacher')} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-sm font-black uppercase tracking-widest">{session.subjectNameSnapshot}</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wider">{session.classNameSnapshot} - Section {session.sectionNameSnapshot} • {session.periodNameSnapshot}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Status</p>
            <p className={`text-xs font-bold ${session.syncStatus === 'DRAFT' ? 'text-amber-400' : 'text-emerald-400'}`}>{session.syncStatus}</p>
          </div>
          {isLocked ? (
            <div className="bg-emerald-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-700 shadow-inner">
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Session Locked</span>
            </div>
          ) : (
            <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700 shadow-inner animate-pulse">
              <Clock size={16} className="text-blue-400" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-100">In Progress</span>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-4 lg:p-8 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: ATTENDANCE */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><UserCheck size={16} className="text-indigo-600" /> Rapid Attendance</h2>
                <p className="text-[10px] font-bold text-slate-400 mt-1">Tap student to toggle status</p>
              </div>
              <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-black text-slate-600">
                {presentCount} / {totalCount} Present
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {classRoster.map(student => {
                const status = session.attendanceSnapshot[student.id] || 'PRESENT';
                const isPresent = status === 'PRESENT';
                const isAbsent = status === 'ABSENT';
                const isLate = status === 'LATE';

                return (
                  <button
                    key={student.id}
                    onClick={() => handleAttendanceToggle(student.id, status)}
                    disabled={isLocked}
                    className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden group
                      ${isPresent ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-400' :
                        isAbsent ? 'bg-rose-50 border-rose-300 hover:border-rose-400 shadow-inner' :
                          'bg-amber-50 border-amber-300 hover:border-amber-400 shadow-inner'}
                      ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPresent ? 'text-emerald-600' : isAbsent ? 'text-rose-600' : 'text-amber-600'}`}>{status}</p>
                    <p className="text-sm font-black text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                    <p className="text-[10px] font-bold text-slate-500">Roll: {student.rollNumber}</p>

                    {isAbsent && <UserX size={40} className="absolute -bottom-2 -right-2 text-rose-200 opacity-50" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACADEMICS & CONTROLS */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">

          {/* SYLLABUS TRACKER */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-6"><BookOpen size={16} className="text-blue-600" /> Syllabus Coverage</h2>
            <div className="space-y-3">
              {MOCK_SYLLABUS_TOPICS.map(topic => {
                const coverage = session.syllabusCoverage.find(t => t.topicId === topic.id);
                const currentStatus = coverage?.status || 'NOT_STARTED';

                return (
                  <div key={topic.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
                    <p className="text-xs font-black text-slate-700">{topic.name}</p>
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        handleSyllabusChange(
                          topic.id,
                          e.target.value as CoverageStatus
                        )
                      }
                      disabled={isLocked}
                      className="w-full text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg bg-white border border-slate-200 outline-none focus:border-blue-500"
                    >
                      <option value="NOT_STARTED">Not Started</option>
                      <option value="INTRODUCED">Introduced</option>
                      <option value="PARTIALLY_COVERED">Partially Covered</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="REVISED">Revised</option>
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* HOMEWORK */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4">Homework / Remarks</h2>
            <textarea
              value={session.homeworkAssigned || ''}
              onChange={(e) => handleHomeworkChange(e.target.value)}
              disabled={isLocked}
              placeholder="Log assignments, pages to read, or disciplinary notes here..."
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          {/* COMMAND ACTIONS */}
          {!isLocked && (
            <div className="grid grid-cols-2 gap-4 mt-auto">
              <button onClick={handleInterrupt} className="py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50 transition-all flex justify-center items-center gap-2">
                <AlertOctagon size={16} /> Interrupt
              </button>
              <button onClick={handleCommit} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-900/20 transition-all flex justify-center items-center gap-2">
                <Save size={16} /> Commit
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default ClassroomExecutionHub;