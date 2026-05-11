import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type StudentDailyStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'MEDICAL_EXIT' | 'ON_LEAVE' | 'UNMARKED';
export type InstructionalDayType = 'FULL_DAY' | 'HALF_DAY' | 'EXAM_DAY' | 'HOLIDAY' | 'EVENT_DAY';

interface DailyStudentRecord {
  studentId: string;
  status: StudentDailyStatus;
}

// 🟢 NEW: Each class gets its own isolated session
interface ClassSession {
  draftRegister: Record<string, DailyStudentRecord>;
  isSubmitted: boolean;
  submittedAt: string | null;
}

interface StudentAttendanceState {
  selectedDate: string;
  instructionalDayType: InstructionalDayType;
  classId: string;
  sectionId: string;
  sessions: Record<string, ClassSession>; // Keyed by "classId-sectionId"
}

const initialState: StudentAttendanceState = {
  selectedDate: new Date().toISOString().split('T')[0],
  instructionalDayType: 'FULL_DAY',
  classId: '10',
  sectionId: 'A',
  sessions: {},
};

// Helper to safely get or create a session
const getSession = (state: StudentAttendanceState) => {
  const key = `${state.classId}-${state.sectionId}`;
  if (!state.sessions[key]) {
    state.sessions[key] = { draftRegister: {}, isSubmitted: false, submittedAt: null };
  }
  return state.sessions[key];
};

export const studentAttendanceSlice = createSlice({
  name: 'studentAttendance',
  initialState,
  reducers: {
    setClassContext: (state, action: PayloadAction<{ classId: string; sectionId: string }>) => {
      state.classId = action.payload.classId;
      state.sectionId = action.payload.sectionId;
      // We don't wipe the draft anymore! We just switch context.
    },
    setInstructionalDayType: (state, action: PayloadAction<InstructionalDayType>) => {
      state.instructionalDayType = action.payload;
    },
    updateStudentStatus: (state, action: PayloadAction<{ studentId: string; status: StudentDailyStatus }>) => {
      const session = getSession(state);
      if (session.isSubmitted) return; 
      session.draftRegister[action.payload.studentId] = { studentId: action.payload.studentId, status: action.payload.status };
    },
    markAllPresent: (state, action: PayloadAction<string[]>) => {
      const session = getSession(state);
      if (session.isSubmitted) return; 
      action.payload.forEach(id => {
        if (!session.draftRegister[id] || session.draftRegister[id].status !== 'ON_LEAVE') {
          session.draftRegister[id] = { studentId: id, status: 'PRESENT' };
        }
      });
    },
    commitOfficialRegister: (state) => {
      const session = getSession(state);
      session.isSubmitted = true;
      session.submittedAt = new Date().toISOString();
    }
  }
});

export const { setClassContext, setInstructionalDayType, updateStudentStatus, markAllPresent, commitOfficialRegister } = studentAttendanceSlice.actions;
export default studentAttendanceSlice.reducer;