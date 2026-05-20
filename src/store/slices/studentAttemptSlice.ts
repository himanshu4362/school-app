import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AttemptStatus = 'NOT_STARTED' | 'ACTIVE' | 'PAUSED' | 'SUBMITTED' | 'TERMINATED' | 'EVALUATED';

interface QuestionResponse {
  questionId: string;
  selectedOptionId: string | null;
  timeSpentSeconds: number;
}

interface StudentAttemptState {
  currentStatus: AttemptStatus;
  activeExamId: string | null;
  responses: Record<string, QuestionResponse>; // questionId -> response
  violations: string[]; // Timestamps of tab switches
  startTime: string | null;
  endTime: string | null;
}

const initialState: StudentAttemptState = {
  currentStatus: 'NOT_STARTED',
  activeExamId: null,
  responses: {},
  violations: [],
  startTime: null,
  endTime: null,
};

export const studentAttemptSlice = createSlice({
  name: 'studentAttempt',
  initialState,
  reducers: {
    startExam: (state, action: PayloadAction<string>) => {
      state.activeExamId = action.payload;
      state.currentStatus = 'ACTIVE';
      state.startTime = new Date().toISOString();
    },
    
    //   LIGHTWEIGHT DELTA SYNC ENGINE
    syncResponse: (state, action: PayloadAction<{ questionId: string; optionId: string; timeIncr: number }>) => {
      if (state.currentStatus !== 'ACTIVE') return;
      
      const { questionId, optionId, timeIncr } = action.payload;
      if (!state.responses[questionId]) {
        state.responses[questionId] = { questionId, selectedOptionId: optionId, timeSpentSeconds: 0 };
      }
      
      state.responses[questionId].selectedOptionId = optionId;
      state.responses[questionId].timeSpentSeconds += timeIncr;

      // 📦 Here is where you would trigger the lightweight API call:
      // POST /api/v1/sync { examId, attemptId, questionId, optionId, timeSpentSeconds }
    },

    logViolation: (state, action: PayloadAction<string>) => {
      state.violations.push(`${action.payload}_${new Date().toISOString()}`);
    },

    terminateExam: (state) => {
      state.currentStatus = 'TERMINATED';
      state.endTime = new Date().toISOString();
    },

    submitExam: (state) => {
      state.currentStatus = 'SUBMITTED';
      state.endTime = new Date().toISOString();
      
      // 🚀 FINAL PAYLOAD COMPILATION
      const finalPayload = {
        examId: state.activeExamId,
        responses: Object.values(state.responses),
        violations: state.violations,
        duration: state.startTime // calculation logic here
      };
      console.log("🏁 EXAM SUBMITTED. Final Payload:", finalPayload);
    }
  }
});

export const { startExam, syncResponse, logViolation, terminateExam, submitExam } = studentAttemptSlice.actions;
export default studentAttemptSlice.reducer;