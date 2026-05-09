import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AttendanceRecord, AttendanceSession, AttendanceChangeLog } from '../../types/faculty/attendance.schema';

interface AttendanceState {
  recordsById: Record<string, AttendanceRecord>;
  recordsByDate: Record<string, string[]>; 
  recordsByEmployee: Record<string, string[]>; 
  sessions: Record<string, AttendanceSession>; 
  
  selectedDate: string;
  draftGrid: Record<string, Partial<AttendanceRecord>>; 
  isSubmitting: boolean;
}

const initialState: AttendanceState = {
  recordsById: {},
  recordsByDate: {},
  recordsByEmployee: {},
  sessions: {},
  selectedDate: '', 
  draftGrid: {},
  isSubmitting: false,
};

export const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string>) => {
      state.selectedDate = action.payload;
      state.draftGrid = {};
    },
    
    updateDraftRecord: (state, action: PayloadAction<{ employeeId: string, changes: Partial<AttendanceRecord> }>) => {
      const { employeeId, changes } = action.payload;
      // GUARD: Cannot edit draft if session is locked
      const session = state.sessions[state.selectedDate];
      if (session?.status === 'locked') return; 

      state.draftGrid[employeeId] = { ...state.draftGrid[employeeId], ...changes };
    },

    clearDraft: (state) => {
      state.draftGrid = {};
    },

    // THE FINANCIAL COMMIT ENGINE
    commitDailyAttendance: (state, action: PayloadAction<{ session: AttendanceSession, records: AttendanceRecord[] }>) => {
      const { session, records } = action.payload;
      const date = session.date;

      // CRITICAL GUARD: Prevent Overwriting a Locked Session
      if (state.sessions[date]?.status === 'locked') {
        console.error("SECURITY VIOLATION: Attempted to commit to a locked attendance session.");
        return; 
      }

      state.sessions[date] = session;

      if (!state.recordsByDate[date]) state.recordsByDate[date] = [];

      records.forEach(record => {
        // Enforce uniqueness (empId + date)
        const existingRecordId = state.recordsByDate[date].find(id => state.recordsById[id].employeeId === record.employeeId);
        
        if (existingRecordId && existingRecordId !== record.id) {
           console.error(`Duplicate Prevention: Record for ${record.employeeId} on ${date} already exists.`);
           return;
        }

        state.recordsById[record.id] = record;
        
        if (!state.recordsByDate[date].includes(record.id)) {
          state.recordsByDate[date].push(record.id);
        }
        
        if (!state.recordsByEmployee[record.employeeId]) state.recordsByEmployee[record.employeeId] = [];
        if (!state.recordsByEmployee[record.employeeId].includes(record.id)) {
          state.recordsByEmployee[record.employeeId].push(record.id);
        }
      });

      state.draftGrid = {};
    },

    // OVERRIDE ENGINE: How Admins edit historical records (with Audit Log)
    adminOverrideRecord: (state, action: PayloadAction<{ recordId: string, changes: Partial<AttendanceRecord>, log: AttendanceChangeLog }>) => {
      const { recordId, changes, log } = action.payload;
      const record = state.recordsById[recordId];
      
      if (record) {
         // Apply changes
         Object.assign(record, changes);
         record.verificationStatus = 'admin_verified';
         record.source = 'admin';
         
         // Push to Immutable Log
         record.changeLogs.push(log);
      }
    },

    lockAttendanceSession: (state, action: PayloadAction<{ date: string, lockedBy: string }>) => {
      const date = action.payload.date;
      if (state.sessions[date]) {
        state.sessions[date].status = 'locked';
        state.sessions[date].lockedBy = action.payload.lockedBy;
        state.sessions[date].lockedAt = new Date().toISOString();
      }
    }
  }
});

export const { setSelectedDate, updateDraftRecord, clearDraft, commitDailyAttendance, adminOverrideRecord, lockAttendanceSession } = attendanceSlice.actions;
export default attendanceSlice.reducer;