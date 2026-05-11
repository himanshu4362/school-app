import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Added 'SKIPPED' for students not explicitly marked before closing
export type StudentDailyStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'MEDICAL_EXIT' | 'ON_LEAVE' | 'SKIPPED';
export type InstructionalDayType = 'FULL_DAY' | 'HALF_DAY' | 'EXAM_DAY' | 'HOLIDAY' | 'EVENT_DAY';

interface DailyStudentRecord {
  studentId: string;
  status: StudentDailyStatus;
}

interface ClassSession {
  draftRegister: Record<string, DailyStudentRecord>;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'LOCKED';
  startedAt: string | null;
  submittedAt: string | null;
}

interface StudentAttendanceState {
  selectedDate: string;
  instructionalDayType: InstructionalDayType;
  // Current active view context
  activeClassId: string | null;
  activeSectionId: string | null;
  // All isolated sessions
  sessions: Record<string, ClassSession>; // Keyed by "classId-sectionId"
}

const initialState: StudentAttendanceState = {
  selectedDate: new Date().toISOString().split('T')[0],
  instructionalDayType: 'FULL_DAY',
  activeClassId: null,
  activeSectionId: null,
  sessions: {},
};

const getSession = (state: StudentAttendanceState, classId: string, sectionId: string) => {
  const key = `${classId}-${sectionId}`;
  if (!state.sessions[key]) {
    state.sessions[key] = { draftRegister: {}, status: 'PENDING', startedAt: null, submittedAt: null };
  }
  return state.sessions[key];
};

export const studentAttendanceSlice = createSlice({
  name: 'studentAttendance',
  initialState,
  reducers: {
    setInstructionalDayType: (state, action: PayloadAction<InstructionalDayType>) => {
      state.instructionalDayType = action.payload;
    },
    
    // 1. Gateway Action: Teacher selects a class
    startAttendanceSession: (state, action: PayloadAction<{ classId: string; sectionId: string }>) => {
      const { classId, sectionId } = action.payload;
      state.activeClassId = classId;
      state.activeSectionId = sectionId;
      
      const session = getSession(state, classId, sectionId);
      if (session.status === 'PENDING') {
        session.status = 'IN_PROGRESS';
        session.startedAt = new Date().toISOString();
      }
    },

    // 2. Gateway Action: Teacher leaves the active session view
    exitAttendanceSession: (state) => {
      state.activeClassId = null;
      state.activeSectionId = null;
    },

    updateStudentStatus: (state, action: PayloadAction<{ studentId: string; status: StudentDailyStatus }>) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      if (session.status === 'SUBMITTED' || session.status === 'LOCKED') return; 
      
      session.draftRegister[action.payload.studentId] = { studentId: action.payload.studentId, status: action.payload.status };
    },

    // 3. The API Payload Compiler & SKIPPED Logic
    compileAndSubmitRegister: (state, action: PayloadAction<{ classRosterIds: string[], teacherId: string }>) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      
      // Auto-assign SKIPPED to anyone unmarked
      action.payload.classRosterIds.forEach(id => {
        if (!session.draftRegister[id]) {
          session.draftRegister[id] = { studentId: id, status: 'SKIPPED' };
        }
      });

      session.status = 'SUBMITTED';
      session.submittedAt = new Date().toISOString();

      // 🟢 MOCK API CONSOLE LOG FOR YOUR BACKEND
      const apiPayload = {
        teacherId: action.payload.teacherId,
        classId: state.activeClassId,
        sectionId: state.activeSectionId,
        date: state.selectedDate,
        instructionalDay: state.instructionalDayType,
        sessionStartedAt: session.startedAt,
        sessionSubmittedAt: session.submittedAt,
        attendanceData: Object.values(session.draftRegister)
      };
      
      console.log("🚀 [API REQUEST] POST /api/v1/attendance/submit");
      console.log("📦 PAYLOAD:", JSON.stringify(apiPayload, null, 2));
    },

    // 4. The 30-Minute Reopen Engine
    requestModifyAttendance: (state) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      
      if (session.submittedAt) {
        const timePassedMs = new Date().getTime() - new Date(session.submittedAt).getTime();
        const minutesPassed = timePassedMs / (1000 * 60);
        
        if (minutesPassed <= 30) {
          session.status = 'IN_PROGRESS';
          console.log("🔓 [API REQUEST] PUT /api/v1/attendance/modify - Session unlocked for modification.");
        } else {
          session.status = 'LOCKED';
          alert("Security Lock: 30 minutes have passed. You can no longer modify this attendance. Please contact an Admin.");
        }
      }
    }
  }
});

export const { 
  setInstructionalDayType, startAttendanceSession, exitAttendanceSession, 
  updateStudentStatus, compileAndSubmitRegister, requestModifyAttendance 
} = studentAttendanceSlice.actions;

export default studentAttendanceSlice.reducer;