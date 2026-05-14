import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GradeSeatPolicy, SeatReservation } from '../../types/admission/seats.schema';
import { ValidationError } from './systemConfigSlice';

interface SeatManagementState {
  policies: Record<string, GradeSeatPolicy>; // By ID
  reservations: Record<string, SeatReservation>; // By ID
  
  // Indexes for fast querying
  policyByGradeYear: Record<string, string>; // `${gradeId}_${yearId}` -> policyId
  reservationsByGradeYear: Record<string, string[]>; // `${gradeId}_${yearId}` -> [reservationIds]
  
  validationErrors: ValidationError[];
}

const initialState: SeatManagementState = {
  policies: {},
  reservations: {},
  policyByGradeYear: {},
  reservationsByGradeYear: {},
  validationErrors: []
};

export const seatSlice = createSlice({
  name: 'seats',
  initialState,
  reducers: {
    clearSeatErrors: (state) => { state.validationErrors = []; },

    // ==========================================
    // POLICY ENGINE
    // ==========================================
    upsertSeatPolicy: (state, action: PayloadAction<GradeSeatPolicy>) => {
      const policy = action.payload;
      const indexKey = `${policy.gradeId}_${policy.academicYearId}`;
      
      // Ensure only one policy per Grade/Year combination
      const existingPolicyId = state.policyByGradeYear[indexKey];
      if (existingPolicyId && existingPolicyId !== policy.id) {
         state.validationErrors.push({
           field: 'policy',
           message: "A Seat Policy already exists for this Grade and Academic Year.",
           severity: 'error'
         });
         return;
      }

      state.policies[policy.id] = policy;
      state.policyByGradeYear[indexKey] = policy.id;
    },

    // ==========================================
    // TRANSACTIONAL ESCROW ENGINE
    // ==========================================
    // NOTE: In Redux this is a simulation. In the real backend, this will use SELECT FOR UPDATE
    createReservation: (state, action: PayloadAction<SeatReservation>) => {
      const res = action.payload;
      state.reservations[res.id] = res;
      
      const indexKey = `${res.gradeId}_${res.academicYearId}`;
      if (!state.reservationsByGradeYear[indexKey]) {
        state.reservationsByGradeYear[indexKey] = [];
      }
      state.reservationsByGradeYear[indexKey].push(res.id);
    },

    // Update reservation states (e.g., Payment success -> 'consumed', or Admin overrides)
    updateReservationState: (state, action: PayloadAction<{ id: string, newState: SeatReservation['state'] }>) => {
      const res = state.reservations[action.payload.id];
      if (res) {
        res.state = action.payload.newState;
        if (action.payload.newState === 'consumed') {
          res.consumedAt = new Date().toISOString();
          res.expiresAt = undefined; // Clear expiry once consumed
        }
      }
    }
  }
});

export const {
  clearSeatErrors,
  upsertSeatPolicy,
  createReservation,
  updateReservationState
} = seatSlice.actions;
export default seatSlice.reducer;