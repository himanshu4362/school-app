import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 🟢 The Strict Enterprise Enums
export type EvaluationStatus = 'NOT_STARTED' | 'DRAFT' | 'PREPARED' | 'VERIFIED' | 'PUBLISHED' | 'LOCKED';
export type MarkValue = number | 'PRESENT' | 'ABSENT' | 'MEDICAL' | 'EXEMPTED' | 'MALPRACTICE' | 'WITHHELD' | null;
export type ExamType = 'MONTHLY_TEST' | 'MAIN_EXAM';

export interface ExamComponent {
  id: string;
  name: string; // e.g., 'Theory', 'Practical', 'Viva'
  maxMarks: number;
}

export interface ExamRecord {
  id: string;
  title: string;
  examType: ExamType;
  classId: string;
  sectionId: string;
  subject: string;
  dateStr: string;
  components: ExamComponent[];
  status: EvaluationStatus;
  lastModified?: string;
  marksData?: Record<string, Record<string, MarkValue>>; 
}

interface EvaluationState {
  currentStage: 'INBOX' | 'EVALUATION_SESSION' | 'PUBLICATION_REQUEST' | 'ANALYTICS' | 'CREATE_TEST';
  activeExamId: string | null;
  
  // The Inbox Data
  assignedExams: Record<string, ExamRecord>;
  
  // Filters
  filterTimeframe: '30_DAYS' | '6_MONTHS' | 'ALL';
  filterExamType: 'ALL' | 'MONTHLY_TEST' | 'MAIN_EXAM';
}

// MOCK INBOX DATA (Assigned to the Teacher)
const MOCK_EXAMS: Record<string, ExamRecord> = {
  'EXM-001': {
    id: 'EXM-001', title: 'May Monthly Test', examType: 'MONTHLY_TEST',
    classId: '10', sectionId: 'A', subject: 'Science', dateStr: '2026-05-10',
    status: 'NOT_STARTED',
    components: [{ id: 'C1', name: 'Theory', maxMarks: 40 }, { id: 'C2', name: 'Notebook', maxMarks: 10 }]
  },
  'EXM-002': {
    id: 'EXM-002', title: 'May Monthly Test', examType: 'MONTHLY_TEST',
    classId: '10', sectionId: 'B', subject: 'Science', dateStr: '2026-05-11',
    status: 'DRAFT', lastModified: new Date().toISOString(),
    components: [{ id: 'C1', name: 'Theory', maxMarks: 40 }, { id: 'C2', name: 'Notebook', maxMarks: 10 }]
  },
  'EXM-003': {
    id: 'EXM-003', title: 'Mid-Term Examination', examType: 'MAIN_EXAM',
    classId: '9', sectionId: 'A', subject: 'Science', dateStr: '2026-04-15',
    status: 'PUBLISHED', lastModified: '2026-04-20T10:00:00Z',
    components: [{ id: 'C1', name: 'Theory', maxMarks: 80 }, { id: 'C2', name: 'Practical', maxMarks: 20 }]
  }
};

const initialState: EvaluationState = {
  currentStage: 'INBOX',
  activeExamId: null,
  assignedExams: MOCK_EXAMS,
  filterTimeframe: '30_DAYS',
  filterExamType: 'ALL',
};

export const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    navToInbox: (state) => {
      state.currentStage = 'INBOX';
      state.activeExamId = null;
    },
    startEvaluationSession: (state, action: PayloadAction<string>) => {
      const examId = action.payload;
      state.activeExamId = examId;
      state.currentStage = 'EVALUATION_SESSION';
      
      // Auto-transition to DRAFT if starting for the first time
      if (state.assignedExams[examId].status === 'NOT_STARTED') {
        state.assignedExams[examId].status = 'DRAFT';
      }
    },
    setFilters: (state, action: PayloadAction<{ timeframe: any, type: any }>) => {
      state.filterTimeframe = action.payload.timeframe;
      state.filterExamType = action.payload.type;
    },
    updateStudentMark: (state, action: PayloadAction<{ examId: string; studentId: string; componentId: string; value: MarkValue }>) => {
      const { examId, studentId, componentId, value } = action.payload;
      const exam = state.assignedExams[examId];
      if (exam.status === 'PREPARED' || exam.status === 'PUBLISHED' || exam.status === 'LOCKED') return; // Security Guard
      
      if (!exam.marksData) exam.marksData = {};
      if (!exam.marksData[studentId]) exam.marksData[studentId] = {};
      
      exam.marksData[studentId][componentId] = value;
      exam.lastModified = new Date().toISOString();
    },

    markAsPrepared: (state, action: PayloadAction<string>) => {
      const examId = action.payload;
      state.assignedExams[examId].status = 'PREPARED';
      state.currentStage = 'INBOX'; // Send them back to inbox after locking
    },
    navToTab: (state, action: PayloadAction<'INBOX' | 'PUBLICATION_REQUEST' | 'ANALYTICS'>) => {
      state.currentStage = action.payload;
      state.activeExamId = null;
    },
    viewExamAnalytics: (state, action: PayloadAction<string>) => {
      state.activeExamId = action.payload;
      state.currentStage = 'ANALYTICS';
    },
    requestVerification: (state, action: PayloadAction<string>) => {
      // In a real app, this sends a notification to HOD. For our UI, we simulate auto-verification.
      state.assignedExams[action.payload].status = 'VERIFIED';
    },
    publishResult: (state, action: PayloadAction<string>) => {
      // Generates the immutable snapshot and opens the Parent Portal
      state.assignedExams[action.payload].status = 'PUBLISHED';
      state.assignedExams[action.payload].lastModified = new Date().toISOString();
    },
    navToCreateTest: (state) => {
      state.currentStage = 'CREATE_TEST';
      state.activeExamId = null;
    },
    createMonthlyTest: (state, action: PayloadAction<ExamRecord>) => {
      // Inject the newly created test into the teacher's inbox
      state.assignedExams[action.payload.id] = action.payload;
      state.currentStage = 'INBOX'; // Route back to inbox after creation
    },
  }
});

export const { navToInbox, navToTab, navToCreateTest, createMonthlyTest, viewExamAnalytics, requestVerification, publishResult, startEvaluationSession, markAsPrepared, updateStudentMark, setFilters } = evaluationSlice.actions;
export default evaluationSlice.reducer;