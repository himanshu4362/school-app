import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LeaveRequest } from '../../types/faculty/leave.schema';

// Standard Yearly Allotment for a Teacher
const DEFAULT_BALANCES = {
  casual_leave: 12,
  sick_leave: 10,
  earned_leave: 15,
  maternity: 180,
  lwp: 0 // Tracked, not allotted
};

interface LeaveState {
  requests: Record<string, LeaveRequest>; // id -> LeaveRequest
  requestsByEmployee: Record<string, string[]>; // employeeId -> [requestIds]
  balances: Record<string, typeof DEFAULT_BALANCES>; // employeeId -> Balances
  
  // UI State
  selectedRequestId: string | null;
  filterStatus: 'all' | 'pending' | 'approved' | 'rejected';
}

const MOCK_REQUESTS: Record<string, LeaveRequest> = {
  'req-1': {
    id: 'req-1',
    employeeId: '2', // This must match Ananya Sharma's ID from your Mock Staff
    leaveType: 'sick_leave',
    startDate: '2026-05-10',
    endDate: '2026-05-12',
    totalDays: 3,
    reason: 'Severe viral fever and throat infection. Advised bed rest by doctor.',
    status: 'pending',
    appliedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
  },
  'req-2': {
    id: 'req-2',
    employeeId: '1', // Matches Himanshu Raj
    leaveType: 'casual_leave',
    startDate: '2026-05-20',
    endDate: '2026-05-20',
    totalDays: 1,
    reason: 'Attending a family wedding out of station.',
    status: 'approved',
    appliedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    reviewedBy: 'Admin',
    reviewedAt: new Date().toISOString(),
  }
};

const initialState: LeaveState = {
  requests: MOCK_REQUESTS,
  requestsByEmployee: { '1': ['req-2'], '2': ['req-1'] },
  balances: {
    '1': { ...DEFAULT_BALANCES, casual_leave: 11 }, // Himanshu used 1 CL
    '2': { ...DEFAULT_BALANCES }
  },
  selectedRequestId: null,
  filterStatus: 'pending', 
};

export const leaveSlice = createSlice({
  name: 'leave',
  initialState,
  reducers: {
    // 1. Initialize Balances (Fired when a new teacher is activated in Onboarding)
    initializeLeaveAccount: (state, action: PayloadAction<string>) => {
      if (!state.balances[action.payload]) {
        state.balances[action.payload] = { ...DEFAULT_BALANCES };
        state.requestsByEmployee[action.payload] = [];
      }
    },

    // 2. Submit a Request (Fired by Teacher Portal, simulated by Admin for now)
    submitLeaveRequest: (state, action: PayloadAction<LeaveRequest>) => {
      const request = action.payload;
      state.requests[request.id] = request;
      
      if (!state.requestsByEmployee[request.employeeId]) {
        state.requestsByEmployee[request.employeeId] = [];
      }
      state.requestsByEmployee[request.employeeId].unshift(request.id);
    },

    // 3. HR Review Engine (Approve/Reject)
    reviewLeaveRequest: (state, action: PayloadAction<{ 
      requestId: string; 
      status: 'approved' | 'rejected'; 
      reviewerId: string; 
      note: string 
    }>) => {
      const { requestId, status, reviewerId, note } = action.payload;
      const request = state.requests[requestId];

      if (request && request.status === 'pending') {
        request.status = status;
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date().toISOString();
        request.reviewerNote = note;

        // If Approved, deduct from balance (unless it's LWP)
        if (status === 'approved' && request.leaveType !== 'lwp') {
           const currentBalance = state.balances[request.employeeId][request.leaveType];
           // Allow negative balance, but HR should see it
           state.balances[request.employeeId][request.leaveType] = currentBalance - request.totalDays;
        }
      }
    },

    // UI Actions
    setLeaveFilter: (state, action: PayloadAction<LeaveState['filterStatus']>) => {
      state.filterStatus = action.payload;
    },
    selectLeaveRequest: (state, action: PayloadAction<string | null>) => {
      state.selectedRequestId = action.payload;
    }
  }
});

export const { initializeLeaveAccount, submitLeaveRequest, reviewLeaveRequest, setLeaveFilter, selectLeaveRequest } = leaveSlice.actions;
export default leaveSlice.reducer;