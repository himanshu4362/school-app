import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LeaveBalance, LeaveRequest, AttendanceRecord } from '../../types/faculty/attendance.schema';
import { SeparationRecord, ClearanceItem, SeparationReason, FnFDeduction } from '../../types/faculty/separation.schema';

interface HRValidationError {
  message: string;
  severity: 'error' | 'warning';
}

interface HRState {
  leaveBalances: Record<string, LeaveBalance>; 
  leaveRequests: Record<string, LeaveRequest>;
  attendanceLogs: Record<string, AttendanceRecord>;   
  separations: Record<string, SeparationRecord>;
  validationErrors: HRValidationError[];
}
const initialState: HRState = {
  leaveBalances: {}, 
  leaveRequests: {}, 
  attendanceLogs: {},
  separations: {},
  validationErrors: [],
};

export const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    clearHRErrors: (state) => { state.validationErrors = []; },
    
    // ... (Keep your existing leave/attendance reducers here) ...
    initializeLeaveBalance: (state, action: PayloadAction<LeaveBalance>) => { state.leaveBalances[`${action.payload.staffId}_${action.payload.academicYearId}`] = action.payload; },
    submitLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => { state.leaveRequests[action.payload.id] = action.payload; },
    reviewLeaveRequest: (state, action: PayloadAction<{ requestId: string; status: 'APPROVED' | 'REJECTED'; adminId: string }>) => { /* ... */ },
    logDailyAttendance: (state, action: PayloadAction<AttendanceRecord>) => { 
        state.attendanceLogs[`${action.payload.employeeId}_${action.payload.date}`] = action.payload; 
    },

    // ==========================================
    // 🔴 THE SEPARATION PIPELINE (OFFBOARDING)
    // ==========================================

    // PHASE 1: INITIATION & GUARDRAILS
    initiateSeparation: (state, action: PayloadAction<{ staffId: string, reason: SeparationReason, lastWorkingDay: string, adminId: string, hasActiveDependencies: boolean }>) => {
      const { staffId, reason, lastWorkingDay, adminId, hasActiveDependencies } = action.payload;

      // 🛑 GUARDRAIL 1: Dependency Blocker
      if (hasActiveDependencies) {
        state.validationErrors.push({ message: `Cannot initiate separation. Staff ID ${staffId} has active timetable/exam dependencies. Transfer ownership first.`, severity: 'error' });
        return;
      }

      const now = new Date().toISOString();
      let initialStatus: SeparationRecord['status'] = 'SEPARATION_INITIATED';
      let accessRevokedAt = null;

      // 🛑 GUARDRAIL 2: Smart Access Matrix
      if (reason === 'TERMINATION' || reason === 'ABSCONDED') {
        accessRevokedAt = now; // Instant Token Lockout
        initialStatus = 'CLEARANCE_PENDING'; // Skip notice period completely
      } else {
        initialStatus = 'NOTICE_PERIOD';
      }

      const newSeparation: SeparationRecord = {
        id: `SEP-${Date.now()}`,
        staffId,
        reason,
        initiatedOn: now,
        lastWorkingDay,
        accessRevokedAt,
        status: initialStatus,
        initiatedBy: adminId,
        fnfDetails: null,
        clearanceMatrix: [
          { department: 'IT', status: 'PENDING', clearedBy: null, clearedAt: null },
          { department: 'LIBRARY', status: 'PENDING', clearedBy: null, clearedAt: null },
          { department: 'ACADEMICS', status: 'PENDING', clearedBy: null, clearedAt: null },
          { department: 'FINANCE', status: 'PENDING', clearedBy: null, clearedAt: null },
          { department: 'HR', status: 'PENDING', clearedBy: null, clearedAt: null }
        ]
      };

      state.separations[staffId] = newSeparation; // Keyed by staffId to prevent duplicate active offboardings
    },

    // MANUAL MOVE: Notice Period -> Clearance
    beginClearanceProcess: (state, action: PayloadAction<string>) => {
      const separation = state.separations[action.payload];
      if (separation && separation.status === 'NOTICE_PERIOD') {
        separation.status = 'CLEARANCE_PENDING';
      }
    },

    // PHASE 2: DECENTRALIZED CLEARANCE (Stateful & Reversible)
    updateClearanceStatus: (state, action: PayloadAction<{ staffId: string, department: ClearanceItem['department'], status: ClearanceItem['status'], remarks: string, adminId: string }>) => {
      const separation = state.separations[action.payload.staffId];
      if (!separation) return;

      const item = separation.clearanceMatrix.find(c => c.department === action.payload.department);
      if (item) {
        item.status = action.payload.status;
        item.clearedBy = action.payload.status === 'PENDING' ? null : action.payload.adminId;
        item.clearedAt = action.payload.status === 'PENDING' ? null : new Date().toISOString();
        item.remarks = action.payload.remarks;
      }
    },

    // PHASE 3: FNF SNAPSHOT GENERATION
    generateFnF: (state, action: PayloadAction<{ staffId: string, proRataSalary: number, leaveEncashment: number, deductions: FnFDeduction[] }>) => {
      const separation = state.separations[action.payload.staffId];
      if (!separation) return;

      // 🛑 GUARDRAIL 3: Strict Clearance Enforcement
      const allCleared = separation.clearanceMatrix.every(c => c.status === 'CLEARED');
      if (!allCleared && separation.reason !== 'ABSCONDED') {
         state.validationErrors.push({ message: "Cannot generate FnF. Departmental clearance matrix is not 100% complete.", severity: 'error' });
         return;
      }

      const totalDeductions = action.payload.deductions.reduce((sum, d) => sum + d.amount, 0);
      const netPayable = (action.payload.proRataSalary + action.payload.leaveEncashment) - totalDeductions;

      separation.fnfDetails = {
        proRataSalary: action.payload.proRataSalary,
        leaveEncashment: action.payload.leaveEncashment,
        deductions: action.payload.deductions,
        netPayable,
        generatedAt: new Date().toISOString(),
        approvedBy: null
      };

      separation.status = 'FNF_PENDING_APPROVAL';
    },

    // PHASE 4: PRINCIPAL APPROVAL
    approveFnF: (state, action: PayloadAction<{ staffId: string, principalId: string }>) => {
      const separation = state.separations[action.payload.staffId];
      if (separation && separation.status === 'FNF_PENDING_APPROVAL' && separation.fnfDetails) {
        separation.fnfDetails.approvedBy = action.payload.principalId;
        separation.status = 'FNF_APPROVED';
      }
    },

    // PHASE 5: THE FINAL CUT
    completeSeparation: (state, action: PayloadAction<string>) => {
      const separation = state.separations[action.payload];
      if (separation && separation.status === 'FNF_APPROVED') {
        separation.status = 'SEPARATED';
        // 🛑 GUARDRAIL 4: Access Revocation Fallback
        if (!separation.accessRevokedAt) {
          separation.accessRevokedAt = new Date().toISOString();
        }
      }
    }
  }
});

export const { 
  clearHRErrors, initializeLeaveBalance, submitLeaveRequest, reviewLeaveRequest, logDailyAttendance,
  // 🔴 SEPARATION EXPORTS
  initiateSeparation, beginClearanceProcess, updateClearanceStatus, generateFnF, approveFnF, completeSeparation
} = hrSlice.actions;

export default hrSlice.reducer;