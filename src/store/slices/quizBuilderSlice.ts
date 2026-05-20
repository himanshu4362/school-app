import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// --- ENUMS & TYPES ---
export type TimingMode = 'FIXED_SCHEDULE' | 'FLEXIBLE_DURATION';
export type SecurityMode = 'STRICT_PROCTORED' | 'NORMAL_OPEN';
export type ResultPublishMode = 'AUTO_INSTANT' | 'MANUAL_HOLD';
export type QuestionType = 'MCQ_SINGLE' | 'MCQ_MULTI' | 'TRUE_FALSE' | 'SHORT_TEXT';

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  promptHtml: string; // Supports Bold/Italic/Underline
  marks: number;
  options: QuizOption[];
  // Future proofing:
  negativeMarks?: number; 
}

export interface QuizConfiguration {
  timingMode: TimingMode;
  durationMinutes: number;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  
  securityMode: SecurityMode;
  resultMode: ResultPublishMode;
  
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowBackNavigation: boolean;
}

export interface QuizBuilderState {
  currentStage: 'CONFIG' | 'BUILDER' | 'REVIEW';
  
  // Core Info
  title: string;
  classId: string;
  sectionId: string;
  subject: string;
  
  config: QuizConfiguration;
  questions: QuizQuestion[];
}

const initialState: QuizBuilderState = {
  currentStage: 'CONFIG',
  title: '',
  classId: '10',
  sectionId: 'A',
  subject: '',
  
  config: {
    timingMode: 'FLEXIBLE_DURATION',
    durationMinutes: 30,
    scheduledStartTime: null,
    scheduledEndTime: null,
    securityMode: 'STRICT_PROCTORED',
    resultMode: 'MANUAL_HOLD',
    shuffleQuestions: true,
    shuffleOptions: true,
    allowBackNavigation: true,
  },
  
  questions: []
};

export const quizBuilderSlice = createSlice({
  name: 'quizBuilder',
  initialState,
  reducers: {
    setBasicInfo: (state, action: PayloadAction<{ title: string; classId: string; sectionId: string; subject: string }>) => {
      state.title = action.payload.title;
      state.classId = action.payload.classId;
      state.sectionId = action.payload.sectionId;
      state.subject = action.payload.subject;
    },
    updateConfig: (state, action: PayloadAction<Partial<QuizConfiguration>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    navToStage: (state, action: PayloadAction<'CONFIG' | 'BUILDER' | 'REVIEW'>) => {
      state.currentStage = action.payload;
    },
    addQuestion: (state, action: PayloadAction<QuestionType>) => {
      const newQ: QuizQuestion = {
        id: `Q-${Date.now()}`,
        type: action.payload,
        promptHtml: '',
        marks: 1,
        options: action.payload.includes('MCQ') ? [
          { id: `OPT-${Date.now()}-1`, text: 'Option 1', isCorrect: true },
          { id: `OPT-${Date.now()}-2`, text: 'Option 2', isCorrect: false }
        ] : []
      };
      state.questions.push(newQ);
    },
    updateQuestionPrompt: (state, action: PayloadAction<{ id: string; promptHtml: string }>) => {
      const q = state.questions.find(q => q.id === action.payload.id);
      if (q) q.promptHtml = action.payload.promptHtml;
    },
    updateQuestionMarks: (state, action: PayloadAction<{ id: string; marks: number }>) => {
      const q = state.questions.find(q => q.id === action.payload.id);
      if (q) q.marks = action.payload.marks;
    },
    addOptionToQuestion: (state, action: PayloadAction<string>) => {
      const q = state.questions.find(q => q.id === action.payload);
      if (q && q.options) {
        q.options.push({ id: `OPT-${Date.now()}`, text: `Option ${q.options.length + 1}`, isCorrect: false });
      }
    },
    updateOption: (state, action: PayloadAction<{ qId: string; optId: string; text: string; isCorrect: boolean }>) => {
      const q = state.questions.find(q => q.id === action.payload.qId);
      if (q && q.options) {
        // If it's a Single MCQ and we are marking an option as correct, turn others false
        if (q.type === 'MCQ_SINGLE' && action.payload.isCorrect) {
          q.options.forEach(opt => opt.isCorrect = false);
        }
        
        const opt = q.options.find(o => o.id === action.payload.optId);
        if (opt) {
          opt.text = action.payload.text;
          opt.isCorrect = action.payload.isCorrect;
        }
      }
    },
    removeOption: (state, action: PayloadAction<{ qId: string; optId: string }>) => {
      const q = state.questions.find(q => q.id === action.payload.qId);
      if (q && q.options) {
        q.options = q.options.filter(o => o.id !== action.payload.optId);
      }
    },
    removeQuestion: (state, action: PayloadAction<string>) => {
      state.questions = state.questions.filter(q => q.id !== action.payload);
    },
    
    //   The Finalization Trigger
    publishImmutableSnapshot: (state) => {
      // 1. Validate data (ensure at least 1 question, positive marks, etc.)
      if (state.questions.length === 0) {
        console.log("Cannot publish an exam with no questions.");
        return;
      }

      // 2. Generate the Snapshot Payload
      const examSnapshot = {
        examId: `EXAM-SNAP-${Date.now()}`,
        teacherId: 'EMP-001', // Mock
        createdTimestamp: new Date().toISOString(),
        
        metadata: {
          title: state.title,
          classId: state.classId,
          sectionId: state.sectionId,
          subject: state.subject
        },
        configuration: state.config,
        questionBankSnapshot: state.questions // Frozen copy
      };

      console.log("🚀 [API REQUEST] POST /api/v1/exams/publish-snapshot");
      console.log("📦 IMMUTABLE PAYLOAD:", JSON.stringify(examSnapshot, null, 2));
      alert("Exam Snapshot successfully created and locked!");
    }
  }
});

export const { 
  setBasicInfo, updateConfig, navToStage, 
  addQuestion, updateQuestionPrompt, updateQuestionMarks, 
  addOptionToQuestion, updateOption, removeOption, removeQuestion,
  publishImmutableSnapshot
} = quizBuilderSlice.actions;

export default quizBuilderSlice.reducer;