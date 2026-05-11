import React, { useEffect, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ArrowLeft, Save, CheckCircle, AlertOctagon, UserCheck, UserX, BookOpen, Clock } from 'lucide-react';
import { RootState } from '../../../../store/store';
import { IonPage } from '@ionic/react';
import { updateDraftPayload, commitSession, interruptSession } from '../../../../store/slices/executionSlice';
import { AttendanceStatus, CoverageStatus } from '../../../../types/execution/execution.schema';

const ClassroomExecutionHub: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const history = useHistory();
  const dispatch = useDispatch();

  const allStudents = useSelector((state: RootState) => state.student.records);
  const allocations = useSelector((state: RootState) => state.academic.allocations);
  const subjects = useSelector((state: RootState) => state.academic.subjects);

  // 1. Fetch Session First
  const session = useSelector((state: RootState) => state.execution.sessions[sessionId]);

  // 2. Security Check Effect
  useEffect(() => {
    if (session && session.status !== 'IN_PROGRESS' && session.status !== 'COMPLETED') {
      history.replace('/teacher');
    }
  }, [session, history]);

  // 3. Graceful Fallback for Prototype Coordination
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <AlertOctagon size={48} className="text-rose-500 mb-4 animate-pulse" />
        <h1 className="text-xl font-black uppercase tracking-widest mb-2">Session Not Found</h1>
        <p className="text-slate-400 text-sm mb-6 max-w-md">
          The execution engine cannot locate this session. Either the session ID is invalid, or Redux state was cleared.
        </p>
        <button onClick={() => history.push('/teacher')} className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  // 4. Derive Dynamic Data
  const currentSubject = useMemo(() => {
    const allocation = allocations.find(a => a.id === session.allocationId);
    return allocation ? subjects[allocation.subjectId] : null;
  }, [session, allocations, subjects]);

  const classRoster = useMemo(() => {
    return Object.values(allStudents).filter(student =>
      student.classId === session.classNameSnapshot &&
      student.sectionId === session.sectionNameSnapshot &&
      student.status === 'ACTIVE'
    );
  }, [allStudents, session]);

  const isLocked = session.status === 'COMPLETED';

  // Handlers
  const handleAttendanceToggle = (studentId: string, currentStatus: AttendanceStatus) => {
    if (isLocked) return;
    const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : currentStatus === 'ABSENT' ? 'LATE' : 'PRESENT';
    dispatch(updateDraftPayload({ sessionId, attendance: { ...session.attendanceSnapshot, [studentId]: newStatus } }));
  };

  const handleSyllabusChange = (topicId: string, status: CoverageStatus) => {
    if (isLocked) return;
    const existing = [...session.syllabusCoverage];
    const index = existing.findIndex(t => t.topicId === topicId);
    if (index >= 0) existing[index] = { ...existing[index], status };
    else existing.push({ topicId, status });
    dispatch(updateDraftPayload({ sessionId, syllabusCoverage: existing }));
  };

  const handleCommit = () => {
    if (window.confirm("Are you sure? Committing will lock this session and transmit it to the Admin portal.")) {
      dispatch(commitSession({ sessionId, commitTime: new Date().toISOString() }));
      history.push('/teacher');
    }
  };

  const presentCount = Object.values(session.attendanceSnapshot).filter(s => s === 'PRESENT' || s === 'LATE').length;

  return (
    <IonPage>
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <header className={`p-4 sticky top-0 z-50 flex justify-between items-center shadow-md transition-colors ${isLocked ? 'bg-emerald-900' : 'bg-slate-900'} text-white`}>
          <div className="flex items-center gap-4">
            <button onClick={() => history.push('/teacher')} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><ArrowLeft size={20} /></button>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest">{session.subjectNameSnapshot}</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-wider">{session.classNameSnapshot} - Section {session.sectionNameSnapshot} • {session.periodNameSnapshot}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLocked ? (
              <div className="bg-emerald-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-emerald-700">
                <CheckCircle size={16} className="text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest text-emerald-100">Session Locked</span>
              </div>
            ) : (
              <div className="bg-slate-800 px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700 animate-pulse">
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
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><UserCheck size={16} className="text-indigo-600" /> Rapid Attendance</h2>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-black text-slate-600">
                  {presentCount} / {classRoster.length} Present
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {classRoster.map(student => {
                  const status = session.attendanceSnapshot[student.id] || 'PRESENT';
                  const isPresent = status === 'PRESENT';
                  return (
                    <button
                      key={student.id}
                      onClick={() => handleAttendanceToggle(student.id, status)}
                      disabled={isLocked}
                      className={`p-3 rounded-xl border-2 text-left transition-all relative overflow-hidden ${isPresent ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-300'} ${isLocked ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isPresent ? 'text-emerald-600' : 'text-rose-600'}`}>{status}</p>
                      <p className="text-sm font-black text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                      {!isPresent && <UserX size={40} className="absolute -bottom-2 -right-2 text-rose-200 opacity-50" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ACADEMICS & CONTROLS */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2"><BookOpen size={16} className="text-blue-600" /> Syllabus Coverage</h2>
              <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {currentSubject?.chapters.map(chapter => (
                  <div key={chapter.id}>
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">{chapter.title}</h3>
                    <div className="space-y-3">
                      {chapter.topics.map(topic => {
                        const coverage = session.syllabusCoverage.find(t => t.topicId === topic.id);
                        return (
                          <div key={topic.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col gap-2">
                            <p className="text-xs font-black text-slate-700">{topic.title}</p>
                            <select
                              value={coverage?.status || 'NOT_STARTED'}
                              onChange={(e) => handleSyllabusChange(topic.id, e.target.value as CoverageStatus)}
                              disabled={isLocked}
                              className="w-full text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg bg-white border border-slate-200"
                            >
                              <option value="NOT_STARTED">Not Started</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {!isLocked && (
              <button onClick={handleCommit} className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-2 mt-auto">
                <Save size={16} /> Commit Session
              </button>
            )}
          </div>
        </main>
      </div>
    </IonPage>
  );
};

export default ClassroomExecutionHub;