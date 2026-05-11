import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
  
  // Navigation Router State
  currentStage: 'GATEWAY' | 'PRE_FLIGHT' | 'ACTIVE' | 'POST_SUBMISSION';
  activeClassId: string | null;
  activeSectionId: string | null;
  
  sessions: Record<string, ClassSession>;
}

const initialState: StudentAttendanceState = {
  selectedDate: new Date().toISOString().split('T')[0],
  instructionalDayType: 'FULL_DAY',
  currentStage: 'GATEWAY',
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
    
    // NAVIGATION ACTIONS (The Breadcrumb Engine)
    navToGateway: (state) => {
      state.currentStage = 'GATEWAY';
      state.activeClassId = null;
      state.activeSectionId = null;
    },
    
    navToPreFlight: (state, action: PayloadAction<{ classId: string; sectionId: string }>) => {
      state.activeClassId = action.payload.classId;
      state.activeSectionId = action.payload.sectionId;
      state.currentStage = 'PRE_FLIGHT';
      getSession(state, action.payload.classId, action.payload.sectionId); // Init session if new
    },

    navToActiveSession: (state) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      state.currentStage = 'ACTIVE';
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      if (session.status === 'PENDING') {
        session.status = 'IN_PROGRESS';
        session.startedAt = new Date().toISOString();
      }
    },

    updateStudentStatus: (state, action: PayloadAction<{ studentId: string; status: StudentDailyStatus }>) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      if (session.status === 'SUBMITTED' || session.status === 'LOCKED') return; 
      session.draftRegister[action.payload.studentId] = { studentId: action.payload.studentId, status: action.payload.status };
    },

    compileAndSubmitRegister: (state, action: PayloadAction<{ classRosterIds: string[], teacherId: string }>) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      
      action.payload.classRosterIds.forEach(id => {
        if (!session.draftRegister[id]) {
          session.draftRegister[id] = { studentId: id, status: 'SKIPPED' };
        }
      });

      session.status = 'SUBMITTED';
      session.submittedAt = new Date().toISOString();
      state.currentStage = 'POST_SUBMISSION'; // Auto-navigate to success screen

      const apiPayload = {
        teacherId: action.payload.teacherId, classId: state.activeClassId, sectionId: state.activeSectionId,
        date: state.selectedDate, instructionalDay: state.instructionalDayType,
        sessionStartedAt: session.startedAt, sessionSubmittedAt: session.submittedAt,
        attendanceData: Object.values(session.draftRegister)
      };
      
      console.log("[API REQUEST] POST /api/v1/attendance/submit\n PAYLOAD:", JSON.stringify(apiPayload, null, 2));
    },

    requestModifyAttendance: (state) => {
      if (!state.activeClassId || !state.activeSectionId) return;
      const session = getSession(state, state.activeClassId, state.activeSectionId);
      
      if (session.submittedAt) {
        const minsPassed = (new Date().getTime() - new Date(session.submittedAt).getTime()) / 60000;
        if (minsPassed <= 30) {
          session.status = 'IN_PROGRESS';
          state.currentStage = 'PRE_FLIGHT'; // Take them back to pre-flight to review
          console.log("🔓 [API REQUEST] PUT /api/v1/attendance/modify - Unlocked.");
        } else {
          session.status = 'LOCKED';
          alert("Security Lock: 30 minutes have passed. Cannot modify.");
        }
      }
    }
  }
});

export const { 
  setInstructionalDayType, navToGateway, navToPreFlight, navToActiveSession, 
  updateStudentStatus, compileAndSubmitRegister, requestModifyAttendance 
} = studentAttendanceSlice.actions;

export default studentAttendanceSlice.reducer;